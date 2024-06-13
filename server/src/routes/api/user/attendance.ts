import { Request, Response, Router } from "express";
import { prisma } from "../../../client";
import { User } from "@/types/common";
import { AttendanceStatus } from "@prisma/client";

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

    const { attendanceCuid, clockInTime, clockOutTime, imageData } = req.body;

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

    let body;
    if (clockInTime) {
      body = {
        clockInTime,
        status: AttendanceStatus.PRESENT,
      };
    } else {
      body = { clockOutTime };
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

    return res.send("Attendance created successfully");
  }
);

export default attendanceApiRouter;
