import { useState } from "react";
import axios, { AxiosError } from "axios";
import { Consultant, Location } from "../../../types/common";
import { CreateProjectData } from "../../../types";
import ProjectDetailsSection from "./DetailsSection";

import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Card,
  CardActions,
  CardOverflow,
} from "@mui/joy";
import ProjectLocationsSection from "./LocationsSection";
import ProjectCandidateHoldersSection from "./CandidateHoldersSection";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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
    noticePeriodUnit: null
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [candidateHolders, setCandidateHolders] = useState<Consultant[]>([]);

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
    <>
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
        <Card>
          <Box sx={{ mb: 1 }}>
            <Typography level="title-md">Create project</Typography>
            <Typography level="body-sm">
              Create a new project and add your candidate holders.
            </Typography>
          </Box>
          <Divider />
          <Stack
            spacing={2}
            sx={{
              py: { xs: 2, md: 3 },
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
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button size="sm" variant="solid" onClick={handleSaveProject}>
                Create
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </>
  );
};

export default CreateProjectPage;