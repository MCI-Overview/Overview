import { Outlet, Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { User } from "../types";

function AuthRedirect() {
  const [user, setUser] = useState<User | null>(null);
  const currentPath = useLocation().pathname;

  useEffect(() => {
    axios.get("/api").then((response) => {
      setUser(response.data);
    });
  }, []);

  if (user === null) {
    return <div>Loading...</div>;
  }

  if (!user || (user && !user?.isUser)) {
    return <Navigate to="/user" />;
  }

  if (user && currentPath === "/admin") {
    return <Navigate to="/user/home" />;
  }

  return <Outlet />;
}

export default AuthRedirect;
