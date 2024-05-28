import { useState } from "react";
import axios from "axios";
import { Consultant, Location, ProjectDetails } from "../../../types";
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

const CreateProjectPage = () => {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: null,
    clientUEN: null,
    clientName: null,
    employmentBy: null,
    startDate: null,
    endDate: null,
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [candidateHolders, setCandidateHolders] = useState<Consultant[]>([]);

  const handleSaveProject = async () => {
    const body = {
      ...projectDetails,
      locations,
      candidateHolders: candidateHolders.map((holder) => holder.email),
    };

    console.log(body);

    try {
      const res = await axios.post("/api/admin/project", body);
      console.log(res);
      console.log("Project saved successfully");
    } catch (error) {
      // TODO: Handle failed save
      console.error("Error while saving project", error);
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
