import { useLocation, Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "../providers/userContextProvider";
import axios from "axios";
import { useEffect, useState } from "react";

export function PrivateUserRoutes() {
  const { user, setUser } = useUserContext();
  const currentPath = useLocation().pathname;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api");
        setLoading(false);
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        setLoading(false);
        if (currentPath !== "/") {
          return <Navigate to="/" />;
        }
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, setUser, currentPath]);

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
  const { user, setUser } = useUserContext();
  const currentPath = useLocation().pathname;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api");
        setLoading(false);
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        setLoading(false);
        if (currentPath !== "/admin") {
          return <Navigate to="/admin" />;
        }
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user, setUser, currentPath]);

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
