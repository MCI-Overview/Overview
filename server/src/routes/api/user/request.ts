import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma, s3, upload } from "../../../client";
import { Prisma, RequestType, User } from "@prisma/client";
import { Router } from "express";
import dayjs from "dayjs";
import { randomUUID } from "crypto";
import { Readable } from "stream";
import { correctTimes } from "../../../utils/clash";

const requestAPIRouter = Router();

/**
GET /api/user/requests/current

Retrieve the user's recent or pending requests.
Only requests from the past 7 days are considered recent.
*/
requestAPIRouter.get("/requests/current", async (req, res) => {
  const user = req.user as User;

  try {
    const requests = await prisma.request.findMany({
      where: {
        candidateCuid: user.cuid,
        OR: [
          {
            status: "PENDING",
          },
          {
            status: {
              not: "PENDING",
            },
            createdAt: {
              gte: dayjs().subtract(7, "day").toDate(),
            },
          },
        ],
      },
      include: {
        Assign: {
          select: {
            Candidate: {
              select: {
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
    });

    const customRequests = requests.map((request) => {
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

    return res.send(customRequests);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
GET /api/user/requests/history/:page

Parameters:
page
searchValue
typeFilter
statusFilter

Retrieve the user's request history (excludes pending requests).
Only requests older than 7 days are considered history.
Uses pagination.
*/
requestAPIRouter.get("/requests/history/:page", async (req, res) => {
  const user = req.user as User;
  const page = parseInt(req.params.page, 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { searchValue, typeFilter, statusFilter } = req.query as any;

  const queryConditions: Prisma.RequestWhereInput | undefined = {
    candidateCuid: user.cuid,
    ...(typeFilter && { type: typeFilter }),
    status: {
      not: "PENDING",
      ...(statusFilter && { equals: statusFilter }),
    },
    createdAt: {
      lt: dayjs().subtract(7, "day").toDate(),
    },
    ...(searchValue && {
      Assign: {
        Project: {
          name: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      },
    }),
  };

  try {
    const fetchedData = await prisma.request.findMany({
      where: queryConditions,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        Assign: {
          select: {
            Candidate: {
              select: {
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
      skip: offset,
      take: limit,
    });

    const customRequests = fetchedData.map((request) => {
      return {
        ...request,
        affectedRosters: request.Attendance.map((attendance) => {
          return correctTimes(
            attendance.shiftDate,
            attendance.shiftType === "SECOND_HALF"
              ? attendance.Shift.halfDayStartTime!
              : attendance.Shift.startTime,
            attendance.shiftType === "FIRST_HALF"
              ? attendance.Shift.halfDayEndTime!
              : attendance.Shift.endTime
          );
        }),
      };
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

    return res.json([customRequests, paginationData]);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
POST /api/user/request/claim

Creates a new claim request.

Parameters:
projectCuid
type
description
amount
rosterCuid
receipt
*/
requestAPIRouter.post(
  "/request/claim",
  upload.single("receipt"),
  async (req, res) => {
    const user = req.user as User;

    const { projectCuid, type, description, amount, rosterCuid } = req.body;
    const candidateCuid = user.cuid;
    const receipt = req.file;

    if (!type) {
      return res.status(400).send("Claim type is required");
    }

    if (!description) {
      return res.status(400).send("Claim description is required");
    }

    if (!amount) {
      return res.status(400).send("Claim amount is required");
    }

    if (!rosterCuid) {
      return res.status(400).send("Shift CUID is required");
    }

    if (!receipt) {
      return res.status(400).send("Receipt is required");
    }

    if (!["MEDICAL", "TRANSPORT", "OTHERS"].includes(type)) {
      return res.status(400).send("Invalid claim type");
    }

    if (amount <= 0) {
      return res.status(400).send("Claim amount must be positive");
    }

    try {
      const request = await prisma.request.create({
        data: {
          projectCuid,
          candidateCuid,
          type: RequestType.CLAIM,
          data: {
            claimType: type,
            claimDescription: description,
            claimAmount: amount,
          },
          Attendance: {
            connect: {
              cuid: rosterCuid,
            },
          },
        },
      });

      await s3
        .send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `projects/${projectCuid}/receipts/${request.cuid}`,
            Body: receipt.buffer,
          })
        )
        .catch((error) => {
          console.error("Error while uploading receipt:", error);
          return res.status(500).send("Internal server error");
        });

      // TODO: Handle the case where db operation is successful but s3 operation fails

      return res.send("Request created successfully");
    } catch (error) {
      console.error("Error while creating request:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
POST /api/user/request/cancel

Cancels a pending request.
*/
requestAPIRouter.post("/request/cancel", async (req, res) => {
  const { requestCuid } = req.body;

  if (!requestCuid) {
    return res.status(400).send("Request CUID is required");
  }

  try {
    await prisma.request.update({
      where: {
        cuid: requestCuid,
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
      },
    });

    return res.send("Request cancelled successfully");
  } catch (error) {
    console.error("Error while cancelling request:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
POST /api/user/request/leave

Creates a new leave request.

Parameters:
projectCuid
rosterCuid
type
duration
reason
*/
requestAPIRouter.post("/request/leave", async (req, res) => {
  const user = req.user as User;

  const { projectCuid, rosterCuid, type, duration, reason } = req.body;
  const candidateCuid = user.cuid;

  if (!type) {
    return res.status(400).send("Leave type is required");
  }

  if (type !== "PAID_LEAVE" && type !== "UNPAID_LEAVE") {
    return res.status(400).send("Invalid leave type");
  }

  if (!rosterCuid) {
    return res.status(400).send("Shift CUID is required");
  }

  if (!["FULL_DAY", "FIRST_HALF", "SECOND_HALF"].includes(duration)) {
    return res.status(400).send("Invalid leave duration");
  }

  if (!reason) {
    return res.status(400).send("Leave reason is required");
  }

  try {
    await prisma.request.create({
      data: {
        projectCuid,
        candidateCuid,
        type,
        data: {
          leaveDuration: duration,
          reason,
        },
        Attendance: {
          connect: {
            cuid: rosterCuid,
          },
        },
      },
    });

    return res.send("Leave request submitted successfully");
  } catch (error) {
    console.error("Error while submitting leave request:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
POST /api/user/request/resign

Creates a new resignation request.

Parameters:
projectCuid
lastDay
reason
*/
requestAPIRouter.post("/request/resign", async (req, res) => {
  const user = req.user as User;

  const { projectCuid, lastDay, reason } = req.body;
  const candidateCuid = user.cuid;

  try {
    await prisma.$transaction([
      prisma.request.create({
        data: {
          projectCuid,
          candidateCuid,
          type: RequestType.RESIGNATION,
          data: {
            lastDay,
            reason,
          },
        },
      }),

      // Auto-cancel any pending resignation requests
      prisma.request.updateMany({
        where: {
          candidateCuid,
          projectCuid,
          type: RequestType.RESIGNATION,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      }),
    ]);

    return res.send("Resignation request submitted successfully");
  } catch (error) {
    console.error("Error while submitting resignation request:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
POST /api/user/request/mc

Creates a new medical leave request.

Parameters:
startDate
numberOfDays

Steps:
1. Verify fields
2. Fetch affected rosters
  a. Exclude rosters with fullday leave
  b. Exclude rosters with clocked in / MC status
3. Upload MC image to S3
4. Create request for each affected project
5. Set pending leave requests to cancelled for affected rosters
*/
requestAPIRouter.post("/request/mc", upload.single("mc"), async (req, res) => {
  const user = req.user as User;

  const { startDate, numberOfDays } = req.body;
  const mc = req.file;
  const candidateCuid = user.cuid;

  if (!startDate) {
    return res.status(400).send("MC start date is required");
  }

  if (!numberOfDays) {
    return res.status(400).send("Number of MC days is required");
  }

  if (numberOfDays <= 0) {
    return res.status(400).send("Number of MC days must be positive");
  }

  if (!mc) {
    return res.status(400).send("MC image is required");
  }

  const affectedRosters = await prisma.attendance.findMany({
    where: {
      candidateCuid,
      AND: [
        {
          // ignore rosters with fullday leave
          OR: [{ leave: null }, { leave: "HALFDAY" }],
        },
        {
          // ignore rosters that are clocked into or have MC for
          OR: [{ status: null }, { status: "NO_SHOW" }],
        },
      ],
      shiftDate: {
        gte: dayjs(startDate).toDate(),
        lte: dayjs(startDate).add(numberOfDays, "day").toDate(),
      },
    },
    select: {
      cuid: true,
      Shift: {
        select: {
          projectCuid: true,
        },
      },
    },
  });

  const affectedProjects = new Set(
    affectedRosters.map((roster) => roster.Shift.projectCuid)
  );

  const imageUUID = randomUUID();

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `mcs/${imageUUID}`,
        Body: mc.buffer,
      })
    );

    await prisma.$transaction(
      Array.from(affectedProjects).map((projectCuid) => {
        const rosterCuids = affectedRosters
          .filter((roster) => roster.Shift.projectCuid === projectCuid)
          .map((roster) => {
            return { cuid: roster.cuid };
          });

        return prisma.request.create({
          data: {
            projectCuid,
            candidateCuid,
            type: RequestType.MEDICAL_LEAVE,
            data: {
              startDate,
              numberOfDays,
              imageUUID,
            },

            // connect rosters to the request
            Attendance: {
              connect: rosterCuids,
            },
          },
        });
      })
    );

    // set pending leave requests to cancelled for affected rosters
    await prisma.request.updateMany({
      where: {
        status: "PENDING",
        type: { in: [RequestType.PAID_LEAVE, RequestType.UNPAID_LEAVE] },
        Attendance: {
          some: {
            cuid: {
              in: affectedRosters.map((roster) => roster.cuid),
            },
          },
        },
      },
      data: {
        status: "CANCELLED",
      },
    });

    return res.send("MC request submitted successfully");
  } catch (error) {
    console.error("Error while submitting MC request:", error);
    return res.status(500).send("Internal server error");
  }
});

/**
GET /api/user/request/:requestCuid/image

Retrieve the image associated with a request.

Parameters:
requestCuid

Steps:
1. Fetch request details
2. Determine request type
3. Fetch image from S3
*/
requestAPIRouter.get("/request/:requestCuid/image", async (req, res) => {
  const user = req.user as User;
  const { requestCuid } = req.params;

  const request = await prisma.request.findUniqueOrThrow({
    where: {
      cuid: requestCuid,
      candidateCuid: user.cuid,
    },
    select: {
      data: true,
      type: true,
      projectCuid: true,
    },
  });

  if (!request) {
    return res.status(404).send("Request not found");
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
