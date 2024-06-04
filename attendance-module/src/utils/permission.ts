import { User, PermissionList } from "../types/common";

export function checkPermission(
  user: User,
  permission: PermissionList,
): boolean {
  if (user.userType !== "admin") {
    return false;
  }

  return (
    user.permissions.includes(permission) || user.permissions.includes("isRoot")
  );
}
