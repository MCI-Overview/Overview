import HeadcountSection from "./HeadcountSection";
import DailyAttendanceSection from "./DailyAttendanceSection";
import DailyHeadcountSection from "./DailyHeadcountSection";

import { Grid, Stack } from "@mui/joy";

const ProjectOverview = () => {
  return (
    <>
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
