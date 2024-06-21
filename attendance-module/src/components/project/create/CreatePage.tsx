import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonConsultant, CommonLocation } from "../../../types/common";
import { CreateProjectData } from "../../../types";
import ProjectDetailsSection from "./DetailsSection";
import ProjectLocationsSection from "./LocationsSection";
import ProjectCandidateHoldersSection from "./CandidateHoldersSection";

import { Box, Button, Divider, Stack } from "@mui/joy";

// Define the interface for the error response data
interface ErrorResponseData {
  message: string;
}

const CreateProjectPage = () => {
  const [projectDetails, setProjectDetails] = useState<CreateProjectData>({
    name: null,
    clientUEN: null,
    clientName: null,
    employmentBy: null,
    startDate: null,
    endDate: null,
    noticePeriodDuration: null,
    noticePeriodUnit: null,
  });
  const [locations, setLocations] = useState<CommonLocation[]>([]);
  const [candidateHolders, setCandidateHolders] = useState<CommonConsultant[]>(
    []
  );

  const navigate = useNavigate();

  const handleSaveProject = async () => {
    const body = {
      ...projectDetails,
      locations,
      candidateHolders: candidateHolders.map((holder) => holder.cuid),
    };

    try {
      const { status, data } = await axios.post("/api/admin/project", body);
      if (status === 200) {
        navigate(`/admin/project/${data.projectCuid}`);
        return toast.success(data.message);
      }

      toast.error(data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponseData>;
      toast.error(
        axiosError.response?.data.message ||
          "Error while creating project. Please try again later."
      );
    }
  };

  return (
    <Stack
      spacing={2}
      sx={{
        display: "flex",
        width: "600px",
        maxHeight: "100%",
        overflowY: "auto",
        scrollbarWidth: "thin",
      }}
    >
      <ProjectDetailsSection
        projectDetails={projectDetails}
        setProjectDetails={setProjectDetails}
      />

      <Divider />

      <ProjectLocationsSection
        locations={locations}
        setLocations={setLocations}
      />

      <Divider />

      <ProjectCandidateHoldersSection
        candidateHolders={candidateHolders}
        setCandidateHolders={setCandidateHolders}
      />

      <Divider />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button size="sm" variant="solid" onClick={handleSaveProject}>
          Create Project
        </Button>
      </Box>
    </Stack>
  );
};

export default CreateProjectPage;
