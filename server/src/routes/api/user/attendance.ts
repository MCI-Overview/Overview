import { Request, Response, Router } from "express";
import { prisma, s3 } from "../../../client";
import { User } from "@/types/common";
import { AttendanceStatus } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dayjs from "dayjs";

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
    console.error(error);
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
    } else if (clockInTime < startTime) {
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
      console.error(error);
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
        console.error(error);
        return res.status(500).send("Internal server error");
      }
    }

    return res.send("Attendance created successfully");
  }
);

attendanceApiRouter.get('/upcoming/:page', async (req: Request, res: Response) => {
  const user = req.user as User;
  const page = parseInt(req.params.page, 10);
  const { date } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  const today = dayjs();

  try {
    let whereClause: any = {
      candidateCuid: user.cuid,
      shiftDate: {
        gte: today
      }
    };

    if (date) {
      const selectedDate = dayjs(date as string).startOf("day");
      whereClause = {
        ...whereClause,
        shiftDate: {
          gte: selectedDate > today ? selectedDate : today,
          lt: dayjs(selectedDate).add(1, "day")
        }
      };
    }

    const totalCount = await prisma.attendance.count({
      where: whereClause,
    });

    const fetchedData = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        Shift: {
          include: {
            Project: true
          }
        }
      },
      orderBy: {
        shiftDate: "asc"
      },
      skip: offset,
      take: limit,
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

    res.json([fetchedData, paginationData]);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the upcoming shifts.' });
  }
});

attendanceApiRouter.get('/history/:page', async (req: Request, res: Response) => {
  const user = req.user as User;
  const page = parseInt(req.params.page, 10);
  const { date } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  const today = dayjs();

  try {
    let whereClause: any = {
      candidateCuid: user.cuid,
      shiftDate: {
        lt: today
      }
    };

    if (date) {
      const selectedDate = dayjs(date as string);
      whereClause = {
        ...whereClause,
        shiftDate: {
          gte: selectedDate.startOf("day"),
          lt: selectedDate.endOf("day") < today ? selectedDate.endOf("day") : today
        }
      };
    }

    const totalCount = await prisma.attendance.count({
      where: whereClause,
    });

    const fetchedData = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        Shift: {
          include: {
            Project: true
          }
        }
      },
      orderBy: {
        shiftDate: "asc"
      },
      skip: offset,
      take: limit,
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

    res.json([fetchedData, paginationData]);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the upcoming shifts.' });
  }
});



export default attendanceApiRouter;
