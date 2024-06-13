import { useState } from "react";
import { useUserContext } from "../providers/userContextProvider";

export default function LoadUser({
  setLoadingFalse,
}: {
  setLoadingFalse: () => void;
}) {
  const { updateUser } = useUserContext();
  const [loadOnce, setLoadOnce] = useState(false);

  if (loadOnce) {
    return null;
  }

  updateUser(setLoadingFalse);
  setLoadOnce(true);

  return null;
}
