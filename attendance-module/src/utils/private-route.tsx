import { useLocation, Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "../providers/userContextProvider";
import { useEffect, useState } from "react";

export function PrivateUserRoutes() {
  const { user, updateUser } = useUserContext();
  const [loading, setLoading] = useState(true);
  const currentPath = useLocation().pathname;

  useEffect(() => {
    if (!user) {
      updateUser(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, updateUser, currentPath]);

  if (loading) return null;

  if (!user) {
    if (currentPath === "/") {
      return <Outlet />;
    }

    return <Navigate to="/" />;
  }

  if (user.userType === "Admin") {
    return <Navigate to="/admin/home" />;
  }

  if (user.hasOnboarded && currentPath.startsWith("/user/new")) {
    return <Navigate to="/user/home" />;
  }

  if (!user.hasOnboarded && !currentPath.startsWith("/user/new")) {
    return <Navigate to="/user/new" />;
  }

  if (currentPath === "/") {
    return <Navigate to="/user/home" />;
  }

  return <Outlet />;
}

export function PrivateAdminRoutes() {
  const { user, updateUser } = useUserContext();
  const [loading, setLoading] = useState(true);
  const currentPath = useLocation().pathname;

  useEffect(() => {
    if (!user) {
      updateUser(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, updateUser, currentPath]);

  if (loading) return null;

  if (!user) {
    if (currentPath === "/admin") {
      return <Outlet />;
    }

    return <Navigate to="/admin" />;
  }

  if (user.userType === "User") {
    return <Navigate to="/user/home" />;
  }

  if (user && currentPath === "/admin") {
    return <Navigate to="/admin/home" />;
  }

  return <Outlet />;
}
