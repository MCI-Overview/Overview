/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { User } from "../types/common";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const UserContext = createContext<{
  user: User | null;
  updateUser: (finallyFunction?: () => void) => void;
}>({
  user: null,
  updateUser: () => {},
});

export function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  async function updateUser(finallyFunction?: () => void) {
    await axios
      .get("/api")
      .then((response) => {
        if (response.data.userType === "User") {
          axios.get("/api/user").then((response) => {
            setUser(response.data);
          });
        } else if (response.data.userType === "Admin") {
          axios.get("/api/admin").then((response) => {
            setUser(response.data);
          });
        }
      })
      .catch((error) => {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 401) {
          setUser(null);
          return;
        }

        if (!error.response) navigate("/504");
      })
      .finally(finallyFunction);
  }

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
}
