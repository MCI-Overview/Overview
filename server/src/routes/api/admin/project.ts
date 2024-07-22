import { Router, Request, Response } from "express";
import { prisma } from "../../../client";
import {
  EmploymentType,
  LeaveStatus,
  RequestStatus,
  Role,
  ShiftStatus,
  ShiftType,
} from "@prisma/client";
import { PrismaError } from "@/types";
import {
  GetProjectDataResponse,
  User,
  CommonLocation,
  CommonShiftGroup,
  CopyAttendanceResponse,
} from "@/types/common";
import {
  defaultDate,
  processCandidateData,
  checkLocationsValidity,
  checkDatesValidity,
  checkEmploymentByValidity,
  checkNoticePeriodValidity,
  checkTimesValidity,
  maskNRIC,
} from "../../../utils";
import bcrypt from "bcrypt";
import customParseFormat from "dayjs/plugin/customParseFormat";

import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  getPermissions,
  PermissionList,
} from "../../../utils/permissions";
import dayjs from "dayjs";
import { correctTimes, doesClash } from "../../../utils/clash";

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
      timeWindow,
      distanceRadius,
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
      timeWindow,
      distanceRadius,
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

    const startDateObject = dayjs(startDate);
    const endDateObject = dayjs(endDate);

    const candidateCuids = await prisma.assign.findMany({
      where: {
        Project: {
          cuid: projectCuid,
        },
        startDate: {
          lte: endDateObject.toDate(),
        },
        endDate: {
          gte: startDateObject.toDate(),
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
          gte: startDateObject.subtract(1, "day").toDate(),
          lte: endDateObject.add(1, "day").toDate(),
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
        leave: true,
        status: true,
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
            projectCuid: true,
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
                    .set("date", startDate.date())
                    .set("month", startDate.month())
                    .set("year", startDate.year())
                : dayjs(cr.Shift.startTime)
                    .set("date", startDate.date())
                    .set("month", startDate.month())
                    .set("year", startDate.year());
            const endTime =
              cr.shiftType === "FIRST_HALF"
                ? dayjs(cr.Shift.halfDayEndTime)
                    .set("date", startDate.date())
                    .set("month", startDate.month())
                    .set("year", startDate.year())
                : dayjs(cr.Shift.endTime)
                    .set("date", startDate.date())
                    .set("month", startDate.month())
                    .set("year", startDate.year());

            return {
              leave: cr.leave,
              status: cr.status,
              projectCuid: cr.Shift.projectCuid,
              shiftCuid: cr.Shift.cuid,
              rosterCuid: cr.cuid,
              shiftType: cr.shiftType,
              shiftStartTime: startTime,
              shiftEndTime: startTime.isBefore(endTime)
                ? endTime
                : endTime.add(1, "day"),
              consultantCuid: cr.Shift.Project.Manage.filter(
                (manage) => manage.role === Role.CLIENT_HOLDER
              ).map((manage) => manage.consultantCuid)[0],
            };
          }),
      };
    });

    return res.json(data);
  }
);

// TODO: Add Permission check and overlap check
projectAPIRouter.patch("/roster", async (req, res) => {
  const { rosterCuid, candidateCuid, rosterDate } = req.body;

  if (!rosterCuid)
    return res.status(400).json({
      message: "Please specify a roster cuid.",
    });

  if (!candidateCuid)
    return res.status(400).json({
      message: "Please specify a candidate cuid.",
    });

  if (!rosterDate)
    return res.status(400).json({
      message: "Please specify a roster date.",
    });

  const rosterDateObject = new Date(rosterDate);

  try {
    await prisma.attendance.update({
      where: {
        cuid: rosterCuid,
      },
      data: {
        candidateCuid: candidateCuid,
        shiftDate: rosterDateObject,
      },
    });

    return res.json({
      message: "Roster updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

// TODO: Add root permission check
projectAPIRouter.get("/project/:cuid/requests/:page", async (req, res) => {
  const user = req.user as User;
  const { cuid } = req.params;
  const page = parseInt(req.params.page, 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const { searchValue, typeFilter, statusFilter } = req.query as any;

  try {
    const project = await prisma.project.findUniqueOrThrow({
      where: {
        cuid,
      },
      include: {
        Manage: true,
      },
    });

    if (!project) {
      return res.status(404).send("Project does not exist.");
    }

    if (
      !project.Manage.some(
        (m) => m.role === "CLIENT_HOLDER" && m.consultantCuid === user.cuid
      )
    ) {
      return res
        .status(403)
        .send("You are not authorized to view this project's requests.");
    }

    const queryConditions = {
      projectCuid: cuid,
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
      ...(searchValue && {
        Assign: {
          Candidate: {
            OR: [
              {
                nric: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
              {
                name: {
                  contains: searchValue,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
      }),
    };

    const fetchedData = await prisma.request.findMany({
      where: queryConditions,
      include: {
        Assign: {
          select: {
            Candidate: {
              select: {
                nric: true,
                name: true,
              },
            },
          },
        },
        Attendance: {
          include: {
            Shift: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const customRequests = fetchedData.map((request) => {
      return {
        ...request,
        affectedRosters: request.Attendance.map((attendance) => {
          const { correctStartTime, correctEndTime } = correctTimes(
            attendance.shiftDate,
            attendance.shiftType === "SECOND_HALF"
              ? attendance.Shift.halfDayStartTime!
              : attendance.Shift.startTime,
            attendance.shiftType === "FIRST_HALF"
              ? attendance.Shift.halfDayEndTime!
              : attendance.Shift.endTime
          );

          return {
            cuid: attendance.cuid,
            correctStartTime,
            correctEndTime,
          };
        }),
      };
    });

    const maskedData = customRequests.map((req) => {
      req.Assign.Candidate.nric = maskNRIC(req.Assign.Candidate.nric);
      return req;
    });

    const totalCount = await prisma.request.count({
      where: queryConditions,
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

    return res.json([maskedData, paginationData]);
  } catch (error) {
    console.error("Error while fetching requests:", error);
    return res.status(500).send("Internal server error");
  }
});

// TODO: Add permission check
projectAPIRouter.post("/project/:projectCuid/roster", async (req, res) => {
  // const user = req.user as User;
  const { projectCuid } = req.params;
  const { newRoster } = req.body;

  if (!projectCuid)
    return res.status(400).json({
      message: "Please specify a project cuid.",
    });

  if (!newRoster)
    return res.status(400).json({
      message: "Please specify new roster data.",
    });

  try {
    await prisma.attendance.createMany({
      data: newRoster,
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

projectAPIRouter.get("/project/:projectCuid/history", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { startDate, endDate } = req.query;

  const start = typeof startDate === "string" ? startDate : undefined;
  const end = typeof endDate === "string" ? endDate : undefined;
  const now = dayjs();
  const adjustedEnd =
    end && dayjs(end).isAfter(now)
      ? now.startOf("day").toDate()
      : end
      ? dayjs(end).startOf("day").toDate()
      : undefined;

  const isNricUnmasked = await checkPermission(
    user.cuid,
    PermissionList.CAN_READ_CANDIDATE_DETAILS
  );

  try {
    const response = await prisma.attendance.findMany({
      where: {
        shiftDate: {
          gte: start ? dayjs(start).startOf("day").toDate() : undefined,
          lte: adjustedEnd,
        },
        Shift: {
          projectCuid: projectCuid,
        },
      },
      include: {
        Shift: {
          include: {
            Project: true,
          },
        },
        Candidate: true,
      },
      orderBy: {
        shiftDate: "asc",
      },
    });

    return res.send(
      response.map((row) => ({
        attendanceCuid: row.cuid,
        date: row.shiftDate,
        nric: isNricUnmasked
          ? row.Candidate.nric
          : maskNRIC(row.Candidate.nric),
        name: row.Candidate.name,
        shiftStart:
          row.shiftType === "SECOND_HALF"
            ? row.Shift.halfDayStartTime
            : row.Shift.startTime,
        shiftEnd:
          row.shiftType === "FIRST_HALF"
            ? row.Shift.halfDayEndTime
            : row.Shift.endTime,
        rawStart: row.clockInTime,
        rawEnd: row.clockOutTime,
        leave: row.leave,
        status: row.status,
        postalCode: row.postalCode,
      }))
    );
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

projectAPIRouter.get("/project/:projectCuid/overview", async (req, res) => {
  const { projectCuid } = req.params;
  const { weekStart } = req.query;

  const start = typeof weekStart === "string" ? weekStart : undefined;
  const formattedWeekStart = dayjs(start).startOf("week").toDate();
  const formattedWeekEnd = dayjs(start).endOf("week").toDate();

  try {
    // Fetch attendance data
    const attendanceResponse = await prisma.attendance.groupBy({
      by: ["status", "shiftDate", "leave"],
      where: {
        Shift: {
          projectCuid: projectCuid,
        },
        shiftDate: {
          gte: formattedWeekStart,
          lte: formattedWeekEnd,
        },
      },
      _count: {
        status: true,
      },
    });

    // Initialize an object to hold the data arrays for each status
    const totals: Record<string, number[]> = {
      LATE: Array(7).fill(0),
      MEDICAL: Array(7).fill(0),
      NO_SHOW: Array(7).fill(0),
      ON_TIME: Array(7).fill(0),
      LEAVE: Array(7).fill(0),
    };

    attendanceResponse.forEach((item) => {
      if (item.shiftDate && item.status) {
        const dayOfWeek = dayjs(item.shiftDate).day(); // Get the day of the week (0 for Sunday, 6 for Saturday)
        const dayIndex = (dayOfWeek + 6) % 7; // Convert so Monday is 0 and Sunday is 6

        if (item.status === "MEDICAL") {
          totals.MEDICAL[dayIndex] += item._count.status;
        } else if (item.leave === "FULLDAY") {
          totals.LEAVE[dayIndex] += item._count.status;
        } else if (item.leave === "HALFDAY") {
          totals.LEAVE[dayIndex] += item._count.status * 0.5;
          totals[item.status][dayIndex] += item._count.status;
        } else {
          totals[item.status][dayIndex] += item._count.status;
        }
      }
    });

    // Fetch headcount data
    const nationalityResponse = await prisma.candidate.groupBy({
      by: ["nationality"],
      _count: {
        nationality: true,
      },
    });

    const endDateResponse = await prisma.assign.groupBy({
      by: ["endDate"],
      where: {
        projectCuid: projectCuid,
      },
      _count: {
        endDate: true,
      },
    });

    const nationalityData: Record<string, number> = nationalityResponse.reduce(
      (acc: Record<string, number>, item) => {
        if (item.nationality) {
          acc[item.nationality.toLowerCase()] = item._count.nationality;
        }
        return acc;
      },
      {}
    );

    const endDateData = endDateResponse.reduce(
      (acc, item) => {
        if (item.endDate) {
          const isOngoing = item.endDate > new Date();
          if (isOngoing) {
            acc.ongoing += item._count.endDate;
          } else {
            acc.hasEnded += item._count.endDate;
          }
        }
        return acc;
      },
      { ongoing: 0, hasEnded: 0 }
    );

    const datasets = {
      leave: {
        data: totals.LEAVE,
      },
      late: {
        data: totals.LATE,
      },
      ontime: {
        data: totals.ON_TIME,
      },
      medical: {
        data: totals.MEDICAL,
      },
      absent: {
        data: totals.NO_SHOW,
      },
    };

    const headcount = {
      nationality: nationalityData,
      endDate: endDateData,
    };

    return res.json({ datasets, headcount });
  } catch (error) {
    console.error("Error fetching overview:", error);
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
    const attendanceToBeDeleted = await prisma.attendance.findUnique({
      where: { cuid: rosterCuid },
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
        Request: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!attendanceToBeDeleted) {
      return res.status(404).json({ message: "Attendance not found." });
    }

    const hasPermission =
      attendanceToBeDeleted.Shift.Project.Manage.some(
        (manage) => manage.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
    }

    // Check if any requests are pending or approved
    const hasPendingOrApprovedRequests = attendanceToBeDeleted.Request.some(
      (request) =>
        request.status === RequestStatus.PENDING ||
        request.status === RequestStatus.APPROVED
    );

    if (hasPendingOrApprovedRequests) {
      return res.status(400).json({
        message: "Cannot delete roster with pending or approved requests.",
      });
    }

    // Perform the deletion
    await prisma.attendance.delete({
      where: { cuid: rosterCuid },
    });

    return res.json({ message: "Attendance deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error." });
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
    timeWindow,
    distanceRadius,
    candidateHolders,
    shiftGroups,
    noticePeriodDuration,
    noticePeriodUnit,
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

  const timeWindowValidity = timeWindow >= 0;
  if (timeWindow && !timeWindowValidity) {
    return res.status(400).json({
      message: "timeWindow must be a non-negative number.",
    });
  }

  const distanceRadiusValidity = distanceRadius >= 50;
  if (distanceRadius && !distanceRadiusValidity) {
    return res.status(400).json({
      message: "distanceRadius must be at least 50 meters.",
    });
  }

  const noticePeriodDurationValidity = noticePeriodDuration >= 0;
  if (noticePeriodDuration && !noticePeriodDurationValidity) {
    return res.status(400).json({
      message: "noticePeriodDuration must be a non-negative number.",
    });
  }

  const noticePeriodUnitValidity = ["DAY", "WEEK", "MONTH"].includes(
    noticePeriodUnit
  );
  if (noticePeriodUnit && !noticePeriodUnitValidity) {
    return res.status(400).json({
      message: "noticePeriodUnit must be one of DAY, WEEK, MONTH.",
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
    ...(timeWindow && { timeWindow }),
    ...(distanceRadius && { distanceRadius }),
    ...(candidateHolders && {
      candidateHolders,
    }),
    ...(shiftGroups && { shiftGroups }),
    ...(noticePeriodDuration && { noticePeriodDuration }),
    ...(noticePeriodUnit && { noticePeriodUnit }),
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
            role: Role.CLIENT_HOLDER,
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

  // verify all candidates have nric, name, contact, dateOfBirth, startDate, endDate, employmentType, residency
  const invalidCandidates = candidates.filter(
    (cdd: any) =>
      !cdd.nric ||
      !cdd.name ||
      !cdd.contact ||
      !cdd.residency ||
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
        dateOfBirth: new Date(Date.parse(cdd.dateOfBirth)),
        residency: cdd.residency,
        hasOnboarded: false,
        nationality: null,
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

  if (!breakDuration) return res.status(400).send("breakDuration is required.");

  if (isNaN(parseInt(breakDuration))) {
    return res.status(400).send("breakDuration must be a number.");
  }

  if (parseInt(breakDuration) < 0) {
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

  const createData = {
    startTime: defaultDate(dayjs(startTime, "HH:mm")).toDate(),
    endTime: defaultDate(dayjs(endTime, "HH:mm")).toDate(),
    ...(halfDayEndTime && {
      halfDayEndTime: defaultDate(dayjs(halfDayEndTime, "HH:mm")).toDate(),
    }),
    ...(halfDayStartTime && {
      halfDayStartTime: defaultDate(dayjs(halfDayStartTime, "HH:mm")).toDate(),
    }),
    breakDuration: parseInt(breakDuration),
    projectCuid,
  };

  try {
    await prisma.shift.create({ data: createData });
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
        Manage: {
          include: {
            Consultant: true,
          },
          where: {
            role: "CLIENT_HOLDER",
          },
        },
        Client: true,
      },
    });

    return res.send(projectsData);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.get("/projects/all", async (_req, res) => {
  /**
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
  */

  try {
    const projectsData = await prisma.project.findMany({
      include: {
        Manage: {
          include: {
            Consultant: true,
          },
        },
        Client: true,
      },
    });

    return res.send(projectsData);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

projectAPIRouter.post("/project/:projectCuid/manage", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { consultantCuid, role } = req.body;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  if (!consultantCuid) {
    return res.status(400).send("consultantCuid is required.");
  }

  if (!role) {
    return res.status(400).send("role is required.");
  }

  if (!["CLIENT_HOLDER", "CANDIDATE_HOLDER"].includes(role)) {
    return res.status(400).send("Invalid role.");
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

    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }

  const hasPermission =
    projectData.Manage.some(
      (m) => m.consultantCuid === user.cuid && m.role === "CLIENT_HOLDER"
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  try {
    await prisma.manage.create({
      data: {
        projectCuid,
        consultantCuid,
        role,
      },
    });

    return res.send(`Consultant successfully added.`);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

projectAPIRouter.patch("/project/:projectCuid/manage", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { consultantCuid, role } = req.body;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  if (!consultantCuid) {
    return res.status(400).send("oldConsultantCuid is required.");
  }

  if (!role) {
    return res.status(400).send("role is required.");
  }

  if (!["CLIENT_HOLDER", "CANDIDATE_HOLDER"].includes(role)) {
    return res.status(400).send("Invalid role.");
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

    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }

  const hasPermission =
    projectData.Manage.some(
      (m) => m.consultantCuid === user.cuid && m.role === "CLIENT_HOLDER"
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  const currentManage = projectData.Manage.find(
    (m) => m.consultantCuid === consultantCuid
  );

  // verify that the consultant is a collaborator
  if (!currentManage) {
    return res.status(400).send("Consultant is not a collaborator.");
  }

  // Do nothing if the role is unchanged
  if (currentManage.role === role) {
    return res.status(400).send("Role is the same as the current role.");
  }

  // prevent removing the last client holder
  if (
    currentManage.role === "CLIENT_HOLDER" &&
    projectData.Manage.filter((m) => m.role === "CLIENT_HOLDER").length === 1
  ) {
    return res
      .status(400)
      .send("Cannot remove the last client holder in the project.");
  }

  try {
    await prisma.manage.update({
      where: {
        consultantCuid_projectCuid: {
          consultantCuid,
          projectCuid,
        },
      },
      data: {
        role,
      },
    });

    return res.send(`Manage successfully updated.`);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

projectAPIRouter.delete("/project/:projectCuid/manage", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { consultantCuid, reassignments } = req.body;

  if (!projectCuid) {
    return res.status(400).send("projectCuid is required.");
  }

  if (!consultantCuid) {
    return res.status(400).send("consultantCuid is required.");
  }

  if (!reassignments) {
    return res.status(400).send("reassign is required.");
  }

  if (!Array.isArray(reassignments)) {
    return res.status(400).send("reassign must be an array.");
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

    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }

  const hasPermission =
    projectData.Manage.some(
      (m) => m.consultantCuid === user.cuid && m.role === "CLIENT_HOLDER"
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  const clientHolders = projectData.Manage.filter(
    (m) => m.role === "CLIENT_HOLDER"
  );

  // prevent removing the last client holder
  if (
    clientHolders.length === 1 &&
    clientHolders[0].consultantCuid === consultantCuid
  ) {
    return res
      .status(400)
      .send("Cannot remove the last client holder in the project.");
  }

  for (const item of reassignments) {
    const { consultantCuid: newConsultantCuid, candidateCuid } = item;

    const assignEntry = projectData.Assign.find(
      (assign) =>
        assign.candidateCuid === candidateCuid &&
        assign.consultantCuid === consultantCuid
    );

    if (!assignEntry) {
      return res.status(404).send({
        error: `Candidate ${candidateCuid} not assigned by consultant ${consultantCuid}.`,
      });
    }

    try {
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
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal server error." });
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

  try {
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
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

/**
/project/:projectCuid/roster/copy

Takes the attendance data for a week and copies it to the next week.

Parameters:
projectCuid
startDate
endDate

Steps:
1. Retrieve attendance data for that week (include with Manage data for permission check)
2. Check permissions
3. For each attendance:
	a. Check that its shift's status is active
	b. Check that its copy will be within candidate assign period
	c. Check that it does not clash with any other attendance (can be from other projects)
	d. If any of the above checks fail, add to failure list, continue to next attendance
	e. Create new attendance
		i. Check LeaveType => if HALF_DAY, adjust ShiftType
4. Return failure list in response
 */
projectAPIRouter.post("/project/:projectCuid/roster/copy", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { startDate, endDate, candidateCuids } = req.body;

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

    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }

  const hasPermission =
    projectData.Manage.some(
      (m) => m.role === Role.CLIENT_HOLDER && m.consultantCuid === user.cuid
    ) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  try {
    let attendanceList;
    if (!candidateCuids || candidateCuids.length === 0) {
      attendanceList = await prisma.attendance.findMany({
        where: {
          shiftDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          Shift: {
            projectCuid,
          },
        },
        include: {
          Shift: true,
        },
      });
    } else {
      attendanceList = await prisma.attendance.findMany({
        where: {
          candidateCuid: {
            in: candidateCuids,
          },
          shiftDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          Shift: {
            projectCuid,
          },
        },
        include: {
          Shift: true,
        },
      });
    }

    const failureList: CopyAttendanceResponse[] = [];

    for (const attendance of attendanceList) {
      const pushFailure = (error: string) => {
        failureList.push({
          attendanceCuid: attendance.cuid,
          date: attendance.shiftDate.toISOString(),
          startTime: attendance.Shift.startTime.toISOString(),
          endTime: attendance.Shift.endTime.toISOString(),
          error,
        });
      };

      // Check if shift is active
      if (attendance.Shift.status === ShiftStatus.ARCHIVED) {
        pushFailure("Shift has been archived.");
        continue;
      }

      // Check if new attendance is within candidate assign period
      const assignData = projectData.Assign.find(
        (assign) => assign.candidateCuid === attendance.candidateCuid
      );
      if (!assignData) {
        // This should never happen
        pushFailure("Candidate is not assigned to project.");
        continue;
      }
      if (
        dayjs(attendance.shiftDate)
          .add(7, "day")
          .isAfter(assignData.endDate, "day")
      ) {
        pushFailure(
          "New attendance date is not within candidate assign period."
        );
        continue;
      }

      // Check if attendance clashes with any other attendance
      const attendanceStart =
        attendance.shiftType === "SECOND_HALF"
          ? attendance.Shift.halfDayStartTime!
          : attendance.Shift.startTime;
      const attendanceEnd =
        attendance.shiftType === "FIRST_HALF"
          ? attendance.Shift.halfDayEndTime!
          : attendance.Shift.endTime;
      const allExistingAttendances = await prisma.candidate
        .findMany({
          where: {
            cuid: attendance.candidateCuid,
          },
          include: {
            Attendance: {
              where: {
                shiftDate: {
                  // Includes the day before and the day of the attendance
                  gte: dayjs(attendance.shiftDate).add(6, "day").toDate(),
                  lte: dayjs(attendance.shiftDate).add(7, "day").toDate(),
                },
              },
              include: {
                Shift: true,
              },
            },
          },
        })
        .then((data) => data[0].Attendance);
      if (
        allExistingAttendances.some((exisitingAttendance) => {
          const existingStart =
            exisitingAttendance.shiftType === "SECOND_HALF"
              ? exisitingAttendance.Shift.halfDayStartTime!
              : exisitingAttendance.Shift.startTime;
          const existingEnd =
            exisitingAttendance.shiftType === "FIRST_HALF"
              ? exisitingAttendance.Shift.halfDayEndTime!
              : exisitingAttendance.Shift.endTime;

          return doesClash(
            attendance.shiftDate,
            attendanceStart,
            attendanceEnd,
            exisitingAttendance.shiftDate,
            existingStart,
            existingEnd
          );
        })
      ) {
        pushFailure("New attendance clashes with existing attendance.");
        continue;
      }

      // Create new attendance
      const newAttendanceData = {
        candidateCuid: attendance.candidateCuid,
        shiftCuid: attendance.shiftCuid,
        shiftDate: dayjs(attendance.shiftDate).add(7, "day").toDate(),
        shiftType:
          attendance.leave === LeaveStatus.HALFDAY
            ? ShiftType.FULL_DAY
            : attendance.shiftType,
      };

      try {
        await prisma.attendance.create({
          data: newAttendanceData,
        });
      } catch (error) {
        console.error(error);
        pushFailure("ERROR: Unable to create new attendance");
      }
    }

    return res.send({
      failureList,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

/**
/project/:projectCuid/roster/clear

Takes the roster data for period specified and deletes it if it has yet to happen.

Parameters:
projectCuid
endDate

Steps:
1. Delete all attendance data for that period with status and leave null for that project and period (ensure that it has yet to passed by checking the start time, the start time will differ for different shift type as it can be second half)
 */

projectAPIRouter.post(
  "/project/:projectCuid/roster/clear",
  async (req, res) => {
    const user = req.user as User;
    const { projectCuid } = req.params;
    const { startDate, endDate, candidateCuids } = req.body;

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
        },
      });
    } catch (error) {
      const prismaError = error as PrismaError;
      if (prismaError.code === "P2025") {
        return res.status(404).send("Project does not exist.");
      }

      console.error(error);
      return res.status(500).send({ error: "Internal server error." });
    }

    const hasPermission =
      projectData.Manage.some(
        (m) => m.role === Role.CLIENT_HOLDER && m.consultantCuid === user.cuid
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermission) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
    }

    try {
      await prisma.attendance.deleteMany({
        where: {
          // do not delete attendances that have pending or approved requests
          Request: {
            status: {
              notIn: [RequestStatus.PENDING, RequestStatus.APPROVED],
            },
          },

          // check all candidate if candidateCuids is not provided/empty
          ...(candidateCuids &&
            candidateCuids.length > 0 && {
              candidateCuid: {
                in: candidateCuids,
              },
            }),
          shiftDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
          Shift: {
            projectCuid,
          },
          Candidate: {
            Assign: {
              Request: {},
            },
          },
          status: null,
          leave: null,
        },
      });

      return res.send("Successfully cleared roster data.");
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal server error." });
    }
  }
);

export default projectAPIRouter;
