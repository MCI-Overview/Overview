import {
  Card,
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  Input,
  CardOverflow,
  CardActions,
  Button,
  FormHelperText,
} from "@mui/joy";
import { CandidateDetails } from "../../../types/common";
import { useState } from "react";
import isEqual from "../../../utils";
import toast from "react-hot-toast";
import dayjs from "dayjs";

type PersonalInfoProps = {
  candidateDetails: CandidateDetails | undefined;
  handleSubmit: (
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) => void;
};

export default function PersonalInfo({
  candidateDetails,
  handleSubmit,
}: PersonalInfoProps) {
  const [oldCandidateDetails, setOldCandidateDetails] =
    useState<CandidateDetails>({
      ...candidateDetails,
      dateOfBirth: candidateDetails?.dateOfBirth.split("T")[0],
    } as CandidateDetails) || {
      name: "",
      nric: "",
      contact: "",
      dateOfBirth: "",
      cuid: "",
      createdAt: "",
      hasOnboarded: false,
    };
  const [newCandidateDetails, setNewCandidateDetails] =
    useState<CandidateDetails>(oldCandidateDetails);

  const isSame = isEqual(oldCandidateDetails, newCandidateDetails);

  const isNameValid = newCandidateDetails.name.length > 0;
  const isDateValid =
    dayjs().diff(dayjs(newCandidateDetails.dateOfBirth), "year") >= 13;

  return (
    <Card>
      <Box sx={{ mb: 1 }}>
        <Typography level="title-md">Personal details</Typography>
        <Typography level="body-sm">
          Update your personal details here.
        </Typography>
      </Box>
      <Divider />
      <Grid container columns={2} spacing={2}>
        <Grid xs={1}>
          <FormControl error={!isNameValid}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={newCandidateDetails.name}
              onChange={(e) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
                  name: e.target.value,
                })
              }
            />
            <FormHelperText>
              {isNameValid ? "" : "Name cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl disabled>
            <FormLabel>NRIC</FormLabel>
            <Input type="text" value={newCandidateDetails.nric} />
          </FormControl>
        </Grid>
        <Grid xs={1}>
          <FormControl>
            <FormLabel>Contact</FormLabel>
            <Input
              type="number"
              value={newCandidateDetails.contact}
              onChange={(e) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
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
        <Grid xs={1}>
          <FormControl error={!isDateValid}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={newCandidateDetails.dateOfBirth.split("T")[0]}
              onChange={(e) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
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
      </Grid>
      <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => setNewCandidateDetails(oldCandidateDetails)}
            disabled={isSame}
          >
            Reset
          </Button>
          <Button
            size="sm"
            variant="solid"
            onClick={() =>
              handleSubmit(
                { ...newCandidateDetails },
                () => {
                  setOldCandidateDetails(newCandidateDetails);
                  toast.success("Details updated successfully.");
                },
                () => {
                  toast.error("Failed to update details.");
                }
              )
            }
            disabled={isSame || !isNameValid || !isDateValid}
          >
            Save
          </Button>
        </CardActions>
      </CardOverflow>
    </Card>
  );
}
