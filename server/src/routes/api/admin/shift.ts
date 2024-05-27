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

projectShiftAPIRouter.get("/shift/:shiftId", async (req, res) => {
  const user = req.user as User;
  const { shiftId } = req.params;

  const shiftData = await prisma.shift.findUnique({
    where: {
      shiftId,
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

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    shiftData.ShiftGroup.Project.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    return res.send(shiftData);
  }

  const hasReadAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (hasReadAllProjectPermission) {
    return res.send(shiftData);
  }

  return res
    .status(401)
    .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
});

projectShiftAPIRouter.post("/shift", async (req, res) => {
  const user = req.user as User;
  const { projectId, days, headcount, startTime, endTime, shiftGroupId } =
    req.body;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
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

  if (!shiftGroupId) {
    return res.status(400).send("shiftGroupId is required.");
  }

  if (!Array.isArray(days)) {
    return res.status(400).send("days must be an array.");
  }

  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number);
  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number);

  if (!startTimeHour || !startTimeMinute || !endTimeHour || !endTimeMinute) {
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
      id: projectId,
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
      (consultant) =>
        consultant.consultantEmail === user.id &&
        consultant.role === Role.CLIENT_HOLDER,
    )
  ) {
    const hasEditAllProjectPermission = await checkPermission(
      user.id,
      Permission.CAN_EDIT_ALL_PROJECTS,
    );

    if (!hasEditAllProjectPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
    }
  }

  const createData = days.map((day) => ({
    day: day.toUpperCase() as DayOfWeek,
    headcount: parseInt(headcount),
    startTime: startTimeObject,
    endTime: endTimeObject,
    projectId: projectId,
    groupId: shiftGroupId,
  }));

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
  const { shiftId } = req.body;

  if (!shiftId) {
    return res.status(400).send("shiftId is required.");
  }

  const shiftData = await prisma.shift.findUnique({
    where: {
      shiftId,
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

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    shiftData.ShiftGroup.Project.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    await prisma.shift.delete({
      where: {
        shiftId,
      },
    });

    return res.send("Shift deleted successfully.");
  }

  const hasEditAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_EDIT_ALL_PROJECTS,
  );

  if (!hasEditAllProjectPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
  }

  await prisma.shift.delete({
    where: {
      shiftId,
    },
  });

  return res.send("Shift deleted successfully.");
});

projectShiftAPIRouter.patch("/shift", async (req, res) => {
  const user = req.user as User;
  const { shiftId, day, headcount, startTime, endTime, shiftNumber } = req.body;

  if (!shiftId) {
    return res.status(400).send("shiftId is required.");
  }

  if (!day && !headcount && !startTime && !endTime && !shiftNumber) {
    return res
      .status(400)
      .send(
        "At least one field (day, headcount, startTime, endTime, shiftNumber) is required.",
      );
  }

  if (day && !Object.values(DayOfWeek).includes(day.toUpperCase())) {
    return res.status(400).send("Invalid day.");
  }

  if (headcount && headcount < 0) {
    return res
      .status(400)
      .send("headcount must be zero or a positive integer.");
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
    ...(headcount && { headcount: headcount }),
    ...(startTime && { startTime: startTimeObject }),
    ...(endTime && { endTime: endTimeObject }),
    ...(shiftNumber && { shiftNumber: shiftNumber }),
  };

  const shiftData = await prisma.shift.findUnique({
    where: {
      shiftId,
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

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    shiftData.ShiftGroup.Project.Manage.some(
      (consultant) =>
        consultant.consultantEmail === user.id &&
        consultant.role === Role.CLIENT_HOLDER,
    )
  ) {
    await prisma.shift.update({
      where: {
        shiftId,
      },
      data: updateData,
    });

    return res.send("Shift updated successfully.");
  }

  const hasEditAllProjectPermission = await checkPermission(
    user.id,
    Permission.CAN_EDIT_ALL_PROJECTS,
  );

  if (!hasEditAllProjectPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
  }

  await prisma.shift.update({
    where: {
      shiftId,
    },
    data: updateData,
  });

  return res.send("Shift updated successfully.");
});

export default projectShiftAPIRouter;
