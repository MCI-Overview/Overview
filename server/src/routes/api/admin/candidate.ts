import { Router, Request, Response } from "express";
import { prisma } from "../../../client";
import { PrismaError } from "@/types";
import {
  CommonAddress,
  BankDetails,
  EmergencyContact,
  User,
} from "@/types/common";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { maskNRIC } from "../../../utils";
import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  PermissionList,
} from "../../../utils/permissions";

const candidateAPIRoutes: Router = Router();

candidateAPIRoutes.get(
  "/candidate/:candidateCuid",
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { candidateCuid } = req.params;

    if (user.userType !== "Admin") {
      // TODO: redirect request to user api endpoint
    }

    try {
      const {
        cuid,
        name,
        nric,
        contact,
        dateOfBirth,
        emergencyContact,
        ...otherData
      } = await prisma.candidate.findUniqueOrThrow({
        where: {
          cuid: candidateCuid,
        },
      });

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
          dateOfBirth,
          emergencyContact,
          ...otherData,
        });
      }

      return res.send({
        cuid: candidateCuid,
        name,
        nric: maskNRIC(nric),
        contact,
        dateOfBirth,
        emergencyContact,
      });
    } catch (error) {
      return res.status(404).send("Candidate not found.");
    }
  }
);

candidateAPIRoutes.get("/candidate/nric/:candidateNric", async (req, res) => {
  const user = req.user as User;
  const { candidateNric } = req.params;

  if (user.userType !== "Admin") {
    res.status(401).send("Unauthorized");
  }

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
      dateOfBirth: candidate.dateOfBirth,
      residency: candidate.residency,
    });
  } catch (error) {
    return res.status(404).send("Candidate not found.");
  }
});

candidateAPIRoutes.post("/candidate", async (req, res) => {
  const {
    nric,
    name,
    contact,
    nationality,
    dateOfBirth,
    bankDetails,
    address,
    emergencyContact,
  } = req.body;

  // Checking for the required parameters
  if (!nric) return res.status(400).send("nric parameter is required.");

  if (!name) return res.status(400).send("name parameter is required.");

  if (!contact) return res.status(400).send("contact parameter is required.");

  // Validation for dateOfBirth
  if (dateOfBirth && !Date.parse(dateOfBirth)) {
    return res.status(400).send("Invalid dateOfBirth parameter.");
  }

  // Validation for bankDetails
  let bankDetailsObject: BankDetails | undefined;
  if (bankDetails) {
    try {
      bankDetailsObject = JSON.parse(bankDetails) as BankDetails;
      if (
        !bankDetailsObject.bankHolderName ||
        !bankDetailsObject.bankName ||
        !bankDetailsObject.bankNumber
      ) {
        throw new Error();
      }
    } catch (error) {
      return res.status(400).send("Invalid bankDetails JSON.");
    }
  }

  // Validation for address
  let addressObject: CommonAddress | undefined;
  if (address) {
    try {
      addressObject = JSON.parse(address) as CommonAddress;
      if (
        !addressObject.block ||
        !addressObject.building ||
        !addressObject.floor ||
        !addressObject.unit ||
        !addressObject.street ||
        !addressObject.postal ||
        !addressObject.country
      ) {
        throw new Error();
      }
    } catch (error) {
      return res.status(400).send("Invalid address JSON.");
    }
  }

  // Validation for emergencyContact
  let emergencyContactObject: EmergencyContact | undefined;
  if (emergencyContact) {
    try {
      emergencyContactObject = JSON.parse(emergencyContact) as EmergencyContact;
      if (
        !emergencyContactObject.name ||
        !emergencyContactObject.relationship ||
        !emergencyContactObject.contact
      ) {
        throw new Error();
      }
    } catch (error) {
      return res.status(400).send("Invalid emergencyContact JSON.");
    }
  }

  const createData = {
    nric,
    name,
    contact,
    ...(nationality && { nationality }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(addressObject && { address: { update: addressObject } }),
    ...(bankDetailsObject && { bankDetails: { update: bankDetailsObject } }),
    ...(emergencyContactObject && {
      emergencyContact: { update: emergencyContactObject },
    }),
  };

  try {
    await prisma.candidate.create({
      data: {
        ...createData,
        User: {
          create: {
            username: nric,
            hash: await bcrypt.hash(contact, 12),
          },
        },
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      const prismaErrorMetaTarget = prismaError.meta.target || [];

      if (prismaErrorMetaTarget.includes("nric")) {
        return res.status(400).send("Candidate already exists.");
      }

      if (prismaErrorMetaTarget.includes("contact")) {
        return res.status(400).send("Another candidate has the same contact.");
      }
    }

    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  return res.send(`Candidate ${nric} created successfully.`);
});

candidateAPIRoutes.delete("/candidate", async (req, res) => {
  const user = req.user as User;
  const { cuid } = req.body;

  if (!cuid) return res.status(400).send("cuid parameter is required.");

  const hasDeleteCandidatePermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_DELETE_CANDIDATES
  );

  if (!hasDeleteCandidatePermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_DELETE_CANDIDATES);
  }

  try {
    await prisma.candidate.delete({
      where: {
        cuid,
        Assign: {
          none: {},
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error.");
  }

  return res.send(`Candidate ${cuid} deleted successfully.`);
});

candidateAPIRoutes.patch("/candidate", async (req, res) => {
  const user = req.user as User;
  const {
    cuid,
    name,
    contact,
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

  const hasUpdateCandidatePermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_UPDATE_CANDIDATES
  );

  if (!hasUpdateCandidatePermission) {
    return res
      .status(401)
      .send(PERMISSION_ERROR_TEMPLATE + PermissionList.CAN_UPDATE_CANDIDATES);
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
    ...(contact && { contact: contact }),
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
          lt: today,
        },
      };

      if (date) {
        const selectedDate = dayjs(date as string);
        whereClause = {
          ...whereClause,
          shiftDate: {
            gte: selectedDate.startOf("day"),
            lt:
              selectedDate.endOf("day") < today
                ? selectedDate.endOf("day")
                : today,
          },
        };
      }

      const totalCount = await prisma.attendance.count({
        where: whereClause,
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

export default candidateAPIRoutes;
