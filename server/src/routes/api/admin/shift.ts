import { User } from "@/types/common";
import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  PermissionList,
} from "../../../utils/permissions";
import { DayOfWeek, PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();

const projectShiftAPIRouter: Router = Router();

projectShiftAPIRouter.delete("/shift", async (req, res) => {
  const user = req.user as User;
  const { cuid } = req.body;

  async function deleteShift() {
    await prisma.shift.delete({
      where: {
        cuid,
      },
    });

    return res.send("Shift deleted successfully.");
  }

  if (!cuid) return res.status(400).send("cuid is required.");

  try {
    const shiftData = await prisma.shift.findUniqueOrThrow({
      where: {
        cuid,
      },
      include: {
        ShiftGroup: {
          include: {
            Project: {
              include: {
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !shiftData.ShiftGroup.Project.Manage.some(
        (manage) => manage.consultantCuid === user.cuid,
      )
    ) {
      const hasEditAllProjectPermission = await checkPermission(
        user.cuid,
        PermissionList.CAN_EDIT_ALL_PROJECTS,
      );

      if (!hasEditAllProjectPermission) {
        return res
          .status(401)
          .send(
            PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS,
          );
      }
    }

    return deleteShift();
  } catch (error) {
    return res.status(404).send("Shift does not exist.");
  }
});

projectShiftAPIRouter.patch("/shift", async (req, res) => {
  const user = req.user as User;
  const { cuid, day, startTime, endTime } = req.body;

  async function updateShift() {
    await prisma.shift.update({
      where: {
        cuid,
      },
      data: updateData,
    });

    return res.send("Shift updated successfully.");
  }

  if (!cuid) return res.status(400).send("cuid is required.");

  if (!day && !startTime && !endTime) {
    return res
      .status(400)
      .send("At least one field (day, startTime, endTime) is required.");
  }

  if (day && !Object.values(DayOfWeek).includes(day.toUpperCase())) {
    return res.status(400).send("Invalid day.");
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
    ...(day && { day: day.toUpperCase() as DayOfWeek }),
    ...(startTime && { startTime: startTimeObject }),
    ...(endTime && { endTime: endTimeObject }),
  };

  try {
    const shiftData = await prisma.shift.findUniqueOrThrow({
      where: {
        cuid,
      },
      include: {
        ShiftGroup: {
          include: {
            Project: {
              include: {
                Manage: true,
              },
            },
          },
        },
      },
    });

    if (
      !shiftData.ShiftGroup.Project.Manage.some(
        (manage) => manage.consultantCuid === user.cuid,
      )
    ) {
      const hasEditAllProjectPermission = await checkPermission(
        user.cuid,
        PermissionList.CAN_EDIT_ALL_PROJECTS,
      );

      if (!hasEditAllProjectPermission) {
        return res
          .status(401)
          .send(
            PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS,
          );
      }
    }

    return updateShift();
  } catch (error) {
    return res.status(404).send("Shift does not exist.");
  }
});

export default projectShiftAPIRouter;
