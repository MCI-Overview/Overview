import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  Address,
  BankDetails,
  EmergencyContact,
  PrismaError,
  User,
} from "@/types";
import bcrypt from "bcrypt";
import {
  Permission,
  PermissionErrorMessage,
  checkPermission,
} from "../../../utils/check-permission";

const prisma = new PrismaClient();

const candidateAPIRoutes: Router = Router();

candidateAPIRoutes.get("/candidate/:nric"),
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { nric } = req.params;

    const candidateData = await prisma.candidate.findUnique({
      where: {
        nric: nric,
      },
    });

    const hasReadCandidateDetailsPermission = await checkPermission(
      user.id,
      Permission.CAN_READ_CANDIDATE_DETAILS,
    );

    if (!candidateData) {
      return res.status(404).send("Candidate does not exist.");
    }

    if (hasReadCandidateDetailsPermission) {
      return res.send(candidateData);
    }

    return res.send({
      name: candidateData.name,
      nric: candidateData.nric,
      phoneNumber: candidateData.phoneNumber,
      emergencyContact: candidateData.emergencyContact,
    });
  };

candidateAPIRoutes.post("/candidate", async (req, res) => {
  const {
    nric,
    name,
    phoneNumber,
    nationality,
    dateOfBirth,
    bankDetails,
    address,
    emergencyContact,
  } = req.body;

  // Checking for the required parameters
  if (!nric) {
    return res.status(400).send("nric parameter is required.");
  }

  if (!name) {
    return res.status(400).send("name parameter is required.");
  }

  if (!phoneNumber) {
    return res.status(400).send("phoneNumber parameter is required.");
  }

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
        return res.status(400).send("Invalid bankDetails JSON.");
      }
    } catch (error) {
      return res.status(400).send("Invalid bankDetails JSON.");
    }
  }

  // Validation for address
  let addressObject: Address | undefined;
  if (address) {
    try {
      addressObject = JSON.parse(address) as Address;
      if (
        !addressObject.block ||
        !addressObject.building ||
        !addressObject.floor ||
        !addressObject.unit ||
        !addressObject.street ||
        !addressObject.postal ||
        !addressObject.country
      ) {
        return res.status(400).send("Invalid address JSON.");
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
        !emergencyContactObject.phoneNumber
      ) {
        return res.status(400).send("Invalid emergencyContact JSON.");
      }
    } catch (error) {
      return res.status(400).send("Invalid emergencyContact JSON.");
    }
  }

  const hasOnboarded =
    nationality && dateOfBirth && bankDetails && address && emergencyContact;

  const createData = {
    nric,
    name,
    phoneNumber,
    hasOnboarded,
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
            hash: await bcrypt.hash(phoneNumber, 12),
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

      if (prismaErrorMetaTarget.includes("phoneNumber")) {
        return res.status(400).send("Duplicate contact number specified.");
      }
    }

    return res.status(500).send(prismaError);
  }

  return res.send(`Candidate ${nric} created successfully.`);
});

candidateAPIRoutes.delete("/candidate", async (req, res) => {
  const user = req.user as User;
  const { nric } = req.body;

  if (!nric) {
    return res.status(400).send("nric parameter is required.");
  }

  const hasDeleteCandidatePermission = await checkPermission(
    user.id,
    Permission.CAN_DELETE_CANDIDATES,
  );

  if (!hasDeleteCandidatePermission) {
    return res
      .status(401)
      .send(PermissionErrorMessage.CANNOT_DELETE_CANDIDATE_ERROR_MESSAGE);
  }

  try {
    await prisma.candidate.delete({
      where: {
        nric: nric,
        Assign: {
          none: {},
        },
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    return res.status(500).send(prismaError);
  }

  return res.send(`Candidate ${nric} deleted successfully.`);
});

candidateAPIRoutes.patch("/candidate", async (req, res) => {
  const user = req.user as User;
  const {
    nric,
    name,
    phoneNumber,
    nationality,
    dateOfBirth,
    bankDetails,
    address,
    emergencyContact,
  } = req.body;

  // Checking for the required identifier
  if (!nric) {
    return res.status(400).send("nric parameter is required.");
  }

  if (
    !name &&
    !phoneNumber &&
    !nationality &&
    !dateOfBirth &&
    !bankDetails &&
    !address &&
    !emergencyContact
  ) {
    return res
      .status(400)
      .send(
        "At least one field (name, phoneNumber, nationality, dateOfBirth, bankDetails, address, emergencyContact) is required.",
      );
  }

  const hasUpdateCandidatePermission = await checkPermission(
    user.id,
    Permission.CAN_UPDATE_CANDIDATES,
  );

  if (!hasUpdateCandidatePermission) {
    return res
      .status(401)
      .send(PermissionErrorMessage.CANNOT_UPDATE_CANDIDATE_ERROR_MESSAGE);
  }

  // Validation for dateOfBirth
  if (dateOfBirth && !Date.parse(dateOfBirth)) {
    return res.status(400).send("Invalid dateOfBirth parameter.");
  }

  // Validation for bankDetails
  let bankDetailsObject;
  if (bankDetails) {
    try {
      bankDetailsObject = JSON.parse(bankDetails);
      if (
        !bankDetailsObject.bankHolderName ||
        !bankDetailsObject.bankName ||
        !bankDetailsObject.bankNumber
      ) {
        return res.status(400).send("Invalid bankDetails JSON.");
      }
    } catch (error) {
      return res.status(400).send("Invalid bankDetails JSON.");
    }
  }

  // Validation for address
  let addressObject;
  if (address) {
    try {
      addressObject = JSON.parse(address);
      if (
        !addressObject.block ||
        !addressObject.building ||
        !addressObject.floor ||
        !addressObject.unit ||
        !addressObject.street ||
        !addressObject.postal ||
        !addressObject.country
      ) {
        return res.status(400).send("Invalid address JSON.");
      }
    } catch (error) {
      return res.status(400).send("Invalid address JSON.");
    }
  }

  // Validation for emergencyContact
  let emergencyContactObject;
  if (emergencyContact) {
    try {
      emergencyContactObject = JSON.parse(emergencyContact);
      if (
        !emergencyContactObject.name ||
        !emergencyContactObject.relationship ||
        !emergencyContactObject.phoneNumber
      ) {
        return res.status(400).send("Invalid emergencyContact JSON.");
      }
    } catch (error) {
      return res.status(400).send("Invalid emergencyContact JSON.");
    }
  }

  // Build the update data object with only provided fields
  const updateData = {
    ...(name && { name }),
    ...(phoneNumber && { phoneNumber }),
    ...(nationality && { nationality }),
    ...(dateOfBirth && { dateOfBirth }),
    ...(addressObject && { address: { update: addressObject } }),
    ...(bankDetailsObject && { bankDetails: { update: bankDetailsObject } }),
    ...(emergencyContactObject && {
      emergencyContact: { update: emergencyContactObject },
    }),
  };

  // Check if no fields are provided to update
  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("No valid fields provided for update.");
  }

  try {
    await prisma.candidate.update({
      where: { nric },
      data: updateData,
    });

    return res.send(`Candidate ${nric} updated successfully.`);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Candidate not found.");
    }
    return res.status(500).send(prismaError);
  }
});

candidateAPIRoutes.get("/candidates", async (req, res) => {
  const user = req.user as User;

  const hasReadCandidateDetailsPermission = await checkPermission(
    user.id,
    Permission.CAN_READ_CANDIDATE_DETAILS,
  );

  if (hasReadCandidateDetailsPermission) {
    const candidatesData = await prisma.candidate.findMany();
    return res.send(candidatesData);
  }

  const candidatesData = await prisma.candidate.findMany({
    select: {
      name: true,
      nric: true,
      phoneNumber: true,
    },
  });

  return res.send(candidatesData);
});

export default candidateAPIRoutes;
