import { Typography, Button, Stack, Box } from "@mui/joy";
import { useUserContext } from "../../providers/userContextProvider";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";

export default function UserOnboarded() {
  const { updateUser } = useUserContext();
  const { handleBack } = useOnboardingContext();

  return (
    <>
      <Typography>
        Your registration was successful, welcome to Overview!
      </Typography>
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          background: "white",
          paddingY: "1rem",
          width: "100%",
          left: 0,
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Stack spacing={1}>
          <Button
            onClick={() => {
              handleBack();
            }}
            variant="outlined"
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
          >
            Back
          </Button>
          <Button
            onClick={() => updateUser()}
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
          >
            Let's Go!
          </Button>
        </Stack>
      </Box>
    </>
  );
}
