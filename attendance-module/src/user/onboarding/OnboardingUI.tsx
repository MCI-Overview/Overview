import NRICStep from "./NRICStep";
import AddressStep from "./AddressStep";
import UserOnboarded from "./UserOnboarded";
import BankDetailsStep from "./BankDetailsStep";
import UserDetailsStep from "./UserDetailsStep";
import EmergencyContactStep from "./EmergencyContactStep";
import CameraPermissionStep from "./CameraPermissionStep";
import LocationPermissionStep from "./LocationPermissionStep";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";

import {
  Divider,
  Stack,
  Step,
  Stepper,
  StepIndicator,
  stepIndicatorClasses,
  stepClasses,
  Typography,
} from "@mui/joy";
import {
  AccountBalanceRounded as AccountBalanceIcon,
  BadgeRounded as BadgeIcon,
  CameraAltOutlined as CameraAltIcon,
  CheckCircleRounded as CheckCircleIcon,
  ContactEmergencyRounded as ContactEmergencyIcon,
  HomeRounded as HomeIcon,
  RoomOutlined as RoomIcon,
  WavingHandRounded as WavingHandIcon,
} from "@mui/icons-material";

export default function OnboardingUI() {
  const { currentStepNumber } = useOnboardingContext();

  const steps = [
    {
      label: "Welcome!",
      icon: <WavingHandIcon />,
      component: <UserDetailsStep />,
    },
    {
      label: "NRIC",
      icon: <BadgeIcon />,
      component: <NRICStep />,
    },
    {
      label: "Address",
      icon: <HomeIcon />,
      component: <AddressStep />,
    },
    {
      label: "Emergency Contact",
      icon: <ContactEmergencyIcon />,
      component: <EmergencyContactStep />,
    },
    {
      label: "Bank Details",
      icon: <AccountBalanceIcon />,
      component: <BankDetailsStep />,
    },
    {
      label: "Location Permission",
      icon: <RoomIcon />,
      component: <LocationPermissionStep />,
    },
    {
      label: "Camera Permission",
      icon: <CameraAltIcon />,
      component: <CameraPermissionStep />,
    },
    {
      label: "Complete",
      icon: <CheckCircleIcon />,
      component: <UserOnboarded />,
    },
  ];

  const currentStep = steps[currentStepNumber];

  return (
    <>
      <Stack
        spacing={2}
        sx={{
          display: "flex",
          height: "100%",
          maxWidth: "800px",
          mx: "auto",
          alignItems: "center",
          px: {
            xs: 2,
            sm: 6,
          },
          py: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        <Typography level="h2" textAlign="center">
          {currentStep.label}
        </Typography>
        <Stepper
          size="lg"
          sx={{
            width: "100%",
            "--StepIndicator-size": "3rem",
            "--Step-connectorInset": "0px",
            [`& .${stepIndicatorClasses.root}`]: {
              borderWidth: 4,
            },
            [`& .${stepClasses.root}::after`]: {
              height: 4,
            },
            [`& .${stepClasses.completed}`]: {
              [`& .${stepIndicatorClasses.root}`]: {
                borderColor: "primary.300",
                color: "primary.300",
              },
              "&::after": {
                bgcolor: "primary.300",
              },
            },
            [`& .${stepClasses.active}`]: {
              [`& .${stepIndicatorClasses.root}`]: {
                borderColor: "currentColor",
              },
            },
            [`& .${stepClasses.disabled} *`]: {
              color: "neutral.outlinedDisabledColor",
            },
          }}
        >
          {steps
            .map((s, index) => (
              <Step
                key={index}
                orientation="vertical"
                active={index === currentStepNumber}
                completed={index < currentStepNumber}
                indicator={
                  <StepIndicator
                    variant={index === currentStepNumber ? "solid" : "outlined"}
                    color={index <= currentStepNumber ? "primary" : "neutral"}
                  >
                    {s.icon}
                  </StepIndicator>
                }
              ></Step>
            ))
            .filter(
              (_s, index) =>
                !(
                  index < currentStepNumber - 1 || index > currentStepNumber + 1
                ) ||
                (currentStepNumber === 0 && index === 2) ||
                (currentStepNumber === steps.length - 1 &&
                  index === steps.length - 3)
            )}
        </Stepper>
        <Divider />
        {currentStep.component}
      </Stack>
    </>
  );
}
