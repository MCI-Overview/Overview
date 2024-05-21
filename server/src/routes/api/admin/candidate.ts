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
import checkPermission from "../../../utils/check-permission";

const prisma = new PrismaClient();

const candidateAPIRoutes: Router = Router();

candidateAPIRoutes.get("/candidate/:candidateId"),
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const candidateId = req.params.candidateId;

    const candidateData = await prisma.candidate.findUnique({
      where: {
        nric: candidateId,
      },
    });

    const hasReadCandidateDetailsPermission = await checkPermission(
      user.id,
      "canReadCandidateDetails",
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
    });
  };

candidateAPIRoutes.get("/candidates", async (req, res) => {
  const user = req.user as User;

  const hasReadCandidateDetailsPermission = await checkPermission(
    user.id,
    "canReadCandidateDetails",
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

candidateAPIRoutes.post("/candidate/create", async (req, res) => {
  // Required fields
  const nric = req.body.nric;
  const name = req.body.name;
  const phoneNumber = req.body.phoneNumber;

  // Optional fields
  const nationality = req.body.nationality;
  const dateOfBirth = req.body.dateOfBirth;
  const bankDetails = req.body.bankDetails;
  const address = req.body.address;
  const emergencyContact = req.body.emergencyContact;

  // Checking for required fields
  if (!nric || !name || !phoneNumber) {
    return res
      .status(400)
      .send("nric, name, and phoneNumber parameter are required.");
  }

  // Validation for dateOfBirth
  if (dateOfBirth && !Date.parse(dateOfBirth)) {
    return res.status(400).send("Invalid dateOfBirth parameter.");
  }

  // Validation for bankDetails
  if (bankDetails) {
    try {
      const bankDetailsObject: BankDetails = JSON.parse(bankDetails);
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
  if (address) {
    try {
      const addressObject: Address = JSON.parse(address);
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
  if (emergencyContact) {
    try {
      const emergencyContactObject: EmergencyContact =
        JSON.parse(emergencyContact);
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

  try {
    await prisma.candidate.create({
      data: {
        nric: nric,
        name: name,
        phoneNumber: phoneNumber,
        dateOfBirth: dateOfBirth,
        nationality: nationality || undefined,
        address: address
          ? {
              create: JSON.parse(address),
            }
          : undefined,
        bankDetails: bankDetails
          ? {
              create: JSON.parse(bankDetails),
            }
          : undefined,
        emergencyContact: emergencyContact
          ? {
              create: JSON.parse(emergencyContact),
            }
          : undefined,
        hasOnboarded: hasOnboarded,
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

candidateAPIRoutes.post("candidate/delete", async (req, res) => {
  const user = req.user as User;

  const nric = req.body.nric;

  if (!nric) {
    return res.status(400).send("nric parameter is required.");
  }

  if (!checkPermission(user.id, "canDeleteCandidates")) {
    return res
      .status(401)
      .send(
        'Unauthorized. User does not have permission "canDeleteCandidates".',
      );
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

export default candidateAPIRoutes;
