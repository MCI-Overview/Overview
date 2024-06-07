import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { formatDate } from "../../../utils/date-time";
import { checkPermission } from "../../../utils/permission";
import { PermissionList } from "../../../types/common";
import HeadcountSection from "./HeadcountSection";
import DailyAttendanceSection from "./DailyAttendanceSection";
import DailyHeadcountSection from "./DailyHeadcountSection";
import LocationsSection from "./LocationsSection";

import {
  Box,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import { InfoOutlined } from "@mui/icons-material";

const ProjectOverview: React.FC = () => {
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [startDate, setStartDate] = useState<string>(project?.startDate.split("T")[0] || "");
  const [endDate, setEndDate] = useState<string>(project?.endDate.split("T")[0] || "");
  const [dateError, setDateError] = useState<boolean>(false);

  const hasEditPermission =
    project?.consultants.find(
      (consultant) => consultant.role === "CLIENT_HOLDER"
    )?.cuid === user?.cuid ||
    (user
      ? checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS)
      : false);

  useEffect(() => {
    if (!project) return;

    setDateError(new Date(endDate) < new Date(startDate));

    if (
      startDate === project.startDate.split("T")[0] &&
      endDate === project.endDate.split("T")[0]
    ) {
      return;
    }

    if (dateError) {
      return;
    }

    try {
      axios
        .patch("/api/admin/project", {
          projectCuid: project.cuid,
          startDate: startDate,
          endDate: endDate,
        })
        .then(() => {
          updateProject();
          toast.success("Project dates updated successfully");
        });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update project dates");
    }
  }, [startDate, endDate, project, dateError, updateProject]);

  if (!project) return null;

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
              <Grid xs={4} md={6}>
                <FormLabel>Client name</FormLabel>
                <Input value={project.client.name} disabled />
              </Grid>
              <Grid xs={4} md={6}>
                <FormLabel>Client UEN</FormLabel>
                <Input value={project.client.uen} disabled />
              </Grid>
              <Grid xs={4} md={6}>
                <FormLabel>Created on</FormLabel>
                <Input
                  value={formatDate(new Date(project.createdAt || 0))}
                  disabled
                />
              </Grid>
              <Grid xs={4} md={6}>
                <FormLabel>Employment by</FormLabel>
                <Input value={project.employmentBy} disabled />
              </Grid>
              <Grid xs={4} md={6}>
                <FormLabel>Start date</FormLabel>
                <FormControl sx={{ flexGrow: 1 }} error={dateError}>
                  <Input
                    type="date"
                    value={startDate}
                    disabled={!hasEditPermission}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <FormHelperText>
                    {dateError && (
                      <>
                        <InfoOutlined />
                        Start date must be before end date
                      </>
                    )}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid xs={4} md={6}>
                <FormLabel>End date</FormLabel>
                <FormControl sx={{ flexGrow: 1 }} error={dateError}>
                  <Input
                    type="date"
                    value={endDate}
                    disabled={!hasEditPermission}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <FormHelperText>
                    {dateError && (
                      <>
                        <InfoOutlined />
                        End date must be after start date
                      </>
                    )}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
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