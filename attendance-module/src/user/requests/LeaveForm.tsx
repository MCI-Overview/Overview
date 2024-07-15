import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRequestContext } from "../../providers/requestContextProvider";
import LoadingRequestButton from "../../components/LoadingRequestButton";

import {
  FormControl,
  FormLabel,
  Select,
  Option,
  Grid,
  Textarea,
  Autocomplete,
} from "@mui/joy";

export default function RequestLeaveForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { updateRequest } = useRequestContext();

  const [type, setType] = useState("UNPAID_LEAVE");
  const [duration, setDuration] = useState("FULL");
  const [reason, setReason] = useState("");
  const [projectCuid, setProjectCuid] = useState("");
  const [rosterCuid, setRosterCuid] = useState("");

  const [shiftType, setShiftType] = useState("FULL");

  const [upcomingShifts, setUpcomingShifts] = useState<{
    [projectCuid: string]: {
      name: string;
      shifts: {
        cuid: string;
        shiftType: string;
        shiftDate: string;
        Shift: {
          startTime: string;
          halfDayStartTime: string;
        };
      }[];
    };
  }>({});

  useEffect(() => {
    axios.get("/api/user/upcomingShifts").then((response) => {
      setUpcomingShifts(response.data);
    });
  }, []);

  const handleClaimSubmit = async () => {
    try {
      const response = await axios.post(`/api/user/request/leave`, {
        projectCuid,
        type,
        rosterCuid,
        duration,
        reason,
      });

      if (response.status === 200) {
        setIsOpen(false);
        updateRequest();
        toast.success("Leave request submitted successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occured while submitting your leave request");
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Project</FormLabel>
            <Autocomplete
              isOptionEqualToValue={(option, value) => {
                return option.projectCuid === value.projectCuid;
              }}
              options={Object.keys(upcomingShifts).map((key) => {
                return {
                  projectCuid: key,
                  label: upcomingShifts[key].name,
                };
              })}
              getOptionLabel={(option) => option.label}
              onChange={(_e, value) => {
                setProjectCuid(value?.projectCuid || "");
              }}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Shift</FormLabel>
            <Autocomplete
              disabled={!projectCuid}
              isOptionEqualToValue={(option, value) => {
                return option.rosterCuid === value.rosterCuid;
              }}
              options={
                upcomingShifts[projectCuid]?.shifts
                  .map((shift) => {
                    return {
                      rosterCuid: shift.cuid,
                      shiftType: shift.shiftType,
                      shiftDate: dayjs(shift.shiftDate),
                      shiftStartTime: dayjs(
                        shift.shiftType === "SECOND_HALF"
                          ? shift.Shift.halfDayStartTime
                          : shift.Shift.startTime
                      ),
                    };
                  })
                  .sort((a, b) =>
                    a.shiftDate.isBefore(b.shiftDate) ? -1 : 1
                  ) || []
              }
              getOptionLabel={(option) =>
                `${option.shiftDate.format(
                  "DD MMM YYYY"
                )} - ${option.shiftStartTime.format("HHmm")}`
              }
              onChange={(_e, value) => {
                setShiftType(value?.shiftType || "FULL");
                setRosterCuid(value?.rosterCuid || "");
              }}
            />
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              defaultValue={type}
              onChange={(_e, value) => {
                setType(value || "UNPAID_LEAVE");
              }}
            >
              <Option value="UNPAID_LEAVE">Unpaid</Option>
              <Option value="PAID_LEAVE">Paid</Option>
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Duration</FormLabel>
            <Select
              disabled={!rosterCuid}
              defaultValue={duration}
              onChange={(_e, value) => {
                setDuration(value || "FULL_DAY");
              }}
            >
              <Option value="FULL_DAY">Full</Option>
              {shiftType === "FULL" ? null : (
                <>
                  <Option value="FIRST_HALF">First Half</Option>
                  <Option value="SECOND_HALF">Second Half</Option>
                </>
              )}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <FormControl>
        <FormLabel>Reason</FormLabel>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </FormControl>
      <LoadingRequestButton
        promise={handleClaimSubmit}
        disabled={!projectCuid || !type || !rosterCuid || !duration || !reason}
      />
    </>
  );
}
