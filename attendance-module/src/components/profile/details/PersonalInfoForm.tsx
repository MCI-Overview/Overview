import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useState } from "react";
import isEqual from "../../../utils";
import { CandidateDetails } from "../../../types/common";

import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";

type PersonalInfoFormProps = {
  candidateDetails: CandidateDetails | undefined;
  handleSubmit: (
    data: object,
    successCallback: () => void,
    errorCallback: () => void
  ) => void;
  canEdit: boolean;
};

export default function PersonalInfoForm({
  candidateDetails,
  handleSubmit,
  canEdit,
}: PersonalInfoFormProps) {
  const [oldCandidateDetails, setOldCandidateDetails] =
    useState<CandidateDetails>(
      candidateDetails || {
        name: "",
        nric: "",
        nationality: "",
        residency: "",
        contact: "",
        dateOfBirth: "",
        cuid: "",
        createdAt: "",
        hasOnboarded: false,
      }
    );
  const [newCandidateDetails, setNewCandidateDetails] =
    useState<CandidateDetails>(oldCandidateDetails);

  const isSame = isEqual(oldCandidateDetails, newCandidateDetails);

  const isNameValid =
    newCandidateDetails.name && newCandidateDetails.name.length > 0;
  const isDateValid =
    newCandidateDetails.dateOfBirth &&
    dayjs().diff(dayjs(newCandidateDetails.dateOfBirth), "year") >= 13;

  return (
    <Card>
      <Typography level="title-md">Personal details</Typography>

      <Divider />

      <Grid container columns={2} spacing={2}>
        <Grid xs={2} sm={1}>
          <FormControl error={!isNameValid}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={newCandidateDetails.name || ""}
              onChange={(e) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
                  name: e.target.value,
                })
              }
              disabled={!canEdit}
            />
            <FormHelperText>
              {isNameValid ? "" : "Name cannot be empty."}
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl disabled>
            <FormLabel>NRIC</FormLabel>
            <Input
              type="text"
              value={
                newCandidateDetails.nric ||
                "An error occured while loading the NRIC"
              }
              disabled={!canEdit}
            />
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Contact</FormLabel>
            <Input
              type="number"
              value={newCandidateDetails.contact || ""}
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
              disabled={!canEdit}
            />
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl error={!isDateValid}>
            <FormLabel>Date of Birth</FormLabel>
            <Input
              type="date"
              value={
                newCandidateDetails.dateOfBirth.split("T")[0] ||
                dayjs().format("YYYY-MM-DD")
              }
              onChange={(e) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
                  dateOfBirth: e.target.value,
                })
              }
              disabled={!canEdit}
              slotProps={{
                input: {
                  max: dayjs().subtract(13, "years").format("YYYY-MM-DD"),
                },
              }}
            />
            {canEdit && (
              <FormHelperText>
                {isDateValid ? "" : "Must be at least 13 years old."}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Nationality</FormLabel>
            <Autocomplete
              value={newCandidateDetails.nationality || ""}
              options={["Singapore", "Malaysia", "China"]}
              onChange={(_e, value) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
                  nationality: value,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "e" || e.key === "-") {
                  e.preventDefault();
                }
              }}
              disabled={!canEdit}
            />
          </FormControl>
        </Grid>

        <Grid xs={2} sm={1}>
          <FormControl>
            <FormLabel>Residency</FormLabel>
            <Select
              value={newCandidateDetails.residency || ""}
              onChange={(_e, value) =>
                setNewCandidateDetails({
                  ...newCandidateDetails,
                  residency: value ?? "",
                })
              }
              disabled={!canEdit}
            >
              <Option value="CITIZEN">Citizen</Option>
              <Option value="PERMANENT_RESIDENT">Permanent Resident</Option>
              <Option value="S_PASS">S Pass</Option>
              <Option value="WORK_PERMIT">Work Permit</Option>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {canEdit && (
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
      )}
    </Card>
  );
}
