import { Router, Request, Response } from "express";
import { prisma, s3 } from "../../../client";
import { PrismaError } from "@/types";
import { User } from "@/types/common";
import dayjs from "dayjs";
import { maskNRIC } from "../../../utils";
import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  PermissionList,
  getPermissions,
} from "../../../utils/permissions";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import bcrypt from "bcrypt";
import { generateDefaultPassword } from "../../../utils";

const candidateAPIRoutes: Router = Router();

/**
GET /api/admin/candidate/:candidateCuid

Fetches data of the candidate with the specified cuid.

Parameters:
candidateCuid

Steps:
1. Fetch user data fom database.
2. Check if user has permission to edit candidate info. (canEdit field in response)
  a. User has assigned the candidate
  b. User is a client holder of the project the candidate is assigned to
3. Check if user has permission to read sensitive candidate details (full nric, address, bank details).
*/
candidateAPIRoutes.get(
  "/candidate/:candidateCuid",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { candidateCuid } = req.params;

    try {
      const candidateData = await prisma.candidate.findUniqueOrThrow({
        where: {
          cuid: candidateCuid,
        },
        include: {
          Assign: {
            include: {
              Consultant: true,
              Project: {
                include: {
                  Manage: true,
                },
              },
            },
          },
        },
      });

      const {
        cuid,
        name,
        nric,
        contact,
        residency,
        dateOfBirth,
        nationality,
        hasOnboarded,
        emergencyContact,
        ...otherData
      } = candidateData;

      // Check if user has permission to edit candidate info
      // Either the assigner or the client holder can edit the candidate info
      const canEdit =
        candidateData.Assign.some(
          (assign) =>
            assign.consultantCuid === user.cuid ||
            assign.Project.Manage.some(
              (manage) =>
                manage.consultantCuid === user.cuid &&
                manage.role === "CLIENT_HOLDER"
            )
        ) ||
        (await checkPermission(
          user.cuid,
          PermissionList.CAN_UPDATE_CANDIDATES
        ));

      const hasReadCandidateDetailsPermission = await checkPermission(
        user.cuid,
        PermissionList.CAN_READ_CANDIDATE_DETAILS
      );

      if (hasReadCandidateDetailsPermission) {
        return res.send({
          cuid: candidateCuid,
          name,
          nric,
          contact,
          residency,
          dateOfBirth,
          nationality,
          hasOnboarded,
          emergencyContact,
          canEdit,
          ...otherData,
        });
      }

      return res.send({
        cuid: candidateCuid,
        name,
        nric: maskNRIC(nric),
        contact,
        residency,
        nationality,
        dateOfBirth,
        hasOnboarded,
        emergencyContact,
        canEdit,
      });
    } catch (error) {
      return res.status(404).send("Candidate not found.");
    }
  }
);

/**
GET /api/admin/candidate/bynric/:candidateNric

Fetches data of the candidate with the specified NRIC, if they exist.

Parameters:
candidateNric
*/
candidateAPIRoutes.get("/candidate/bynric/:candidateNric", async (req, res) => {
  const { candidateNric } = req.params;

  try {
    const candidate = await prisma.candidate.findUnique({
      where: {
        nric: candidateNric,
      },
    });

    if (!candidate) {
      return res.status(404).send("Candidate not found.");
    }

    return res.send({
      nric: candidate.nric,
      name: candidate.name,
      cuid: candidate.cuid,
      contact: candidate.contact,
      residency: candidate.residency,
      dateOfBirth: candidate.dateOfBirth,
      nationality: candidate.nationality,
    });
  } catch (error) {
    return res.status(404).send("Candidate not found.");
  }
});

/**
PATCH /api/admin/candidate

Updates data of the candidate with the specified cuid.

Parameters:
cuid
(and optional parameters)

Steps:
1. Check permission to update candidate data
  a. User has CAN_UPDATE_CANDIDATES permission
  b. User is an assigner of the candidate
  c. User is a client holder of the project the candidate is assigned to
2. Validate the input fields
3. Update the candidate data
*/
candidateAPIRoutes.patch("/candidate", async (req, res) => {
  const user = req.user as User;
  const {
    cuid,
    name,
    contact,
    residency,
    nationality,
    dateOfBirth,
    bankDetails,
    address,
    emergencyContact,
  } = req.body;

  // Checking for the required identifier
  if (!cuid) return res.status(400).send("cuid parameter is required.");

  if (
    !name &&
    !contact &&
    !residency &&
    !nationality &&
    !dateOfBirth &&
    !bankDetails &&
    !address &&
    !emergencyContact
  ) {
    return res
      .status(400)
      .send(
        "At least one field (name, contact, nationality, dateOfBirth, bankDetails, address, emergencyContact) is required."
      );
  }

  // Check if user has permission to update candidate:
  // has CAN_UPDATE_CANDIDATES permission / is an assigner / is a client holder
  const hasUpdateCandidatePermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_UPDATE_CANDIDATES
  );

  if (!hasUpdateCandidatePermission) {
    const data = await prisma.candidate.findUnique({
      where: {
        cuid,
      },
      include: {
        Assign: {
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

    if (!data) {
      return res.status(404).send("Candidate not found.");
    }

    // Check if user has permission to edit candidate info
    // Either the assigner or the client holder can edit the candidate info
    const canEdit = data.Assign.some(
      (assign) =>
        assign.consultantCuid === user.cuid ||
        assign.Project.Manage.some(
          (manage) =>
            manage.consultantCuid === user.cuid &&
            manage.role === "CLIENT_HOLDER"
        )
    );

    if (!canEdit) {
      return res
        .status(401)
        .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_UPDATE_CANDIDATES);
    }
  }

  // Validation for dateOfBirth
  if (dateOfBirth && !Date.parse(dateOfBirth)) {
    return res.status(400).send("Invalid dateOfBirth parameter.");
  }

  // Validation for bankDetails
  if (
    bankDetails &&
    (!bankDetails.bankHolderName ||
      !bankDetails.bankName ||
      !bankDetails.bankNumber)
  ) {
    return res.status(400).send("Invalid bankDetails JSON.");
  }
  // Validation for address
  if (
    address &&
    (!address.block ||
      !address.building ||
      !address.street ||
      !address.postal ||
      !address.country ||
      !address.floor ||
      !address.unit)
  ) {
    return res.status(400).send("Invalid address JSON.");
  }

  // Validation for emergencyContact
  if (
    emergencyContact &&
    (!emergencyContact.name ||
      !emergencyContact.relationship ||
      !emergencyContact.contact)
  ) {
    return res.status(400).send("Invalid emergencyContact JSON.");
  }

  // Build the update data object with only provided fields
  const updateData = {
    ...(name && { name }),
    ...(contact && { contact }),
    ...(residency && { residency }),
    ...(nationality && { nationality }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(address && { address }),
    ...(bankDetails && { bankDetails }),
    ...(emergencyContact && { emergencyContact }),
  };

  // Check if no fields are provided to update
  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("No valid fields provided for update.");
  }

  try {
    await prisma.candidate.update({
      where: { cuid },
      data: updateData,
    });

    return res.send(`Candidate ${cuid} updated successfully.`);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Candidate not found.");
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }
});

/**
GET /api/admin/history/:candidatecuid/:page

Fetches the attendance history of the candidate with the specified cuid.
Uses pagination.

Parameters:
candidatecuid

Steps:
1. Display attendances based on whether the user is part of the project.
  a. Unless they have CAN_READ_ALL_PROJECTS
2. Fetch the attendance data from the database.
*/
candidateAPIRoutes.get(
  "/history/:candidatecuid/:page",
  async (req: Request, res: Response) => {
    const usercuid = req.params.candidatecuid;
    const page = parseInt(req.params.page, 10);
    const { date } = req.query;
    const limit = 10;
    const offset = (page - 1) * limit;
    const today = dayjs();

    try {
      let whereClause: any = {
        candidateCuid: usercuid,
        shiftDate: {
          lt: today.toDate(),
        },
      };

      if (date) {
        const selectedDate = dayjs(date as string);
        whereClause = {
          ...whereClause,
          shiftDate: {
            gte: selectedDate.startOf("day").toDate(),
            lt: selectedDate.isBefore(today, "day")
              ? selectedDate.endOf("day").toDate()
              : today.toDate(),
          },
        };
      }

      const hasReadAllProjectsPermission = await checkPermission(
        usercuid,
        PermissionList.CAN_READ_ALL_PROJECTS
      );

      if (!hasReadAllProjectsPermission) {
        whereClause = {
          ...whereClause,
          Candidate: {
            Assign: {
              some: {
                Project: {
                  Manage: {
                    some: {
                      consultantCuid: usercuid,
                    },
                  },
                },
              },
            },
          },
        };
      }

      const totalCount = await prisma.attendance.count({
        where: {
          candidateCuid: usercuid,
          shiftDate: {
            lt: today.toDate(),
          },
        },
      });

      const fetchedData = await prisma.attendance.findMany({
        where: whereClause,
        include: {
          Shift: {
            include: {
              Project: true,
            },
          },
        },
        orderBy: {
          shiftDate: "asc",
        },
        skip: offset,
        take: limit,
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

      res.json([fetchedData, paginationData]);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching the upcoming shifts.",
      });
    }
  }
);

/**
GET /api/admin/report/:candidatecuid

Fetches the data of the candidate with the specified cuid.
Used for candidate profile report tab.
No permissions required, since only combined data is shown.

Parameters:
candidatecuid
*/
candidateAPIRoutes.get("/report/:candidateCuid", async (req, res) => {
  const { candidateCuid } = req.params;

  const { month, year } = req.query as {
    month: string;
    year: string;
  };

  const providedDate = dayjs()
    .set("month", parseInt(month))
    .set("year", parseInt(year));

  const queryDate = providedDate.isValid() ? providedDate : dayjs();

  const attendanceData = await prisma.attendance.findMany({
    where: {
      candidateCuid: candidateCuid,
      shiftDate: {
        gte: queryDate.startOf("month").toDate(),
        lte: queryDate.endOf("month").toDate(),
      },
    },
    include: {
      Shift: true,
    },
  });

  const onTime = attendanceData.filter(
    (attendance) =>
      attendance.status === "ON_TIME" && attendance.clockOutTime !== null
  ).length;
  const late = attendanceData.filter(
    (attendance) =>
      attendance.status === "LATE" && attendance.clockOutTime !== null
  ).length;
  const noShow = attendanceData.filter(
    (attendance) => attendance.status === "NO_SHOW" && attendance.leave === null
  ).length;
  const others = attendanceData.filter(
    (attendance) =>
      attendance.clockInTime !== null && attendance.clockOutTime === null
  ).length;

  const hoursWorked = attendanceData
    .filter(
      (attendance) =>
        attendance.clockOutTime !== null && attendance.status !== "NO_SHOW"
    )
    .reduce((acc, attendance) => {
      if (attendance.shiftType === "FULL_DAY") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "FIRST_HALF") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.halfDayEndTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "SECOND_HALF") {
        const startTime = dayjs(attendance.Shift.halfDayStartTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      return acc;
    }, 0);

  const scheduledHoursWorked = attendanceData
    .filter((attendance) => attendance.status !== "MEDICAL")
    .reduce((acc, attendance) => {
      if (attendance.shiftType === "FULL_DAY") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "FIRST_HALF") {
        const startTime = dayjs(attendance.Shift.startTime);
        const endTime = dayjs(attendance.Shift.halfDayEndTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      if (attendance.shiftType === "SECOND_HALF") {
        const startTime = dayjs(attendance.Shift.halfDayStartTime);
        const endTime = dayjs(attendance.Shift.endTime);

        if (endTime.isBefore(startTime)) {
          return acc + endTime.add(1, "day").diff(startTime, "hour", true);
        }

        return acc + endTime.diff(startTime, "hour", true);
      }

      return acc;
    }, 0);

  const mc = attendanceData.filter(
    (attendance) => attendance.status === "MEDICAL" && attendance.leave === null
  ).length;
  const leave = attendanceData
    .filter(
      (attendance) =>
        attendance.status !== "MEDICAL" && attendance.leave !== null
    )
    .reduce((acc, attendance) => {
      if (attendance.leave === "HALFDAY") {
        return acc + 0.5;
      }

      return acc + 1;
    }, 0);

  return res.json({
    onTime,
    late,
    noShow,
    others,
    mc,
    leave,
    hoursWorked,
    scheduledHoursWorked,
  });
});

candidateAPIRoutes.get(
  "/candidate/:candidateCuid/nric/front",
  async (req, res) => {
    const user = req.user as User;
    const candidateCuid = req.params.candidateCuid;

    console.log("triggers");

    const hasReadCandidateDetailsPermission = await checkPermission(
      user.cuid,
      PermissionList.CAN_READ_CANDIDATE_DETAILS
    );

    if (!hasReadCandidateDetailsPermission) {
      const data = await prisma.candidate.findUnique({
        where: {
          cuid: candidateCuid,
        },
        include: {
          Assign: {
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

      const assignersAndClientHolders: string[] = [];
      data?.Assign.forEach((assign) => {
        if (!assignersAndClientHolders.includes(assign.consultantCuid)) {
          assignersAndClientHolders.push(assign.consultantCuid);
        }

        assign.Project.Manage.forEach((manage) => {
          if (
            manage.role === "CLIENT_HOLDER" &&
            !assignersAndClientHolders.includes(manage.consultantCuid)
          ) {
            assignersAndClientHolders.push(manage.consultantCuid);
          }
        });
      });

      if (!assignersAndClientHolders.includes(user.cuid)) {
        return res
          .status(401)
          .send(
            PERMISSION_ERROR_TEMPLATE +
              PermissionList.CAN_READ_CANDIDATE_DETAILS
          );
      }
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `users/${candidateCuid}/nric/front`,
      });

      const response = await s3.send(command);

      if (response.Body instanceof Readable) {
        return response.Body.pipe(res);
      } else {
        return res.status(500).send("Unexpected response body type");
      }
    } catch (error) {
      console.error("Error while downloading file:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

candidateAPIRoutes.get(
  "/candidate/:candidateCuid/nric/back",
  async (req, res) => {
    const user = req.user as User;
    const candidateCuid = req.params.candidateCuid;

    const hasReadCandidateDetailsPermission = await checkPermission(
      user.cuid,
      PermissionList.CAN_READ_CANDIDATE_DETAILS
    );

    if (!hasReadCandidateDetailsPermission) {
      const data = await prisma.candidate.findUnique({
        where: {
          cuid: candidateCuid,
        },
        include: {
          Assign: {
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

      const assignersAndClientHolders: string[] = [];
      data?.Assign.forEach((assign) => {
        if (!assignersAndClientHolders.includes(assign.consultantCuid)) {
          assignersAndClientHolders.push(assign.consultantCuid);
        }

        assign.Project.Manage.forEach((manage) => {
          if (
            manage.role === "CLIENT_HOLDER" &&
            !assignersAndClientHolders.includes(manage.consultantCuid)
          ) {
            assignersAndClientHolders.push(manage.consultantCuid);
          }
        });
      });

      if (!assignersAndClientHolders.includes(user.cuid)) {
        return res
          .status(401)
          .send(
            PERMISSION_ERROR_TEMPLATE +
              PermissionList.CAN_READ_CANDIDATE_DETAILS
          );
      }
    }

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `users/${candidateCuid}/nric/back`,
      });

      const response = await s3.send(command);
      if (response.Body instanceof Readable) {
        return response.Body.pipe(res);
      } else {
        return res.status(500).send("Unexpected response body type");
      }
    } catch (error) {
      console.error("Error while downloading file:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

/**
 * GET /api/admin/candidate/resetPasswords/:candidateCuid
 *
 * Resets the password of the candidate with the specified cuid.
 * Requires isRoot permission.
 */
candidateAPIRoutes.get("/resetPasswords/:candidateCuid", async (req, res) => {
  const user = req.user as User;
  const candidateCuid = req.params.candidateCuid;

  const permissions = await getPermissions(user.cuid);
  if ("isRoot" in permissions && permissions["isRoot"]) {
    return true;
  }

  const candidate = await prisma.candidate.findUnique({
    where: {
      cuid: candidateCuid,
    },
  });

  if (!candidate) {
    return res.status(404).send("Candidate not found.");
  }

  prisma.user.update({
    where: {
      cuid: candidateCuid,
    },
    data: {
      hash: bcrypt.hashSync(generateDefaultPassword(candidate), 12),
    },
  });

  return res.send("All passwords reset");
});

export default candidateAPIRoutes;
