import { Stack, Button, Typography } from "@mui/joy";
import { useUserContext } from "../providers/userContextProvider";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const { user } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "404 Not Found - Overview";
  }, []);

  function handleReturnToHome() {
    if (user?.userType === "Admin") {
      return navigate("/admin/home");
    }
    if (user?.userType === "User") {
      return navigate("/user/home");
    }

    return navigate("/");
  }

  return (
    <Stack
      sx={{
        width: "100dvw",
        height: "100dvh",
        textAlign: "center",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
      }}
      spacing={2}
    >
      <Typography level="h1">404 Not Found</Typography>
      <Typography level="body-lg">
        Are you lost? Simply click on the button below to get right back!
      </Typography>
      <Button
        sx={{
          maxWidth: "20rem",
        }}
        onClick={handleReturnToHome}
      >
        Return to home
      </Button>
    </Stack>
  );
}
