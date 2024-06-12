import { Router, Request, Response } from "express";
import { prisma } from "../../../client";
import { EmploymentType, Role, ShiftStatus } from "@prisma/client";
import { PrismaError } from "@/types";
import {
  GetProjectDataResponse,
  User,
  CommonLocation,
  CommonShiftGroup,
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
import customParseFormat from "dayjs/plugin/customParseFormat";

import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  getPermissions,
  PermissionList,
} from "../../../utils/permissions";
import dayjs from "dayjs";

const projectAPIRouter: Router = Router();

dayjs.extend(customParseFormat);

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
        (manage) => manage.consultantCuid === user.cuid,
      ) ||
      (await checkPermission(
        user.cuid,
        PermissionList.CAN_READ_ALL_PROJECTS,
        permissionData,
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
      locations: locations as CommonLocation[],
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      createdAt: createdAt.toISOString(),
      noticePeriodDuration,
      noticePeriodUnit,
      status,
      shiftGroups: shiftGroups as unknown as CommonShiftGroup[],
      shifts: Shift.map((shift) => ({
        ...shift,
        startTime: shift.startTime.toISOString(),
        endTime: shift.endTime.toISOString(),
        halfDayStartTime: shift.halfDayStartTime?.toISOString() || null,
        halfDayEndTime: shift.halfDayEndTime?.toISOString() || null,
      })),
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

// TODO: Add permission checks
projectAPIRouter.get(
  "/project/:projectCuid/roster",
  async (req: Request, res) => {
    // const user = req.user as User;
    const { startDate, endDate } = req.query as any;
    const { projectCuid } = req.params;

    if (!projectCuid)
      return res.status(400).json({
        message: "Please specify a project cuid.",
      });
    if (!startDate)
      return res.status(400).json({
        message: "Please specify a start date.",
      });
    if (!endDate)
      return res.status(400).json({
        message: "Please specify an end date.",
      });

    const datesValidity = checkDatesValidity(startDate, endDate);
    if (!datesValidity.isValid) {
      return res.status(400).json({
        message: datesValidity.message,
      });
    }

    const startDateObject = new Date(startDate);
    const endDateObject = new Date(endDate);

    const candidateCuids = await prisma.assign.findMany({
      where: {
        Project: {
          cuid: projectCuid,
        },
        startDate: {
          lte: endDateObject,
        },
        endDate: {
          gte: startDateObject,
        },
      },
      select: {
        candidateCuid: true,
        startDate: true,
        endDate: true,
        Candidate: {
          select: {
            name: true,
          },
        },
      },
    });

    const candidateRoster = await prisma.attendance.findMany({
      where: {
        shiftDate: {
          gte: startDateObject,
          lte: endDateObject,
        },
        candidateCuid: {
          in: candidateCuids.map((c) => c.candidateCuid),
        },
      },
      select: {
        cuid: true,
        shiftDate: true,
        candidateCuid: true,
        shiftType: true,
        Shift: {
          select: {
            Project: {
              select: {
                Manage: true,
              },
            },
            startTime: true,
            endTime: true,
            halfDayStartTime: true,
            halfDayEndTime: true,
            cuid: true,
          },
        },
      },
    });

    const data = candidateCuids.map((c) => {
      return {
        startDate: c.startDate,
        endDate: c.endDate,
        name: c.Candidate.name,
        cuid: c.candidateCuid,
        shifts: candidateRoster
          .filter((cr) => cr.candidateCuid === c.candidateCuid)
          .map((cr) => {
            const startDate = dayjs(cr.shiftDate);
            const startTime =
              cr.shiftType === "SECOND_HALF"
                ? dayjs(cr.Shift.halfDayStartTime)
                : dayjs(cr.Shift.startTime);
            const endTime =
              cr.shiftType === "FIRST_HALF"
                ? dayjs(cr.Shift.halfDayEndTime)
                : dayjs(cr.Shift.endTime);

            return {
              shiftCuid: cr.Shift.cuid,
              rosterCuid: cr.cuid,
              shiftType: cr.shiftType,
              shiftStartTime: startDate
                .add(startTime.hour(), "hour")
                .add(startTime.minute(), "minute"),
              shiftEndTime: startTime.isBefore(endTime)
                ? startDate
                    .add(endTime.hour(), "hour")
                    .add(endTime.minute(), "minute")
                : startDate
                    .add(endTime.hour(), "hour")
                    .add(endTime.minute(), "minute")
                    .add(1, "day"),
              consultantCuid: cr.Shift.Project.Manage.filter(
                (manage) => manage.role === Role.CLIENT_HOLDER,
              ).map((manage) => manage.consultantCuid)[0],
            };
          }),
      };
    });

    return res.json(data);
  },
);

projectAPIRouter.post("/project/:projectCuid/roster", async (req, res) => {
  // const user = req.user as User;
  const { projectCuid } = req.params;
  const { candidateCuid, newShifts } = req.body;

  if (!projectCuid)
    return res.status(400).json({
      message: "Please specify a project cuid.",
    });
  if (!candidateCuid)
    return res.status(400).json({
      message: "Please specify a candidate cuid.",
    });

  if (!newShifts || !Array.isArray(newShifts) || newShifts.length === 0)
    return res.status(400).json({
      message: "Please specify new shifts.",
    });

  const createData = newShifts.map((shift) => {
    return {
      candidateCuid,
      shiftType: shift.type,
      shiftDate: new Date(shift.shiftDate),
      shiftCuid: shift.shiftCuid,
    };
  });

  try {
    await prisma.attendance.createMany({
      data: createData,
      skipDuplicates: true,
    });

    return res.json({
      message: "Attendance created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

projectAPIRouter.delete("/roster/:rosterCuid", async (req, res) => {
  const user = req.user as User;
  const { rosterCuid } = req.params;

  if (!rosterCuid)
    return res.status(400).json({
      message: "Please specify a roster cuid.",
    });

  try {
    await prisma.attendance.delete({
      where: {
        cuid: rosterCuid,
        Shift: {
          Project: {
            Manage: {
              some: {
                consultantCuid: user.cuid,
                role: Role.CLIENT_HOLDER,
              },
            },
          },
        },
      },
      include: {
        Shift: {
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

    return res.json({
      message: "Attendance deleted successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error.",
    });
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
    endDate,
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
    startDate: dayjs(startDate).startOf("day").toDate(),
    endDate: dayjs(endDate).endOf("day").toDate(),
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
    PermissionList.CAN_HARD_DELETE_PROJECTS,
  );

  if (!hasHardDeletePermission) {
    return res
      .status(401)
      .send(
        PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_HARD_DELETE_PROJECTS,
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
    shiftGroups,
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
    PermissionList.CAN_EDIT_ALL_PROJECTS,
  );

  let updateData = {
    ...(name && { name }),
    ...(clientUEN && { clientUEN }),
    ...(locations && { locations }),
    ...(employmentBy && { employmentBy }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(endDate && { endDate: new Date(endDate) }),
    ...(candidateHolders && {
      candidateHolders,
    }),
    ...(shiftGroups && { shiftGroups }),
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
      !cdd.employmentType,
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
          }),
        ),
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
            candidates.find((c) => c.nric === cdd.nric).startDate,
          ),
          endDate: new Date(
            candidates.find((c) => c.nric === cdd.nric).endDate,
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
            !createdAssigns.some((assign) => assign.candidateCuid === cdd.cuid),
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
  },
);

projectAPIRouter.post("/project/:projectCuid/shifts", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const {
    startTime,
    endTime,
    halfDayEndTime,
    halfDayStartTime,
    breakDuration,
  } = req.body;

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
    (endTimeObject.getTime() - startTimeObject.getTime()) / 1000 / 60 / 60;

  if (shiftDuration >= 8 && breakDuration < 45) {
    return res
      .status(400)
      .send(
        `Minimum break duration is 45 minutes for a ${shiftDuration.toFixed(
          1,
        )}h shift.`,
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
        manage.role === Role.CLIENT_HOLDER,
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  const createData = {
    startTime: dayjs(startTime, "HH:mm").toDate(),
    endTime: dayjs(endTime, "HH:mm").toDate(),
    ...(halfDayEndTime && {
      halfDayEndTime: dayjs(halfDayEndTime, "HH:mm").toDate(),
    }),
    ...(halfDayStartTime && {
      halfDayStartTime: dayjs(halfDayStartTime, "HH:mm").toDate(),
    }),
    breakDuration: parseInt(breakDuration),
    projectCuid,
  };

  try {
    await prisma.shift.create({
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
        (manage) => manage.consultantCuid === user.cuid,
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
    PermissionList.CAN_READ_ALL_PROJECTS,
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

const checkProjectRole = async (

  req: Request,

  projectCuid: string,

): Promise<boolean> => {
  const user = req.user as User;
  const response = await prisma.manage.findFirst({
    where: {
      projectCuid,
      consultantCuid: user.cuid,
    },
  });

  return response?.role === "CLIENT_HOLDER";
};

const validateProjectAndConsultant = async (
  projectCuid: string,
  consultantCuid: string,
): Promise<{ projectExists: boolean; consultantExists: boolean }> => {
  const [project, consultant] = await Promise.all([
    prisma.project.findUnique({ where: { cuid: projectCuid } }),
    prisma.consultant.findUnique({ where: { cuid: consultantCuid } }),
  ]);

  return {
    projectExists: !!project,
    consultantExists: !!consultant,
  };
};

const handleValidationError = (res: Response, message: string) =>
  res.status(400).send({ error: message });

projectAPIRouter.post("/project/:projectCuid/manage/add", async (req, res) => {
  const { projectCuid } = req.params;
  const { consultantCuid } = req.body;

  if (!(await checkProjectRole(req, projectCuid))) {
    return res.status(403).send({ error: "User has no access." });
  }

  try {
    const { projectExists, consultantExists } =
      await validateProjectAndConsultant(projectCuid, consultantCuid);

    if (!projectExists) {
      return handleValidationError(res, "Project does not exist.");
    }

    if (!consultantExists) {
      return handleValidationError(res, "Consultant does not exist.");
    }

    const existingCollaboration = await prisma.manage.findUnique({
      where: {
        consultantCuid_projectCuid: {
          consultantCuid,
          projectCuid,
        },
      },
    });

    if (existingCollaboration) {
      return handleValidationError(
        res,
        "Consultant is already a collaborator.",
      );
    }

    const manageData = await prisma.manage.create({
      data: {
        consultantCuid,
        projectCuid,
        role: "CANDIDATE_HOLDER",
      },
    });

    return res.status(200).send(manageData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

projectAPIRouter.post(
  "/project/:projectCuid/manage/remove",
  async (req, res) => {
    const { projectCuid } = req.params;
    const { consultantCuid, reassign } = req.body;

    if (!(await checkProjectRole(req, projectCuid))) {
      return res.status(403).send({ error: "User has no access." });
    }

    try {
      const manageEntry = await prisma.manage.findFirst({
        where: {
          projectCuid,
          consultantCuid,
        },
      });

      if (!manageEntry) {
        return res.status(404).send({ error: "Manage entry not found." });
      }

      if (Array.isArray(reassign)) {
        for (const item of reassign) {
          const { consultantCuid: newConsultantCuid, candidateCuid } = item;

          const assignEntry = await prisma.assign.findFirst({
            where: {
              projectCuid,
              candidateCuid,
            },
          });

          if (!assignEntry) {
            return res.status(404).send({
              error: `Assign entry not found for candidateCuid: ${candidateCuid}`,
            });
          }

          await prisma.assign.update({
            where: {
              projectCuid_candidateCuid: {
                projectCuid,
                candidateCuid,
              },
            },
            data: {
              consultantCuid: newConsultantCuid,
            },
          });
        }
      }

      const remainingAssignments = await prisma.assign.findMany({
        where: {
          consultantCuid,
          projectCuid,
        },
      });

      if (remainingAssignments.length > 0) {
        return res.status(400).send({
          error:
            "Consultant cannot be removed as they are still assigned to candidates in this project.",
        });
      }

      await prisma.manage.delete({
        where: {
          consultantCuid_projectCuid: {
            consultantCuid,
            projectCuid,
          },
        },
      });

      return res.status(200).send({
        message: "Successfully removed collaborator and updated Assign table.",
      });
    } catch (error) {
      console.error("Error while removing collaborator:", error);
      return res.status(500).send({ error: "Internal server error." });
    }
  },
);

export default projectAPIRouter;
