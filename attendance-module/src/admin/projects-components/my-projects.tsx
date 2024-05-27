// ./login/choose-role.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
import axios from "axios";
import ProjectDisplay from "../../components/project/ui/Project";
import { Project } from "../../types";

const MyProjects: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateProjectClick = () => {
    navigate("/admin/projects#create");
  };

  const [projectsList, setProjectsList] = React.useState([]);

  useEffect(() => {
    axios.get("/api/admin/projects").then((response) => {
      setProjectsList(response.data);
    });
  }, []);

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
            <Typography level="title-md">My projects</Typography>
            <Typography level="body-sm">
              Projects that you have joined or created.
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            {projectsList.length === 0 && (
              <Typography level="body-sm" textAlign="center">
                No projects found. Create one to get started!
              </Typography>
            )}
            {projectsList.map((project: Project) => (
              <ProjectDisplay
                key={project.id}
                projectName={project.name}
                companyName={project.Client.name}
                projectId={project.id}
              />
            ))}
          </Stack>
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button
                size="sm"
                variant="solid"
                onClick={handleCreateProjectClick}
              >
                Create project
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </>
  );
};

export default MyProjects;
