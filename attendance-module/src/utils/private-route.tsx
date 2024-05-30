import { useLocation, Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "../providers/userContextProvider";
import axios from "axios";

export function PrivateUserRoutes() {
  const { user, setUser } = useUserContext();

  if (!user) {
    axios.get("/api").then((response) => {
      setUser(response.data);
    });
  }

  const currentPath = useLocation().pathname;

  if (user === null) return;

  if (!user || (user && !(user.userType == "User"))) {
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

export function PrivateAdminRoutes() {
  const { user, setUser } = useUserContext();

  if (!user) {
    axios.get("/api").then((response) => {
      setUser(response.data);
    });
  }

  const currentPath = useLocation().pathname;

  if (!user) return;

  if (!user || (user && !(user.userType == "Admin"))) {
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
