/* eslint-disable react-refresh/only-export-components */
import axios, { AxiosError } from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { CommonConsultant } from "../types/common";
import { useUserContext } from "./userContextProvider";

const ConsultantsContext = createContext<{
  consultants: CommonConsultant[] | null;
  updateConsultants: (finallyFunction?: () => void) => void;
}>({
  consultants: null,
  updateConsultants: () => {},
});

// TODO: Add cache and revalidate
export function ConsultantsContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserContext();
  const [consultants, setConsultants] = useState<CommonConsultant[] | null>(
    null
  );

  const updateConsultants = useCallback(
    async (finallyFunction?: () => void) => {
      if (user?.userType === "User") return;

      await axios
        .get("/api/admin/consultants")
        .then((response) => {
          setConsultants(response.data);
        })
        .catch((error) => {
          const axiosError = error as AxiosError;

          console.error("Error while fetching consultant list", axiosError);
        })
        .finally(finallyFunction);
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      updateConsultants();
    }
  }, [updateConsultants, user]);

  return (
    <ConsultantsContext.Provider value={{ consultants, updateConsultants }}>
      {children}
    </ConsultantsContext.Provider>
  );
}

export function useConsultantsContext() {
  const context = useContext(ConsultantsContext);
  if (context === undefined) {
    throw new Error(
      "useConsultantsContext must be used within a ConsultantsContextProvider"
    );
  }
  return context;
}
