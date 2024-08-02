import dayjs from "dayjs";
import { useDrop } from "react-dnd";
import { useState, useEffect } from "react";

import { useProjectContext } from "../../../providers/projectContextProvider";
import {
  useRosterDraggingContext,
  useRosterItemContext,
  useRosterTableContext,
} from "../../../providers/rosterContextProvider";

import DraggableRoster from "./DraggableRoster";
import { RosterDisplayProps } from "./RosterDisplay";

import { Typography, Stack, Tooltip } from "@mui/joy";

export type Candidate = {
  cuid: string;
  name: string;
  restDay: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  roster: RosterDisplayProps["data"][];
  possibleDates?: dayjs.Dayjs[];
};

export default function DroppableArea({
  type,
  candidate,
  date,
}: {
  type: "ATTENDANCE" | "ROSTER";
  candidate: Candidate;
  date: dayjs.Dayjs;
}) {
  const { project } = useProjectContext();

  const { item } = useRosterItemContext();
  const { isPerformanceMode } = useRosterTableContext();
  const { setHoverDate, setHoverCandidateCuid } = useRosterDraggingContext();

  const [tooltip, setTooltip] = useState<React.ReactElement | null>(null);
  const [isOutOfDateRange, setIsOutOfDateRange] = useState(false);
  const [isPossible, setIsPossible] = useState(false);

  const [, drop] = useDrop({
    accept: ["shift", "roster"],
    hover: () => {
      setHoverDate(date);
      setHoverCandidateCuid(candidate.cuid);
    },
  });

  useEffect(() => {
    if (!project || !candidate || !candidate.possibleDates) return;

    setIsPossible(
      candidate.possibleDates.some((validDate) => validDate.isSame(date, "day"))
    );

    if (date.isAfter(project?.endDate)) {
      setIsOutOfDateRange(true);
      return setTooltip(<Typography>Project has ended</Typography>);
    }

    if (date.isBefore(project?.startDate)) {
      setIsOutOfDateRange(true);
      return setTooltip(<Typography>Project has yet to start</Typography>);
    }

    if (
      date.isBefore(candidate && candidate.startDate) &&
      !date.isSame(candidate && candidate.startDate, "day")
    ) {
      setIsOutOfDateRange(true);
      return setTooltip(
        <Typography>
          {`Candidate start date is ${
            candidate && candidate.startDate.format("DD MMM")
          }`}
        </Typography>
      );
    }

    if (
      date.isAfter(candidate && candidate.endDate) &&
      !date.isSame(candidate && candidate.endDate, "day")
    ) {
      setIsOutOfDateRange(true);
      return setTooltip(
        <Typography>
          {`Candidate last day is ${
            candidate && candidate.endDate.format("DD MMM")
          }`}
        </Typography>
      );
    }

    setIsOutOfDateRange(false);
    setTooltip(null);
  }, [date, project, candidate]);

  return (
    <Tooltip title={tooltip}>
      <td
        ref={drop}
        style={{
          background: isOutOfDateRange
            ? "rgba(0, 0, 0, 0.08)"
            : item
            ? isPerformanceMode
              ? "inherit"
              : isPossible
              ? date.format("ddd").toUpperCase() === candidate.restDay
                ? "repeating-linear-gradient(135deg,rgba(0, 128, 0, 0.08),rgba(0, 128, 0, 0.08) 10px,#ffffff 10px,#ffffff 20px)"
                : "rgba(0, 128, 0, 0.08)"
              : "rgba(255, 0, 0, 0.08)"
            : date.format("ddd").toUpperCase() === candidate.restDay
            ? "repeating-linear-gradient(135deg,rgba(255, 165, 0, 0.25),rgba(255, 165, 0, 0.25) 10px,#ffffff 10px,#ffffff 20px)"
            : "inherit",
        }}
      >
        <Stack spacing={1}>
          {(candidate.roster || [])
            .sort((a, b) => (a.startTime.isBefore(b.startTime) ? -1 : 1))
            .map((roster) => (
              <DraggableRoster
                displayType={type}
                key={`${roster.rosterCuid} ${roster.type} ${roster.status} ${roster.shiftCuid} ${roster.originalStartTime} ${roster.originalEndTime} ${roster.startTime} ${roster.endTime}`}
                clientHolderCuids={roster.clientHolderCuids}
                status={roster.status}
                leave={roster.leave}
                state={roster.state}
                type={roster.type}
                shiftCuid={roster.shiftCuid}
                rosterCuid={roster.rosterCuid || ""}
                projectCuid={roster.projectCuid || ""}
                startTime={roster.startTime}
                endTime={roster.endTime}
                isPartial={roster.isPartial}
                originalStartTime={roster.originalStartTime}
                originalEndTime={roster.originalEndTime}
                clockInTime={roster.clockInTime}
                clockOutTime={roster.clockOutTime}
                breakDuration={roster.breakDuration}
              />
            ))}
        </Stack>
      </td>
    </Tooltip>
  );
}
