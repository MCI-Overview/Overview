import { s3, prisma, upload } from "../../../client";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { User } from "@prisma/client";
import { Router } from "express";
import { Readable } from "stream";

const profileAPIRouter = Router();

profileAPIRouter.get("/bankStatement", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${cuid}/bank-statement`,
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

profileAPIRouter.get("/nric/front", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${cuid}/nric/front`,
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

profileAPIRouter.get("/nric/back", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `${cuid}/nric/back`,
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

profileAPIRouter.post("/details", async (req, res) => {
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

profileAPIRouter.post(
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
      await Promise.all([
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${cuid}/nric/front`,
            Body: nricFront.buffer,
          })
        ),
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${cuid}/nric/back`,
            Body: nricBack.buffer,
          })
        ),
      ]);

      return res.send("NRIC images uploaded successfully");
    } catch (error) {
      console.error("Error while uploading file:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

profileAPIRouter.post(
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
      await Promise.all([
        s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `${cuid}/bank-statement`,
            Body: bankStatement.buffer,
          })
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
  }
);

profileAPIRouter.post("/emergencyContact", async (req, res) => {
  const { cuid } = req.user as User;
  const { name, relationship, contact } = req.body;

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

export default profileAPIRouter;
