import { Check } from "@mui/icons-material";
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
  Checkbox,
  Button,
  Autocomplete,
} from "@mui/joy";
import axios from "axios";
import { SyntheticEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShiftGroup } from "../../../types";

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
  const projectId = useParams().projectId;
  const [isOpen, setIsOpen] = useState(false);
  const [shiftData, setShiftData] = useState({});
  const [days, setDays] = useState<string[]>([]);
  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[]>([]);

  useEffect(() => {
    axios
      .get(`/api/admin/project/${projectId}/shiftGroups`)
      .then((response) => {
        const currentGroups = response.data;
        // currentGroups.push({ name: `Shift ${currentGroups.length + 1}` });
        setShiftGroups(currentGroups);
      });
  }, [projectId]);

  async function handleCreateShift() {
    await axios.post("/api/admin/shift", {
      ...shiftData,
      projectId,
      days: days,
    });
    setIsOpen(false);
    window.location.reload()
  }

  function handleShiftNameInput(e: SyntheticEvent<Element, Event>) {
    const inputShiftGroupName = (e.target as HTMLSelectElement).value;

    const shiftGroup = shiftGroups.find((group) => group.name === inputShiftGroupName);
    if (shiftGroup) {
      setShiftData({
        ...shiftData,
        shiftGroupId: shiftGroup.id,
        shiftGroupName: null,
      });
    } else {
      setShiftData({
        ...shiftData,
        shiftGroupId: null,
        shiftGroupName: inputShiftGroupName,
      });
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
                  <FormLabel>Shift Group Name</FormLabel>
                  <Autocomplete
                    freeSolo
                    options={shiftGroups.map((shiftGroup) => ({
                      label: shiftGroup.name,
                      value: shiftGroup.id,
                    }))}
                    onSelect={
                      handleShiftNameInput
                    }
                  />
                </FormControl>
              </Grid>
              <Grid xs={6}>
                <FormControl required>
                  <FormLabel>Headcount</FormLabel>
                  <Input
                    type="number"
                    onChange={(e) => {
                      if (parseInt(e.target.value) < 0) {
                        e.target.value = "0";
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
                      variant="plain"
                      color={checked ? "primary" : "neutral"}
                      startDecorator={
                        checked && (
                          <Check sx={{ zIndex: 1, pointerEvents: "none" }} />
                        )
                      }
                    >
                      <Checkbox
                        variant="outlined"
                        color={checked ? "primary" : "neutral"}
                        disableIcon
                        overlay
                        label={name.substring(0, 3)}
                        checked={checked}
                        onChange={(event) => {
                          setDays((names) =>
                            !event.target.checked
                              ? names.filter((n) => n !== name)
                              : [...names, name],
                          );
                        }}
                      />
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
