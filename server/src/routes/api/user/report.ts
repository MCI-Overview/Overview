import { prisma } from "../../../client";
import { User } from "@/types/common";
import dayjs from "dayjs";
import { Router } from "express";

const reportAPIRouter = Router();

reportAPIRouter.get("/report", async (req, res) => {
  const user = req.user as User;

  const { month, year } = req.query as {
    month: string;
    year: string;
  };

  const providedDate = dayjs()
    .set("month", parseInt(month))
    .set("year", parseInt(year));

  const queryDate = providedDate.isValid() ? providedDate : dayjs();

  const attendanceData = await prisma.attendance.findMany({
    where: {
      candidateCuid: user.cuid,
      shiftDate: {
        gte: queryDate.startOf("month").toDate(),
        lte: queryDate.endOf("month").toDate(),
      },
    },
    include: {
      Shift: true,
    },
  });

  const onTime = attendanceData.filter(
    (attendance) =>
      attendance.status === "ON_TIME" && attendance.clockOutTime !== null,
  ).length;
  const late = attendanceData.filter(
    (attendance) =>
      attendance.status === "LATE" && attendance.clockOutTime !== null,
  ).length;
  const noShow = attendanceData.filter(
    (attendance) =>
      attendance.status === "NO_SHOW" && attendance.leave === null,
  ).length;
  const others = attendanceData.filter(
    (attendance) =>
      attendance.clockInTime !== null && attendance.clockOutTime === null,
  ).length;

  const hoursWorked = attendanceData
    .filter(
      (attendance) =>
        attendance.clockOutTime !== null && attendance.status !== "NO_SHOW",
    )
    .reduce((acc, attendance) => {
      if (attendance.shiftType === "FULL_DAY") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "FIRST_HALF") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.halfDayEndTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "SECOND_HALF") {
        const startTime = dayjs(attendance.Shift.halfDayStartTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      return acc;
    }, 0);

  const scheduledHoursWorked = attendanceData
    .filter((attendance) => attendance.status !== "MEDICAL")
    .reduce((acc, attendance) => {
      if (attendance.shiftType === "FULL_DAY") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "FIRST_HALF") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.halfDayEndTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "SECOND_HALF") {
        const startTime = dayjs(attendance.Shift.halfDayStartTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      return acc;
    }, 0);

  const mc = attendanceData.filter(
    (attendance) =>
      attendance.status === "MEDICAL" && attendance.leave === null,
  ).length;
  const leave = attendanceData
    .filter(
      (attendance) =>
        attendance.status !== "MEDICAL" && attendance.leave !== null,
    )
    .reduce((acc, attendance) => {
      if (attendance.leave === "HALFDAY") {
        return acc + 0.5;
      }

      return acc + 1;
    }, 0);

  return res.json({
    onTime,
    late,
    noShow,
    others,
    mc,
    leave,
    hoursWorked,
    scheduledHoursWorked,
  });
});

export default reportAPIRouter;
