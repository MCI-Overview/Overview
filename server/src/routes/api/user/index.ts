import { Router } from "express";
import { prisma } from "../../../client";
import { PrismaError } from "@/types";
import { User } from "@/types/common";
import attendanceAPIRoutes from "./attendance";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import multer from "multer";
import { Readable } from "stream";

const userAPIRouter: Router = Router();

userAPIRouter.use("/", attendanceAPIRoutes);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

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

userAPIRouter.get("/bankStatement", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const s3 = new S3Client({
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${cuid}-bankStatement`,
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

userAPIRouter.post("/details", async (req, res) => {
  const { nationality, address } = req.body;
  const { cuid } = req.user as User;

  try {
    await prisma.candidate.update({
      where: {
        cuid,
      },
      data: {
        nationality: nationality,
        address: address,
      },
    });

    return res.status(200).send("User data updated successfully");
  } catch (error) {
    console.error("Error while updating user data:", error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.post(
  "/nric",
  upload.fields([
    { name: "nricFront", maxCount: 1 },
    { name: "nricBack", maxCount: 1 },
  ]),
  async (req, res) => {
    const { cuid } = req.user as User;

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files) {
      return res.status(400).send("NRIC images are required.");
    }

    const nricFront = files["nricFront"]?.[0];
    const nricBack = files["nricBack"]?.[0];

    if (!nricFront) {
      return res.status(400).send("Front of NRIC is required.");
    }

    if (!nricBack) {
      return res.status(400).send("Back of NRIC is required.");
    }

    try {
      const s3 = new S3Client({
        region: "ap-southeast-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });

      await Promise.all([
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${cuid}-nricFront`,
            Body: nricFront.buffer,
          }),
        ),
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${cuid}-nricBack`,
            Body: nricBack.buffer,
          }),
        ),
      ]);

      return res.send("NRIC images uploaded successfully");
    } catch (error) {
      console.error("Error while uploading file:", error);
      return res.status(500).send("Internal server error");
    }
  },
);

userAPIRouter.post(
  "/bankDetails",
  upload.single("bankStatement"),
  async (req, res) => {
    const { cuid } = req.user as User;
    const { bankName, bankHolderName, bankNumber } = req.body;
    const bankStatement = req.file;
    if (!bankStatement) {
      return res.status(400).send("Bank Statement is required.");
    }

    try {
      const s3 = new S3Client({
        region: "ap-southeast-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });

      await Promise.all([
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${cuid}-bankStatement`,
            Body: bankStatement.buffer,
          }),
        ),
        prisma.candidate.update({
          where: {
            cuid,
          },
          data: {
            bankDetails: {
              bankHolderName,
              bankName,
              bankNumber,
            },
            hasOnboarded: true,
          },
        }),
      ]);

      return res.send("Bank details uploaded successfully");
    } catch (error) {
      console.error("Error while uploading file:", error);
      return res.status(500).send("Internal server error");
    }
  },
);

userAPIRouter.post("/emergencyContact", async (req, res) => {
  const { cuid } = req.user as User;
  const { name, relationship, contact } = req.body;

  console.log("req.body", req.body);

  try {
    await prisma.candidate.update({
      where: {
        cuid,
      },
      data: {
        emergencyContact: {
          name,
          relationship,
          contact,
        },
      },
    });
    return res.send("Emergency contact information updated successfully");
  } catch (error) {
    console.error("Error while updating emergency contact information:", error);
    return res.status(500).send("Internal server error");
  }
});

userAPIRouter.get("/nric/front", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const s3 = new S3Client({
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${cuid}-nricFront`,
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
});

userAPIRouter.get("/nric/back", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const s3 = new S3Client({
      region: "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${cuid}-nricBack`,
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
