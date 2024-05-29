import { User } from "@/types";
import {
  PERMISSION_ERROR_TEMPLATE,
  Permission,
  checkPermission,
} from "../../../utils/check-permission";
import { DayOfWeek, PrismaClient, Role } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();

const projectShiftAPIRouter: Router = Router();

projectShiftAPIRouter.post("/shift", async (req, res) => {
  const user = req.user as User;
  const {
    projectCuid,
    days,
    headcount,
    startTime,
    endTime,
    shiftcuid,
    shiftGroupName,
  } = req.body;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  if (!days) {
    return res.status(400).send("days is required.");
  }

  if (!headcount) {
    return res.status(400).send("headcount is required.");
  }

  if (!startTime) {
    return res.status(400).send("startTime is required.");
  }

  if (!endTime) {
    return res.status(400).send("endTime is required.");
  }

  if (!shiftcuid && !shiftGroupName) {
    return res.status(400).send("shiftcuid or shiftGroupName is required.");
  }

  if (!Array.isArray(days)) {
    return res.status(400).send("days must be an array.");
  }

  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number);
  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number);

  if (
    isNaN(startTimeHour) ||
    isNaN(startTimeMinute) ||
    isNaN(endTimeHour) ||
    isNaN(endTimeMinute)
  ) {
    console.log(startTimeHour, startTimeMinute, endTimeHour, endTimeMinute);
    return res.status(400).send("Invalid time format.");
  }

  if (startTimeHour < 0 || startTimeHour > 23) {
    return res.status(400).send("Invalid start time hour.");
  }

  if (startTimeMinute < 0 || startTimeMinute > 59) {
    return res.status(400).send("Invalid start time minute.");
  }

  if (endTimeHour < 0 || endTimeHour > 23) {
    return res.status(400).send("Invalid end time hour.");
  }

  if (endTimeMinute < 0 || endTimeMinute > 59) {
    return res.status(400).send("Invalid end time minute.");
  }

  const startTimeObject = new Date();
  startTimeObject.setHours(startTimeHour, startTimeMinute, 0, 0);

  const endTimeObject = new Date();
  endTimeObject.setHours(endTimeHour, endTimeMinute, 0, 0);

  const projectData = await prisma.project.findUnique({
    where: {
      cuid: projectCuid,
    },
    include: {
      Manage: true,
      ShiftGroup: true,
    },
  });

  if (!projectData) {
    return res.status(404).send("Project does not exist.");
  }

  // Checks if the user is a client holder of the project
  if (
    !projectData.Manage.some(
      (manage) =>
        manage.consultantCuid === user.cuid &&
        manage.role === Role.CLIENT_HOLDER,
    )
  ) {
    const hasEditAllProjectPermission = await checkPermission(
      user.cuid,
      Permission.CAN_EDIT_ALL_PROJECTS,
    );

    if (!hasEditAllProjectPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
    }
  }

  let shiftGroup: any;
  if (
    !projectData.ShiftGroup.some((shiftGroup) => shiftGroup.cuid === shiftcuid)
  ) {
    shiftGroup = await prisma.shiftGroup.create({
      data: {
        name: shiftGroupName,
        projectCuid,
      },
    });
  }

  const createData = days.map((day) => {
    return {
      day: day.toUpperCase() as DayOfWeek,
      headcount: parseInt(headcount),
      startTime: startTimeObject,
      endTime: endTimeObject,
      groupCuid: shiftcuid || shiftGroup.id,
    };
  });

  try {
    await prisma.shift.createMany({
      data: createData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  return res.send("Shift created successfully.");
});

projectShiftAPIRouter.delete("/shift", async (req, res) => {
  const user = req.user as User;
  const { cuid } = req.body;

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

    async function deleteShift() {
      await prisma.shift.delete({
        where: {
          cuid,
        },
      });

      return res.send("Shift deleted successfully.");
    }

    if (
      !shiftData.ShiftGroup.Project.Manage.some(
        (manage) => manage.consultantCuid === user.cuid,
      )
    ) {
      const hasEditAllProjectPermission = await checkPermission(
        user.cuid,
        Permission.CAN_EDIT_ALL_PROJECTS,
      );

      if (!hasEditAllProjectPermission) {
        return res
          .status(401)
          .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
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

    async function updateShift() {
      await prisma.shift.update({
        where: {
          cuid,
        },
        data: updateData,
      });

      return res.send("Shift updated successfully.");
    }

    if (
      !shiftData.ShiftGroup.Project.Manage.some(
        (manage) => manage.consultantCuid === user.cuid,
      )
    ) {
      const hasEditAllProjectPermission = await checkPermission(
        user.cuid,
        Permission.CAN_EDIT_ALL_PROJECTS,
      );

      if (!hasEditAllProjectPermission) {
        return res
          .status(401)
          .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
      }
    }

    return updateShift();
  } catch (error) {
    return res.status(404).send("Shift does not exist.");
  }
});

export default projectShiftAPIRouter;
