import { useState, useEffect } from "react";
import axios from "axios";
import { CandidateHolder, Location, ProjectData } from "../../types";
import ProjectDetailsSection from "./project-details-section";
import CandidateHolderList from "./candidate-holder-list";

import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  Card,
  CardActions,
  CardOverflow
} from '@mui/joy';

const CreateProjectPage = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    projectTitle: "",
    email: "",
    clientCompanyUEN: "",
    clientCompanyName: "",
    employedBy: undefined,
    startDate: "",
    endDate: "",
  });

  const [locations, setLocations] = useState<Location[]>([]);

  const [allConsultants, setAllConsultants] = useState<CandidateHolder[]>([]);
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/admin/consultants",
          { withCredentials: true }
        );
        setAllConsultants(response.data);
      } catch (error) {
        console.error("Error while fetching consultants", error);
      }
    };

    fetchConsultants();
  }, []);

  const [candidateHolders, setCandidateHolders] = useState<CandidateHolder[]>(
    []
  );
  const handleAddCandidateHolder = (email: string) => {
    const newHolder = allConsultants.find((c) => c.email === email);
    setCandidateHolders([...candidateHolders, newHolder!]);
  };

  const handleSaveProject = async () => {
    const body = {
      name: projectData.projectTitle,
      clientUEN: projectData.clientCompanyUEN,
      clientName: projectData.clientCompanyName,
      employmentBy: projectData.employedBy,
      locations: JSON.stringify(locations),
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      candidateHolders: candidateHolders.map((holder) => holder.email),
    };

    console.log("Saving project with body", body);

    try {
      await axios.post("http://localhost:3000/api/admin/project/create",
        body,
        { withCredentials: true, }
      );
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
          display: 'flex',
          maxWidth: '800px',
          mx: 'auto',
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
          <Stack spacing={2} sx={{ my: 1 }}>

            <div>
              <ProjectDetailsSection
                projectData={projectData}
                setProjectData={setProjectData}
                locations={locations}
                setLocations={setLocations}
              />

              <CandidateHolderList
                candidateHolders={candidateHolders}
                handleAddCandidateHolder={handleAddCandidateHolder}
                availableConsultants={allConsultants.filter(
                  (c) => c.email !== projectData?.email // exclude client handler
                )}
              />
            </div>

          </Stack>
          <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <CardActions sx={{ alignSelf: 'flex-end', pt: 2 }}>
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
