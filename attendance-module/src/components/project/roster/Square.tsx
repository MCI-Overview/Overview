import { CircularProgress, IconButton, Stack, Tooltip } from "@mui/joy";
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
      {date.toString().slice(0, 10)}
      {shifts.map((shift) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            {`${shift.startTime.format("HHmm")} -
            ${shift.endTime.format("HHmm")}`}
          </div>
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

function renderSquare({
  backgroundColor,
  firstHalfBackground,
  secondHalfBackground,
  tooltip = "",
  loading = false,
}: {
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
          height: "2rem",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: firstHalfBackground || backgroundColor,
          }}
        />
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: secondHalfBackground || backgroundColor,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "#CDD7E1",
          }}
        />
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
    (r) => r.type === "FIRST_HALF" || r.type === "FULL_DAY",
  );
  const hasSecondHalfRoster = roster.some(
    (r) => r.type === "SECOND_HALF" || r.type === "FULL_DAY",
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
      backgroundColor: "gray",
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
      firstHalfBackground: hasFirstHalfRoster ? "blue" : "transparent",
      secondHalfBackground: hasSecondHalfRoster ? "blue" : "transparent",
    });
  }

  return renderSquare({
    tooltip: date.format("YYYY-MM-DD"),
    backgroundColor: "transparent",
  });
}
