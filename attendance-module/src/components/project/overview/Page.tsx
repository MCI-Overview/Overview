import { useProjectContext } from "../../../providers/projectContextProvider";
import HeadcountSection from "./HeadcountSection";
import DailyAttendanceSection from "./DailyAttendanceSection";
import DailyHeadcountSection from "./DailyHeadcountSection";
import LocationsSection from "./LocationsSection";

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
} from "@mui/joy";

const ProjectOverview: React.FC = () => {
  const { project } = useProjectContext();

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
                <Input value={project?.client.name} disabled />
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Client UEN</FormLabel>
                <Input value={project?.client.uen} disabled />
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Created on</FormLabel>
                <Input
                  value={new Date(project?.createdAt || 0).toLocaleDateString()}
                  disabled
                />
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Employment by</FormLabel>
                <Input value={project?.employmentBy} disabled />
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>Start date</FormLabel>
                <Input
                  value={new Date(project?.startDate || 0).toLocaleDateString()}
                  disabled
                />
              </Grid>
              <Grid xs={12} sm={12} md={6}>
                <FormLabel>End date</FormLabel>
                <Input
                  value={new Date(project?.endDate || 0).toLocaleDateString()}
                  disabled
                />
              </Grid>
            </Grid>
          </Stack>
          <CardOverflow
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          ></CardOverflow>
        </Card>
      </Stack>

      <LocationsSection />

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
            <HeadcountSection />
          </Stack>
        </Grid>
        <Grid xs={12} md={6}>
          <Stack spacing={4}>
            <DailyHeadcountSection />
          </Stack>
        </Grid>
      </Grid>
      <DailyAttendanceSection />
    </>
  );
};

export default ProjectOverview;
