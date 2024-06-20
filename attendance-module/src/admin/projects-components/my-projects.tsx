import axios from "axios";
import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Project } from "../../types/index";
import ProjectDisplay from "../../components/project/ui/Project";

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

const MyProjects: FC = () => {
  const navigate = useNavigate();

  const handleCreateProjectClick = () => {
    navigate("/admin/projects#create");
  };

  const [projectsList, setProjectsList] = useState<Project[] | null>(null);

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
            {!projectsList && <div>Loading...</div>}
            {projectsList && projectsList.length === 0 && (
              <Typography level="body-sm" textAlign="center">
                No projects found. Create one to get started!
              </Typography>
            )}
            {projectsList &&
              projectsList.map((project: Project) => (
                <ProjectDisplay
                  key={project.cuid}
                  projectName={project.name}
                  companyName={project.Client.name}
                  projectCuid={project.cuid}
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
