import { useState, useEffect, ChangeEvent } from "react";
import {
  Button,
  Stepper,
  Step,
  StepIndicator,
  stepIndicatorClasses,
  stepClasses,
  Divider,
  Stack,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Autocomplete,
  Grid,
  Checkbox,
} from "@mui/joy";
import ContactsRoundedIcon from "@mui/icons-material/ContactsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import { useUserContext } from "../providers/userContextProvider";
import { CandidateUser, User } from "../types/common";
import axios from "axios";

export default function UserNewStepper() {
  const userData = useUserContext().user as CandidateUser | null;

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    postalCode: "",
    addressDetails: {
      block: "",
      street: "",
      building: "",
    },
    isPostalCodeValid: true,
    isLandedProperty: false,
    nationality: "",
    floor: "",
    unit: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const { setUser } = useUserContext();

  useEffect(() => {
    const {
      postalCode,
      isPostalCodeValid,
      isLandedProperty,
      floor,
      unit,
      nationality,
    } = formData;
    const isValid =
      nationality !== "" &&
      postalCode.length === 6 &&
      isPostalCodeValid &&
      (isLandedProperty || (floor !== "" && unit !== ""));
    setIsFormValid(isValid);
  }, [formData]);

  if (!userData) return null;

  const handleNext = () =>
    setStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  const handleBack = () => setStep((prevStep) => Math.max(prevStep - 1, 0));

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePostalCodeChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const code = event.target.value;
    setFormData((prevData) => ({
      ...prevData,
      postalCode: code,
      isPostalCodeValid: false,
      addressDetails: {
        block: "",
        street: "",
        building: "",
      },
    }));

    if (code.length === 6) {
      try {
        const response = await fetch(
          `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${code}&returnGeom=N&getAddrDetails=Y`,
        );
        const data = await response.json();
        if (data.found > 0) {
          const { BLK_NO, ROAD_NAME, BUILDING } = data.results[0];
          setFormData((prevData) => ({
            ...prevData,
            isPostalCodeValid: true,
            addressDetails: {
              block: BLK_NO,
              street: ROAD_NAME,
              building: BUILDING,
            },
          }));
        }
      } catch (error) {
        console.error("Error fetching address details:", error);
      }
    }
  };

  const handleSubmit = () => handleNext();

  const handleFinish = async () => {
    const { nationality, addressDetails, postalCode, floor, unit } = formData;
    try {
      const response = await axios.post(`/api/user/${userData.cuid}/newuser`, {
        nationality: nationality,
        address: {
          unit: unit,
          floor: floor,
          building: addressDetails.building,
          block: addressDetails.block,
          street: addressDetails.street,
          postal: postalCode,
          country: "SINGAPORE",
        },
      });
      setUser(response.data as User);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const nationalities = ["Singapore", "Malaysia", "China"];

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
          <Typography level="title-lg">Personal particulars</Typography>
          <Divider />
          <FormControl required>
            <FormLabel>NRIC</FormLabel>
            <Input name="nric" value={userData.nric} disabled />
          </FormControl>
          <FormControl required>
            <FormLabel>Full Name</FormLabel>
            <Input name="name" value={userData.name} disabled />
          </FormControl>
          <FormControl required>
            <FormLabel>Date of Birth</FormLabel>
            <Input type="date" name="dateOfBirth" disabled />
          </FormControl>
          <FormControl required>
            <FormLabel>Contact Number</FormLabel>
            <Input name="contact" value={userData.contact} disabled />
          </FormControl>
          <FormControl required>
            <FormLabel>Nationality</FormLabel>
            <Autocomplete
              name="nationality"
              options={nationalities}
              value={
                formData.nationality
                  ? nationalities.find(
                      (option) => option === formData.nationality,
                    )
                  : null
              }
              onChange={(_event, newValue) =>
                setFormData({ ...formData, nationality: newValue as string })
              }
              isOptionEqualToValue={(option, value) => option === value}
            />
          </FormControl>

          <Typography level="title-lg">Address</Typography>
          <Divider />

          <Checkbox
            label="Landed property"
            checked={formData.isLandedProperty}
            onChange={(e) =>
              setFormData({ ...formData, isLandedProperty: e.target.checked })
            }
          />

          {!formData.isLandedProperty && (
            <Grid container columnSpacing={2}>
              <Grid xs={6} style={{ paddingLeft: 0 }}>
                <FormControl required>
                  <FormLabel>Floor</FormLabel>
                  <Input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
              <Grid xs={6} style={{ paddingRight: 0 }}>
                <FormControl required>
                  <FormLabel>Unit no.</FormLabel>
                  <Input
                    type="number"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
            </Grid>
          )}

          <FormControl required>
            <FormLabel>Postal code</FormLabel>
            <Input
              name="postalCode"
              type="number"
              value={formData.postalCode}
              onChange={handlePostalCodeChange}
            />
            {!formData.isPostalCodeValid && (
              <Typography color="danger">Postal code is invalid</Typography>
            )}
          </FormControl>

          {formData.postalCode.length === 6 && formData.isPostalCodeValid && (
            <>
              <FormControl required>
                <FormLabel>Block</FormLabel>
                <Input
                  type="text"
                  name="block"
                  value={formData.addressDetails.block}
                  disabled
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Street</FormLabel>
                <Input
                  type="text"
                  name="street"
                  value={formData.addressDetails.street}
                  disabled
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Building</FormLabel>
                <Input
                  type="text"
                  name="building"
                  value={formData.addressDetails.building}
                  disabled
                />
              </FormControl>
            </>
          )}

          <Button variant="outlined" onClick={handleBack}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            Submit
          </Button>
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
