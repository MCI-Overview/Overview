import axios from "axios";
import dayjs from "dayjs";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { nricRegex, contactRegex } from "../../../utils/validation";

import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
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
  const [showFields, setShowFields] = useState(false);
  const [cdd, setCdd] = useState({
    nric: "",
    name: "",
    contact: "",
    dateOfBirth: "",
    startDate: "",
    endDate: "",
    employmentType: "",
  });

  const [errors, setErrors] = useState({
    nric: "",
    name: "",
    contact: "",
    dateOfBirth: "",
    startDate: "",
    endDate: "",
    employmentType: "",
  });

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setShowFields(false);
    setCdd({
      nric: "",
      name: "",
      contact: "",
      dateOfBirth: "",
      startDate: "",
      endDate: "",
      employmentType: "",
    });
    setErrors({
      nric: "",
      name: "",
      contact: "",
      dateOfBirth: "",
      startDate: "",
      endDate: "",
      employmentType: "",
    });
  };

  if (!project || !user) return null;

  const projectCuid = project.cuid;

  const handleNRICSearch = async () => {
    try {
      const response = await axios.get(`/api/admin/candidate/nric/${cdd.nric}`);
      const candidate = response.data;
      setCdd({
        ...cdd,
        nric: candidate.nric,
        name: candidate.name,
        contact: candidate.contact,
        dateOfBirth: dayjs(candidate.dateOfBirth).format("YYYY-MM-DD"),
      });
    } catch (error) {
      toast.error("Candidate not found");
      console.error(error);
    } finally {
      setShowFields(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCdd((prevCdd) => ({
      ...prevCdd,
      [name]: value,
    }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setCdd((prevCdd) => ({
      ...prevCdd,
      contact: value,
    }));
  };

  const handleSelectChange = (
    _event: React.SyntheticEvent | null,
    value: string | null
  ) => {
    setCdd((prevCdd) => ({
      ...prevCdd,
      employmentType: value || "",
    }));
  };

  const validateInput = () => {
    const newErrors = {
      nric: "",
      name: "",
      contact: "",
      dateOfBirth: "",
      startDate: "",
      endDate: "",
      employmentType: "",
    };

    if (!nricRegex.test(cdd.nric)) {
      newErrors.nric = "Invalid NRIC";
    }
    if (cdd.name.trim() === "") {
      newErrors.name = "Name is required";
    }
    if (!contactRegex.test(cdd.contact)) {
      newErrors.contact = "Invalid contact";
    }
    if (!cdd.dateOfBirth || !Date.parse(cdd.dateOfBirth)) {
      newErrors.dateOfBirth = "Invalid date of birth";
    }
    if (!cdd.startDate || !Date.parse(cdd.startDate)) {
      newErrors.startDate = "Invalid start date";
    }
    if (!cdd.endDate || !Date.parse(cdd.endDate)) {
      newErrors.endDate = "Invalid end date";
    }
    if (Date.parse(cdd.startDate) > Date.parse(cdd.endDate)) {
      newErrors.startDate = "Start date cannot be after end date";
      newErrors.endDate = "End date cannot be before start date";
    }
    if (!cdd.employmentType) {
      newErrors.employmentType = "Employment type is required";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmitData = async () => {
    if (!validateInput()) {
      toast.error("Invalid input fields");
      return;
    }

    const formattedCdd = {
      ...cdd,
      dateOfBirth: new Date(cdd.dateOfBirth).toISOString(),
      startDate: new Date(cdd.startDate).toISOString(),
      endDate: new Date(cdd.endDate).toISOString(),
    };

    axios
      .post(`/api/admin/project/${projectCuid}/candidates`, [formattedCdd])
      .then((response) => {
        console.log(response.data);

        if (Array.isArray(response.data) && response.data.length === 1) {
          toast.error("Candidate already exists in project");
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
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={isAddModalOpen}
      onClose={handleCloseModal}
    >

      <ModalDialog
        variant="outlined"
        sx={{
          maxWidth: 500,
          overflow: "auto",
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography level="title-lg">Add a candidate</Typography>
        <Typography level="body-xs">
          Add a candidate to your project. Select from candidate history, or
          fill in their details.
        </Typography>

        <Grid container spacing={2} py={2}>
          <Grid xs={10} md={6}>
            <FormControl required error={!!errors.nric} sx={{ flexGrow: 1 }}>
              <FormLabel>Nric</FormLabel>
              <Input name="nric" value={cdd.nric} onChange={handleChange} />
              {errors.nric && (
                <Typography textColor="danger">{errors.nric}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid xs={2} md={6}>
            <FormControl>
              <FormLabel>&nbsp;</FormLabel>
              <Button
                fullWidth
                onClick={handleNRICSearch}
                disabled={!nricRegex.test(cdd.nric)}
                sx={{ display: { xs: "none", md: "block" } }}
              >
                Search NRIC
              </Button>
              <IconButton
                onClick={handleNRICSearch}
                disabled={!nricRegex.test(cdd.nric)}
                sx={{ display: { xs: "block", md: "none" } }}
                variant="solid"
                color="primary"
              >
                <SearchIcon onClick={handleNRICSearch} />
              </IconButton>
            </FormControl>
          </Grid>

          {showFields && (
            <>
              <Grid xs={12}>
                <FormControl required error={!!errors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={cdd.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <Typography textColor="danger">{errors.name}</Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid xs={12} md={6}>
                <FormControl required error={!!errors.dateOfBirth}>
                  <FormLabel>Date of birth</FormLabel>
                  <Input
                    type="date"
                    name="dateOfBirth"
                    value={cdd.dateOfBirth}
                    onChange={handleChange}
                  />
                  {errors.dateOfBirth && (
                    <Typography textColor="danger">
                      {errors.dateOfBirth}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid xs={12} md={6}>
                <FormControl required error={!!errors.contact}>
                  <FormLabel>Contact</FormLabel>
                  <Input
                    startDecorator={"+65"}
                    name="contact"
                    value={cdd.contact}
                    onChange={handleContactChange}
                  />
                  {errors.contact && (
                    <Typography textColor="danger">
                      {errors.contact}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </>
          )}

          <Grid xs={12} md={6}>
            <FormControl required error={!!errors.startDate}>
              <FormLabel>Start date</FormLabel>
              <Input
                type="date"
                name="startDate"
                value={cdd.startDate}
                onChange={handleChange}
              />
              {errors.startDate && (
                <Typography textColor="danger">{errors.startDate}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid xs={12} md={6}>
            <FormControl required error={!!errors.endDate}>
              <FormLabel>End date</FormLabel>
              <Input
                type="date"
                name="endDate"
                value={cdd.endDate}
                onChange={handleChange}
              />
              {errors.endDate && (
                <Typography textColor="danger">{errors.endDate}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid xs={12}>
            <FormControl required error={!!errors.employmentType}>
              <FormLabel>Job type</FormLabel>
              <Select
                value={cdd.employmentType}
                name="employmentType"
                onChange={handleSelectChange}
              >
                <Option value={"FULL_TIME"}>FULL_TIME</Option>
                <Option value={"PART_TIME"}>PART_TIME</Option>
                <Option value={"CONTRACT"}>CONTRACT</Option>
              </Select>
              {errors.employmentType && (
                <Typography textColor="danger">
                  {errors.employmentType}
                </Typography>
              )}
            </FormControl>
          </Grid>
        </Grid>

        <Button onClick={handleSubmitData} disabled={!showFields}>
          Save
        </Button>
      </ModalDialog>

    </Modal >
  );
};

export default AddCandidateModal;
