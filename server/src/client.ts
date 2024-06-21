import { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import multer, { Multer } from "multer";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const globalForS3 = globalThis as unknown as { s3: S3Client };
const globalForUploadMulter = globalThis as unknown as { upload: Multer };

export const prisma = globalForPrisma.prisma || new PrismaClient();
export const s3 = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});
export const upload =
  globalForUploadMulter.upload ||
  multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 2 * 1024 * 1024,
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;
if (process.env.NODE_ENV !== "production")
  globalForUploadMulter.upload = upload;
