import { User } from "@/types";
import {
  Permission,
  PermissionErrorMessage,
  checkPermission,
} from "@/utils/check-permission";
import { DayOfWeek, PrismaClient, Role } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();

const projectShiftAPIRouter: Router = Router();

projectShiftAPIRouter.get("/shift/:shiftId", async (req, res) => {
  const user = req.user as User;
  const { shiftId } = req.params;

  const shiftData = await prisma.shift.findUnique({
    where: {
      id: shiftId,
    },
    include: {
      Project: {
        include: {
          Manage: true,
        },
      },
    },
  });

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    shiftData.Project.Manage.some(
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
    .send(PermissionErrorMessage.CANNOT_READ_PROJECT_ERROR_MESSAGE);
});

projectShiftAPIRouter.post("/shift", async (req, res) => {
  const user = req.user as User;
  const { projectId, day, headcount, startTime, endTime, shiftNumber } =
    req.body;

  if (!projectId) {
    return res.status(400).send("projectId is required.");
  }

  if (!day) {
    return res.status(400).send("day is required.");
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

  if (!shiftNumber) {
    return res.status(400).send("shiftNumber is required.");
  }

  const projectData = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      Manage: true,
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
        .send(PermissionErrorMessage.CANNOT_EDIT_PROJECT_ERROR_MESSAGE);
    }
  }

  try {
    await prisma.shift.create({
      data: {
        day: day.toUpperCase() as DayOfWeek,
        headcount: headcount,
        startTime: startTime,
        endTime: endTime,
        shiftNumber: shiftNumber,
        Project: {
          connect: {
            id: projectId,
          },
        },
      },
    });
  } catch (error) {
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
      id: shiftId,
    },
    include: {
      Project: {
        include: {
          Manage: true,
        },
      },
    },
  });

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    shiftData.Project.Manage.some(
      (consultant) => consultant.consultantEmail === user.id,
    )
  ) {
    await prisma.shift.delete({
      where: {
        id: shiftId,
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
      .send(PermissionErrorMessage.CANNOT_EDIT_PROJECT_ERROR_MESSAGE);
  }

  await prisma.shift.delete({
    where: {
      id: shiftId,
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
      id: shiftId,
    },
    include: {
      Project: {
        include: {
          Manage: true,
        },
      },
    },
  });

  if (!shiftData) {
    return res.status(404).send("Shift does not exist.");
  }

  if (
    shiftData.Project.Manage.some(
      (consultant) =>
        consultant.consultantEmail === user.id &&
        consultant.role === Role.CLIENT_HOLDER,
    )
  ) {
    await prisma.shift.update({
      where: {
        id: shiftId,
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
      .send(PermissionErrorMessage.CANNOT_EDIT_PROJECT_ERROR_MESSAGE);
  }

  await prisma.shift.update({
    where: {
      id: shiftId,
    },
    data: updateData,
  });

  return res.send("Shift updated successfully.");
});

export default projectShiftAPIRouter;
