import { Router, Request, Response } from "express";
import {
  EmploymentType,
  DayOfWeek,
  PrismaClient,
  Role,
  ShiftStatus,
} from "@prisma/client";
import { PrismaError } from "@/types";
import {
  GetProjectDataResponse,
  User,
  Location,
  ShiftGroup,
} from "@/types/common";
import {
  processCandidateData,
  checkLocationsValidity,
  checkDatesValidity,
  checkEmploymentByValidity,
  checkNoticePeriodValidity,
  checkTimesValidity,
} from "../../../utils/";
import bcrypt from "bcrypt";

import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  getPermissions,
  PermissionList,
} from "../../../utils/permissions";

const prisma = new PrismaClient();
const projectAPIRouter: Router = Router();

projectAPIRouter.get("/project/:projectCuid", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: {
          include: {
            Consultant: true,
          },
        },
        Shift: {
          where: {
            status: ShiftStatus.ACTIVE,
          },
        },
        Assign: {
          include: {
            Candidate: true,
            Consultant: {
              select: {
                cuid: true,
              },
            },
          },
        },
        Client: true,
      },
    });

    const permissionData = await getPermissions(user.cuid);

    const hasPermission =
      projectData.Manage.some(
        (manage) => manage.consultantCuid === user.cuid
      ) ||
      (await checkPermission(
        user.cuid,
        PermissionList.CAN_READ_ALL_PROJECTS,
        permissionData
      ));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_READ_ALL_PROJECTS);
    }

    const {
      cuid,
      name,
      employmentBy,
      locations,
      startDate,
      endDate,
      createdAt,
      noticePeriodDuration,
      noticePeriodUnit,
      status,
      Client,
      shiftGroups,
      Shift,
      Assign,
      Manage,
    } = projectData;

    const processedData: GetProjectDataResponse = {
      cuid,
      name,
      employmentBy,
      locations: locations as Location[],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: createdAt.toISOString(),
      noticePeriodDuration,
      noticePeriodUnit,
      status,
      shiftGroups: shiftGroups as unknown as ShiftGroup[],
      shifts: Shift,
      client: {
        ...Client,
      },
      candidates: await processCandidateData(user.cuid, Assign, permissionData),
      consultants: Manage.map((manage) => {
        const { role } = manage;
        const { cuid, name, email } = manage.Consultant;

        return {
          cuid,
          name,
          email,
          role,
        };
      }),
    };

    return res.send(processedData);
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
    noticePeriodDuration,
    noticePeriodUnit,
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
  if (!noticePeriodDuration || !noticePeriodUnit)
    return res.status(400).json({
      message: "Please specify notice period duration and unit.",
    });

  const datesValidity = checkDatesValidity(startDate, endDate);
  if (!datesValidity.isValid) {
    return res.status(400).json({
      message: datesValidity.message,
    });
  }

  const noticePeriodValidity = checkNoticePeriodValidity(
    noticePeriodDuration,
    noticePeriodUnit,
    startDate,
    endDate
  );
  if (!noticePeriodValidity.isValid) {
    return res.status(400).json({
      message: noticePeriodValidity.message,
    });
  }

  const locationsValidity = checkLocationsValidity(locations);
  if (!locationsValidity.isValid) {
    return res.status(400).json({
      message: locationsValidity.message,
    });
  }

  const employmentByValidity = checkEmploymentByValidity(employmentBy);
  if (!employmentByValidity.isValid) {
    return res.status(400).json({
      message: employmentByValidity.message,
    });
  }

  if (candidateHolders && !Array.isArray(candidateHolders)) {
    return res.status(400).json({
      message: "Invalid candidate holders parameter (Not an array).",
    });
  }

  const createData = {
    name,
    startDate,
    endDate,
    noticePeriodDuration: parseInt(noticePeriodDuration),
    noticePeriodUnit,
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

projectAPIRouter.delete("/project/:projectCuid", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;

  if (!projectCuid)
    return res.status(400).json({ message: "projectCuid is required." });

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
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  try {
    await prisma.project.update({
      where: {
        cuid: projectCuid,
      },
      data: {
        status: "DELETED",
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  return res.send("Project deleted");
});

// TODO: Delete related references in other tables first
projectAPIRouter.delete("/project/permanent", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.body;

  const hasHardDeletePermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_HARD_DELETE_PROJECTS
  );

  if (!hasHardDeletePermission) {
    return res
      .status(401)
      .send(
        PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_HARD_DELETE_PROJECTS
      );
  }

  try {
    await prisma.project.delete({
      where: {
        cuid: projectCuid,
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
    projectCuid,
    name,
    clientUEN,
    employmentBy,
    locations,
    startDate,
    endDate,
    candidateHolders,
  } = req.body;

  if (!projectCuid) return res.status(400).send("projectCuid is required.");

  const employmentByValidity = checkEmploymentByValidity(employmentBy);
  if (!employmentByValidity.isValid) {
    return res.status(400).json({
      message: employmentByValidity.message,
    });
  }

  const datesValidity = checkDatesValidity(startDate, endDate);
  if (!datesValidity.isValid) {
    return res.status(400).json({
      message: datesValidity.message,
    });
  }

  const locationsValidity = checkLocationsValidity(locations);
  if (!locationsValidity.isValid) {
    return res.status(400).json({
      message: locationsValidity.message,
    });
  }

  if (candidateHolders && !Array.isArray(candidateHolders)) {
    return res.status(400).send("candidateHolders must be an array.");
  }

  const hasCanEditAllProjects = await checkPermission(
    user.cuid,
    PermissionList.CAN_EDIT_ALL_PROJECTS
  );

  let updateData = {
    ...(name && { name }),
    ...(clientUEN && { clientUEN }),
    ...(locations && { locations }),
    ...(employmentBy && { employmentBy }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(endDate && { endDate: new Date(endDate) }),
    ...(candidateHolders && {
      candidateHolders: { update: candidateHolders },
    }),
  };

  if (!hasCanEditAllProjects) {
    delete updateData.clientUEN;
  }

  try {
    await prisma.project.update({
      where: {
        cuid: projectCuid,
        Manage: {
          some: {
            consultantCuid: user.cuid,
          },
        },
      },
      data: updateData,
    });

    return res.send(`Project ${projectCuid} updated successfully.`);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Project not found.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }
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
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).send("Nonempty candidates array is required.");
  }

  // verify all candidates have nric, name, contact, dateOfBirth, startDate, endDate, employmentType
  const invalidCandidates = candidates.filter(
    (cdd: any) =>
      !cdd.nric ||
      !cdd.name ||
      !cdd.contact ||
      !cdd.dateOfBirth ||
      !cdd.startDate ||
      !cdd.endDate ||
      !cdd.employmentType
  );

  if (invalidCandidates.length > 0) {
    return res.status(400).send("Invalid candidate data.");
  }

  for (const cdd of candidates) {
    const datesValidity = checkDatesValidity(cdd.startDate, cdd.endDate);
    if (!datesValidity.isValid) {
      return res.status(400).json({
        message: datesValidity.message,
      });
    }

    // set cdd end date to project end date if it exceeds
    const startDate = new Date(cdd.startDate);
    const endDate = new Date(cdd.endDate);
    if (
      startDate < projectData.startDate ||
      endDate < projectData.startDate ||
      startDate > projectData.endDate ||
      endDate > projectData.endDate
    ) {
      return res
        .status(400)
        .send("Candidate start/end dates must fall within project period.");
    }
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
          })
        )
      );

      // retrieve cuids
      const candidatesInDb = await prisma.candidate.findMany({
        where: {
          nric: {
            in: candidateObjects.map((cdd) => cdd.nric),
          },
        },
      });

      const assignData = candidatesInDb.map((cdd) => {
        return {
          candidateCuid: cdd.cuid,
          consultantCuid: user.cuid,
          projectCuid: projectCuid,
          startDate: new Date(
            candidates.find((c) => c.nric === cdd.nric).startDate
          ),
          endDate: new Date(
            candidates.find((c) => c.nric === cdd.nric).endDate
          ),
          employmentType: candidates.find((c) => c.nric === cdd.nric)
            .employmentType as EmploymentType,
        };
      });

      const createdAssigns = await prisma.assign.createManyAndReturn({
        data: assignData,
        skipDuplicates: true,
      });

      const alreadyAssignedCandidates = candidatesInDb
        .filter(
          (cdd) =>
            !createdAssigns.some((assign) => assign.candidateCuid === cdd.cuid)
        )
        .map((cdd) => cdd.cuid);

      return res.send(alreadyAssignedCandidates);
    });
  } catch (error) {
    const err = error as PrismaError;
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
});

// TODO: revisit candidate deletion logic. Proposed steps:
// 1. Delete scheduled future attendances (if they exist)
// 2. If candidate has no past attendances, hard delete candidate
// 3. Otherwise, soft delete candidate by setting endDate to current date
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
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
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
  }
);

projectAPIRouter.post("/project/:projectCuid/shifts", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const {
    days,
    headcount,
    startTime,
    endTime,
    halfDayEndTime,
    halfDayStartTime,
    breakDuration,
  } = req.body;

  if (!days) return res.status(400).send("days is required.");

  if (parseInt(headcount) <= 0) {
    return res.status(400).send("positive headcount is required.");
  }

  if (!startTime) return res.status(400).send("startTime is required.");

  if (!endTime) return res.status(400).send("endTime is required.");

  if (
    (halfDayEndTime && !halfDayStartTime) ||
    (!halfDayEndTime && halfDayStartTime)
  ) {
    return res
      .status(400)
      .send("specify both/neither halfDayEndTime and halfDayStartTime.");
  }

  if (breakDuration && parseInt(breakDuration) < 0) {
    return res.status(400).send("breakDuration cannot be negative.");
  }

  if (!Array.isArray(days) || days.length === 0) {
    return res.status(400).send("days must be a nonempty array.");
  }

  const timeValidity = checkTimesValidity(startTime, endTime);
  if (!timeValidity.isValid) {
    return res.status(400).send(timeValidity.message);
  }

  const startTimeObject = new Date();
  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number);
  startTimeObject.setHours(startTimeHour, startTimeMinute, 0, 0);

  const endTimeObject = new Date();
  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number);
  endTimeObject.setHours(endTimeHour, endTimeMinute, 0, 0);

  if (startTimeObject >= endTimeObject) {
    endTimeObject.setDate(endTimeObject.getDate() + 1);
  }

  const shiftDuration =
    (endTimeObject.getTime() - startTimeObject.getTime()) / 1000 / 60;

  if (shiftDuration >= 8 && breakDuration < 45) {
    return res
      .status(400)
      .send(
        `Minimum break duration is 45 minutes for a ${shiftDuration.toFixed(
          1
        )}h shift.`
      );
  }

  let projectData;
  try {
    projectData = await prisma.project.findUniqueOrThrow({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: true,
        Shift: true,
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
        manage.role === Role.CLIENT_HOLDER
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  const createData = days.map((day) => {
    return {
      day: day.toUpperCase() as DayOfWeek,
      startTime: startTimeObject,
      endTime: endTimeObject,
      halfDayEndTime: new Date(halfDayEndTime),
      halfDayStartTime: new Date(halfDayStartTime),
      breakDuration: parseInt(breakDuration),
      headcount: parseInt(headcount),
      projectCuid,
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

// TODO: check for clashes in timings with existing shifts (For shift groups)

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
        (manage) => manage.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
    }

    try {
      const attendanceData = await prisma.attendance.findMany({
        where: {
          ...(candidateCuid && { candidateCuid }),
          shiftDate: {
            gte: startDate,
            lte: endDate,
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
  }
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
        (manage) => manage.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_READ_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_READ_ALL_PROJECTS);
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
            projectCuid: projectCuid,
          },
          status: null,
        },
      });

      return res.send(attendanceData);
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }
  }
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
    PermissionList.CAN_READ_ALL_PROJECTS
  );

  if (!hasReadAllProjectsPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_READ_ALL_PROJECTS);
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
