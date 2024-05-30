import { useLocation, Outlet, Navigate } from "react-router-dom";
import { User } from "../types";

export function PrivateUserRoutes({ user }: { user: User }) {
  const currentPath = useLocation().pathname;

  if (user === null) return;

  if (!user || (user && !user.isUser)) {
    if (currentPath === "/user") {
      return <Outlet />;
    }

    return <Navigate to="/user" />;
  }

  if (user && currentPath === "/user") {
    return <Navigate to="/user/home" />;
  }

  return <Outlet />;
}

export function PrivateAdminRoutes({ user }: { user: User }) {
  const currentPath = useLocation().pathname;

  if (!user) return;

  if (!user || (user && !user.isAdmin)) {
    if (currentPath === "/admin") {
      return <Outlet />;
    }

    return <Navigate to="/admin" />;
  }

  if (user && currentPath === "/admin") {
    return <Navigate to="/admin/home" />;
  }

  return <Outlet />;
}
