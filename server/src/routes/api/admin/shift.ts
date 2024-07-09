// TODO: Update these API routes

import { User } from "@/types/common";
import { PrismaError } from "@/types";
import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  PermissionList,
} from "../../../utils/permissions";
import { prisma } from "../../../client";
import { Router } from "express";
import dayjs from "dayjs";

const projectShiftAPIRouter: Router = Router();

projectShiftAPIRouter.delete("/shift/:shiftCuid", async (req, res) => {
  const user = req.user as User;
  const { shiftCuid } = req.params;

  if (!shiftCuid)
    return res.status(400).json({
      message: "Please specify a shift cuid.",
    });

  let shiftData;
  try {
    shiftData = await prisma.shift.findUniqueOrThrow({
      where: {
        cuid: shiftCuid,
      },
      include: {
        Project: {
          include: {
            Manage: true,
          },
        },
        Attendance: true,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Shift does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  const hasPermission =
    shiftData.Project.Manage.some(
      (manage) => manage.consultantCuid === user.cuid
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  // Prevent/soft/hard delete based on attendance
  // scheduled future attendances => prevent delete
  // past attendances => soft delete
  // no attendances => hard delete

  if (shiftData.Attendance.length === 0) {
    await prisma.shift.delete({
      where: {
        cuid: shiftCuid,
      },
    });

    return res.json({ message: "Shift deleted successfully." });
  }

  // include attendences which end after current time
  const shiftEndTime = dayjs(shiftData.endTime);
  const futureAttendances = shiftData.Attendance.filter((attendance) => {
    const endTime = dayjs(attendance.shiftDate)
      .hour(shiftEndTime.hour())
      .minute(shiftEndTime.minute())
      .second(shiftEndTime.second())
      .millisecond(shiftEndTime.millisecond());

    return endTime.isAfter(dayjs());
  });

  if (futureAttendances.length > 0) {
    return res.status(400).json({ message: "Cannot delete ongoing shifts." });
  }

  await prisma.shift.update({
    where: {
      cuid: shiftCuid,
    },
    data: {
      status: "ARCHIVED",
    },
  });

  return res.json({ message: "Shift deleted successfully." });
});

// TODO: include commented fields
projectShiftAPIRouter.patch("/shift", async (req, res) => {
  const user = req.user as User;
  const {
    shiftCuid,
    // headcount
    day,
    startTime,
    // halfDayEndTime,
    // halfDayStartTime,
    endTime,
    // breakDuration,
  } = req.body;

  if (!shiftCuid) return res.status(400).send("shiftCuid is required.");

  if (!day && !startTime && !endTime) {
    return res
      .status(400)
      .send("At least one field (day, startTime, endTime) is required.");
  }

  let startTimeObject;
  if (startTime) {
    try {
      startTimeObject = new Date(startTime);
    } catch (error) {
      return res.status(400).send("Invalid startTime.");
    }
  }

  let endTimeObject;
  if (endTime) {
    try {
      endTimeObject = new Date(endTime);
    } catch (error) {
      return res.status(400).send("Invalid endTime.");
    }
  }

  const updateData = {
    ...(startTime && { startTime: startTimeObject }),
    ...(endTime && { endTime: endTimeObject }),
  };

  let shiftData;
  try {
    shiftData = await prisma.shift.findUniqueOrThrow({
      where: {
        cuid: shiftCuid,
      },
      include: {
        Project: {
          include: {
            Manage: true,
          },
        },
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Shift does not exist.");
    }

    console.log(error);
    return res.status(404).send("Shift does not exist.");
  }

  const hasPermission =
    shiftData.Project.Manage.some(
      (manage) => manage.consultantCuid === user.cuid
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  await prisma.shift.update({
    where: {
      cuid: shiftCuid,
    },
    data: updateData,
  });

  return res.send("Shift updated successfully.");
});

export default projectShiftAPIRouter;
