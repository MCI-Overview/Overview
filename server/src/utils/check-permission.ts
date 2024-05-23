import { PrismaClient } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export enum Permission {
  CAN_READ_ALL_PROJECTS = "canReadAllProjects",
  CAN_EDIT_ALL_PROJECTS = "canEditAllProjects",
  CAN_HARD_DELETE_PROJECTS = "canHardDeleteProjects",

  CAN_CREATE_CONSULTANT = "canCreateConsultant",
  CAN_DELETE_CONSULTANT = "canDeleteConsultant",

  CAN_DELETE_CANDIDATES = "canDeleteCandidates",
  CAN_UPDATE_CANDIDATES = "canUpdateCandidates",
  CAN_READ_CANDIDATE_DETAILS = "canReadCandidateDetails",
}

export enum PermissionErrorMessage {
  CANNOT_READ_PROJECT_ERROR_MESSAGE = `Unauthorized. User does not manage the project and does not have permission ${Permission.CAN_READ_ALL_PROJECTS}.`,
  CANNOT_EDIT_PROJECT_ERROR_MESSAGE = `Unauthorized. User does not manage the project and does not have permission ${Permission.CAN_EDIT_ALL_PROJECTS}.`,
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
