/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CustomRequest } from "../types";

const RequestContext = createContext<{
  error: boolean;
  requests: CustomRequest[] | null;
  updateRequest: () => void;
}>({
  error: false,
  requests: [],
  updateRequest: () => [],
});

export function RequestContextProvider({
  children,
  updateFunction,
}: {
  children: React.ReactNode;
  updateFunction: () => Promise<CustomRequest[]>;
}) {
  const [requests, setRequests] = useState<CustomRequest[] | null>(null);
  const [error, setError] = useState<boolean>(false);

  const updateRequest = useCallback(() => {
    updateFunction()
      .then((data) => {
        setError(false);
        setRequests(data);
      })
      .catch(() => {
        setError(true);
      });
  }, [updateFunction]);

  useEffect(() => {
    updateRequest();
  }, [updateRequest]);

  return (
    <RequestContext.Provider
      value={{
        error,
        requests,
        updateRequest,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}

export function useRequestContext() {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error(
      "useRequestContext must be used within a RequestContextProvider"
    );
  }
  return context;
}
