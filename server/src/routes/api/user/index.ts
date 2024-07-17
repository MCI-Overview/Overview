import { Router } from "express";
import { prisma, s3, upload } from "../../../client";
import { PrismaError } from "@/types";
import { User } from "@/types/common";
import attendanceAPIRoutes from "./attendance";
import profileAPIRoutes from "./profile";
import requestAPIRoutes from "./request";
import reportAPIRoutes from "./report";
import dayjs from "dayjs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
const userAPIRouter: Router = Router();

userAPIRouter.use("/", attendanceAPIRoutes);
userAPIRouter.use("/", profileAPIRoutes);
userAPIRouter.use("/", requestAPIRoutes);
userAPIRouter.use("/", reportAPIRoutes);

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

userAPIRouter.get("/projects", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const projects = await prisma.project.findMany({
      where: {
        Assign: {
          some: {
            candidateCuid: cuid,
            startDate: {
              lte: new Date(),
            },
            endDate: {
              gte: new Date(),
            },
          },
        },
        status: "ACTIVE",
      },
      include: {
        Client: true,
        Assign: {
          select: {
            candidateCuid: true,
            startDate: true,
            endDate: true,
          },
        },
        Manage: {
          include: {
            Consultant: {
              select: {
                name: true,
                email: true,
                contact: true,
              },
            },
          },
          where: {
            role: "CLIENT_HOLDER",
          },
        },
      },
    });

    return res.send(
      projects.map((project) => {
        const candidateAssign = project.Assign.filter(
          (assign) => assign.candidateCuid === cuid
        )[0];

        return {
          name: project.name,
          cuid: project.cuid,
          startDate: candidateAssign.startDate,
          endDate: candidateAssign.endDate,
          noticePeriodDuration: project.noticePeriodDuration,
          noticePeriodUnit: project.noticePeriodUnit,
          Client: project.Client,
          Manage: project.Manage,
        };
      })
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/claimableShifts", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const roster = await prisma.attendance.findMany({
      where: {
        candidateCuid: cuid,
        NOT: {
          OR: [
            {
              status: null,
            },
            {
              status: "NO_SHOW",
            },
          ],
        },
        shiftDate: {
          gte: dayjs().startOf("day").subtract(1, "month").toDate(),
          lte: dayjs().toDate(),
        },
      },
      include: {
        Shift: {
          include: {
            Project: true,
          },
        },
      },
    });

    return res.send(
      roster.reduce((acc, shift) => {
        const projectCuid = shift.Shift.projectCuid;
        if (!acc[projectCuid]) {
          acc[projectCuid] = {};
          acc[projectCuid]["name"] = shift.Shift.Project.name;
          acc[projectCuid]["shifts"] = [];
        }

        acc[projectCuid]["shifts"].push(shift);

        return acc;
      }, {} as Record<string, any>)
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/upcomingShifts", async (req, res) => {
  const { cuid } = req.user as User;

  try {
    const shifts = await prisma.attendance.findMany({
      where: {
        candidateCuid: cuid,
        leave: null,
        shiftDate: {
          gte: dayjs().startOf("day").toDate(),
          lte: dayjs().endOf("day").add(1, "month").toDate(),
        },
      },
      include: {
        Shift: {
          include: {
            Project: true,
          },
        },
      },
    });

    return res.send(
      shifts.reduce((acc, shift) => {
        const projectCuid = shift.Shift.Project.cuid;
        if (!acc[projectCuid]) {
          acc[projectCuid] = {};
          acc[projectCuid]["name"] = shift.Shift.Project.name;
          acc[projectCuid]["shifts"] = [];
        }

        acc[projectCuid]["shifts"].push(shift);

        return acc;
      }, {} as Record<string, any>)
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.patch(
  "/",
  upload.fields([
    { name: "bankStatement", maxCount: 1 },
    { name: "nricFront", maxCount: 1 },
    { name: "nricBack", maxCount: 1 },
  ]),
  async (req, res) => {
    const user = req.user as User;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const bankStatement = files && files["bankStatement"]?.[0];
    const nricFront = files && files["nricFront"]?.[0];
    const nricBack = files && files["nricBack"]?.[0];

    const {
      name,
      contact,
      residency,
      nationality,
      dateOfBirth,
      bankDetails,
      address,
      emergencyContact,
    } = req.body;

    if (
      !name &&
      !contact &&
      !residency &&
      !nationality &&
      !dateOfBirth &&
      !bankDetails &&
      !address &&
      !emergencyContact &&
      !bankStatement &&
      !nricFront &&
      !nricBack
    ) {
      return res
        .status(400)
        .send(
          "At least one field (name, contact, residency, nationality, dateOfBirth, bankDetails, address, emergencyContact, bankStatement, nricFront, nricBack) is required."
        );
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

    if (bankDetails && !bankStatement) {
      return res.status(400).send("Bank Statement image is required.");
    }

    // Build the update data object with only provided fields
    const updateData = {
      ...(name && { name }),
      ...(contact && { contact }),
      ...(residency && { residency }),
      ...(nationality && { nationality }),
      ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
      ...(address && { address }),
      ...(emergencyContact && { emergencyContact }),
      ...(bankDetails && { bankDetails, hasOnboarded: true }),
    };

    // TODO: Fix transaction timeout issue
    await prisma.$transaction(
      async () => {
        if (Object.keys(updateData).length !== 0) {
          try {
            await prisma.candidate.update({
              where: { cuid: user.cuid },
              data: updateData,
            });
          } catch (error) {
            console.error("Error while updating candidate data:", error);
            return res.status(500).send("Unable to update candidate data.");
          }
        }

        if (bankStatement) {
          try {
            await s3.send(
              new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: `users/${user.cuid}/bank-statement`,
                Body: bankStatement.buffer,
              })
            );
          } catch (error) {
            console.error("Error while uploading Bank Statement file:", error);
            return res.status(500).send("Unable to upload bank statement.");
          }
        }

        if (nricFront) {
          try {
            await s3.send(
              new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: `users/${user.cuid}/nric/front`,
                Body: nricFront.buffer,
              })
            );
          } catch (error) {
            console.error("Error while uploading NRIC (Front) file:", error);
            return res.status(500).send("Unable to upload NRIC (Front).");
          }
        }

        if (nricBack) {
          try {
            await s3.send(
              new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: `users/${user.cuid}/nric/back`,
                Body: nricBack.buffer,
              })
            );
          } catch (error) {
            console.error("Error while uploading NRIC (Back) file:", error);
            return res.status(500).send("Unable to upload NRIC (Back).");
          }
        }

        return res.send("Profile updated successfully.");
      },
      {
        timeout: 15000,
      }
    );

    return;
  }
);

export default userAPIRouter;
