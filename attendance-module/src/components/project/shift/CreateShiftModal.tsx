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
  Chip,
  Button,
  Autocomplete,
} from "@mui/joy";
import axios from "axios";
import { SyntheticEvent, useRef, useState } from "react";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { CreateShiftData } from "../../../types";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CreateShiftModal() {
  const { project, updateProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const [shiftData, setShiftData] = useState<CreateShiftData>({
    shiftGroupName: null,
    shiftGroupCuid: null,
    startTime: "00:00",
    endTime: "00:00",
    headcount: null,
    days: [],
  });
  const [days, setDays] = useState<string[]>([]);
  const [shiftGroupExists, setShiftGroupExists] = useState<boolean>(false);
  const headcountInputRef = useRef<HTMLInputElement>(null);

  if (!project) return null;

  async function handleCreateShift() {
    await axios.post(`/api/admin/project/${project?.cuid}/shifts`, {
      ...shiftData,
      days: days,
    });
    setIsOpen(false);
    updateProject();
  }

  function handleShiftNameInput(e: SyntheticEvent<Element, Event>) {
    const inputShiftGroupName = (e.target as HTMLSelectElement).value;

    const shiftGroup = project?.ShiftGroup.find(
      (group) => group.name === inputShiftGroupName,
    );
    if (shiftGroup) {
      setShiftData({
        ...shiftData,
        shiftGroupCuid: shiftGroup.cuid,
        shiftGroupName: null,
        headcount: shiftGroup.headcount.toString(),
      });
      setShiftGroupExists(true);
    } else {
      setShiftData({
        ...shiftData,
        shiftGroupCuid: null,
        shiftGroupName: inputShiftGroupName,
        headcount: null,
      });
      setShiftGroupExists(false);
    }
  }

  return (
    <>
      <Modal open={isOpen}>
        <ModalDialog sx={{ minWidth: "34rem" }}>
          <ModalClose onClick={() => setIsOpen(false)} />
          <Typography level="title-lg">Create a shift</Typography>
          <Stack spacing={1}>
            <Grid container spacing={1}>
              <Grid xs={6}>
                <FormControl required>
                  <FormLabel>Shift Name</FormLabel>
                  <Autocomplete
                    freeSolo
                    options={project?.ShiftGroup.map((shiftGroup) => ({
                      label: shiftGroup.name,
                      value: shiftGroup.cuid,
                    }))}
                    onSelect={handleShiftNameInput}
                  />
                </FormControl>
              </Grid>
              <Grid xs={6}>
                <FormControl required>
                  <FormLabel>Headcount</FormLabel>
                  <Input
                    ref={headcountInputRef}
                    disabled={shiftGroupExists}
                    type="number"
                    value={shiftData.headcount || ""}
                    onChange={(e) => {
                      if (parseInt(e.target.value) < 0) {
                        setShiftData({
                          ...shiftData,
                          headcount: "0",
                        });
                      } else {
                        setShiftData({
                          ...shiftData,
                          headcount: e.target.value,
                        });
                      }
                    }}
                  />
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
            <Stack
              spacing={1}
              sx={{
                pl: "0.25rem",
              }}
            >
              <FormLabel>Days</FormLabel>
              <Grid container gap={1}>
                {DAYS.map((name) => {
                  const checked = days.includes(name);
                  return (
                    <Chip
                      key={name}
                      variant={checked ? "solid" : "outlined"}
                      color={checked ? "primary" : "neutral"}
                      onClick={() =>
                        setDays(
                          checked
                            ? days.filter((day) => day !== name)
                            : [...days, name],
                        )
                      }
                    >
                      {name.substring(0, 3)}
                    </Chip>
                  );
                })}
              </Grid>
            </Stack>
          </Stack>
          <Button onClick={handleCreateShift}>Create Shift</Button>
        </ModalDialog>
      </Modal>
      <Button onClick={() => setIsOpen(true)}>Create Shift</Button>
    </>
  );
}
