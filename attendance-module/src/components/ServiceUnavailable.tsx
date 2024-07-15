import { useEffect } from "react";

import { Stack, Button, Typography } from "@mui/joy";

export default function ServiceUnavailable() {
  useEffect(() => {
    document.title = "503 Service Unavailable - Overview";
  }, []);

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
      <Typography level="h1">503 Service Unavailable</Typography>
      <Typography level="body-lg">
        An unexpected error occurred. Please click the button to try again.
      </Typography>
      <Typography level="body-lg">Sorry for the inconvenience!</Typography>
      <Button
        component="a"
        href="/"
        sx={{
          maxWidth: "20rem",
        }}
      >
        <Typography textColor="white">Reload</Typography>
      </Button>
    </Stack>
  );
}
