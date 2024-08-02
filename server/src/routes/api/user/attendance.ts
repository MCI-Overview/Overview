import { Request, Response, Router } from "express";
import { prisma, s3 } from "../../../client";
import { User } from "@/types/common";
import { AttendanceStatus } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dayjs from "dayjs";

const attendanceApiRouter: Router = Router();

/**
GET /api/user/attendance

Retrieves the current user's attendance data.

TODO: Replace with something like "/nextAttendance" instead
*/
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

/**
PATCH /api/user/attendance

Updates the current user's attendance data during clock in or clock out.
Includes image upload during clock in.

Parameters:
attendanceCuid
clockInTime
clockOutTime
imageData
startTime
location

TODO: Seperate into two different endpoints for clock in and clock out?
*/
attendanceApiRouter.patch(
  "/attendance",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const candidateCuid = user.cuid;

    const {
      attendanceCuid,
      clockInTime,
      clockOutTime,
      imageData,
      startTime,
      location,
    } = req.body;

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
    const clockInTimeObject = dayjs(clockInTime);
    const startTimeObject = dayjs(startTime);

    if (!clockInTime) {
      body = { clockOutTime };
    } else if (clockInTimeObject.isAfter(startTimeObject, "minute")) {
      body = { clockInTime, status: AttendanceStatus.LATE, location };
    } else {
      body = { clockInTime, status: AttendanceStatus.ON_TIME, location };
    }

    try {
      prisma.$transaction(
        async () => {
          const attendance = await prisma.attendance.update({
            where: {
              cuid: attendanceCuid,
              candidateCuid: candidateCuid,
            },
            data: body,
            select: {
              Shift: {
                select: {
                  projectCuid: true,
                },
              },
            },
          });

          if (imageData) {
            const base64Data = imageData.replace(
              /^data:image\/\w+;base64,/,
              ""
            );
            const buffer = Buffer.from(base64Data, "base64");

            try {
              await s3.send(
                new PutObjectCommand({
                  Bucket: process.env.S3_BUCKET_NAME!,
                  Key: `projects/${attendance.Shift.projectCuid}/clock-in/${candidateCuid}/${attendanceCuid}.jpg`,
                  Body: buffer,
                })
              );
            } catch (error) {
              console.error(error);
              return res.status(500).send("Internal server error");
            }
          }

          return;
        },
        {
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal server error");
    }

    return res.send("Attendance updated successfully");
  }
);

/**
GET /api/user/attendance/upcoming/:page

Retrieves the current user's upcoming rosters.
Uses pagination.

Parameters:
page
date (optional)
*/
attendanceApiRouter.get(
  "/upcoming/:page",
  async (req: Request, res: Response) => {
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
          gte: today.toDate(),
        },
      };

      if (date) {
        const selectedDate = dayjs(date as string).startOf("day");
        whereClause = {
          ...whereClause,
          shiftDate: {
            gte: selectedDate > today ? selectedDate : today,
            lt: dayjs(selectedDate).add(1, "day"),
          },
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
              Project: true,
            },
          },
        },
        orderBy: {
          shiftDate: "asc",
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
      res.status(500).json({
        error: "An error occurred while fetching the upcoming shifts.",
      });
    }
  }
);

/**
GET /api/user/attendance/history/:page

Retrieves the current user's past rosters.
Uses pagination.

Parameters:
page
date (optional)
*/
attendanceApiRouter.get(
  "/history/:page",
  async (req: Request, res: Response) => {
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
          lt: today,
        },
      };

      if (date) {
        const selectedDate = dayjs(date as string);
        whereClause = {
          ...whereClause,
          shiftDate: {
            gte: selectedDate.startOf("day"),
            lt:
              selectedDate.endOf("day") < today
                ? selectedDate.endOf("day")
                : today,
          },
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
              Project: true,
            },
          },
        },
        orderBy: {
          shiftDate: "asc",
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
      res.status(500).json({
        error: "An error occurred while fetching history shifts.",
      });
    }
  }
);

export default attendanceApiRouter;
