import { Request, Response, Router } from "express";
import { prisma } from "../../../client";
import { User } from "@/types/common";

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

export default attendanceApiRouter;
