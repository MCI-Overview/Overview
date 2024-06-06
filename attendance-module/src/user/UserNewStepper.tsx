import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Button,
  Stepper,
  Step,
  StepIndicator,
  Divider,
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Input,
  stepClasses,
  stepIndicatorClasses,
} from "@mui/joy";
import ContactsRoundedIcon from "@mui/icons-material/ContactsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WavingHandIcon from "@mui/icons-material/WavingHand";

type ExampleCandidate = {
  nric: string,
  name: string,
  dateOfBirth: string,
  contact: string
};

export default function UserNewStepper() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [userData, setUserData] = useState<ExampleCandidate>({
    nric: "T1234567A",
    name: "Alice Smith",
    dateOfBirth: "1990-01-01",
    contact: "98765432",
  });

  // useEffect(() => {
  //   // retrieve and set user data
  // }, []);

  const handleNext = () => {
    setStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Submit user data to backend
    console.log(userData);
    // Move to next step or show completion message
    handleNext();
  };

  const handleFinish = () => {
    navigate("/user/home");
  };

  const steps = [
    {
      label: "Welcome!",
      icon: <WavingHandIcon />,
      content: (
        <>
          <Typography level="body-sm">
            We’re glad you’re here. Tell us a bit about yourself so we can track
            your attendance accurately. Ready to begin?
          </Typography>
          <Button onClick={handleNext}>Next</Button>
        </>
      ),
    },
    {
      label: "Your Details",
      icon: <ContactsRoundedIcon />,
      content: (
        <>
          <FormControl required>
            <FormLabel>NRIC</FormLabel>
            <Input
              name="nric"
              value={userData.nric}
              onChange={handleDataChange}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Full Name</FormLabel>
            <Input
              name="name"
              value={userData.name}
              onChange={handleDataChange}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              name="dateOfBirth"
              value={userData.dateOfBirth}
              onChange={handleDataChange}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Contact Number</FormLabel>
            <Input
              name="contact"
              value={userData.contact}
              onChange={handleDataChange}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Nationality</FormLabel>
            <Input
              name="nationality"
              onChange={handleDataChange}
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Postal code</FormLabel>
            <Input
              name="address.postalCode"
              onChange={handleDataChange}
            />
          </FormControl>
          <Button onClick={handleBack}>Back</Button>
          <Button onClick={handleSubmit}>Submit</Button>

          <Typography>{JSON.stringify(userData)}</Typography>
        </>
      ),
    },
    {
      label: "Thank You!",
      icon: <CheckCircleRoundedIcon />,
      content: (
        <>
          <Typography>
            Your registration was successful, welcome to Overview!
          </Typography>
          <Button onClick={handleFinish}>Lets go!</Button>
        </>
      ),
    },
  ];

  return (
    <Stack
      spacing={4}
      sx={{
        display: "flex",
        maxWidth: "800px",
        mx: "auto",
        px: { xs: 2, md: 6 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Typography level="title-md">{steps[step].label}</Typography>
      <Typography level="body-sm">
        {step === 0
          ? "Let's get to know you better!"
          : step === 1
            ? "Please provide the following information:"
            : "Your information has been submitted successfully."}
      </Typography>

      <Divider />
      <Stack spacing={2} sx={{ my: 1 }}>
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
          {steps.map((s, index) => (
            <Step
              key={index}
              orientation="vertical"
              active={index === step}
              completed={index < step}
              indicator={
                <StepIndicator
                  variant={index === step ? "solid" : "outlined"}
                  color={index <= step ? "primary" : "neutral"}
                >
                  {s.icon}
                </StepIndicator>
              }
            >
              {index === step && (
                <Typography
                  sx={{
                    textTransform: "uppercase",
                    fontWeight: "lg",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  {s.label}
                </Typography>
              )}
            </Step>
          ))}
        </Stepper>
        <Divider />
        {steps[step].content}
      </Stack>
    </Stack>
  );
}
