import { s3 } from "../../../client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { User } from "@prisma/client";
import { Router } from "express";
import { Readable } from "stream";

const profileAPIRouter = Router();

/**
GET /api/user/profile/bankStatement

Retrieve the user's bank statement images.
Currently unused.
*/
profileAPIRouter.get("/bankStatement", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `users/${cuid}/bank-statement`,
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

/**
GET /api/user/profile/nric/front

Retrieve the user's NRIC front image.
Used in candidate profile page.
*/
profileAPIRouter.get("/nric/front", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `users/${cuid}/nric/front`,
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

/**
GET /api/user/profile/nric/back

Retrieve the user's NRIC back image.
Used in candidate profile page.
*/
profileAPIRouter.get("/nric/back", async (req, res) => {
  const user = req.user as User;
  const { cuid } = user;

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `users/${cuid}/nric/back`,
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

export default profileAPIRouter;
