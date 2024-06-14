import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { checkPermission } from "../../../utils/permission";
import { PermissionList } from "../../../types/common";
import HeadcountSection from "./HeadcountSection";
import DailyAttendanceSection from "./DailyAttendanceSection";
import DailyHeadcountSection from "./DailyHeadcountSection";

import { Grid, Stack } from "@mui/joy";
import dayjs from "dayjs";

const ProjectOverview = () => {
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [startDate, setStartDate] = useState<string | undefined>(
    project?.startDate.format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    project?.endDate.format("YYYY-MM-DD")
  );
  const [startDateError, setStartDateError] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string>("");

  const hasEditPermission =
    project?.consultants.find(
      (consultant) => consultant.role === "CLIENT_HOLDER"
    )?.cuid === user?.cuid ||
    (user
      ? checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS)
      : false);

  useEffect(() => {
    if (!project) return;

    setStartDateError("");
    setEndDateError("");

    if (!startDate) return setStartDateError("Invalid start date");
    if (!endDate) return setEndDateError("Invalid end date");

    const newStartDate = dayjs(startDate);
    const newEndDate = dayjs(endDate);

    if (newStartDate.isAfter(newEndDate)) {
      setStartDateError("Start date must be before end date");
      setEndDateError("End date must be after start date");
      return;
    }
    const threshold = dayjs("2000-01-01");

    if (newStartDate.isBefore(threshold)) {
      return setStartDateError("Start date must be after 2000-01-01");
    }

    if (newEndDate.isBefore(threshold)) {
      return setEndDateError("End date must be after 2000-01-01");
    }

    if (
      newStartDate.isSame(dayjs(project.startDate)) &&
      newEndDate.isSame(dayjs(project.endDate))
    ) {
      return;
    }

    if (
      newStartDate.format("YYYY-MM-DD") ===
        project.startDate.format("YYYY-MM-DD") &&
      newEndDate.format("YYYY-MM-DD") === project.endDate.format("YYYY-MM-DD")
    ) {
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
  }, [
    startDate,
    endDate,
    project,
    startDateError,
    endDateError,
    updateProject,
  ]);

  if (!project) return null;

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
