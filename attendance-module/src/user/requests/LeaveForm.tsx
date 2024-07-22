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

type UpcomingRostersType = {
  [projectCuid: string]: {
    name: string;
    rosters: {
      cuid: string;
      shiftType: string;
      shiftDate: string;
      Shift: {
        startTime: string;
        endTime: string;
        halfDayStartTime: string;
        halfDayEndTime: string;
      };
      status: string;
      leave: string;
    }[];
  };
};

export default function RequestLeaveForm({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) {
  const { updateRequest } = useRequestContext();

  const [type, setType] = useState("UNPAID_LEAVE");
  const [duration, setDuration] = useState("FULL_DAY");
  const [reason, setReason] = useState("");
  const [projectCuid, setProjectCuid] = useState("");
  const [rosterCuid, setRosterCuid] = useState("");

  const [isHalfDayAllowed, setIsHalfDayAllowed] = useState(false);

  const [upcomingRosters, setUpcomingRosters] = useState<UpcomingRostersType>(
    {}
  );

  useEffect(() => {
    axios.get("/api/user/upcomingRosters").then((response) => {
      setUpcomingRosters(response.data);
    });
  }, []);

  const handleSubmit = async () => {
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
        {upcomingRosters && (
          <>
            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Project</FormLabel>
                <Autocomplete
                  value={projectCuid}
                  options={Object.keys(upcomingRosters)}
                  getOptionLabel={(option) =>
                    upcomingRosters[option] ? upcomingRosters[option].name : ""
                  }
                  onChange={(_e, value) => {
                    setProjectCuid(value || "");
                    setRosterCuid("");
                    setDuration("FULL_DAY");
                  }}
                />
              </FormControl>
            </Grid>

            <Grid xs={12} sm={6}>
              <FormControl>
                <FormLabel>Shift</FormLabel>
                <Autocomplete
                  value={rosterCuid}
                  disabled={!projectCuid}
                  options={
                    projectCuid
                      ? upcomingRosters[projectCuid].rosters
                          .sort((a, b) =>
                            dayjs(a.shiftDate).isBefore(dayjs(b.shiftDate))
                              ? -1
                              : 1
                          )
                          .map((shift) => shift.cuid)
                      : []
                  }
                  getOptionLabel={(option) => {
                    if (!upcomingRosters[projectCuid]) return "";

                    const roster = upcomingRosters[projectCuid].rosters.find(
                      (shift) => shift.cuid === option
                    );

                    if (!roster) return "";

                    const correctStartTime =
                      roster.shiftType === "SECOND_HALF"
                        ? dayjs(roster.Shift.halfDayStartTime)
                        : dayjs(roster.Shift.startTime);

                    const correctEndTime =
                      roster.shiftType === "FIRST_HALF"
                        ? dayjs(roster.Shift.halfDayEndTime)
                        : dayjs(roster.Shift.endTime);

                    return `${dayjs(roster.shiftDate).format(
                      "DD/MM/YY"
                    )} ${correctStartTime.format(
                      "HHmm"
                    )} - ${correctEndTime.format("HHmm")}`;
                  }}
                  onChange={(_e, value) => {
                    const roster = upcomingRosters[projectCuid].rosters.find(
                      (shift) => shift.cuid === value
                    );

                    setRosterCuid(value || "");
                    setDuration("FULL_DAY");
                    setIsHalfDayAllowed(
                      Boolean(roster?.Shift.halfDayStartTime) &&
                        roster?.shiftType === "FULL_DAY"
                    );
                  }}
                />
              </FormControl>
            </Grid>
          </>
        )}

        <Grid xs={12} sm={6}>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              value={type}
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
              value={duration}
              disabled={!rosterCuid}
              onChange={(_e, value) => {
                setDuration(value || "FULL_DAY");
              }}
            >
              <Option value="FULL_DAY">Full</Option>
              <Option value="FIRST_HALF" disabled={!isHalfDayAllowed}>
                First Half
              </Option>
              <Option value="SECOND_HALF" disabled={!isHalfDayAllowed}>
                Second Half
              </Option>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <FormControl>
        <FormLabel>Reason</FormLabel>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </FormControl>

      <LoadingRequestButton
        promise={handleSubmit}
        disabled={!projectCuid || !type || !rosterCuid || !duration || !reason}
      />
    </>
  );
}
