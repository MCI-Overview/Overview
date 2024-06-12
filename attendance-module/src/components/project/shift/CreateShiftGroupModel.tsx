import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Autocomplete,
  FormHelperText,
  Chip,
  Grid,
} from "@mui/joy";
import { useState } from "react";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { capitalizeWords } from "../../../utils/capitalize";
import { Shift } from "../roster/DraggableChip";
import axios from "axios";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CreateShiftGroupModal() {
  const { project, updateProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const [shiftGroupName, setShiftGroupName] = useState<string>("");
  const [shiftCuids, setShiftCuids] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);

  if (!project) return null;

  async function handleCreateShift() {
    const currentShiftGroupNames =
      project?.shiftGroups.map((sg) => sg.name) || [];
    await axios.patch(`/api/admin/project`, {
      projectCuid: project?.cuid,
      shiftGroups: [
        ...(project?.shiftGroups || []),
        !currentShiftGroupNames.includes(shiftGroupName) && {
          name: shiftGroupName,
          shifts: shiftCuids,
        },
      ],
    });
    setIsOpen(false);
    updateProject();
  }

  return (
    <>
      <Modal open={isOpen}>
        <ModalDialog sx={{ minWidth: "34rem" }}>
          <ModalClose onClick={() => setIsOpen(false)} />
          <Typography level="title-lg">Create shift group</Typography>
          <Stack spacing={1}>
            <FormControl required>
              <FormLabel>Shift Group Name</FormLabel>
              <Input onChange={(e) => setShiftGroupName(e.target.value)} />
              <FormHelperText>
                {project.shiftGroups.filter((sg) => sg.name === shiftGroupName)
                  .length > 0
                  ? "Shift group name already exists"
                  : ""}
              </FormHelperText>
            </FormControl>
            <FormControl required>
              <FormLabel>Shifts</FormLabel>
              <Autocomplete
                multiple
                options={project.shifts}
                getOptionLabel={(shift: Shift) =>
                  `${capitalizeWords(shift.day)} ${shift.startTime.format(
                    "HHmm",
                  )} - ${shift.endTime.format("HHmm")}`
                }
                onChange={(_e, value) =>
                  setShiftCuids(value.map((v) => v.cuid))
                }
              />
            </FormControl>
            <FormControl>
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
            </FormControl>
          </Stack>
          <Button onClick={handleCreateShift}>Create Shift Group</Button>
        </ModalDialog>
      </Modal>
      <Button onClick={() => setIsOpen(true)}>Create Shift Group</Button>
    </>
  );
}
