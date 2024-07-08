import dayjs from "dayjs";
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
  Select,
  Option,
  Stack,
  Typography,
} from "@mui/joy";
import { InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";
import { CreateProjectData } from "../../../types";
import { capitalizeWords } from "../../../utils/capitalize";

const NOTICE_PERIOD_UNITS = ["DAY", "WEEK", "MONTH"];

function addS(value: number, string: string) {
  return Math.abs(value) <= 1 ? string : `${string}s`;
}

const THRESHOLD = dayjs("2000-01-01");

const GeneralProjectSettings = () => {
  const { user } = useUserContext();
  const { project, updateProject } = useProjectContext();

  const [startDate, setStartDate] = useState<string | undefined>(
    project?.startDate.format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    project?.endDate.format("YYYY-MM-DD")
  );
  const [timeWindow, setTimeWindow] = useState<number | undefined>(
    project?.timeWindow
  );
  const [distanceRadius, setDistanceRadius] = useState<number | undefined>(
    project?.distanceRadius
  );
  const [noticePeriodDuration, setNoticePeriodDuration] = useState<
    number | undefined
  >(project?.noticePeriodDuration);
  const [noticePeriodUnit, setNoticePeriodUnit] = useState<string | undefined>(
    project?.noticePeriodUnit
  );

  const [projectDetails, setProjectDetails] = useState<CreateProjectData>({
    name: null,
    clientUEN: null,
    clientName: null,
    employmentBy: null,
    startDate: null,
    endDate: null,
    noticePeriodDuration: null,
    noticePeriodUnit: null,
  });

  const [startDateError, setStartDateError] = useState<string>("");
  const [endDateError, setEndDateError] = useState<string>("");
  const [timeWindowError, setTimeWindowError] = useState<string>("");
  const [distanceRadiusError, setDistanceRadiusError] = useState<string>("");
  const [noticePeriodDurationError, setNoticePeriodDurationError] =
    useState<string>("");

  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] =
    useState<boolean>(true);

  const hasEditPermission =
    project?.consultants.some(
      (c) => c.cuid === user?.cuid && c.role === "CLIENT_HOLDER"
    ) ||
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
    e: React.ChangeEvent<HTMLInputElement>
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
        "Distance range must be between 50 and 200 meters"
      );
      return;
    }

    setDistanceRadiusError("");
  };

  const handleNoticePeriodDurationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const duration = parseInt(e.target.value);

    if (Number.isNaN(duration)) {
      setNoticePeriodDuration(undefined);
      setNoticePeriodDurationError("Invalid notice period duration");
      return;
    } else {
      setNoticePeriodDuration(duration);
    }

    if (duration < 0) {
      setNoticePeriodDurationError("Notice period duration must be positive");
      return;
    }

    setNoticePeriodDurationError("");
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
      Boolean(distanceRadius) &&
      Boolean(noticePeriodDuration) &&
      Boolean(noticePeriodUnit);

    const areAnyFieldsChanged =
      startDate !== project.startDate.format("YYYY-MM-DD") ||
      endDate !== project.endDate.format("YYYY-MM-DD") ||
      timeWindow !== project.timeWindow ||
      distanceRadius !== project.distanceRadius ||
      noticePeriodDuration !== project.noticePeriodDuration ||
      noticePeriodUnit !== project.noticePeriodUnit;

    console.log(noticePeriodDuration, project.noticePeriodDuration);
    console.log(noticePeriodUnit, project.noticePeriodUnit);

    setIsUpdateButtonDisabled(
      !areAllFieldsFilled ||
        !areAnyFieldsChanged ||
        !!timeWindowError ||
        !!distanceRadiusError ||
        !!startDateError ||
        !!endDateError ||
        !!noticePeriodDurationError
    );
  }, [
    startDate,
    endDate,
    timeWindow,
    distanceRadius,
    hasEditPermission,
    project,
    noticePeriodDuration,
    noticePeriodUnit,
    timeWindowError,
    distanceRadiusError,
    startDateError,
    endDateError,
    noticePeriodDurationError,
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
          noticePeriodDuration: noticePeriodDuration,
          noticePeriodUnit: noticePeriodUnit,
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
                  slotProps={{
                    input: {
                      min: 15,
                      max: 45,
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "e" || e.key === "-") {
                      e.preventDefault();
                    }
                  }}
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
                  slotProps={{
                    input: {
                      min: 50,
                      max: 200,
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "e" || e.key === "-") {
                      e.preventDefault();
                    }
                  }}
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
            <Grid xs={6}>
              <FormLabel>Notice period duration</FormLabel>
              <FormControl
                sx={{ flexGrow: 1 }}
                error={noticePeriodDurationError !== ""}
              >
                <Input
                  type="number"
                  value={noticePeriodDuration}
                  disabled={!hasEditPermission}
                  slotProps={{
                    input: {
                      min: 0,
                    },
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "e" || e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                  onChange={handleNoticePeriodDurationChange}
                />
                <FormHelperText>
                  {noticePeriodDurationError && (
                    <>
                      <InfoOutlinedIcon />
                      {noticePeriodDurationError}
                    </>
                  )}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl required sx={{ flexGrow: 1 }}>
                <FormLabel>Notice period unit</FormLabel>
                <Select
                  placeholder="Select notice period unit"
                  value={noticePeriodUnit}
                  disabled={!hasEditPermission}
                  onChange={(_e, value) => {
                    setNoticePeriodUnit(value as string);
                  }}
                >
                  {NOTICE_PERIOD_UNITS.map((unit) => (
                    <Option key={unit} value={unit}>
                      {addS(
                        parseInt(noticePeriodDuration?.toString() ?? "") || 0,
                        capitalizeWords(unit)
                      )}
                    </Option>
                  ))}
                </Select>
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
