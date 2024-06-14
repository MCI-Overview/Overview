import { Router } from "express";
import { prisma } from "../../../client";
import { PrismaError } from "@/types";
import { User } from "@/types/common";
import attendanceAPIRoutes from "./attendance";
import profileAPIRoutes from "./profile";
const userAPIRouter: Router = Router();

userAPIRouter.use("/", attendanceAPIRoutes);
userAPIRouter.use("/", profileAPIRoutes);

userAPIRouter.get("/", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const candidateData = await prisma.candidate.findUniqueOrThrow({
      where: {
        cuid,
      },
    });

    return res.send({ ...req.user, ...candidateData });
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Candidate does not exist.");
    }

    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/:candidateCuid", async (req, res) => {
  const { candidateCuid } = req.params;

  try {
    const candidateData = await prisma.candidate.findUniqueOrThrow({
      where: {
        cuid: candidateCuid,
      },
    });

    return res.send(candidateData);
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Candidate does not exist.");
    }

    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.patch("/", async (req, res) => {
  const user = req.user as User;
  const {
    cuid,
    name,
    nric,
    contact,
    dateOfBirth,
    hasOnboarded,
    nationality,
    bankDetails,
    address,
    emergencyContact,
  } = req.body;

  if (!cuid) {
    return res.status(400).send("cuid is required.");
  }

  if (!user || user.cuid !== cuid) {
    return res.status(401).send("Unauthorized");
  }

  try {
    await prisma.candidate.update({
      where: {
        cuid,
      },
      data: {
        name,
        nric,
        contact,
        dateOfBirth,
        hasOnboarded,
        nationality,
        bankDetails,
        address,
        emergencyContact,
      },
    });

    return res.send("Candidate updated successfully");
  } catch (error) {
    const prismaError = error as PrismaError;
    if (prismaError.code === "P2025") {
      return res.status(404).send("Candidate does not exist.");
    }

    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

export default userAPIRouter;
