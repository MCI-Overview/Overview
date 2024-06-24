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
  requests: CustomRequest[] | null;
  updateRequest: () => void;
}>({
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

  const updateRequest = useCallback(() => {
    updateFunction().then((data) => {
      setRequests(data);
    });
  }, [updateFunction]);

  useEffect(() => {
    updateRequest();
  }, [updateRequest]);

  return (
    <RequestContext.Provider
      value={{
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
      "useRequestContext must be used within a RequestContextProvider",
    );
  }
  return context;
}
