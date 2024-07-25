import axios from "axios";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { CustomAdminAttendance } from "../../../types";
import { readableEnum } from "../../../utils/capitalize";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  FormControl,
  FormLabel,
  Modal,
  ModalDialog,
  Typography,
  Input,
  Grid,
  Divider,
  ModalClose,
  Button,
  Select,
  Option,
} from "@mui/joy";

interface AddLocationsModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedAtt: CustomAdminAttendance | null;
}

const AdminProjectAttendanceEditModal = ({
  isOpen,
  setIsOpen,
  selectedAtt,
}: AddLocationsModalProps) => {
  if (!selectedAtt) return null;

  const { project, updateProject } = useProjectContext();
  const projectLocations = project?.locations || [];
  const initialFields = {
    clockIn: selectedAtt.rawStart ? dayjs(selectedAtt.rawStart) : null,
    clockOut: selectedAtt.rawEnd ? dayjs(selectedAtt.rawEnd) : null,
    name: selectedAtt.location.name || null,
    status: selectedAtt.status,
  };
  const [updatefields, setUpdateFields] = useState(initialFields);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUpdateFields(initialFields);
      setHasChanges(false);
    }
  }, [isOpen, selectedAtt]);

  useEffect(() => {
    const determineStatus = () => {
      if (!updatefields.clockIn) {
        return "NO_SHOW";
      }

      const clockInTime = dayjs(updatefields.clockIn).format("HH:mm:ss");
      const shiftStartTime = dayjs(selectedAtt.shiftStart).format("HH:mm:ss");

      if (clockInTime <= shiftStartTime) {
        return "ON_TIME";
      }
      return "LATE";
    };

    setUpdateFields((prevFields) => ({
      ...prevFields,
      status: determineStatus(),
    }));
  }, [updatefields.clockIn, selectedAtt.shiftStart]);

  useEffect(() => {
    const hasUpdates =
      JSON.stringify(updatefields) !== JSON.stringify(initialFields);
    setHasChanges(hasUpdates);
  }, [updatefields, initialFields]);

  const locationOptions = projectLocations.map((location) => ({
    value: location.name,
    label: `${location.name}`,
  }));

  const handleSubmit = async () => {
    try {
      await axios.patch(
        `/api/admin/attendance/${selectedAtt.attendanceCuid}/edit`,
        {
          clockInTime: updatefields.clockIn,
          clockOutTime: updatefields.clockOut,
          status: updatefields.status,
          location: projectLocations.find(
            (loc) => loc.name === updatefields.name
          ),
        }
      );
      toast.success("Attendance updated successfully");
      updateProject();
      setIsOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update attendance");
    }
  };

  const updateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateFields((prevFields) => ({
      ...prevFields,
      [name]: value ? dayjs(value, "HH:mm") : null,
    }));
  };

  const handleSelectChange = (_event: any, newValue: string | null) => {
    setUpdateFields((prevFields) => ({
      ...prevFields,
      name: newValue,
    }));
  };

  return (
    <Modal open={isOpen} onClose={() => setIsOpen(false)}>
      <ModalDialog
        layout="fullscreen"
        sx={{
          maxWidth: "525px",
          overflow: "auto",
        }}
      >
        <ModalClose />

        <Typography level="title-lg">
          Edit {selectedAtt.name}'s attendance
        </Typography>

        <Divider />
        <Typography level="title-md">Basic details:</Typography>
        <Divider />
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Nric</FormLabel>
              <Typography>{selectedAtt.nric}</Typography>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Typography>{selectedAtt.date.format("DD MMM YYYY")}</Typography>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Shift start</FormLabel>
              <Typography>{selectedAtt.shiftStart.format("HH:mm")}</Typography>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Shift end</FormLabel>
              <Typography>{selectedAtt.shiftEnd.format("HH:mm")}</Typography>
            </FormControl>
          </Grid>
        </Grid>

        <Divider />
        <Typography level="title-md">Editable fields:</Typography>
        <Divider />
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Clock in</FormLabel>
              <Input
                onChange={updateInput}
                name="clockIn"
                type="time"
                value={
                  updatefields.clockIn
                    ? updatefields.clockIn.format("HH:mm")
                    : ""
                }
              ></Input>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Clock out</FormLabel>
              <Input
                onChange={updateInput}
                name="clockOut"
                type="time"
                value={
                  updatefields.clockOut
                    ? updatefields.clockOut.format("HH:mm")
                    : ""
                }
              ></Input>
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Input value={readableEnum(updatefields.status || "UPCOMING")} />
            </FormControl>
          </Grid>

          <Grid xs={12} sm={6}>
            <FormControl>
              <FormLabel>Location</FormLabel>
              <Select
                onChange={handleSelectChange}
                placeholder="Select Location"
                value={updatefields.name || null}
              >
                {locationOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button onClick={handleSubmit} disabled={!hasChanges}>
          Save
        </Button>
      </ModalDialog>
    </Modal>
  );
};

export default AdminProjectAttendanceEditModal;
