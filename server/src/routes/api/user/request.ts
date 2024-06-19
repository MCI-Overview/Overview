import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma, s3, upload } from "../../../client";
import { RequestType, User } from "@prisma/client";
import { Router } from "express";
import dayjs from "dayjs";
import { randomUUID } from "crypto";

const requestAPIRouter = Router();

requestAPIRouter.get("/requests", async (req, res) => {
  const user = req.user as User;

  try {
    const requests = await prisma.request.findMany({
      where: {
        candidateCuid: user.cuid,
        type: {
          not: "CANCEL",
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

    // TODO: Check if roster cuid is valid

    const createData = {
      projectCuid,
      candidateCuid,
      type: RequestType.CLAIM,
      data: {
        claimType: type,
        claimDescription: description,
        claimAmount: amount,
        claimRosterCuid: rosterCuid,
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
          }),
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
  },
);

requestAPIRouter.post("/cancel", async (req, res) => {
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

  try {
    await prisma.request.create({
      data: {
        projectCuid,
        candidateCuid,
        type,
        data: {
          leaveShiftCuid: rosterCuid,
          leaveDuration: duration,
          reason,
        },
      },
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
    await prisma.request.create({
      data: {
        projectCuid,
        candidateCuid,
        type: RequestType.RESIGNATION,
        data: {
          lastDay,
          reason,
        },
      },
    });

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
    affectedRoster.map((roster) => roster.Shift.projectCuid),
  );

  const imageUUID = randomUUID();

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `mc/${imageUUID}`,
        Body: mc.buffer,
      }),
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
        }),
      ),
    );

    return res.send("MC request submitted successfully");
  } catch (error) {
    console.error("Error while submitting MC request:", error);
    return res.status(500).send("Internal server error");
  }
});

export default requestAPIRouter;
