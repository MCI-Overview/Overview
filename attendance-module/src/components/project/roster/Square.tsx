import { CircularProgress, IconButton, Stack, Tooltip, Chip } from "@mui/joy";
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
      {date.format('DD-MM-YYYY').toString()}
      {shifts.map((shift) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          key={shift.rosterCuid}
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

function ShiftCard({ shift }: { shift: Roster }) {
  return (
    <Chip>{shift.startTime.format("HHmm")} - {shift.endTime.format("HHmm")}</Chip>
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
          height: "6rem",
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
            {shifts.map((shift) => (
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
      firstHalfBackground: hasFirstHalfRoster ? "rgb(60, 179, 113, 0.8)" : "transparent",
      secondHalfBackground: hasSecondHalfRoster ? "rgb(60, 179, 113, 0.8)" : "transparent",
      shifts: roster,
    });
  }

  return renderSquare({
    tooltip: date.format("DD-MM-YYYY"),
    backgroundColor: "transparent",
  });
} 