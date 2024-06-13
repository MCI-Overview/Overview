import { PrismaClient } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const globalForS3 = globalThis as unknown as { s3: S3Client };

export const prisma = globalForPrisma.prisma || new PrismaClient();
export const s3 = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
if (process.env.NODE_ENV !== "production") globalForS3.s3 = s3;
