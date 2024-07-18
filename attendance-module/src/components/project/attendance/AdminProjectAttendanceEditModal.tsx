import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FormControl, FormLabel, Modal, ModalDialog, Typography, Input, Grid, Divider, ModalClose, Button, Select, Option } from "@mui/joy";
import { CustomAdminAttendance } from "../../../types";
import { useProjectContext } from "../../../providers/projectContextProvider";
import dayjs from "dayjs";

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
        postalCode: selectedAtt.postalCode || null,
        status: selectedAtt.status
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
            if (dayjs(updatefields.clockIn).isBefore(selectedAtt.shiftStart) || dayjs(updatefields.clockIn).isSame(selectedAtt.shiftStart)) {
                return "ON_TIME";
            }
            return "LATE";
        };

        setUpdateFields(prevFields => ({
            ...prevFields,
            status: determineStatus()
        }));
    }, [updatefields.clockIn, selectedAtt.shiftStart]);

    useEffect(() => {
        const hasUpdates = JSON.stringify(updatefields) !== JSON.stringify(initialFields);
        setHasChanges(hasUpdates);
    }, [updatefields, initialFields]);

    const locationOptions = projectLocations.map(location => ({
        value: location.postalCode,
        label: `${location.postalCode} - ${location.address}`
    }));

    const handleSubmit = async () => {
        try {
            await axios.patch(`/api/admin/attendance/${selectedAtt.attendanceCuid}/edit`, {
                clockInTime: updatefields.clockIn,
                clockOutTime: updatefields.clockOut,
                postalCode: updatefields.postalCode,
                status: updatefields.status
            });
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
        setUpdateFields(prevFields => ({
            ...prevFields,
            [name]: dayjs(value, 'HH:mm')
        }));
    };

    const handleSelectChange = (_event: any, newValue: string | null) => {
        setUpdateFields(prevFields => ({
            ...prevFields,
            postalCode: newValue
        }));
    };

    return (
        <Modal open={isOpen} onClose={() => setIsOpen(false)}>
            <ModalDialog
                layout="fullscreen"
                sx={{
                    maxWidth: "525px",
                    overflow: "auto"
                }}>

                <ModalClose />

                <Typography level="title-lg">Edit {selectedAtt.name}'s attendance</Typography>

                <Typography>Basic details</Typography>
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
                            <Typography>{selectedAtt.date.format('DD MMM YYYY')}</Typography>
                        </FormControl>
                    </Grid>

                    <Grid xs={12} sm={6}>
                        <FormControl>
                            <FormLabel>Shift start</FormLabel>
                            <Typography>{selectedAtt.shiftStart.format('HH:mm')}</Typography>
                        </FormControl>
                    </Grid>

                    <Grid xs={12} sm={6}>
                        <FormControl>
                            <FormLabel>Shift end</FormLabel>
                            <Typography>{selectedAtt.shiftEnd.format('HH:mm')}</Typography>
                        </FormControl>
                    </Grid>
                </Grid>

                <Typography>Editable</Typography>
                <Divider />
                <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                        <FormControl>
                            <FormLabel>Clock in</FormLabel>
                            <Input onChange={updateInput} name="clockIn" type="time" value={updatefields.clockIn ? updatefields.clockIn.format('HH:mm') : ''}></Input>
                        </FormControl>
                    </Grid>

                    <Grid xs={12} sm={6}>
                        <FormControl>
                            <FormLabel>Clock out</FormLabel>
                            <Input onChange={updateInput} name="clockOut" type="time" value={updatefields.clockOut ? updatefields.clockOut.format('HH:mm') : ''}></Input>
                        </FormControl>
                    </Grid>

                    <Grid xs={12} sm={6}>
                        <FormControl>
                            <FormLabel>Location</FormLabel>
                            <Select onChange={handleSelectChange} name="postalCode" placeholder="Select Location" defaultValue={updatefields.postalCode}>
                                <Option value={null}>-</Option>
                                {locationOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid xs={12} sm={6}>
                        <FormControl>
                            <FormLabel>Status</FormLabel>
                            <Input disabled value={updatefields.status || "UPCOMING"} />
                        </FormControl>
                    </Grid>
                </Grid>

                <Button onClick={handleSubmit} disabled={!hasChanges}>Save</Button>
            </ModalDialog>
        </Modal>
    );
};

export default AdminProjectAttendanceEditModal;