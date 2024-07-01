import { Stack, Button, Typography } from "@mui/joy";

export default function GatewayTimeout() {
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
      <Typography level="h1">504 Gateway Timeout</Typography>
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
