import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export default async function checkPermission(
  email: string,
  permissionName: string,
) {
  const permissionData = await prisma.consultant.findUnique({
    where: {
      email: email,
    },
    select: {
      permissions: true,
    },
  });

  if (!permissionData || !permissionData.permissions) {
    return false;
  }

  const permissions = permissionData.permissions as JsonObject;

  if (permissionName in permissions) {
    return permissions[permissionName];
  }

  return false;
}
