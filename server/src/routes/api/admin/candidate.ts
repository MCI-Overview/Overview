import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError } from "@/types";
import { Address, BankDetails, EmergencyContact, User } from "@/types/common";
import bcrypt from "bcrypt";
import { maskNRIC } from "../../../utils";
import {
  PERMISSION_ERROR_TEMPLATE,
  checkPermission,
  PermissionList,
} from "../../../utils/permissions";

const prisma = new PrismaClient();

const candidateAPIRoutes: Router = Router();

candidateAPIRoutes.get("/candidate/:cuid"),
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const { cuid } = req.params;

    try {
      const { name, nric, contact, emergencyContact, ...otherData } =
        await prisma.candidate.findUniqueOrThrow({
          where: {
            cuid,
          },
        });

      const hasReadCandidateDetailsPermission = await checkPermission(
        user.cuid,
        PermissionList.CAN_READ_CANDIDATE_DETAILS,
      );

      if (hasReadCandidateDetailsPermission) {
        return res.send({
          name,
          nric,
          contact,
          emergencyContact,
          ...otherData,
        });
      }

      return res.send({
        name,
        nric: maskNRIC(nric),
        contact,
        emergencyContact,
      });
    } catch (error) {
      return res.status(404).send("Candidate not found.");
    }
  };

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
    PermissionList.CAN_DELETE_CANDIDATES,
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
        "At least one field (name, contact, nationality, dateOfBirth, bankDetails, address, emergencyContact) is required.",
      );
  }

  const hasUpdateCandidatePermission = await checkPermission(
    user.cuid,
    PermissionList.CAN_UPDATE_CANDIDATES,
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
        !emergencyContactObject.contact
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
    ...(contact && { contact: contact }),
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

export default candidateAPIRoutes;
