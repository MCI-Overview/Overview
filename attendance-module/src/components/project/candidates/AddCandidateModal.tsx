import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";
import toast from "react-hot-toast";

import ResponsiveDialog from "../../ResponsiveDialog";
import { nricRegex, contactRegex } from "../../../utils/validation";
import { useUserContext } from "../../../providers/userContextProvider";
import { readableEnum } from "../../../utils/capitalize";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Option,
  Select,
  Typography,
} from "@mui/joy";
import { SearchRounded as SearchIcon } from "@mui/icons-material";

interface AddCandidateModalProps {
  isAddModalOpen: boolean;
  setAddModalOpen: (isOpen: boolean) => void;
}

const AddCandidateModal = ({
  isAddModalOpen,
  setAddModalOpen,
}: AddCandidateModalProps) => {
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();
  const [isExistingCandidate, setIsExistingCandidate] = useState<
    boolean | null
  >(null);

  const [nric, setNric] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [residency, setResidency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const [nricError, setNricError] = useState("");
  const [nameError, setNameError] = useState("");
  const [contactError, setContactError] = useState("");
  const [dateOfBirthError, setDateOfBirthError] = useState("");
  const [residencyError, setResidencyError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [employmentTypeError, setEmploymentTypeError] = useState("");

  const resetAllFieldsAndErrors = () => {
    setNric("");
    setName("");
    setContact("");
    setDateOfBirth("");
    setResidency("");
    setStartDate("");
    setEndDate("");
    setEmploymentType("");

    setNricError("");
    setNameError("");
    setContactError("");
    setDateOfBirthError("");
    setResidencyError("");
    setStartDateError("");
    setEndDateError("");
    setEmploymentTypeError("");
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setIsExistingCandidate(null);
    resetAllFieldsAndErrors();
  };

  if (!project || !user) return null;

  const {
    cuid: projectCuid,
    startDate: projectStartDate,
    endDate: projectEndDate,
  } = project;

  const handleNRICSearch = async () => {
    try {
      const response = await axios.get(`/api/admin/candidate/bynric/${nric}`);
      const candidate = response.data;

      setNric(candidate.nric);
      setName(candidate.name);
      setContact(candidate.contact);
      setDateOfBirth(dayjs(candidate.dateOfBirth).format("YYYY-MM-DD"));
      setResidency(candidate.residency);
      toast.success("Candidate found");
      setIsExistingCandidate(true);
    } catch (error) {
      setName("");
      setContact("");
      setDateOfBirth("");
      setResidency("");
      toast.error("Candidate not found");
      setIsExistingCandidate(false);
    }
  };

  const handleSubmitData = async () => {
    if (
      !nric ||
      !name ||
      !contact ||
      !dateOfBirth ||
      !residency ||
      !startDate ||
      !endDate ||
      !employmentType
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (
      nricError ||
      nameError ||
      contactError ||
      dateOfBirthError ||
      residencyError ||
      startDateError ||
      endDateError ||
      employmentTypeError
    ) {
      toast.error("Invalid fields ");
      return;
    }

    const candidate = {
      nric,
      name: readableEnum(name.trim()),
      contact,
      dateOfBirth: new Date(dateOfBirth).toISOString(),
      residency,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      employmentType,
    };

    axios
      .post(`/api/admin/project/${projectCuid}/candidates`, [candidate])
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length === 1) {
          toast.error("Candidate is already added to project");
          return;
        }

        toast.success("Candidate added successfully");
        updateProject();
        setAddModalOpen(false);
      })
      .catch((error) => {
        toast.error("Error in adding candidate");
        console.error(error);
      });
  };

  return (
    <ResponsiveDialog
      open={isAddModalOpen}
      handleClose={handleCloseModal}
      title="Add a candidate"
      subtitle="Add a candidate to your project. Select from candidate history, or fill
        in their details."
      actions={<Button onClick={handleSubmitData}>Save</Button>}
    >
      <Grid container spacing={2} py={2}>
        <Grid xs={10} md={6}>
          <FormControl required error={!!nricError}>
            <FormLabel>Nric</FormLabel>
            <Input
              name="nric"
              value={nric}
              onChange={(e) => {
                const value = e.target.value.trim().toUpperCase();
                setNric(value);

                if (!value) {
                  setNricError("NRIC is required");
                } else if (nricRegex.test(value)) {
                  setNricError("");
                } else {
                  setNricError("Invalid NRIC");
                }
              }}
            />
            <FormHelperText>{nricError}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={2} md={6}>
          <FormControl>
            <FormLabel>&nbsp;</FormLabel>
            <Button
              fullWidth
              onClick={handleNRICSearch}
              disabled={!nricRegex.test(nric)}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Search NRIC
            </Button>
            <IconButton
              onClick={handleNRICSearch}
              disabled={!nricRegex.test(nric)}
              sx={{ display: { xs: "block", md: "none" } }}
              variant="solid"
              color="primary"
            >
              <SearchIcon onClick={handleNRICSearch} />
            </IconButton>
          </FormControl>
        </Grid>

        {isExistingCandidate !== null && (
          <>
            <Grid xs={12} md={6}>
              <FormControl required error={!!nameError}>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);

                    if (!e.target.value) {
                      setNameError("Name is required");
                    } else {
                      setNameError("");
                    }
                  }}
                  disabled={isExistingCandidate}
                />
                <FormHelperText>{nameError}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl required error={!!residencyError}>
                <FormLabel>Residency status</FormLabel>
                <Select
                  value={residency}
                  name="residency"
                  onChange={(_e, value) => {
                    if (!value) {
                      setResidency("");
                      setResidencyError("Residency status is required");
                      return;
                    }

                    setResidency(value);
                    setResidencyError("");
                  }}
                  disabled={isExistingCandidate}
                >
                  <Option value={"CITIZEN"}>Citizen</Option>
                  <Option value={"PERMANENT_RESIDENT"}>
                    Permanent Resident
                  </Option>
                  <Option value={"S_PASS"}>S Pass</Option>
                  <Option value={"WORK_PERMIT"}>Work Permit</Option>
                </Select>
                <FormHelperText>{residencyError}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl required error={!!dateOfBirthError}>
                <FormLabel>Date of birth</FormLabel>
                <Input
                  type="date"
                  name="dateOfBirth"
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);

                    if (!dateOfBirth || !Date.parse(dateOfBirth)) {
                      setDateOfBirthError("Invalid date of birth");
                    } else {
                      setDateOfBirthError("");
                    }
                  }}
                  disabled={isExistingCandidate}
                />
                <FormHelperText>{dateOfBirthError}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12} md={6}>
              <FormControl required error={!!contactError}>
                <FormLabel>Contact</FormLabel>
                <Input
                  startDecorator={"+65"}
                  name="contact"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);

                    if (!contactRegex.test(contact)) {
                      setContactError("Invalid contact");
                    } else {
                      setContactError("");
                    }
                  }}
                  disabled={isExistingCandidate}
                />
                <FormHelperText>{contactError}</FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={12}>
              <Typography level="body-xs" sx={{ mt: -2 }}>
                The above details have been pre-filled from existing records. If
                needed, you may update them on their profile page later.
              </Typography>
            </Grid>
          </>
        )}

        <Grid xs={12} md={6}>
          <FormControl required error={!!startDateError}>
            <FormLabel>Start date</FormLabel>
            <Input
              type="date"
              name="startDate"
              value={startDate}
              slotProps={{
                input: {
                  min: (dayjs().isAfter(project.startDate)
                    ? dayjs()
                    : project.startDate
                  ).format("YYYY-MM-DD"),
                  max: project.endDate.format("YYYY-MM-DD"),
                },
              }}
              onChange={(e) => {
                const value = e.target.value;
                setStartDate(value);

                if (!value || !Date.parse(value)) {
                  setStartDateError("Invalid start date");
                } else if (
                  Date.parse(value) < Date.parse(projectStartDate.toString())
                ) {
                  setStartDateError(
                    `Start date cannot be before project start date (${projectStartDate.format(
                      "DD MMM YYYY"
                    )})`
                  );
                } else if (
                  endDate &&
                  Date.parse(endDate) &&
                  Date.parse(value) > Date.parse(endDate)
                ) {
                  setStartDateError("Start date cannot be after end date");
                  setEndDateError("End date cannot be before start date");
                } else {
                  setStartDateError("");
                  setEndDateError("");
                }
              }}
            />
            <FormHelperText>{startDateError}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl required error={!!endDateError}>
            <FormLabel>End date</FormLabel>
            <Input
              type="date"
              name="endDate"
              value={endDate}
              slotProps={{
                input: {
                  min: (dayjs().isAfter(project.startDate)
                    ? dayjs()
                    : project.startDate
                  ).format("YYYY-MM-DD"),
                  max: project.endDate.format("YYYY-MM-DD"),
                },
              }}
              onChange={(e) => {
                const value = e.target.value;
                setEndDate(value);

                if (!value || !Date.parse(value)) {
                  setEndDateError("Invalid end date");
                } else if (
                  Date.parse(value) > Date.parse(projectEndDate.toString())
                ) {
                  setEndDateError(
                    `End date cannot be after project end date (${projectEndDate.format(
                      "DD MMM YYYY"
                    )})`
                  );
                } else if (
                  startDate &&
                  Date.parse(startDate) &&
                  Date.parse(value) < Date.parse(startDate)
                ) {
                  setEndDateError("End date cannot be before start date");
                  setStartDateError("Start date cannot be after end date");
                } else {
                  setStartDateError("");
                  setEndDateError("");
                }
              }}
            />
            <FormHelperText>{endDateError}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid xs={12}>
          <FormControl required error={!!employmentTypeError}>
            <FormLabel>Job type</FormLabel>
            <Select
              value={employmentType}
              name="employmentType"
              onChange={(_e, value) => {
                if (!value) {
                  setEmploymentType("");
                  setEmploymentTypeError("Employment type is required");
                  return;
                }

                setEmploymentType(value);
                setEmploymentTypeError("");
              }}
            >
              <Option value={"FULL_TIME"}>Full time</Option>
              <Option value={"PART_TIME"}>Part time</Option>
              <Option value={"CONTRACT"}>Contract</Option>
            </Select>
            <FormHelperText>{employmentTypeError}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </ResponsiveDialog>
  );
};

export default AddCandidateModal;
