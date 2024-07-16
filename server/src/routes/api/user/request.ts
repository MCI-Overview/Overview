import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma, s3, upload } from "../../../client";
import { Prisma, RequestType, User } from "@prisma/client";
import { Router } from "express";
import dayjs from "dayjs";
import { randomUUID } from "crypto";
import { Readable } from "stream";

const requestAPIRouter = Router();

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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return res.send(requests);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

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
      },
      skip: offset,
      take: limit,
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

    return res.json([fetchedData, paginationData]);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

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

    const createData = {
      projectCuid,
      candidateCuid,
      rosterCuid,
      type: RequestType.CLAIM,
      data: {
        claimType: type,
        claimDescription: description,
        claimAmount: amount,
      },
    };

    try {
      const request = await prisma.request.create({
        data: createData,
      });

      await s3
        .send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `receipt/${request.cuid}`,
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

// Add validation for leave type
requestAPIRouter.post("/request/leave", async (req, res) => {
  const user = req.user as User;

  const { projectCuid, rosterCuid, type, duration, reason } = req.body;
  const candidateCuid = user.cuid;

  if (!type) {
    return res.status(400).send("Leave type is required");
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

  const createData = {
    projectCuid,
    candidateCuid,
    rosterCuid,
    type,
    data: {
      leaveDuration: duration,
      reason,
    },
  };

  try {
    await prisma.request.create({
      data: createData,
    });

    return res.send("Leave request submitted successfully");
  } catch (error) {
    console.error("Error while submitting leave request:", error);
    return res.status(500).send("Internal server error");
  }
});

// TODO: Add logic for when multiple resign requests are submitted
requestAPIRouter.post("/request/resign", async (req, res) => {
  const user = req.user as User;

  const { projectCuid, lastDay, reason } = req.body;
  const candidateCuid = user.cuid;

  try {
    await prisma.$transaction([
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
    ]);

    return res.send("Resignation request submitted successfully");
  } catch (error) {
    console.error("Error while submitting resignation request:", error);
    return res.status(500).send("Internal server error");
  }
});

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

  const affectedRoster = await prisma.attendance.findMany({
    where: {
      candidateCuid,
      OR: [
        {
          status: null,
        },
        {
          status: "NO_SHOW",
        },
      ],
      shiftDate: {
        gte: dayjs(startDate).toDate(),
        lte: dayjs(startDate).add(numberOfDays, "day").toDate(),
      },
    },
    select: {
      Shift: {
        select: {
          projectCuid: true,
        },
      },
    },
  });

  const affectedProjects = new Set(
    affectedRoster.map((roster) => roster.Shift.projectCuid)
  );

  const imageUUID = randomUUID();

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `mc/${imageUUID}`,
        Body: mc.buffer,
      })
    );

    await prisma.$transaction(
      Array.from(affectedProjects).map((projectCuid) =>
        prisma.request.create({
          data: {
            projectCuid,
            candidateCuid,
            type: RequestType.MEDICAL_LEAVE,
            data: {
              startDate,
              numberOfDays,
              imageUUID,
            },
          },
        })
      )
    );

    return res.send("MC request submitted successfully");
  } catch (error) {
    console.error("Error while submitting MC request:", error);
    return res.status(500).send("Internal server error");
  }
});

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
    },
  });

  if (request.type === "CLAIM") {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `receipt/${requestCuid}`,
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
      Key: `mc/${(request.data as { imageUUID: string }).imageUUID}`,
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
        candidateCuid: user.cuid,
      },
      select: {
        candidateCuid: true,
        projectCuid: true,
        rosterCuid: true,
        data: true,
        type: true,
      },
    });

    if (request.type === "RESIGNATION") {
      return res.status(404).send("No roster details found for this request.");
    }

    if (request.type === "MEDICAL_LEAVE") {
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
        include: {
          Shift: true,
        },
      });

      return res.json(affectedRosterData);
    }

    if (request.type === "CLAIM") {
      const claimRosterData = await prisma.attendance.findUniqueOrThrow({
        where: {
          cuid: request.rosterCuid as string,
        },
        include: {
          Shift: true,
        },
      });

      return res.json(claimRosterData);
    }

    if (request.type === "UNPAID_LEAVE" || request.type === "PAID_LEAVE") {
      const leaveRosterData = await prisma.attendance.findUniqueOrThrow({
        where: {
          cuid: request.rosterCuid as string,
        },
        include: {
          Shift: true,
        },
      });

      return res.json(leaveRosterData);
    }

    return res.status(400).send("No roster details found for this request.");
  } catch (error) {
    console.error("Error while fetching roster details:", error);
    return res.status(500).send("Internal server error");
  }
});

export default requestAPIRouter;
