import { Router, Request, Response } from "express";
import {
  Candidate,
  DayOfWeek,
  PrismaClient,
  Role,
  ShiftStatus,
} from "@prisma/client";
import { PrismaError, User, Location } from "@/types";
import {
  checkPermission,
  Permission,
  PERMISSION_ERROR_TEMPLATE,
  maskNRIC,
} from "../../../utils/";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const projectAPIRouter: Router = Router();
const VALID_EMPLOYMENT_BY = [
  "MCI Career Services Pte Ltd",
  "MCI Outsourcing Pte Ltd",
];

projectAPIRouter.get("/project/:projectCuid", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;

  // TODO: check if user has permission to view project

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: true,
        ShiftGroup: {
          include: {
            Shift: true,
          },
        },
        Assign: {
          include: {
            Candidate: true,
          },
        },
        Client: true,
      },
    });

    if (
      !projectData.Manage.some((manage) => manage.consultantCuid === user.cuid)
    ) {
      const hasReadAllProjectPermission = await checkPermission(
        user.cuid,
        Permission.CAN_READ_ALL_PROJECTS,
      );

      if (!hasReadAllProjectPermission) {
        return res
          .status(401)
          .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
      }
    }

    return res.send(projectData);
  } catch (error) {
    return res.status(404).send("Project does not exist.");
  }
});

projectAPIRouter.post("/project", async (req, res) => {
  const user = req.user as User;
  const {
    name,
    clientUEN,
    clientName,
    employmentBy,
    locations,
    startDate,
    endDate,
    candidateHolders,
  } = req.body;

  if (!name)
    return res.status(400).json({
      message: "Please specify a project name.",
    });
  if (!employmentBy)
    return res.status(400).json({
      message: "Please choose employment by company.",
    });
  if (!clientUEN)
    return res.status(400).json({
      message: "Please specify client UEN number.",
    });
  if (!startDate)
    return res.status(400).json({
      message: "Please specify a start date.",
    });
  if (!endDate)
    return res.status(400).json({
      message: "Please specify an end date.",
    });

  let endDateObject: Date | undefined;
  if (endDate) {
    try {
      endDateObject = new Date(Date.parse(endDate));
    } catch (error) {
      return res.status(400).json({
        message: "Invalid end date parameter.",
      });
    }
  }

  let startDateObject: Date | undefined;
  if (startDate) {
    try {
      startDateObject = new Date(Date.parse(startDate));
    } catch (error) {
      return res.status(400).json({
        message: "Invalid start date parameter.",
      });
    }
  }

  if (startDateObject && endDateObject && startDateObject > endDateObject) {
    return res.status(400).json({
      message: "Please ensure that start date is after end date.",
    });
  }

  if (locations && !Array.isArray(locations)) {
    return res.status(400).json({
      message: "Invalid locations parameter (Not an array).",
    });
  }

  if (locations && Array.isArray(locations)) {
    try {
      locations.map((location: Location) => {
        return {
          postalCode: location.postalCode,
          address: location.address,
          longitude: location.longitude,
          latitude: location.latitude,
        };
      });
    } catch (error) {
      return res.status(400).json({
        message: "Invalid locations parameter (Location object format)",
      });
    }
  }

  if (candidateHolders && !Array.isArray(candidateHolders)) {
    return res.status(400).json({
      message: "Invalid candidate holders parameter (Not an array).",
    });
  }

  if (!VALID_EMPLOYMENT_BY.includes(employmentBy)) {
    return res.status(400).send("Invalid employmentBy parameter.");
  }

  const createData = {
    name,
    startDate,
    endDate,
    locations,
    employmentBy,
  };

  try {
    const projectData = await prisma.project.create({
      data: {
        ...createData,
        Manage: {
          createMany: {
            data: [
              {
                consultantCuid: user.cuid,
                role: Role.CLIENT_HOLDER,
              },
              ...candidateHolders.map((cuid: string) => {
                return {
                  consultantCuid: cuid,
                  role: Role.CANDIDATE_HOLDER,
                };
              }),
            ],
          },
        },
        Client: {
          connectOrCreate: {
            where: {
              uen: clientUEN,
            },
            create: {
              uen: clientUEN,
              name: clientName,
            },
          },
        },
      },
    });

    return res.json({
      message: "Project successfully created.",
      projectCuid: projectData.cuid,
    });
  } catch (error) {
    const prismaError = error as PrismaError;

    if (
      prismaError.code === "P2003" &&
      prismaError.meta.field_name === "Project_clientId_fkey (index)"
    ) {
      return res.status(400).json({
        message: "clientId does not exist.",
      });
    }

    console.log(prismaError);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

projectAPIRouter.delete("/project", async (req, res) => {
  const user = req.user as User;
  const { cuid } = req.body;

  try {
    await prisma.project.update({
      where: {
        cuid,
        Manage: {
          some: {
            consultantCuid: user.cuid,
          },
        },
      },
      data: {
        status: "DELETED",
      },
    });
    return res.send("Project deleted");
  } catch (error) {
    const prismaError = error as PrismaError;

    if (prismaError.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.delete("/project/permanent", async (req, res) => {
  const user = req.user as User;
  const { cuid } = req.body;

  const hasHardDeletePermission = await checkPermission(
    user.cuid,
    Permission.CAN_HARD_DELETE_PROJECTS,
  );

  if (!hasHardDeletePermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_HARD_DELETE_PROJECTS);
  }

  try {
    await prisma.project.delete({
      where: {
        cuid,
      },
    });

    return res.send("Project hard deleted.");
  } catch (error) {
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.patch("/project", async (req, res) => {
  const user = req.user as User;

  const {
    cuid,
    name,
    clientUEN,
    employmentBy,
    locations,
    startDate,
    endDate,
    candidateHolders,
  } = req.body;

  if (!cuid) return res.status(400).send("cuid is required.");

  if (!VALID_EMPLOYMENT_BY.includes(employmentBy)) {
    return res.status(400).send("Invalid employmentBy parameter.");
  }

  let endDateObject: Date | undefined;
  if (endDate) {
    try {
      endDateObject = new Date(Date.parse(endDate));
    } catch (error) {
      return res.status(400).send("Invalid endDate parameter.");
    }
  }

  let startDateObject: Date | undefined;
  if (startDate) {
    try {
      startDateObject = new Date(Date.parse(startDate));
    } catch (error) {
      return res.status(400).send("Invalid startDate parameter.");
    }
  }

  if (startDateObject && endDateObject && startDateObject > endDateObject) {
    return res.status(400).send("startDate cannot be after endDate.");
  }

  if (locations && !Array.isArray(locations)) {
    return res.status(400).send("locations must be an array.");
  }

  if (locations && Array.isArray(locations)) {
    try {
      locations.map((location: Location) => {
        return {
          postalCode: location.postalCode,
          address: location.address,
          longitude: location.longitude,
          latitude: location.latitude,
        };
      });
    } catch (error) {
      return res.status(400).send("Invalid locations parameter.");
    }
  }

  if (candidateHolders && !Array.isArray(candidateHolders)) {
    return res.status(400).send("candidateHolders must be an array.");
  }

  const hasCanEditAllProjects = await checkPermission(
    user.cuid,
    Permission.CAN_EDIT_ALL_PROJECTS,
  );

  let updateData = {
    ...(name && { name }),
    ...(clientUEN && { clientUEN }),
    ...(locations && { locations }),
    ...(employmentBy && { employmentBy }),
    ...(startDateObject && { startDate: startDateObject }),
    ...(endDateObject && { endDate: endDateObject }),
    ...(candidateHolders && {
      candidateHolders: { update: candidateHolders },
    }),
  };

  if (!hasCanEditAllProjects) {
    updateData = {
      ...(name && { name }),
      ...(locations && { locations }),
      ...(employmentBy && { employmentBy }),
      ...(startDateObject && { startDate: startDateObject }),
      ...(endDateObject && { endDate: endDateObject }),
      ...(candidateHolders && {
        candidateHolders: { update: candidateHolders },
      }),
    };
  }

  try {
    await prisma.project.update({
      where: {
        cuid: cuid,
        Manage: {
          some: {
            consultantCuid: user.cuid,
          },
        },
      },
      data: updateData,
    });

    return res.send(`Project ${cuid} updated successfully.`);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project not found.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.get("/project/:projectCuid/candidates", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Assign: {
          include: {
            Candidate: true,
          },
        },
        Manage: true,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  const hasPermission =
    projectData.Manage.some((manage) => manage.consultantCuid === user.cuid) ||
    (await checkPermission(user.cuid, Permission.CAN_READ_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
  }

  let candidateData: any = projectData.Assign.map((assign) => assign.Candidate);

  const hasReadCandidateDetailsPermission = await checkPermission(
    user.cuid,
    Permission.CAN_READ_CANDIDATE_DETAILS,
  );

  if (!hasReadCandidateDetailsPermission) {
    candidateData = candidateData.map((candidate: Candidate) => {
      const { cuid, nric, name, contact, dateOfBirth } = candidate;
      return {
        cuid,
        nric: maskNRIC(nric),
        name,
        contact: contact,
        dateOfBirth,
      };
    });
  }

  return res.send(candidateData);
});

projectAPIRouter.post("/project/:projectCuid/candidates", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const candidates = req.body;

  if (!projectCuid) return res.status(400).send("projectCuid is required.");

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: true,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  const hasPermission =
    projectData.Manage.some((manage) => manage.consultantCuid === user.cuid) ||
    (await checkPermission(user.cuid, Permission.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
  }

  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).send("Nonempty candidates array is required.");
  }

  // verify all candidates have nric, name, contact, dateOfBirth
  const invalidCandidates = candidates.filter(
    (cdd: any) => !cdd.nric || !cdd.name || !cdd.contact || !cdd.dateOfBirth,
  );

  if (invalidCandidates.length > 0) {
    return res.status(400).send("Invalid candidate data.");
  }

  let candidateObjects;
  try {
    candidateObjects = candidates.map((cdd) => {
      return {
        nric: cdd.nric,
        contact: cdd.contact,
        name: cdd.name,
        hasOnboarded: false,
        nationality: null,
        dateOfBirth: new Date(Date.parse(cdd.dateOfBirth)),
        bankDetails: undefined,
        address: undefined,
        emergencyContact: undefined,
      };
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Invalid dateOfBirth parameter.");
  }

  // let existingCandidates;
  // try {
  //   existingCandidates = await prisma.candidate.findMany({
  //     where: {
  //       nric: {
  //         in: candidateObjects.map((cdd) => cdd.nric),
  //       },
  //     },
  //   });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).send("Internal server error.");
  // }

  // const newCandidates = candidateObjects.filter(
  //   (cdd) => !existingCandidates.some((existCdd) => existCdd.nric === cdd.nric),
  // );

  try {
    return await prisma.$transaction(async (prisma) => {
      const candidateData = await prisma.candidate.createManyAndReturn({
        data: candidateObjects,
        skipDuplicates: true,
      });

      await Promise.all(
        candidateData.map((cdd) =>
          prisma.user.create({
            data: {
              hash: bcrypt.hashSync(cdd.contact, 12),
              username: cdd.nric,
              Candidate: {
                connect: {
                  cuid: cdd.cuid,
                },
              },
            },
          }),
        ),
      );

      // retrieve cuids
      const candidates = await prisma.candidate.findMany({
        where: {
          nric: {
            in: candidateObjects.map((cdd) => cdd.nric),
          },
        },
      });

      const assignData = candidates.map((cdd) => {
        return {
          candidateCuid: cdd.cuid,
          consultantCuid: user.cuid,
          projectCuid: projectCuid,
        };
      });

      const createdAssigns = await prisma.assign.createManyAndReturn({
        data: assignData,
        skipDuplicates: true,
      });

      const alreadyAssignedCandidates = candidates.filter(
        (cdd) =>
          !createdAssigns.some((assign) => assign.candidateCuid === cdd.cuid),
      );

      return res.send(alreadyAssignedCandidates);
    });
  } catch (error) {
    const err = error as PrismaError;
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.delete(
  "/project/:projectCuid/candidates",
  async (req, res) => {
    const user = req.user as User;
    const { projectCuid } = req.params;
    const { cuidList } = req.body;

    if (!projectCuid) {
      return res.status(400).send("projectCuid is required.");
    }

    if (!cuidList || !Array.isArray(cuidList) || cuidList.length === 0) {
      return res.status(400).send("Nonempty cuidList array is required.");
    }

    let projectData;
    try {
      projectData = await prisma.project.findUniqueOrThrow({
        where: {
          cuid: projectCuid,
        },
        include: {
          Manage: true,
        },
      });
    } catch (error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).send("Project does not exist.");
      }

      console.log(error);
      return res.status(500).send("Internal server error.");
    }

    const hasPermission =
      projectData.Manage.some((m) => m.consultantCuid === user.cuid) ||
      (await checkPermission(user.cuid, Permission.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
    }

    try {
      await prisma.assign.deleteMany({
        where: {
          projectCuid: projectCuid,
          candidateCuid: {
            in: cuidList,
          },
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }

    return res.send("Candidates removed successfully.");
  },
);

projectAPIRouter.get("/project/:projectCuid/shifts", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: true,
        ShiftGroup: {
          include: {
            Shift: true,
          },
        },
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  const responseData = projectData.ShiftGroup.filter(
    (shift) => shift.shiftStatus === ShiftStatus.ACTIVE,
  ).map((shiftGroup) => shiftGroup.Shift);

  const hasPermission =
    projectData.Manage.some((manage) => manage.consultantCuid === user.cuid) ||
    (await checkPermission(user.cuid, Permission.CAN_READ_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
  }

  return res.send(responseData);
});

projectAPIRouter.get("/project/:projectCuid/shiftGroups", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: true,
        ShiftGroup: {
          include: {
            Shift: true,
          },
        },
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  const responseData = projectData.ShiftGroup.filter(
    (shiftGroup) => shiftGroup.shiftStatus === ShiftStatus.ACTIVE,
  );

  const hasPermission =
    projectData.Manage.some((manage) => manage.consultantCuid === user.cuid) ||
    (await checkPermission(user.cuid, Permission.CAN_READ_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
  }

  return res.send(responseData);
});

projectAPIRouter.post("/project/:projectCuid/shifts", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const {
    days,
    headcount,
    startTime,
    endTime,
    shiftGroupCuid,
    shiftGroupName,
  } = req.body;

  if (!days) return res.status(400).send("days is required.");

  if (parseInt(headcount) <= 0) {
    return res.status(400).send("positive headcount is required.");
  }

  if (!startTime) return res.status(400).send("startTime is required.");

  if (!endTime) return res.status(400).send("endTime is required.");

  if (!shiftGroupCuid && !shiftGroupName) {
    return res
      .status(400)
      .send("shiftGroupCuid or shiftGroupName is required.");
  }

  if (!Array.isArray(days) || days.length === 0) {
    return res.status(400).send("days must be a nonempty array.");
  }

  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number);
  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number);

  if (
    isNaN(startTimeHour) ||
    isNaN(startTimeMinute) ||
    isNaN(endTimeHour) ||
    isNaN(endTimeMinute)
  ) {
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

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: true,
        ShiftGroup: true,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  // Checks if the user is a client holder of the project
  const hasPermission =
    projectData.Manage.some(
      (manage) =>
        manage.consultantCuid === user.cuid &&
        manage.role === Role.CLIENT_HOLDER,
    ) || (await checkPermission(user.cuid, Permission.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
  }

  let shiftGroup: any;
  if (
    !projectData.ShiftGroup.some(
      (shiftGroup) => shiftGroup.cuid === shiftGroupCuid,
    )
  ) {
    try {
      shiftGroup = await prisma.shiftGroup.create({
        data: {
          name: shiftGroupName,
          headcount: parseInt(headcount),
          projectCuid,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }
  } else {
    // TODO: check for clashes in timings with existing shifts
  }

  const createData = days.map((day) => {
    return {
      day: day.toUpperCase() as DayOfWeek,
      startTime: startTimeObject,
      endTime: endTimeObject,
      groupCuid: shiftGroupCuid || shiftGroup.cuid,
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

projectAPIRouter.get(
  "/project/:projectCuid/attendance/:date&:candidateCuid",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { projectCuid, candidateCuid, date } = req.params;

    if (!projectCuid) {
      return res.status(400).send("projectCuid is required.");
    }

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).send("valid date is required.");
    }

    // find first and last day of month
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    let projectData;
    try {
      projectData = await prisma.project.findUniqueOrThrow({
        where: {
          cuid: projectCuid,
        },
        include: {
          Manage: true,
        },
      });
    } catch (error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).send("Project does not exist.");
      }

      console.log(error);
      return res.status(500).send("Internal server error.");
    }

    const hasPermission =
      projectData.Manage.some(
        (manage) => manage.consultantCuid === user.cuid,
      ) || (await checkPermission(user.cuid, Permission.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_EDIT_ALL_PROJECTS);
    }

    try {
      const attendanceData = await prisma.attendance.findMany({
        where: {
          ...(candidateCuid && { candidateCuid }),
          shiftDate: {
            gte: startDate,
            lte: endDate,
          },
          Shift: {
            ShiftGroup: {
              projectCuid: projectCuid,
            },
          },
          NOT: {
            status: null,
          },
        },
      });

      return res.send(attendanceData);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }
  },
);

projectAPIRouter.get(
  "/project/:projectCuid/candidates/roster",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };
    const { projectCuid } = req.params;

    if (!projectCuid) {
      return res.status(400).send("projectCuid is required.");
    }

    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).send("valid startDate is required.");
    }

    if (!endDate || isNaN(Date.parse(endDate))) {
      return res.status(400).send("valid endDate is required.");
    }

    let projectData;
    try {
      projectData = await prisma.project.findUniqueOrThrow({
        where: {
          cuid: projectCuid,
        },
        include: {
          Manage: true,
          Assign: true,
        },
      });
    } catch (error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).send("Project does not exist.");
      }

      console.log(error);
      return res.status(500).send("Internal server error.");
    }

    const hasPermission =
      projectData.Manage.some(
        (manage) => manage.consultantCuid === user.cuid,
      ) || (await checkPermission(user.cuid, Permission.CAN_READ_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
    }

    try {
      const attendanceData = await prisma.attendance.findMany({
        where: {
          candidateCuid: {
            in: projectData.Assign.map((assign) => assign.candidateCuid),
          },
          shiftDate: {
            gte: startDate,
            lte: endDate,
          },
          Shift: {
            ShiftGroup: {
              projectCuid: projectCuid,
            },
          },
          status: null,
        },
      });

      return res.send(attendanceData);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }
  },
);

projectAPIRouter.get("/projects", async (req, res) => {
  const user = req.user as User;

  try {
    const projectsData = await prisma.project.findMany({
      where: {
        Manage: {
          some: {
            consultantCuid: user.cuid,
          },
        },
      },
      include: {
        Client: true,
      },
    });

    return res.send(projectsData);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.get("/projects/all", async (req, res) => {
  const user = req.user as User;

  const hasReadAllProjectsPermission = await checkPermission(
    user.cuid,
    Permission.CAN_READ_ALL_PROJECTS,
  );

  if (!hasReadAllProjectsPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + Permission.CAN_READ_ALL_PROJECTS);
  }

  try {
    const projectsData = await prisma.project.findMany();

    return res.send(projectsData);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

export default projectAPIRouter;
