import { Box } from "@mui/joy";
import { OnboardingContextProvider } from "../../providers/onboardingContextProvider";
import OnboardingUI from "./OnboardingUI";

export default function OnboardingPage() {
  return (
    <Box sx={{ flex: 1, width: "100%", height: "100%" }}>
      <OnboardingContextProvider>
        <OnboardingUI />
      </OnboardingContextProvider>
    </Box>
  );
}
