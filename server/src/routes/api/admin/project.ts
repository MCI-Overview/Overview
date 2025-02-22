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
  generateDefaultPassword,
} from "../../../utils";
import bcrypt from "bcrypt";

import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  getPermissions,
  PermissionList,
} from "../../../utils/permissions";
import dayjs from "dayjs";
import { correctTimes, doesClash } from "../../../utils/clash";

const projectAPIRouter: Router = Router();

/**
 * GET /api/admin/project/:projectCuid
 *
 * Retrieve the project data with the given cuid.
 * Used in projectContextProvider
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a consultant of the project
 *  b. User has CAN_READ_ALL_PROJECTS permission
 * 2. Retrieve the project data with the given cuid
 * 3. Process the project data and return it
 */
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

/**
 * GET /api/admin/project/:projectCuid/roster
 *
 * Retrieve the roster data for candidates within the project with the given cuid.
 *
 * Parameters:
 * startDate
 * endDate
 * projectCuid
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a consultant of the project
 *  b. User has CAN_READ_ALL_PROJECTS permission
 * 2. Retrieve list of candidate cuids with start date and end dates within the specified range
 *  a. User has CAN_READ_ALL_PROJECTS permission and is client holder can view all candidates
 *  b. User is a consultant of the project can view only their candidates
 * 3. Retrieve the roster data for the candidates within the specified range
 * 4. Process the roster data and return it
 */
projectAPIRouter.get(
  "/project/:projectCuid/roster",
  async (req: Request, res) => {
    const user = req.user as User;
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

    const hasReadAllProjectsPermission = await checkPermission(
      user.cuid,
      PermissionList.CAN_READ_ALL_PROJECTS
    );

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
        ...(!hasReadAllProjectsPermission && {
          OR: [
            {
              consultantCuid: user.cuid,
            },
            {
              Project: {
                Manage: {
                  some: {
                    consultantCuid: user.cuid,
                    role: Role.CLIENT_HOLDER,
                  },
                },
              },
            },
          ],
        }),
      },
      select: {
        employeeId: true,
        restDay: true,
        candidateCuid: true,
        startDate: true,
        endDate: true,
        Candidate: {
          select: {
            name: true,
          },
        },
        Project: {
          select: {
            Manage: true,
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
        clockInTime: true,
        clockOutTime: true,
        Request: true,
        Shift: {
          select: {
            Project: {
              select: {
                Manage: true,
              },
            },
            breakDuration: true,
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
        cuid: c.candidateCuid,
        name: c.Candidate.name,
        employeeId: c.employeeId,
        startDate: c.startDate,
        endDate: c.endDate,
        restDay: c.restDay,
        rosters: candidateRoster
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

            // TODO: Hide other project roster irrelevant data
            return {
              breakDuration: cr.Shift.breakDuration,
              leave: cr.leave,
              status: cr.status,
              projectCuid: cr.Shift.projectCuid,
              shiftCuid: cr.Shift.cuid,
              rosterCuid: cr.cuid,
              type: cr.shiftType,
              startTime: startTime,
              endTime: startTime.isBefore(endTime)
                ? endTime
                : endTime.add(1, "day"),
              clockInTime: cr.clockInTime,
              clockOutTime: cr.clockOutTime,
              clientHolderCuids: cr.Shift.Project.Manage.filter(
                (manage) => manage.role === Role.CLIENT_HOLDER
              ).map((manage) => manage.consultantCuid),
            };
          }),
      };
    });

    return res.json(data);
  }
);

// TODO: Add overlap check
/**
 * PATCH /api/admin/project/:projectCuid/roster
 *
 * Change an existing roster record to either a new candidate or new date.
 *
 * Parameters:
 * rosterCuid
 * candidateCuid
 * rosterDate
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Update the roster record
 */
projectAPIRouter.patch("/roster", async (req, res) => {
  const user = req.user as User;
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

  const hasCanEditAllProjectsPermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_EDIT_ALL_PROJECTS
  );

  try {
    await prisma.attendance.update({
      where: {
        cuid: rosterCuid,
        // Ensure that there are no pending requests, if there are, do not update the roster
        Request: {
          none: {
            status: RequestStatus.PENDING,
          },
        },
        // Add in client holder check only if user does not have CAN_EDIT_ALL_PROJECTS permission
        ...(!hasCanEditAllProjectsPermission && {
          Shift: {
            Project: {
              Manage: {
                some: {
                  role: Role.CLIENT_HOLDER,
                  consultantCuid: user.cuid,
                },
              },
            },
          },
        }),
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

/**
 * GET /api/admin/project/:cuid/requests/:page
 *
 * Retrieve the requests for the project with the given cuid.
 *
 * Parameters:
 * cuid
 * page
 * searchValue
 * typeFilter
 * statusFilter
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_READ_ALL_PROJECTS permission
 * 2. Retrieve the requests for the project with the given cuid
 * 3. Process the requests data and return it
 */
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
      ) ||
      (await checkPermission(user.cuid, PermissionList.CAN_READ_ALL_PROJECTS))
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
            Project: {
              select: {
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

/**
 * POST /api/admin/project/:projectCuid/roster
 *
 * Create multiple attendance records for the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * newRoster: {
 *  candidateCuid
 *  shiftDate;
 *  shiftType: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
 *  shiftCuid;
 * }
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Create the attendance records
 */
projectAPIRouter.post("/project/:projectCuid/roster", async (req, res) => {
  const user = req.user as User;
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

  const hasCanEditAllProjectsPermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_EDIT_ALL_PROJECTS
  );

  try {
    if (!hasCanEditAllProjectsPermission) {
      const project = await prisma.project.findUnique({
        where: {
          cuid: projectCuid,
        },
        include: {
          Manage: {
            where: {
              consultantCuid: user.cuid,
              role: "CLIENT_HOLDER",
            },
          },
        },
      });

      if (!project) {
        return res.status(403).json({
          message: "You are not authorized to create rosters for this project.",
        });
      }
    }

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

/**
 * GET /api/admin/project/:projectCuid/history
 *
 * Retrieve the attendance records for the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * startDate
 * endDate
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a consultant of the project
 *  b. User has CAN_READ_ALL_PROJECTS permission
 * 2. Retrieve the attendance records for the project with the given cuid
 * 3. Check if the user has permission to view unmasked NRIC
 * 4. Process the attendance data and return it
 */
projectAPIRouter.get("/project/:projectCuid/history", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { startDate, endDate } = req.query;

  const start = typeof startDate === "string" ? startDate : undefined;
  const end = typeof endDate === "string" ? endDate : undefined;

  const isNricUnmasked = await checkPermission(
    user.cuid,
    PermissionList.CAN_READ_CANDIDATE_DETAILS
  );

  const hasReadAllProjectsPermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_READ_ALL_PROJECTS
  );

  try {
    const response = await prisma.attendance.findMany({
      where: {
        shiftDate: {
          gte: start ? dayjs(start).startOf("day").toDate() : undefined,
          lte: end ? dayjs(end).endOf("day").toDate() : undefined,
        },
        Shift: {
          projectCuid: projectCuid,
          // Add in client holder check only if user does not have CAN_READ_ALL_PROJECTS permission
          ...(!hasReadAllProjectsPermission && {
            Project: {
              Manage: {
                some: {
                  consultantCuid: user.cuid,
                  role: "CLIENT_HOLDER",
                },
              },
            },
          }),
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

    if (!response) {
      return res.status(404).send("No attendance records found.");
    }

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
        location: row.location,
      }))
    );
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

/**
 * GET /api/admin/project/:projectCuid/overview
 *
 * Retrieve the overview data for the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * weekStart
 * endDate
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a consultant of the project
 *  b. User has CAN_READ_ALL_PROJECTS permission
 * 2. Fetch attendance, headcount, and claims data
 * 3. Process the data and return it
 *
 */
projectAPIRouter.get("/project/:projectCuid/overview", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { weekStart, endDate } = req.query;

  const start = typeof weekStart === "string" ? weekStart : undefined;
  const end = typeof endDate === "string" ? endDate : undefined;
  const formattedWeekStart = dayjs(start).startOf("day").toDate();
  const formattedWeekEnd = dayjs(end).endOf("day").toDate();
  const difference = dayjs(formattedWeekEnd).diff(
    dayjs(formattedWeekStart),
    "day"
  ); // Including the end day

  const hasReadAllProjectsPermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_READ_ALL_PROJECTS
  );

  try {
    const project = await prisma.project.findUnique({
      where: {
        cuid: projectCuid,
      },
      include: {
        Manage: {
          where: {
            consultantCuid: user.cuid,
          },
        },
      },
    });

    if (!project && !hasReadAllProjectsPermission) {
      return res.status(403).json({
        message: "You are not authorized to view this project's overview.",
      });
    }
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }

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
      LATE: Array(difference).fill(0),
      MEDICAL: Array(difference).fill(0),
      NO_SHOW: Array(difference).fill(0),
      ON_TIME: Array(difference).fill(0),
      LEAVE: Array(difference).fill(0),
    };

    attendanceResponse.forEach((item) => {
      if (item.shiftDate && item.status) {
        const dayOfWeek = dayjs(item.shiftDate).diff(
          dayjs(formattedWeekStart),
          "day"
        ); // Get the day index from week start
        if (item.status === "MEDICAL") {
          totals.MEDICAL[dayOfWeek] += item._count.status;
        } else if (item.leave === "FULLDAY") {
          totals.LEAVE[dayOfWeek] += item._count.status;
        } else if (item.leave === "HALFDAY") {
          totals.LEAVE[dayOfWeek] += item._count.status * 0.5;
          totals[item.status][dayOfWeek] += item._count.status;
        } else {
          totals[item.status][dayOfWeek] += item._count.status;
        }
      }
    });

    // Fetch headcount data
    const nationalityResponse = await prisma.candidate.groupBy({
      by: ["nationality"],
      where: {
        Assign: {
          some: {
            projectCuid: projectCuid,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    const passTypeResponse = await prisma.candidate.groupBy({
      by: ["residency"],
      where: {
        Assign: {
          some: {
            projectCuid: projectCuid,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    // Fetch claims amt
    const claimsResponse = await prisma.request.findMany({
      where: {
        projectCuid,
        type: "CLAIM",
        status: "APPROVED",
        Attendance: {
          some: {
            shiftDate: {
              gte: formattedWeekStart,
              lte: formattedWeekEnd,
            },
          },
        },
      },
    });

    const expenses = {
      medical: 0,
      transport: 0,
      others: 0,
    };

    claimsResponse.reduce<{ [key: string]: number }>((acc, claim) => {
      // Parse the data JSON
      const data = claim.data as { claimType: string; claimAmount: string };

      // Extract claimType and claimAmount
      const { claimType, claimAmount } = data;

      // Sum the claim amounts
      const claimTypeKey = claimType.toLowerCase();
      acc[claimTypeKey] = (acc[claimTypeKey] || 0) + parseFloat(claimAmount);
      return acc;
    }, expenses);

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
        const nationalityKey = item.nationality
          ? item.nationality.toLowerCase()
          : "not_set";
        acc[nationalityKey] = item._count._all;
        return acc;
      },
      {}
    );

    const passTypeData: Record<string, number> = passTypeResponse.reduce(
      (acc: Record<string, number>, item) => {
        const nationalityKey = item.residency
          ? item.residency.toLowerCase()
          : "not_set";
        acc[nationalityKey] = item._count._all;
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
      residency: passTypeData,
    };

    return res.json({ datasets, headcount, expenses });
  } catch (error) {
    console.error("Error fetching overview:", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

/**
 * POST /api/admin/project
 *
 * Create a new project.
 *
 * Parameters:
 * name
 * clientUEN
 * clientName
 * employmentBy
 * startDate
 * endDate
 * noticePeriodDuration
 * noticePeriodUnit
 * timezone
 *
 * Steps:
 * 1. Check if all fields are present and valid
 * 2. Create the project
 */
projectAPIRouter.post("/project", async (req, res) => {
  const user = req.user as User;
  const {
    name,
    clientUEN,
    clientName,
    employmentBy,
    startDate,
    endDate,
    noticePeriodDuration,
    noticePeriodUnit,
    timezone,
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

  if (!timezone)
    return res.status(400).json({
      message: "Please specify timezone.",
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

  const employmentByValidity = checkEmploymentByValidity(employmentBy);
  if (!employmentByValidity.isValid) {
    return res.status(400).json({
      message: employmentByValidity.message,
    });
  }

  const createData = {
    name,
    startDate: dayjs(startDate).tz(timezone).startOf("day").toDate(),
    endDate: dayjs(endDate).tz(timezone).endOf("day").toDate(),
    noticePeriodDuration: parseInt(noticePeriodDuration),
    noticePeriodUnit,
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

/**
 * PATCH /api/admin/project
 *
 * Update an existing project.
 *
 * Parameters:
 * projectCuid
 * and optional fields to update
 *
 * Steps:
 * 1. Check if fields present are valid
 * 2. Check if user has permission to update the project
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 3. Update the project if there is a field to update
 */
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
    ...(startDate && { startDate: dayjs.utc(startDate).toDate() }),
    ...(endDate && { endDate: dayjs.utc(endDate).toDate() }),
    ...(timeWindow && { timeWindow }),
    ...(distanceRadius && { distanceRadius }),
    ...(candidateHolders && {
      candidateHolders,
    }),
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

/**
 * POST /api/admin/project/:projectCuid/candidates
 *
 * Assigns candidates to a project.
 * Creates candidate records if they do not exist yet.
 * Ignores and returns list of candidates that were already assigned to the project.
 *
 * Parameters:
 * projectCuid
 * candidates
 *
 * Steps:
 * 1. Check permission, requires either:
 *  a. User is a consultant of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Validate candidates data
 * 3. Within a transaction:
 *  a. Create candidate (and user) records if they do not exist
 *  b. Assign all candidates to the project
 *  c. Return list of candidates that were already assigned to the project
 */
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

  // verify all candidates have nric, name, contact, dateOfBirth, startDate, endDate, employmentType, residency, restDay
  const invalidCandidates = candidates.filter(
    (cdd: any) =>
      !cdd.nric ||
      !cdd.name ||
      !cdd.contact ||
      !cdd.residency ||
      !cdd.dateOfBirth ||
      !cdd.startDate ||
      !cdd.endDate ||
      !cdd.employmentType ||
      !cdd.restDay
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
        dateOfBirth: dayjs.utc(cdd.dateOfBirth).toDate(),
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
    return await prisma.$transaction(
      async (prisma) => {
        const candidateData = await prisma.candidate.createManyAndReturn({
          data: candidateObjects,
          skipDuplicates: true,
        });

        // create user records for new candidates
        await Promise.all(
          candidateData.map((cdd) =>
            prisma.user.create({
              data: {
                hash: bcrypt.hashSync(generateDefaultPassword(cdd), 12),
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

        // retrieve cuids (some might be newly created, some might be already in db)
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
            restDay: candidates.find((c) => c.nric === cdd.nric).restDay,
          };
        });

        const createdAssigns = await prisma.assign.createManyAndReturn({
          data: assignData,
          skipDuplicates: true,
        });

        const alreadyAssignedCandidates = candidatesInDb
          .filter(
            (cdd) =>
              !createdAssigns.some(
                (assign) => assign.candidateCuid === cdd.cuid
              )
          )
          .map((cdd) => cdd.cuid);

        return res.send(alreadyAssignedCandidates);
      },
      {
        // variable transaction timeout based on number of candidates
        timeout: candidates.length * 2000,
      }
    );
  } catch (error) {
    const err = error as PrismaError;
    console.log(err);
    return res.status(500).send("Internal server error.");
  }
});

/**
 * DELETE /api/admin/project/:projectCuid/candidates
 *
 * HARD DELETES ASSIGNS WITH NO CARES ABOUT ATTENDANCES
 *
 * Parameters:
 * projectCuid
 * cuidList
 *
 * Steps:
 * 1. Check permission, either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Otherwise, only proceed for candidates that the user has assigned
 * 3. Delete scheduled future attendances (if they exist)
 * 4. Check if candidate has past attendances
 *  a. If candidate has no past attendances, hard delete candidate
 *  b. Otherwise, soft delete candidate by setting endDate to current date
 *
 * TODO: Test if this works as intended
 */
projectAPIRouter.delete(
  "/project/:projectCuid/candidates",
  async (req, res) => {
    const user = req.user as User;
    const { projectCuid } = req.params;
    let { cuidList } = req.body;

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
          // for permission check
          Manage: {
            where: {
              role: Role.CLIENT_HOLDER,
            },
          },

          // for permission check
          Assign: {
            where: {
              consultantCuid: user.cuid,
            },
          },

          // for checking attendances
          Shift: {
            include: {
              Attendance: {
                where: {
                  candidateCuid: {
                    in: cuidList,
                  },
                },
                include: {
                  Request: true,
                },
              },
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

    const hasPermissionToDeleteAll =
      projectData.Manage.some((m) => m.consultantCuid === user.cuid) ||
      (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

    if (!hasPermissionToDeleteAll) {
      // filter out candidates that the user did not assign
      cuidList = cuidList.filter((cuid) => {
        const assign = projectData.Assign.find(
          (assign) => assign.candidateCuid === cuid
        );

        return assign && assign.consultantCuid === user.cuid;
      });

      if (cuidList.length === 0) {
        return res
          .status(401)
          .send(
            PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS
          );
      }
    }

    // get list of all future attendances to be removed
    const futureAttendances = projectData.Shift.flatMap((shift) =>
      shift.Attendance.filter((attendance) => {
        const isInCuidList = cuidList.includes(attendance.candidateCuid);
        if (!isInCuidList) return false;

        const { correctStartTime } = correctTimes(
          attendance.shiftDate,
          attendance.shiftType === "SECOND_HALF"
            ? shift.halfDayStartTime!
            : shift.startTime,
          attendance.shiftType === "FIRST_HALF"
            ? shift.halfDayEndTime!
            : shift.endTime
        );

        return dayjs().isBefore(correctStartTime);
      })
    );

    try {
      await prisma.$transaction(async () => {
        // delete future attendances
        await prisma.attendance.deleteMany({
          where: {
            cuid: {
              in: futureAttendances.map((attendance) => attendance.cuid),
            },
          },
        });

        // marks all related requests as REJECTED
        await prisma.request.updateMany({
          where: {
            cuid: {
              in: futureAttendances.flatMap((attendance) =>
                attendance.Request.map((request) => request.cuid)
              ),
            },
            status: {
              not: "CANCELLED",
            },
          },
          data: {
            status: "REJECTED",
          },
        });

        // delete assigns without attendances
        await prisma.assign.deleteMany({
          where: {
            projectCuid,
            Candidate: {
              cuid: {
                in: cuidList,
              },

              // has no past attendances for this project
              Attendance: {
                none: {
                  Shift: {
                    projectCuid,
                  },
                },
              },
            },
          },
        });

        // update end date for candidates with past attendances
        await prisma.assign.updateMany({
          where: {
            projectCuid,
            Candidate: {
              cuid: {
                in: cuidList,
              },

              //  has past attendances for this project
              Attendance: {
                some: {
                  Shift: {
                    projectCuid,
                  },
                },
              },
            },
          },

          data: {
            endDate: dayjs().startOf("day").toDate(),
          },
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal server error.");
    }

    return res.send("Candidates removed successfully.");
  }
);

/**
 * POST /api/admin/project/:projectCuid/shifts
 *
 * Create a new shift for the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * startTime
 * endTime
 * halfDayStartTime
 * halfDayEndTime
 * breakDuration
 * timezone
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Validate the shift data
 * 3. Create the shift
 */
projectAPIRouter.post("/project/:projectCuid/shifts", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const {
    startTime,
    endTime,
    halfDayEndTime,
    halfDayStartTime,
    breakDuration,
    timezone,
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

  const [startTimeHour, startTimeMinute] = startTime.split(":").map(Number);
  const startTimeObject = dayjs()
    .tz(timezone)
    .set("hour", startTimeHour)
    .set("minute", startTimeMinute)
    .startOf("minute")
    .utc();

  const [endTimeHour, endTimeMinute] = endTime.split(":").map(Number);
  let endTimeObject = dayjs()
    .tz(timezone)
    .set("hour", endTimeHour)
    .set("minute", endTimeMinute)
    .startOf("minute")
    .utc();

  if (startTimeObject.isAfter(endTimeObject)) {
    endTimeObject = endTimeObject.add(1, "day");
  }

  const shiftDuration = endTimeObject.diff(startTimeObject, "hour", true);

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
    startTime: defaultDate(startTimeObject).toDate(),
    endTime: defaultDate(endTimeObject).toDate(),
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

/**
 * GET /api/admin/project/:projectCuid/candidates/roster
 *
 * Retrieve the roster data for the project with the given cuid.
 * Used in rosterContextProvider
 *
 * Parameters:
 * projectCuid
 * startDate
 * endDate
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a consultant of the project
 *  b. User has CAN_READ_ALL_PROJECTS permission
 * 2. Fetch attendance data between the given dates
 * 3. Return the attendance data
 */
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

/**
 * GET /api/admin/projects
 *
 * Retrieve all projects that the user is a consultant of.
 */
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
      select: {
        cuid: true,
        name: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        Manage: {
          select: {
            consultantCuid: true,
            role: true,
          },
          where: {
            Consultant: {
              status: "ACTIVE",
            },
          },
        },
        Client: true,
      },
    });

    return res.send(
      projectsData.map((project) => {
        return {
          cuid: project.cuid,
          name: project.name,
          createdAt: project.createdAt,
          clientName: project.Client.name,
          clientUEN: project.Client.uen,
          startDate: project.startDate,
          endDate: project.endDate,
          consultants: project.Manage.map((manage) => ({
            cuid: manage.consultantCuid,
            role: manage.role,
          })),
        };
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

/**
 * GET /api/admin/projects/all
 *
 * Retrieve all projects that the user is not a consultant of.
 */
projectAPIRouter.get("/projects/all", async (req, res) => {
  const user = req.user as User;

  try {
    const projectsData = await prisma.project.findMany({
      where: {
        Manage: {
          none: {
            consultantCuid: user.cuid,
          },
        },
      },
      select: {
        cuid: true,
        name: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        Manage: {
          select: {
            consultantCuid: true,
            role: true,
          },
          where: {
            Consultant: {
              status: "ACTIVE",
            },
          },
        },
        Client: true,
      },
    });

    return res.send(
      projectsData.map((project) => {
        return {
          cuid: project.cuid,
          name: project.name,
          createdAt: project.createdAt,
          clientName: project.Client.name,
          clientUEN: project.Client.uen,
          startDate: project.startDate,
          endDate: project.endDate,
          consultants: project.Manage.map((manage) => ({
            cuid: manage.consultantCuid,
            role: manage.role,
          })),
        };
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});
/**
 * POST /api/admin/project/:projectCuid/manage
 *
 * Add a consultant to the project with the given cuid and role.
 *
 * Parameters:
 * projectCuid
 * consultantCuid
 * role
 *
 * Steps:
 * 1. Check permissions, requires either:
 * a. User is a client holder of the project
 * b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Validate the role
 * 3. Add the consultant to the project
 */
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

/**
 * PATCH /api/admin/project/:projectCuid/manage
 *
 * Change the role of a consultant in the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * consultantCuid
 * role
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Validate the role
 * 3. Update the role of the consultant in the project
 */
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

/**
 * DELETE /api/admin/project/:projectCuid/manage
 *
 * Remove a consultant from the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * consultantCuid
 * reassignments
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Ensure that last client holder is not removed
 * 3. Reassign candidates to new consultants
 * 4. Remove the consultant from the project
 */
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
 * POST /project/:projectCuid/roster/copy
 *
 * Takes the attendance data for a week and copies it to the next week.
 *
 * Parameters:
 * projectCuid
 * startDate
 * endDate
 * selectedCandidates
 * selectedDates
 *
 * Steps:
 * 1. Retrieve attendance data for that week (include with Manage data for permission check)
 * of selectedDates and selectedCandidates if specified
 * 2. Check permissions, requires either:
 * a. User is a client holder of the project
 * b. User has CAN_EDIT_ALL_PROJECTS permission
 * 3. For each attendance:
 *  a. Check that its shift's status is active
 *  b. Check that its copy will be within candidate assign period
 *  c. Check that it does not clash with any other attendance (can be from other projects)
 *  d. If any of the above checks fail, add to failure list, continue to next attendance
 *  e. Create new attendance
 *  i. Check LeaveType => if HALF_DAY, adjust ShiftType
 * 4. Return failure list in response
 */
projectAPIRouter.post("/project/:projectCuid/roster/copy", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const { startDate, endDate, selectedCandidates, selectedDates } = req.body;

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
    const attendanceList = await prisma.attendance.findMany({
      where: {
        ...(selectedCandidates && {
          candidateCuid: {
            in: selectedCandidates,
          },
        }),
        ...(selectedDates &&
          selectedDates.length === 0 && {
            shiftDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        ...(selectedDates &&
          selectedDates.length > 0 && {
            shiftDate: {
              in: selectedDates.map((date: string) => new Date(date)),
            },
          }),
        Shift: {
          projectCuid,
        },
      },
      include: {
        Shift: true,
      },
    });

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
 * POST /api/admin/project/:projectCuid/roster/clear
 *
 * Takes the roster data for period specified and deletes it if it has yet to happen.
 *
 * Parameters:
 * projectCuid
 * startDate
 * endDate
 * selectedCandidates
 * selectedDates
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Delete all attendance data for that period that satisfies the following conditions
 *  a. status is null
 *  b. leave is null
 *  c. shiftDate is within the period and start time has yet to pass or is within selectedDates if specified
 *  d. projectCuid matches
 *  e. candidateCuid is in selectedCandidates if provided
 */
projectAPIRouter.post(
  "/project/:projectCuid/roster/clear",
  async (req, res) => {
    const user = req.user as User;
    const { projectCuid } = req.params;
    const { startDate, endDate, selectedCandidates, selectedDates } = req.body;

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
            none: {
              status: {
                in: [RequestStatus.PENDING, RequestStatus.APPROVED],
              },
            },
          },

          // check all candidate if candidateCuids is not provided/empty
          ...(selectedCandidates &&
            selectedCandidates.length > 0 && {
              candidateCuid: {
                in: selectedCandidates,
              },
            }),
          ...(selectedDates &&
            selectedDates.length === 0 && {
              shiftDate: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            }),
          ...(selectedDates &&
            selectedDates.length > 0 && {
              shiftDate: {
                in: selectedDates.map((date: string) => new Date(date)),
              },
            }),
          Shift: {
            projectCuid,
          },
          // Candidate: {
          //   Assign: {
          //     Request: {},
          //   },
          // },
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

/**
 * POST /api/admin/project/:projectCuid/shifts/archive
 *
 * Archive all shifts that are rostered after the given date.
 *
 * Parameters:
 * projectCuid
 * startDate
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Retrieve all shifts that are rostered after the given date
 * 3. Update all shifts that are not rostered to be archived
 */
projectAPIRouter.post(
  "/project/:projectCuid/shifts/archive",
  async (req, res) => {
    const user = req.user as User;
    const { projectCuid } = req.params;
    const { startDate } = req.body;

    if (!projectCuid) {
      return res.status(400).send("projectCuid is required.");
    }

    if (!startDate || isNaN(Date.parse(startDate))) {
      return res.status(400).send("valid startDate is required.");
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
      const rosteredShifts = await prisma.attendance.findMany({
        where: {
          shiftDate: {
            gte: new Date(startDate),
          },
          Shift: {
            projectCuid,
          },
        },
        distinct: ["shiftCuid"],
      });

      await prisma.shift.updateMany({
        where: {
          projectCuid,
          cuid: {
            notIn: rosteredShifts.map((shift) => shift.shiftCuid),
          },
        },
        data: {
          status: ShiftStatus.ARCHIVED,
        },
      });

      return res.send("Successfully archived shifts.");
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Internal server error." });
    }
  }
);

/**
 * PATCH /api/admin/project/:projectCuid/assign
 *
 * Update the assign data for the project with the given cuid.
 *
 * Parameters:
 * projectCuid
 * editedRows : {
 *   candidateCuid
 *   employeeId
 *   startDate
 *   endDate
 *   employmentType
 *   restDay
 *   consultantCuid
 * }[]
 *
 * Steps:
 * 1. Check permissions, requires either:
 *  a. User is a client holder of the project
 *  b. User has CAN_EDIT_ALL_PROJECTS permission
 * 2. Validate the assign data
 * 3. Update the assign data
 */
projectAPIRouter.patch("/project/:projectCuid/assign", async (req, res) => {
  const user = req.user as User;
  const { projectCuid } = req.params;
  const editedRows = req.body;

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
        Manage: {
          where: {
            role: Role.CLIENT_HOLDER,
          },
        },
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
    projectData.Manage.some((m) => m.consultantCuid === user.cuid) ||
    (await checkPermission(user.cuid, PermissionList.CAN_EDIT_ALL_PROJECTS));

  if (!hasPermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_EDIT_ALL_PROJECTS);
  }

  for (const row of editedRows) {
    const {
      candidateCuid,
      employeeId,
      startDate,
      endDate,
      employmentType,
      restDay,
      consultantCuid,
    } = row;

    if (
      !candidateCuid ||
      !employeeId ||
      !startDate ||
      !endDate ||
      !restDay ||
      !consultantCuid ||
      !employmentType
    ) {
      return res.status(400).send("All fields are required.");
    }
  }

  try {
    await prisma.$transaction(
      editedRows.map(
        (row: {
          candidateCuid: string;
          employeeId: string;
          startDate: string;
          endDate: string;
          employmentType: "FULL_TIME" | "PART_TIME";
          restDay: "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
          consultantCuid: string;
        }) =>
          prisma.assign.update({
            where: {
              projectCuid_candidateCuid: {
                projectCuid,
                candidateCuid: row.candidateCuid,
              },
            },
            data: {
              employeeId: row.employeeId,
              startDate: new Date(row.startDate),
              endDate: new Date(row.endDate),
              employmentType: row.employmentType,
              restDay: row.restDay,
              consultantCuid: row.consultantCuid,
            },
          })
      )
    );

    return res.send("Successfully updated assign data.");
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal server error." });
  }
});

export default projectAPIRouter;
