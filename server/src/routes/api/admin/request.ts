import { Router } from "express";
import { Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { User } from "@/types/common";
import { maskNRIC } from "../../../utils";
import { prisma, s3 } from "../../../client";
import { correctTimes } from "../../../utils/clash";
import { checkPermission, PermissionList } from "../../../utils/permissions";

const requestAPIRouter: Router = Router();

/**
GET /api/admin/request/all/:page

Fetches list of requests for projects the user is a client holder of.
Uses pagination.

Parameters:
page
searchValue
typeFilter
statusFilter

Steps:
1. Fetch all projects the user is a client holder of.
2. Fetch requests for these projects.
3. Apply filters and search value.
4. Return paginated data.
5. Mask data if user is missing CAN_READ_CANDIDATE_DETAILS permission.
*/
requestAPIRouter.get("/request/all/:page", async (req, res) => {
  const user = req.user as User;
  const page = parseInt(req.params.page, 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { searchValue, typeFilter, statusFilter } = req.query as any;

  try {
    const project = await prisma.project.findMany({
      where: {
        Manage: {
          some: {
            consultantCuid: user.cuid,
            role: "CLIENT_HOLDER",
          },
        },
      },
      include: {
        Manage: true,
      },
    });

    const queryConditions = {
      projectCuid: {
        in: project.map((proj) => proj.cuid),
      },
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(searchValue && {
        Assign: {
          Candidate: {
            OR: [
              {
                nric: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      }),
    };

    const fetchedData = await prisma.request.findMany({
      where: queryConditions,
      include: {
        Assign: {
          select: {
            Candidate: {
              select: {
                nric: true,
                name: true,
              },
            },
            Project: {
              select: {
                name: true,
              },
            },
          },
        },
        Attendance: {
          include: {
            Shift: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const customRequests = fetchedData.map((request) => {
      return {
        ...request,
        affectedRosters: request.Attendance.map((attendance) => {
          const { correctStartTime, correctEndTime } = correctTimes(
            attendance.shiftDate,
            attendance.shiftType === "SECOND_HALF"
              ? attendance.Shift.halfDayStartTime!
              : attendance.Shift.startTime,
            attendance.shiftType === "FIRST_HALF"
              ? attendance.Shift.halfDayEndTime!
              : attendance.Shift.endTime
          );

          return {
            cuid: attendance.cuid,
            correctStartTime,
            correctEndTime,
          };
        }),
      };
    });

    const hasCanReadCandidateDetails = await checkPermission(
      user.cuid,
      PermissionList.CAN_READ_CANDIDATE_DETAILS
    );

    const totalCount = await prisma.request.count({
      where: queryConditions,
    });

    const paginationData = {
      isFirstPage: page === 1,
      isLastPage: page * limit >= totalCount,
      currentPage: page,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page * limit < totalCount ? page + 1 : null,
      pageCount: Math.ceil(totalCount / limit),
      totalCount: totalCount,
    };

    if (!hasCanReadCandidateDetails) {
      const maskedData = customRequests.map((req) => {
        req.Assign.Candidate.nric = maskNRIC(req.Assign.Candidate.nric);
        return req;
      });

      return res.json([maskedData, paginationData]);
    }

    return res.json([customRequests, paginationData]);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
POST /api/admin/request/:requestCuid/approve

Approves a request and updates assign/rosters accordingly.

Parameters:
requestCuid

Steps:
1. Check permissions, either:
  a. User is a client holder of the project.
  b. User has CAN_EDIT_ALL_PROJECTS permission.
2. Perform transaction:
  a. Update affected rosters based on request type.
  b. Update request status to APPROVED.
*/
requestAPIRouter.post("/request/:requestCuid/approve", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  try {
    const request = await prisma.request.findUniqueOrThrow({
      where: {
        cuid: requestCuid,
        status: "PENDING",
      },
      include: {
        Assign: {
          select: {
            Project: {
              select: {
                Manage: {
                  where: {
                    role: "CLIENT_HOLDER",
                  },
                },
              },
            },
          },
        },
        Attendance: true,
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) => assign.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS))
    ) {
      return res
        .status(403)
        .send("You are not authorized to approve this request.");
    }

    const transactionRequests = [];

    if (request.type === "MEDICAL_LEAVE") {
      transactionRequests.push(
        prisma.attendance.updateMany({
          where: {
            cuid: {
              in: request.Attendance.map((attendance) => attendance.cuid),
            },
            AND: [
              // Attendance must not be FULLDAY leave
              // MC does not override or refund leaves
              { OR: [{ leave: null }, { leave: "HALFDAY" }] },

              // Attendance status must be either NO_SHOW or null
              // MC should not affect attendance that has been marked as present
              { OR: [{ status: null }, { status: "NO_SHOW" }] },
            ],
          },
          data: {
            status: "MEDICAL",
          },
        })
      );

      // reject pending unpaid and paid leave requests for affected rosters
      transactionRequests.push(
        prisma.request.updateMany({
          where: {
            type: {
              in: ["PAID_LEAVE", "UNPAID_LEAVE"],
            },
            status: "PENDING",
            Attendance: {
              some: {
                cuid: {
                  in: request.Attendance.map((attendance) => attendance.cuid),
                },
              },
            },
          },
          data: {
            status: "REJECTED",
          },
        })
      );
    }

    if (request.type === "RESIGNATION") {
      transactionRequests.push(
        // set assigned candidate's end date to the lastDay in the request
        prisma.assign.update({
          where: {
            projectCuid_candidateCuid: {
              projectCuid: request.projectCuid,
              candidateCuid: request.candidateCuid,
            },
          },
          data: {
            endDate: (request.data as { lastDay: string }).lastDay,
          },
        })
      );
    }

    if (request.type === "PAID_LEAVE" || request.type === "UNPAID_LEAVE") {
      // should have only 1 affected roster
      if (request.Attendance.length !== 1) {
        return res.status(500).send("Linked roster details are invalid.");
      }
      const affectedRoster = request.Attendance[0];
      const leaveDuration = (request.data as { leaveDuration: string })
        .leaveDuration;

      if (leaveDuration === "FULL_DAY") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: affectedRoster.cuid,
            },
            data: {
              leave: "FULLDAY",
            },
          })
        );
      }

      if (leaveDuration === "FIRST_HALF") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: affectedRoster.cuid,
            },
            data: {
              leave: "HALFDAY",
              shiftType: "SECOND_HALF",
            },
          })
        );
      }

      if (leaveDuration === "SECOND_HALF") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: affectedRoster.cuid,
            },
            data: {
              leave: "HALFDAY",
              shiftType: "FIRST_HALF",
            },
          })
        );
      }
    }

    transactionRequests.push(
      prisma.request.update({
        where: {
          cuid: requestCuid,
        },
        data: {
          status: "APPROVED",
        },
      })
    );

    await prisma.$transaction(transactionRequests);

    return res.send("Request approved.");
  } catch (error) {
    console.error("Error while approving request:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
POST /api/admin/request/:requestCuid/reject

Rejects a request.

Parameters:
requestCuid

Steps:
1. Check permissions, either:
  a. User is a client holder of the project.
  b. User has CAN_EDIT_ALL_PROJECTS permission.
2. Update request status to REJECTED.
*/
requestAPIRouter.post("/request/:requestCuid/reject", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  try {
    const request = await prisma.request.findUniqueOrThrow({
      where: {
        cuid: requestCuid,
        status: "PENDING",
      },
      select: {
        Assign: {
          select: {
            Project: {
              select: {
                Manage: {
                  where: {
                    role: "CLIENT_HOLDER",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) => assign.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS))
    ) {
      return res
        .status(403)
        .send("You are not authorized to reject this request.");
    }

    await prisma.request.update({
      where: {
        cuid: requestCuid,
      },
      data: {
        status: "REJECTED",
      },
    });

    return res.send("Request rejected.");
  } catch (error) {
    console.error("Error while rejecting request:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
GET /api/admin/request/:requestCuid/image

Fetches image for a request. Only relevant for claims and medical leaves.

Parameters:
requestCuid

Steps:
1. Check permissions, either:
  a. User is a client holder of the project.
  b. User has CAN_READ_CANDIDATE_DETAILS permission.
2. Fetch image from S3 based on request type.
*/
requestAPIRouter.get("/request/:requestCuid/image", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  const request = await prisma.request.findUniqueOrThrow({
    where: {
      cuid: requestCuid,
    },
    select: {
      data: true,
      type: true,
      projectCuid: true,
      Assign: {
        select: {
          Project: {
            select: {
              Manage: {
                where: {
                  role: "CLIENT_HOLDER",
                },
              },
            },
          },
        },
      },
    },
  });

  if (
    !request.Assign.Project.Manage.some(
      (assign) => assign.consultantCuid === user.cuid
    )
  ) {
    return res
      .status(403)
      .send("You are not authorized to reject this request.");
  }

  if (request.type === "CLAIM") {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `projects/${request.projectCuid}/receipts/${requestCuid}`,
    });

    const response = await s3.send(command);
    if (response.Body instanceof Readable) {
      return response.Body.pipe(res);
    } else {
      return res.status(500).send("Unexpected response body type");
    }
  }

  if (request.type === "MEDICAL_LEAVE") {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `mcs/${(request.data as { imageUUID: string }).imageUUID}`,
    });

    const response = await s3.send(command);
    if (response.Body instanceof Readable) {
      return response.Body.pipe(res);
    } else {
      return res.status(500).send("Unexpected response body type");
    }
  }

  return res.status(400).send("No image found for this request.");
});

export default requestAPIRouter;
