import {
  Box,
  Typography,
  Grid,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  Autocomplete,
  Button,
  Stack,
} from "@mui/joy";
import { EmergencyContact } from "../../types/common";
import { useOnboardingContext } from "../../providers/onboardingContextProvider";
import axios from "axios";

const RELATIONSHIPS = [
  "Mother",
  "Father",
  "Daughter",
  "Son",
  "Sister",
  "Brother",
  "Aunt",
  "Uncle",
  "Niece",
  "Nephew",
  "Cousin (Female)",
  "Cousin (Male)",
  "Grandmother",
  "Grandfather",
  "Granddaughter",
  "Grandson",
  "Stepsister",
  "Stepbrother",
  "Stepmother",
  "Stepfather",
  "Others",
];

const DEFAULT_CONTACT: EmergencyContact = {
  name: "",
  contact: "",
  relationship: "",
};

export default function EmergencyContactStep() {
  const {
    oldCandidate,
    newCandidate,
    handleBack,
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
    relationship: oldRelationship,
  } = oldCandidate.emergencyContact || DEFAULT_CONTACT;

  const {
    name: newName,
    contact: newContact,
    relationship: newRelationship,
  } = newCandidate.emergencyContact || DEFAULT_CONTACT;

  return (
    <Stack
      sx={{
        height: "100%",
        maxWidth: "600px",
      }}
      gap={1}
    >
      <Box>
        <Typography level="body-sm">
          Next up, we need your emergency contact details.
        </Typography>
      </Box>
      <Grid container columns={2} spacing={2}>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              value={newName || ""}
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  emergencyContact: {
                    contact: newContact,
                    relationship: newRelationship,
                    name: e.target.value,
                  },
                })
              }
            />
          </FormControl>
        </Grid>
        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Contact Number</FormLabel>
            <Input
              value={newContact || ""}
              type="number"
              onChange={(e) =>
                setNewCandidate({
                  ...newCandidate,
                  emergencyContact: {
                    contact: e.target.value,
                    relationship: newRelationship,
                    name: newName,
                  },
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
          <FormControl>
            <FormLabel>Relationship</FormLabel>
            <Autocomplete
              value={newRelationship || ""}
              options={RELATIONSHIPS}
              freeSolo
              onInputChange={(_e, value) => {
                setNewCandidate({
                  ...newCandidate,
                  emergencyContact: {
                    contact: newContact,
                    relationship: value || "",
                    name: newName,
                  },
                });
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
            onClick={() => {
              const updateData = {
                emergencyContact: {
                  ...(oldName !== newName && { name: newName }),
                  ...(oldContact !== newContact && { contact: newContact }),
                  ...(oldRelationship !== newRelationship && {
                    relationship: newRelationship,
                  }),
                },
              };

              if (Object.keys(updateData.emergencyContact).length > 0) {
                axios.patch("/api/user", updateData).then(() => {
                  setOldCandidate({
                    ...oldCandidate,
                    emergencyContact: {
                      ...oldCandidate.emergencyContact,
                      ...updateData.emergencyContact,
                    },
                  });
                  handleNext();
                });
                handleNext();
              } else {
                handleNext();
              }
            }}
            sx={{
              width: "80dvw",
              maxWidth: "600px",
            }}
            disabled={!newName || !newContact || !newRelationship}
          >
            Next
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
