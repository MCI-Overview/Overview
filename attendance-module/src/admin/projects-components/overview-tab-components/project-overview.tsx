// ./login/choose-role.tsx
import React, { useEffect, useState } from "react";

import {
  Box,
  Divider,
  Stack,
  Typography,
  Card,
  CardOverflow,
  FormLabel,
  Input,
  Grid,
  Skeleton,
} from "@mui/joy";
import ProjectHeadcount from "./project-headcount";
import DailyAttendanceReport from "./project-daily-attendance";
import ProjectDailyHeadcount from "./project-daily-headcount";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Project } from "../../../types";

const ProjectOverview: React.FC = () => {
  const projectId = useParams().projectId;
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);

  useEffect(() => {
    axios.get(`/api/admin/project/${projectId}`).then((response) => {
      setProjectDetails(response.data);
    });
  }, [projectId]);
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
            <Typography level="title-md">About</Typography>
            <Typography level="body-sm">Project information</Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
              sx={{ flexGrow: 2 }}
            >
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Client name</FormLabel>
                <Skeleton
                  variant="rectangular"
                  loading={!projectDetails}
                  animation="wave"
                  sx={{ height: "2.25rem" }}
                >
                  <Input value={projectDetails?.Client.name} disabled />
                </Skeleton>
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Client UEN</FormLabel>
                <Skeleton
                  variant="rectangular"
                  loading={!projectDetails}
                  animation="wave"
                  sx={{ height: "2.25rem" }}
                >
                  <Input value={projectDetails?.clientUEN} disabled />
                </Skeleton>
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Created on</FormLabel>
                <Skeleton
                  variant="rectangular"
                  loading={!projectDetails}
                  animation="wave"
                  sx={{ height: "2.25rem" }}
                >
                  <Input
                    value={new Date(
                      projectDetails?.createdAt || 0,
                    ).toLocaleDateString()}
                    disabled
                  />
                </Skeleton>
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Employment by</FormLabel>
                <Skeleton
                  variant="rectangular"
                  loading={!projectDetails}
                  animation="wave"
                  sx={{ height: "2.25rem" }}
                >
                  <Input value={projectDetails?.employmentBy} disabled />
                </Skeleton>
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Start date</FormLabel>
                <Skeleton
                  variant="rectangular"
                  loading={!projectDetails}
                  animation="wave"
                  sx={{ height: "2.25rem" }}
                >
                  <Input
                    value={new Date(
                      projectDetails?.startDate || 0,
                    ).toLocaleDateString()}
                    disabled
                  />
                </Skeleton>
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>End date</FormLabel>
                <Skeleton
                  variant="rectangular"
                  loading={!projectDetails}
                  animation="wave"
                  sx={{ height: "2.25rem" }}
                >
                  <Input
                    value={new Date(
                      projectDetails?.endDate || 0,
                    ).toLocaleDateString()}
                    disabled
                  />
                </Skeleton>
              </Grid>
            </Grid>
          </Stack>
          <CardOverflow
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          ></CardOverflow>
        </Card>
      </Stack>

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
            <Typography level="title-md">Locations</Typography>
            <Typography level="body-sm">
              Add site locations to your project
            </Typography>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}></Stack>
          <CardOverflow
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          ></CardOverflow>
        </Card>
      </Stack>
      <Grid
        container
        spacing={4}
        sx={{
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 0, md: 4 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Grid xs={12} md={6}>
          <Stack spacing={4}>
            <ProjectHeadcount />
          </Stack>
        </Grid>
        <Grid xs={12} md={6}>
          <Stack spacing={4}>
            <ProjectDailyHeadcount />
          </Stack>
        </Grid>
      </Grid>
      <DailyAttendanceReport />
    </>
  );
};

export default ProjectOverview;
