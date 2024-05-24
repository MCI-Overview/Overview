// ./login/choose-role.tsx
import React from "react";
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
  Chip,
} from "@mui/joy";

const MyProjects: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateProjectClick = () => {
    navigate("/admin/projects#create");
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
            <Typography level="title-md">My projects</Typography>
            <Typography level="body-sm">
              Projects that you have joined or created.
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            <Card>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography level="title-md">Project 1</Typography>
                <Chip>Company Pte Ltd</Chip>
              </Box>
            </Card>
            <Card>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography level="title-md">Project 1</Typography>
                <Chip>Company Pte Ltd</Chip>
              </Box>
            </Card>
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
