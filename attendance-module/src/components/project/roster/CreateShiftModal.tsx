import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useRef, useState } from "react";
import axios, { AxiosError } from "axios";

import { CreateShiftData } from "../../../types";
import ResponsiveDialog from "../../ResponsiveDialog";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Stack,
  ListItemButton,
  Chip,
} from "@mui/joy";

import { CreateRounded as CreateIcon } from "@mui/icons-material";
import RosterIcon from "./RosterIcon";

function getShiftDuration(startTime: string | null, endTime: string | null) {
  if (!startTime || !endTime) return 0;

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const start = startHour + startMinute / 60;
  const end = endHour + endMinute / 60;

  if (start > end) {
    return 24 - start + end;
  }

  return end - start;
}

export default function CreateShiftModal() {
  const { project, updateProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const [shiftData, setShiftData] = useState<CreateShiftData>({
    startTime: null,
    endTime: null,
    halfDayStartTime: null,
    halfDayEndTime: null,
    breakDuration: null,
    timezone: dayjs.tz.guess(),
  });
  const breakDurationInputRef = useRef<HTMLInputElement>(null);
  const shiftDuration = getShiftDuration(
    shiftData.startTime,
    shiftData.endTime
  );
  const hasHalfDay = shiftDuration > 6;

  const firstHalfShiftDuration = getShiftDuration(
    shiftData.startTime,
    shiftData.halfDayEndTime
  );
  const secondHalfShiftDuration = getShiftDuration(
    shiftData.halfDayStartTime,
    shiftData.endTime
  );

  if (!project) return null;

  async function handleCreateShift() {
    try {
      await axios.post(`/api/admin/project/${project?.cuid}/shifts`, {
        ...shiftData,
      });
      setIsOpen(false);
      updateProject();
      toast.success("Shift created successfully.");
      setShiftData({
        startTime: null,
        endTime: null,
        halfDayStartTime: null,
        halfDayEndTime: null,
        breakDuration: null,
        timezone: shiftData.timezone,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status === 400) {
        toast.error(axiosError.response.data as string);
      } else {
        toast.error("Error while creating shift. Please try again later.");
      }
    }
  }

  return (
    <>
      <ListItemButton onClick={() => setIsOpen(true)}>
        <CreateIcon />
        Create Shift
      </ListItemButton>

      <ResponsiveDialog
        open={isOpen}
        title="Create Shift"
        handleClose={() => setIsOpen(false)}
        actions={
          <Button
            onClick={handleCreateShift}
            disabled={
              firstHalfShiftDuration > shiftDuration ||
              secondHalfShiftDuration > shiftDuration
            }
          >
            Create Shift
          </Button>
        }
      >
        <Stack spacing={1}>
          <Grid container xs={12} spacing={1}>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="time"
                  onChange={(e) =>
                    setShiftData({ ...shiftData, startTime: e.target.value })
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="time"
                  onChange={(e) =>
                    setShiftData({ ...shiftData, endTime: e.target.value })
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          {hasHalfDay && (
            <Grid container xs={12} spacing={1}>
              <Grid xs={6}>
                <FormControl>
                  <FormLabel>Half Day End Time</FormLabel>
                  <Input
                    type="time"
                    onChange={(e) =>
                      setShiftData({
                        ...shiftData,
                        halfDayEndTime: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </Grid>
              <Grid xs={6}>
                <FormControl>
                  <FormLabel>Half Day Start Time</FormLabel>
                  <Input
                    type="time"
                    onChange={(e) =>
                      setShiftData({
                        ...shiftData,
                        halfDayStartTime: e.target.value,
                      })
                    }
                  />
                </FormControl>
              </Grid>
            </Grid>
          )}
          <Grid container spacing={1}>
            <Grid xs={6}>
              <FormControl
                error={
                  shiftDuration >= 8 &&
                  parseInt(shiftData.breakDuration || "0") < 45
                }
              >
                <FormLabel>Break Duration</FormLabel>
                <Input
                  type="number"
                  endDecorator="minutes"
                  ref={breakDurationInputRef}
                  value={shiftData.breakDuration || ""}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) {
                      setShiftData({
                        ...shiftData,
                        breakDuration: "0",
                      });
                    } else {
                      setShiftData({
                        ...shiftData,
                        breakDuration: e.target.value,
                      });
                    }
                  }}
                />
                <FormHelperText>
                  {shiftDuration >= 8 &&
                    parseInt(shiftData.breakDuration || "0") < 45 &&
                    "Must be at least 45 minutes"}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid xs={6} display="flex" flexDirection="column">
              <FormLabel>⠀</FormLabel>
              <Stack
                spacing={1}
                direction="row"
                alignContent="center"
                flexGrow={1}
              >
                <Chip
                  variant="plain"
                  startDecorator={<RosterIcon type="FULL_DAY" />}
                >
                  {shiftDuration.toFixed(1)}h
                </Chip>
                {hasHalfDay && (
                  <Chip
                    variant="plain"
                    startDecorator={<RosterIcon type="FIRST_HALF" />}
                  >
                    {firstHalfShiftDuration.toFixed(1)}h
                  </Chip>
                )}
                {hasHalfDay && (
                  <Chip
                    variant="plain"
                    startDecorator={<RosterIcon type="SECOND_HALF" />}
                  >
                    {secondHalfShiftDuration.toFixed(1)}h
                  </Chip>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </ResponsiveDialog>
    </>
  );
}
