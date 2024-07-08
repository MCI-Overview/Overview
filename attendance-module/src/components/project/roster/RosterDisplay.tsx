import dayjs from "dayjs";

import MagicalButton from "./MagicalButton";
import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import {
  LATE_COLOR,
  LEAVE_COLOR,
  MEDICAL_COLOR,
  NO_SHOW_COLOR,
  UPCOMING_COLOR,
} from "../../../utils/colors";

import { Box, CircularProgress, Typography } from "@mui/joy";
import {
  HourglassFullRounded as HourglassIcon,
  HourglassTopRounded as HourglassTopIcon,
  HourglassBottomRounded as HourglassBottomIcon,
  AlignHorizontalLeftRounded as AlignHorizontalLeftIcon,
} from "@mui/icons-material";

export type RosterDisplayProps = {
  data: {
    type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF" | "OVERLAP";
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    shiftCuid: string;
    status?: string;
    leave?: string;
    rosterCuid?: string;
    projectCuid?: string;
    candidateCuid?: string;
    originalStartTime: dayjs.Dayjs;
    originalEndTime: dayjs.Dayjs;
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

  if (status === "NO_SHOW") {
    return NO_SHOW_COLOR;
  }

  if (status === "LATE") {
    return LATE_COLOR;
  }

  if (leave) {
    return LEAVE_COLOR;
  }

  return UPCOMING_COLOR;
}

export default function RosterDisplay({
  data,
  draggable,
  opacity,
}: RosterDisplayProps) {
  const { project } = useProjectContext();
  const { setHoverCuid, hoverCuid } = useRosterContext();

  if (!data) {
    return null;
  }

  const isSameProject = !data.projectCuid || data.projectCuid === project?.cuid;

  const loading = data.state === "LOADING";
  const blinking = data.state === "PREVIEW";

  return (
    <>
      <MagicalButton
        key={data.shiftCuid + data.rosterCuid}
        className={data.shiftCuid}
        opacity={opacity || 1}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          minWidth: "8rem",
          cursor: draggable ? "move !important" : "default !important",
        }}
        seed={data.shiftCuid}
        color={
          data.displayType === "ATTENDANCE"
            ? getAttendanceColor(data.status, data.leave)
            : undefined
        }
        hover={
          data.rosterCuid && hoverCuid === data.rosterCuid ? "true" : undefined
        }
        blinking={blinking ? "true" : undefined}
        issameproject={isSameProject ? "true" : undefined}
        onMouseEnter={() => {
          setHoverCuid(data.rosterCuid || null);
        }}
        onMouseLeave={() => {
          setHoverCuid(null);
        }}
      >
        <Typography
          sx={{
            color: isSameProject ? "white" : "text.disabled",
            display: "flex",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {loading && (
              <Box>
                <CircularProgress color="neutral" size="sm" />
              </Box>
            )}
            {!loading && data.type === "FULL_DAY" && (
              <HourglassIcon sx={{ color: "inherit" }} />
            )}
            {!loading && data.type === "FIRST_HALF" && (
              <HourglassTopIcon sx={{ color: "inherit" }} />
            )}
            {!loading && data.type === "SECOND_HALF" && (
              <HourglassBottomIcon sx={{ color: "inherit" }} />
            )}
            {!loading && data.type === "OVERLAP" && (
              <AlignHorizontalLeftIcon sx={{ color: "inherit" }} />
            )}
          </Box>
          <Typography sx={{ width: "1.75rem" }}>
            {data.startTime.format("HHmm")}
          </Typography>
          -
          <Typography sx={{ width: "1.5rem" }}>
            {data.endTime.format("HHmm")}
          </Typography>
        </Typography>
      </MagicalButton>
    </>
  );
}
