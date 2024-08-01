import axios from "axios";
import dayjs from "dayjs";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";
import { allCountries } from "../../utils/countries";

import {
  Box,
  Button,
  Autocomplete,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Stack,
  Typography,
  Select,
  Option,
} from "@mui/joy";

export default function UserDetailsStep() {
  const {
    oldCandidate,
    newCandidate,
    handleNext,
    setOldCandidate,
    setNewCandidate,
  } = useOnboardingContext();

  if (!oldCandidate || !newCandidate) {
    return null;
  }

  const {
    name: oldName,
    contact: oldContact,
    dateOfBirth: oldDateOfBirth,
    nationality: oldNationality,
    residency: oldResidency,
    nric: oldNric,
  } = oldCandidate;
  const {
    name: newName,
    contact: newContact,
    dateOfBirth: newDateOfBirth,
    nationality: newNationality,
    residency: newResidency,
    nric: newNric,
  } = newCandidate;

  const isNameValid = newName.length > 0;
  const isDateValid = dayjs().diff(dayjs(newDateOfBirth), "year") >= 13;

  return (
    <Stack
      sx={{
        height: "100%",
        maxWidth: "600px",
      }}
      gap={1}
    >
      <Typography level="body-sm">
        We’re glad you’re here. We just need a few details to get started.
      </Typography>

      <Grid
        container
        columns={2}
        spacing={2}
        sx={{
          marginBottom: "10rem",
        }}
      >
        <Grid xs={2} sm={1}>
          <FormControl disabled>
            <FormLabel>NRIC</FormLabel>
            <Input type="text" value={newNric || "Error loading NRIC"} />
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl error={!isNameValid}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={newName || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  name: e.target.value,
                })
              }
            />
            <FormHelperText>
              {isNameValid ? "" : "Name cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Contact</FormLabel>
            <Input
              type="number"
              value={newContact || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  contact: e.target.value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl error={!isDateValid}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={
                newDateOfBirth.split("T")[0] || dayjs().format("YYYY-MM-DD")
              }
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  dateOfBirth: e.target.value,
                })
              }
              slotProps={{
                input: {
                  max: dayjs().subtract(13, "years").format("YYYY-MM-DD"),
                },
              }}
            />
            <FormHelperText>
              {isDateValid ? "" : "Must be at least 13 years old."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Residency</FormLabel>
            <Select
              value={newResidency || ""}
              onChange={(_e, value) => {
                if (!value) return;

                setNewCandidate({
                  ...newCandidate,
                  residency: value,
                });
              }}
            >
              <Option value={"CITIZEN"}>Citizen</Option>
              <Option value={"PERMANENT_RESIDENT"}>Permanent Resident</Option>
              <Option value={"S_PASS"}>S Pass</Option>
              <Option value={"WORK_PERMIT"}>Work Permit</Option>
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Nationality</FormLabel>
            <Autocomplete
              value={newNationality || ""}
              options={allCountries}
              onChange={(_e, value) =>
                setNewCandidate({
                  ...newCandidate,
                  nationality: value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
            />
          </FormControl>
        </Grid>
      </Grid>

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
        <Button
          onClick={() => {
            const updateData = {
              ...(oldName !== newName && { name: newName }),
              ...(oldContact !== newContact && { contact: newContact }),
              ...(oldNric !== newNric && { nric: newNric }),
              ...(oldDateOfBirth !== newDateOfBirth && {
                dateOfBirth: newDateOfBirth,
              }),
              ...(oldResidency !== newResidency && { residency: newResidency }),
              ...(oldNationality !== newNationality && {
                nationality: newNationality,
              }),
            };

            if (Object.keys(updateData).length > 0) {
              axios
                .patch("/api/user", {
                  name: oldName,
                  contact: oldContact,
                  dateOfBirth: oldDateOfBirth,
                  residency: oldResidency,
                  nationality: oldNationality,
                  nric: oldNric,
                  ...updateData,
                })
                .then(() => {
                  setOldCandidate({
                    ...oldCandidate,
                    ...updateData,
                  });
                  handleNext();
                });
            } else {
              handleNext();
            }
          }}
          sx={{
            width: "80dvw",
            maxWidth: "600px",
          }}
          disabled={
            !isNameValid || !isDateValid || !newContact || !newNationality
          }
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
}
