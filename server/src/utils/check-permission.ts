import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export const PERMISSION_ERROR_TEMPLATE =
  "Unauthorized. User does not have permission ";

export enum Permission {
  CAN_READ_ALL_PROJECTS = "canReadAllProjects",
  CAN_EDIT_ALL_PROJECTS = "canEditAllProjects",
  CAN_HARD_DELETE_PROJECTS = "canHardDeleteProjects",

  CAN_DELETE_CLIENTS = "canDeleteClients",
  CAN_UPDATE_CLIENTS = "canUpdateClients",

  CAN_CREATE_CONSULTANTS = "canCreateConsultants",
  CAN_UPDATE_CONSULTANTS = "canUpdateConsultants",
  CAN_DELETE_CONSULTANTS = "canDeleteConsultants",

  CAN_DELETE_CANDIDATES = "canDeleteCandidates",
  CAN_UPDATE_CANDIDATES = "canUpdateCandidates",
  CAN_READ_CANDIDATE_DETAILS = "canReadCandidateDetails",
}

export async function checkPermission(
  email: string,
  permissionName: Permission,
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

  if ("isRoot" in permissions && permissions["isRoot"]) {
    return true;
  }

  if (permissionName in permissions) {
    return permissions[permissionName];
  }

  return false;
}
