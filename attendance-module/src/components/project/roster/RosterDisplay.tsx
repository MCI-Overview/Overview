import dayjs from "dayjs";
import { useState } from "react";

import RosterIcon from "./RosterIcon";
import MagicalButton from "./MagicalButton";
import ConsultantDisplay from "../ui/ConsultantDisplay";
import AttendanceStatusChip from "../attendance/AttendanceStatusChip";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  LATE_COLOR,
  LEAVE_COLOR,
  MEDICAL_COLOR,
  NO_SHOW_COLOR,
  ON_TIME_COLOR,
  UPCOMING_COLOR,
} from "../../../utils/colors";

import {
  Box,
  Card,
  Chip,
  CircularProgress,
  DialogContent,
  Divider,
  Drawer,
  ModalClose,
  Stack,
  Typography,
} from "@mui/joy";

import {
  FreeBreakfastRounded as BreakIcon,
  PunchClockRounded as PunchClockIcon,
} from "@mui/icons-material";

export type RosterDisplayProps = {
  data: {
    type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    shiftCuid: string;
    status?: string;
    leave?: string;
    rosterCuid?: string;
    breakDuration?: number;
    projectCuid?: string;
    clientHolderCuids?: string[];
    originalStartTime: dayjs.Dayjs;
    originalEndTime: dayjs.Dayjs;
    clockInTime?: dayjs.Dayjs;
    clockOutTime?: dayjs.Dayjs;
    isPartial: boolean;
    state?: "LOADING" | "PREVIEW";
    displayType?: "ATTENDANCE" | "ROSTER";
  };
  draggable: boolean;
  opacity?: number;
};

function getAttendanceColor(
  status: string | undefined,
  leave: string | undefined
) {
  if (status === "MEDICAL") {
    return MEDICAL_COLOR;
  }

  if (leave) {
    return LEAVE_COLOR;
  }

  if (status === "NO_SHOW") {
    return NO_SHOW_COLOR;
  }

  if (status === "LATE") {
    return LATE_COLOR;
  }

  if (status === "ON_TIME") {
    return ON_TIME_COLOR;
  }

  return UPCOMING_COLOR;
}

function addS(value: number, string: string) {
  return Math.abs(value) <= 1 ? string : `${string}s`;
}

export default function RosterDisplay({
  data,
  draggable,
  opacity,
}: RosterDisplayProps) {
  const { project } = useProjectContext();

  const [open, setOpen] = useState(false);

  if (!data) {
    return null;
  }

  const isSameProject = !data.projectCuid || data.projectCuid === project?.cuid;

  const loading = data.state === "LOADING";
  const blinking = data.state === "PREVIEW";

  return (
    <>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        anchor="right"
        size="sm"
      >
        <ModalClose />
        <DialogContent
          sx={{
            marginTop: 4,
            padding: 2,
          }}
        >
          <Stack spacing={2}>
            <Typography level="title-lg">Roster Details</Typography>
            <Card>
              <Stack direction="row" spacing={0.5}>
                <Chip
                  startDecorator={<RosterIcon type={data.type} />}
                  variant="plain"
                >
                  {`${data.startTime.format("HHmm")} - ${data.endTime.format(
                    "HHmm"
                  )}`}
                </Chip>
                {data.rosterCuid && (
                  <AttendanceStatusChip
                    status={
                      (data.status as
                        | "MEDICAL"
                        | "NO_SHOW"
                        | "LATE"
                        | "ON_TIME") || null
                    }
                    leave={(data.leave as "FULLDAY" | "HALFDAY") || null}
                  />
                )}
              </Stack>
              {data.clockInTime?.isValid() && (
                <Chip startDecorator={<PunchClockIcon />} variant="plain">
                  {`${data.clockInTime.format("HHmm")} / ${
                    data.clockOutTime?.isValid()
                      ? data.clockOutTime?.format("HHmm")
                      : "" || "-"
                  }`}
                </Chip>
              )}
              <Chip startDecorator={<BreakIcon />} variant="plain">
                {`${data.breakDuration}m`}
              </Chip>
            </Card>
            <Divider />
            {data.clientHolderCuids && data.clientHolderCuids.length !== 0 && (
              <>
                <Typography level="title-lg">
                  {addS(data.clientHolderCuids.length, "Client Holder")}
                </Typography>
                <Card>
                  {data.clientHolderCuids.map((cuid) => (
                    <ConsultantDisplay key={cuid} cuid={cuid} variant="SMALL" />
                  ))}
                </Card>
              </>
            )}
          </Stack>
        </DialogContent>
      </Drawer>
      <MagicalButton
        key={data.shiftCuid + data.rosterCuid}
        className={data.shiftCuid}
        opacity={opacity || 1}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "100%",
          cursor: draggable ? "move !important" : "pointer !important",
        }}
        seed={data.shiftCuid}
        color={
          data.displayType === "ATTENDANCE"
            ? getAttendanceColor(data.status, data.leave)
            : undefined
        }
        blinking={blinking ? "true" : undefined}
        issameproject={isSameProject ? "true" : undefined}
        onClick={() => setOpen(true)}
      >
        <Typography
          sx={{
            color: isSameProject ? "white" : "text.disabled",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {loading && (
              <Box>
                <CircularProgress color="neutral" size="sm" />
              </Box>
            )}
            {!loading && (
              <RosterIcon type={data.type} isPartial={data.isPartial} />
            )}
          </Box>
          <Typography>{data.startTime.format("HHmm")}</Typography>-
          <Typography>{data.endTime.format("HHmm")}</Typography>
        </Typography>
      </MagicalButton>
    </>
  );
}
