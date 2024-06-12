import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Button,
  FormHelperText,
  Table,
  Chip,
} from "@mui/joy";
import axios from "axios";
import { useRef, useState } from "react";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { CreateShiftData } from "../../../types";

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
    headcount: null,
    breakDuration: null,
    days: [],
  });
  const breakDurationInputRef = useRef<HTMLInputElement>(null);
  const shiftDuration = getShiftDuration(
    shiftData.startTime,
    shiftData.endTime,
  );
  const hasHalfDay = shiftDuration > 6;

  if (!project) return null;

  async function handleCreateShift() {
    await axios.post(`/api/admin/project/${project?.cuid}/shifts`, {
      ...shiftData,
    });
    setIsOpen(false);
    updateProject();
  }

  return (
    <>
      <Modal open={isOpen}>
        <ModalDialog sx={{ minWidth: "34rem" }}>
          <ModalClose onClick={() => setIsOpen(false)} />
          <Typography level="title-lg">Create shifts</Typography>
          <Stack spacing={1}>
            <Stack
              spacing={1}
              sx={{
                pl: "0.25rem",
              }}
            ></Stack>
            <Grid container spacing={1}>
              <Grid xs={6}>
                <FormControl
                  required
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
            </Grid>
            <Grid container xs={12} spacing={1}>
              <Grid xs={6}>
                <FormControl required>
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
                <FormControl required>
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
            <Grid container xs={12} spacing={1}>
              <Grid xs={6}>
                <FormControl required>
                  <FormLabel>Half Day End Time</FormLabel>
                  <Input
                    type="time"
                    disabled={!hasHalfDay}
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
                <FormControl required>
                  <FormLabel>Half Day Start Time</FormLabel>
                  <Input
                    type="time"
                    disabled={!hasHalfDay}
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
            <Table borderAxis="bothBetween">
              <thead>
                <tr>
                  <td />
                  <td>Full</td>
                  <td>AM</td>
                  <td>PM</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Shift Duration</td>
                  <td>{shiftDuration.toFixed(1)}h</td>
                  <td>
                    {hasHalfDay
                      ? getShiftDuration(
                          shiftData.startTime,
                          shiftData.halfDayEndTime,
                        ).toFixed(1) + "h"
                      : "-"}
                  </td>
                  <td>
                    {hasHalfDay
                      ? getShiftDuration(
                          shiftData.halfDayStartTime,
                          shiftData.endTime,
                        ).toFixed(1) + "h"
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Stack>
          <Button onClick={handleCreateShift}>Create Shift</Button>
        </ModalDialog>
      </Modal>
      <Chip
        onClick={() => setIsOpen(true)}
        sx={{ height: "2rem" }}
        variant="solid"
        color="primary"
      >
        Create Shift
      </Chip>
    </>
  );
}
