import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaError, User } from "@/types";
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
      nationality: candidateData.nationality,
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
      nationality: true,
      phoneNumber: true,
    },
  });

  return res.send(candidatesData);
});

candidateAPIRoutes.post("/candidate/create", async (req, res) => {
  // Required fields
  const nric = req.body.nric;
  const name = req.body.name;
  const block = req.body.block;
  const building = req.body.building;
  const floor = req.body.floor;
  const unit = req.body.unit;
  const street = req.body.street;
  const postal = req.body.postal;
  const country = req.body.country;
  const nationality = req.body.nationality;
  const phoneNumber = req.body.phoneNumber;

  // Optional fields
  const bankHolderName = req.body.bankHolderName;
  const bankName = req.body.bankName;
  const bankNumber = req.body.bankNumber;
  const dateOfBirth = req.body.dateOfBirth;

  if (
    !nric ||
    !name ||
    !block ||
    !building ||
    !floor ||
    !unit ||
    !street ||
    !postal ||
    !country ||
    !nationality ||
    !phoneNumber
  ) {
    return res
      .status(400)
      .send(
        "nric, name, block, building, floor, unit, street, postal, country, nationality, and phoneNumber are required.",
      );
  }

  try {
    await prisma.candidate.create({
      data: {
        nric: nric,
        name: name,
        nationality: nationality,
        phoneNumber: phoneNumber,
        block: block,
        building: building,
        floor: floor,
        unit: unit,
        street: street,
        postal: postal,
        country: country,
        bankHolderName: bankHolderName,
        bankName: bankName,
        bankNumber: bankNumber,
        dateOfBirth: dateOfBirth,
      },
    });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2002") {
      const prismaErrorMetaTarget = prismaError.meta.target || [];

      if (prismaErrorMetaTarget.includes("nric")) {
        return res.status(400).send("Candidate already exists. (Duplicate ID)");
      }

      if (prismaErrorMetaTarget.includes("phoneNumber")) {
        return res.status(400).send("Duplicate contact number specified.");
      }
    }

    return res.status(500).send("Internal server error.");
  }

  return res.send("Candidate created successfully.");
});

candidateAPIRoutes.post("candidate/delete", async (req, res) => {
  const user = req.user as User;

  const nric = req.body.nric;

  if (!nric) {
    return res.status(400).send("nric is required.");
  }

  if (!checkPermission(user.id, "canDeleteCandidate")) {
    return res.status(401).send("Unauthorized");
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
    return res.status(500).send("Internal server error.");
  }

  return res.send("Consultant deleted successfully.");
});

export default candidateAPIRoutes;
