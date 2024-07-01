import {
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Chip,
  ColorPaletteProp,
  Typography,
} from "@mui/joy";
import { CancelRounded as CancelIcon } from "@mui/icons-material";
import axios from "axios";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { Dayjs } from "dayjs";
import { ReactNode } from "react";
import { DraggableChipProps } from "../../../types";
import { Roster } from "../../../types/common";

function ShiftTooltipDisplay({
  date,
  shifts,
  updateRosterData,
}: {
  date: Dayjs;
  shifts: Roster[];
  updateRosterData: () => void;
}) {
  const { project } = useProjectContext();

  if (!project) return null;

  return (
    <Stack
      sx={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Typography level="body-xs" sx={{ color: "white" }}>
        {date.format("DD-MM-YYYY").toString()}
      </Typography>

      {shifts.map((shift) => (
        <Stack
          key={shift.rosterCuid}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography level="body-xs" sx={{ color: "white" }}>
            {`${shift.startTime.format("HHmm")} -
            ${shift.endTime.format("HHmm")}`}
          </Typography>

          <IconButton
            size="sm"
            variant="soft"
            onClick={() =>
              axios
                .delete(`/api/admin/roster/${shift.rosterCuid}`)
                .then(() => updateRosterData())
            }
          >
            <CancelIcon />
          </IconButton>
        </Stack>
      ))}
    </Stack>
  );
}

function ShiftCard({ shift }: { shift: Roster }) {
  let chipcolor: ColorPaletteProp = "primary";
  if (shift.type === "FIRST_HALF") {
    chipcolor = "warning";
  } else if (shift.type === "SECOND_HALF") {
    chipcolor = "success";
  }
  return (
    <Chip color={chipcolor} variant="solid">
      <Typography level="body-xs" sx={{ color: "inherit" }}>
        {shift.startTime.format("HHmm")} - {shift.endTime.format("HHmm")}
      </Typography>
    </Chip>
  );
}

function renderSquare({
  shifts,
  backgroundColor,
  firstHalfBackground,
  secondHalfBackground,
  tooltip = "",
  loading = false,
}: {
  shifts?: Roster[];
  backgroundColor: string;
  firstHalfBackground?: string;
  secondHalfBackground?: string;
  tooltip?: string | ReactNode;
  loading?: boolean;
}) {
  return (
    <Tooltip title={tooltip}>
      <Stack
        direction="row"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4rem",
          width: "100%",
          overflow: "hidden",
          position: "relative", // Added for positioning the CircularProgress
          backgroundColor,
        }}
      >
        <Stack
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: firstHalfBackground || backgroundColor,
          }}
        />
        <Stack
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: secondHalfBackground || backgroundColor,
            boxSizing: "border-box",
          }}
        />
        {shifts && shifts.length > 0 && (
          <Stack
            spacing={1}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {shifts
              .sort((a, b) => (a.startTime.isBefore(b.startTime) ? -1 : 1))
              .map((shift) => (
                <ShiftCard key={shift.rosterCuid} shift={shift} />
              ))}
          </Stack>
        )}
        {loading && (
          <CircularProgress size="sm" sx={{ position: "absolute" }} />
        )}
      </Stack>
    </Tooltip>
  );
}

export default function Square({
  date,
  canDrop,
  didDrop,
  isOver,
  roster,
  disabled,
  item,
  updateRosterData,
}: {
  date: Dayjs;
  canDrop: boolean;
  didDrop: boolean;
  isOver: boolean;
  roster: Roster[];
  disabled: boolean;
  item: DraggableChipProps;
  updateRosterData: () => void;
}) {
  const hasFirstHalfItem = item?.type !== "SECOND_HALF";
  const hasSecondHalfItem = item?.type !== "FIRST_HALF";

  const hasFirstHalfRoster = roster.some(
    (r) => r.type === "FIRST_HALF" || r.type === "FULL_DAY"
  );
  const hasSecondHalfRoster = roster.some(
    (r) => r.type === "SECOND_HALF" || r.type === "FULL_DAY"
  );

  if (didDrop) {
    return renderSquare({
      backgroundColor: "orange",
      loading: true,
    });
  }

  if (isOver && disabled) {
    return renderSquare({
      backgroundColor: "gray",
      firstHalfBackground: hasFirstHalfItem ? "red" : "gray",
      secondHalfBackground: hasSecondHalfItem ? "red" : "gray",
    });
  }

  if (disabled) {
    return renderSquare({
      backgroundColor: "rgb(179, 179, 179, 0.3)",
    });
  }

  if (isOver && !canDrop) {
    return renderSquare({
      backgroundColor: "transparent",
      firstHalfBackground: hasFirstHalfItem
        ? "red"
        : hasFirstHalfRoster
        ? "blue"
        : "transparent",
      secondHalfBackground: hasSecondHalfItem
        ? "red"
        : hasSecondHalfRoster
        ? "blue"
        : "transparent",
    });
  }

  if (isOver) {
    return renderSquare({
      backgroundColor: "transparent",
      firstHalfBackground: hasFirstHalfItem
        ? "green"
        : hasFirstHalfRoster
        ? "blue"
        : "transparent",
      secondHalfBackground: hasSecondHalfItem
        ? "green"
        : hasSecondHalfRoster
        ? "blue"
        : "transparent",
    });
  }

  if (roster && roster.length > 0) {
    return renderSquare({
      backgroundColor: "transparent",
      tooltip: (
        <ShiftTooltipDisplay
          date={date}
          shifts={roster}
          updateRosterData={updateRosterData}
        />
      ),
      firstHalfBackground: "rgb(60, 179, 113, 0.8)",
      secondHalfBackground: "rgb(60, 179, 113, 0.8)",
      // firstHalfBackground: hasFirstHalfRoster
      //   ? "rgb(60, 179, 113, 0.8)"
      //   : "transparent",
      // secondHalfBackground: hasSecondHalfRoster
      //   ? "rgb(60, 179, 113, 0.8)"
      //   : "transparent",
      shifts: roster,
    });
  }

  return renderSquare({
    tooltip: date.format("DD-MM-YYYY"),
    backgroundColor: "transparent",
  });
}
