import dayjs from "dayjs";
import { Router } from "express";
import { Readable } from "stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { User } from "@/types/common";
import { prisma, s3 } from "../../../client";
import { maskNRIC } from "../../../utils";

const requestAPIRouter: Router = Router();

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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const maskedData = fetchedData.map((req) => {
      req.Assign.Candidate.nric = maskNRIC(req.Assign.Candidate.nric);
      return req;
    });

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

    return res.json([maskedData, paginationData]);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

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
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) =>
          assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
      )
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
            candidateCuid: request.candidateCuid,
            NOT: {
              leave: "FULLDAY",
            },
            OR: [
              {
                status: null,
              },
              {
                status: "NO_SHOW",
              },
            ],
            shiftDate: {
              gte: dayjs(
                (request.data as { startDate: string }).startDate
              ).toDate(),
              lte: dayjs((request.data as { startDate: string }).startDate)
                .add(
                  parseInt(
                    (request.data as { numberOfDays: string }).numberOfDays,
                    10
                  ) - 1,
                  "day"
                )
                .endOf("day")
                .toDate(),
            },
            Shift: {
              projectCuid: request.projectCuid,
            },
          },
          data: {
            status: "MEDICAL",
          },
        })
      );
    }

    if (request.type === "RESIGNATION") {
      transactionRequests.push(
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
      if (!request.rosterCuid) {
        return res.status(500).send("Leave request missing linked roster.");
      }

      const leaveDuration = (request.data as { leaveDuration: string })
        .leaveDuration;

      if (leaveDuration === "FULL_DAY") {
        transactionRequests.push(
          prisma.attendance.update({
            where: {
              cuid: request.rosterCuid,
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
              cuid: request.rosterCuid,
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
              cuid: request.rosterCuid,
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
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) =>
          assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
      )
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
              Manage: true,
            },
          },
        },
      },
    },
  });

  if (
    !request.Assign.Project.Manage.some(
      (assign) =>
        assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
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

requestAPIRouter.get("/request/:requestCuid/roster", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  try {
    const request = await prisma.request.findUniqueOrThrow({
      where: {
        cuid: requestCuid,
      },
      select: {
        candidateCuid: true,
        projectCuid: true,
        rosterCuid: true,
        data: true,
        type: true,
        Assign: {
          select: {
            Project: {
              select: {
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !request.Assign.Project.Manage.some(
        (assign) =>
          assign.consultantCuid === user.cuid && assign.role === "CLIENT_HOLDER"
      )
    ) {
      return res
        .status(403)
        .send("You are not authorized to reject this request.");
    }

    if (request.type === "RESIGNATION") {
      return res.status(404).send("No roster details found for this request.");
    }

    if (request.type === "MEDICAL_LEAVE") {
      const reqData = request.data as {
        startDate: string;
        numberOfDays: string;
      };

      const affectedRosterData = await prisma.attendance.findMany({
        where: {
          candidateCuid: request.candidateCuid,
          OR: [
            {
              status: null,
            },
            {
              status: "NO_SHOW",
            },
          ],
          shiftDate: {
            gte: dayjs(reqData.startDate).toDate(),
            lte: dayjs(reqData.startDate)
              .add(parseInt(reqData.numberOfDays, 10) - 1, "day")
              .endOf("day")
              .toDate(),
          },
          Shift: {
            projectCuid: request.projectCuid,
          },
        },
        include: {
          Shift: true,
        },
      });

      return res.json(affectedRosterData);
    }

    if (request.type === "CLAIM") {
      if (!request.rosterCuid) {
        return res.status(500).send("Claim request missing linked roster.");
      }

      const claimRosterData = await prisma.attendance.findUniqueOrThrow({
        where: {
          cuid: request.rosterCuid,
        },
        include: {
          Shift: true,
        },
      });

      return res.json(claimRosterData);
    }

    if (request.type === "UNPAID_LEAVE" || request.type === "PAID_LEAVE") {
      if (!request.rosterCuid) {
        return res.status(500).send("Leave request missing linked roster.");
      }

      const leaveRosterData = await prisma.attendance.findUniqueOrThrow({
        where: {
          cuid: request.rosterCuid,
        },
        include: {
          Shift: true,
        },
      });

      return res.json(leaveRosterData);
    }

    return res.status(400).send("Invalid request type.");
  } catch (error) {
    console.error("Error while fetching roster details:", error);
    return res.status(500).send("Internal server error");
  }
});

export default requestAPIRouter;
