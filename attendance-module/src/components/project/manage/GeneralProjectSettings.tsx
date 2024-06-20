import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { checkPermission } from "../../../utils/permission";
import { PermissionList } from "../../../types/common";
import LocationsSection from "./LocationsSection";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardOverflow,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import { InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";
import dayjs from "dayjs";

const THRESHOLD = dayjs("2000-01-01");

const GeneralProjectSettings = () => {
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [startDate, setStartDate] = useState<string | undefined>(
    project?.startDate.format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    project?.endDate.format("YYYY-MM-DD"),
  );
  const [timeWindow, setTimeWindow] = useState<number | undefined>(
    project?.timeWindow,
  );
  const [distanceRadius, setDistanceRadius] = useState<number | undefined>(
    project?.distanceRadius,
  );

  const [startDateError, setStartDateError] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string>("");
  const [timeWindowError, setTimeWindowError] = useState<string>("");
  const [distanceRadiusError, setDistanceRadiusError] = useState<string>("");

  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] =
    useState<boolean>(true);

  const hasEditPermission =
    project?.consultants.find(
      (consultant) => consultant.role === "CLIENT_HOLDER",
    )?.cuid === user?.cuid ||
    (user
      ? checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS)
      : false);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setStartDateError("Invalid start date");
      return;
    } else {
      setStartDate(e.target.value);
    }

    const newStartDate = dayjs(e.target.value);

    if (newStartDate.isAfter(dayjs(endDate))) {
      setStartDateError("Start date must be before end date");
      setEndDateError("End date must be after start date");
      return;
    }

    if (newStartDate.isBefore(THRESHOLD)) {
      setStartDateError("Start date must be after 01/01/2000");
      return;
    }

    setStartDateError("");
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      setEndDateError("Invalid end date");
      return;
    } else {
      setEndDate(e.target.value);
    }

    const newEndDate = dayjs(e.target.value);

    if (newEndDate.isBefore(dayjs(startDate))) {
      setStartDateError("Start date must be before end date");
      setEndDateError("End date must be after start date");
      return;
    }

    if (newEndDate.isBefore(THRESHOLD)) {
      setEndDateError("End date must be after 01/01/2000");
      return;
    }

    setEndDateError("");
  };

  const handleTimeWindowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);

    if (Number.isNaN(time)) {
      setTimeWindow(undefined);
      setTimeWindowError("Invalid time window");
      return;
    } else {
      setTimeWindow(time);
    }

    if (time < 15 || time > 45) {
      setTimeWindowError("Time window must be between 15 and 45 minutes");
      return;
    }

    setTimeWindowError("");
  };

  const handleDistanceRadiusChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const distance = parseInt(e.target.value);

    if (Number.isNaN(distance)) {
      setDistanceRadius(undefined);
      setDistanceRadiusError("Invalid distance range");
      return;
    } else {
      setDistanceRadius(distance);
    }

    if (distance < 50 || distance > 200) {
      setDistanceRadiusError(
        "Distance range must be between 50 and 200 meters",
      );
      return;
    }

    setDistanceRadiusError("");
  };

  useEffect(() => {
    if (!project) return;

    if (!hasEditPermission) {
      setIsUpdateButtonDisabled(true);
      return;
    }

    const areAllFieldsFilled =
      Boolean(startDate) &&
      Boolean(endDate) &&
      Boolean(timeWindow) &&
      Boolean(distanceRadius);

    const areAnyFieldsChanged =
      startDate !== project.startDate.format("YYYY-MM-DD") ||
      endDate !== project.endDate.format("YYYY-MM-DD") ||
      timeWindow !== project.timeWindow ||
      distanceRadius !== project.distanceRadius;

    setIsUpdateButtonDisabled(!areAllFieldsFilled || !areAnyFieldsChanged);
  }, [
    startDate,
    endDate,
    timeWindow,
    distanceRadius,
    hasEditPermission,
    project,
  ]);

  const handleUpdateProject = () => {
    if (!project) return;

    if (startDateError) {
      toast.error(startDateError);
      return;
    }

    if (endDateError) {
      toast.error(endDateError);
      return;
    }

    if (timeWindowError) {
      toast.error(timeWindowError);
      return;
    }

    if (distanceRadiusError) {
      toast.error(distanceRadiusError);
      return;
    }

    try {
      axios
        .patch("/api/admin/project", {
          projectCuid: project.cuid,
          startDate: startDate,
          endDate: endDate,
          timeWindow: timeWindow,
          distanceRadius: distanceRadius,
        })
        .then(() => {
          updateProject();
          toast.success("Project updated successfully");
        });
    } catch (error) {
      console.log(error);
      toast.error("Failed to update project");
    }
  };

  if (!project) return null;

  return (
    <Stack
      spacing={2}
      sx={{
        display: "flex",
        mx: "auto",
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
            columns={{ xs: 6, sm: 12 }}
            sx={{ flexGrow: 2 }}
          >
            <Grid xs={6}>
              <FormLabel>Client name</FormLabel>
              <Input value={project.client.name} disabled />
            </Grid>
            <Grid xs={6}>
              <FormLabel>Client UEN</FormLabel>
              <Input value={project.client.uen} disabled />
            </Grid>

            <Grid xs={6}>
              <FormLabel>Created on</FormLabel>
              <Input
                value={project.createdAt.format("DD/MM/YYYY HH:mm ")}
                disabled
              />
            </Grid>
            <Grid xs={6}>
              <FormLabel>Employment by</FormLabel>
              <Input value={project.employmentBy} disabled />
            </Grid>

            <Grid xs={6}>
              <FormLabel>Start date</FormLabel>
              <FormControl sx={{ flexGrow: 1 }} error={startDateError !== ""}>
                <Input
                  type="date"
                  value={startDate}
                  disabled={!hasEditPermission}
                  onChange={handleStartDateChange}
                />
                <FormHelperText>
                  {startDateError && (
                    <>
                      <InfoOutlinedIcon />
                      {startDateError}
                    </>
                  )}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormLabel>End date</FormLabel>
              <FormControl sx={{ flexGrow: 1 }} error={endDateError !== ""}>
                <Input
                  type="date"
                  value={endDate}
                  disabled={!hasEditPermission}
                  onChange={handleEndDateChange}
                />
                <FormHelperText>
                  {endDateError && (
                    <>
                      <InfoOutlinedIcon />
                      {endDateError}
                    </>
                  )}
                </FormHelperText>
              </FormControl>
            </Grid>

            <Grid xs={6}>
              <FormLabel>Time window (minutes)</FormLabel>
              <FormControl sx={{ flexGrow: 1 }} error={timeWindowError !== ""}>
                <Input
                  type="number"
                  value={timeWindow}
                  disabled={!hasEditPermission}
                  onChange={handleTimeWindowChange}
                />
                <FormHelperText>
                  {timeWindowError && (
                    <>
                      <InfoOutlinedIcon />
                      {timeWindowError}
                    </>
                  )}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormLabel>Distance range (meters)</FormLabel>
              <FormControl
                sx={{ flexGrow: 1 }}
                error={distanceRadiusError !== ""}
              >
                <Input
                  type="number"
                  defaultValue={distanceRadius}
                  disabled={!hasEditPermission}
                  onChange={handleDistanceRadiusChange}
                />
                <FormHelperText>
                  {distanceRadiusError && (
                    <>
                      <InfoOutlinedIcon />
                      {distanceRadiusError}
                    </>
                  )}
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>

        {hasEditPermission && (
          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              <Button
                size="sm"
                variant="solid"
                onClick={handleUpdateProject}
                disabled={isUpdateButtonDisabled}
              >
                Update
              </Button>
            </CardActions>
          </CardOverflow>
        )}
      </Card>

      <LocationsSection />
    </Stack>
  );
};

export default GeneralProjectSettings;
