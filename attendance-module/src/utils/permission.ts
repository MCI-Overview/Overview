import { User, PermissionList } from "../types/common";

export function checkPermission(
  user: User,
  permission: PermissionList
): boolean {
  if (user.userType !== "Admin" || !user.permissions) {
    return false;
  }

  if ("isRoot" in user.permissions && user.permissions["isRoot"]) {
    return true;
  }

  return user.permissions[permission] || false;
}
