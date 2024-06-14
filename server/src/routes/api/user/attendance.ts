import { Request, Response, Router } from "express";
import { prisma, s3 } from "../../../client";
import { User } from "@/types/common";
import { AttendanceStatus } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const attendanceApiRouter: Router = Router();

attendanceApiRouter.get("/attendance", async (req: Request, res: Response) => {
  const user = req.user as User;
  const candidateCuid = user.cuid;

  try {
    const attendanceData = await prisma.attendance.findMany({
      where: {
        candidateCuid,
      },
      include: {
        Shift: {
          include: {
            Project: {
              select: {
                name: true,
                locations: true,
                timeWindow: true,
                distanceRadius: true,
              },
            },
          },
        },
      },
    });

    // sort by shiftDate first, then by startTime
    attendanceData.sort((a, b) => {
      if (a.shiftDate < b.shiftDate) return -1;
      if (a.shiftDate > b.shiftDate) return 1;
      if (a.Shift.startTime < b.Shift.startTime) return -1;
      if (a.Shift.startTime > b.Shift.startTime) return 1;
      return 0;
    });

    return res.send(attendanceData);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

attendanceApiRouter.patch(
  "/attendance",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const candidateCuid = user.cuid;

    const { attendanceCuid, clockInTime, clockOutTime, imageData, startTime } =
      req.body;

    if (!attendanceCuid) {
      return res.status(400).send("attendanceCuid is required");
    }

    if (!clockInTime && !clockOutTime) {
      return res.status(400).send("clockInTime or clockOutTime is required");
    }

    if (clockInTime && clockOutTime) {
      return res.status(400).send("Provide either clockInTime or clockOutTime");
    }

    if (clockInTime && !imageData) {
      return res.status(400).send("imageData is required when clocking in");
    }

    if (clockInTime && !startTime) {
      return res.status(400).send("startTime is required when clocking in");
    }

    let body;
    if (!clockInTime) {
      body = { clockOutTime };
    } else if (startTime < clockInTime) {
      body = { clockInTime, status: AttendanceStatus.ON_TIME };
    } else {
      body = { clockInTime, status: AttendanceStatus.LATE };
    }

    try {
      await prisma.attendance.update({
        where: {
          cuid: attendanceCuid,
          candidateCuid: candidateCuid,
        },
        data: body,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error");
    }

    // Upload image to S3
    if (imageData) {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      try {
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${candidateCuid}-${attendanceCuid}-clockIn.jpg`,
            Body: buffer,
          })
        );
      } catch (error) {
        console.log(error);
        return res.status(500).send("Internal server error");
      }
    }

    return res.send("Attendance created successfully");
  }
);

export default attendanceApiRouter;
