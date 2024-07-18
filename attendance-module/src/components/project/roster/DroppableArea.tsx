import dayjs from "dayjs";
import { useDrop } from "react-dnd";
import { useState, useEffect } from "react";

import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import DraggableRoster from "./DraggableRoster";
import { RosterDisplayProps } from "./RosterDisplay";

import { Typography, Stack, Tooltip } from "@mui/joy";

export type Candidate = {
  cuid: string;
  name: string;
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
  const { setHoverDate, setCandidateHoverCuid, item } = useRosterContext();
  const [tooltip, setTooltip] = useState<React.ReactElement | null>(null);

  const [, drop] = useDrop({
    accept: ["shift", "roster"],
    hover: () => {
      setHoverDate(date);
      setCandidateHoverCuid(candidate.cuid);
    },
  });

  useEffect(() => {
    if (date.isAfter(project?.endDate)) {
      return setTooltip(<Typography>Project has ended</Typography>);
    }

    if (date.isBefore(project?.startDate)) {
      return setTooltip(<Typography>Project has yet to start</Typography>);
    }

    if (
      date.isBefore(candidate && candidate.startDate) &&
      !date.isSame(candidate && candidate.startDate, "day")
    ) {
      return setTooltip(
        <Typography>
          Candidate start date is{" "}
          {candidate && candidate.startDate.format("DD MMM")}
        </Typography>
      );
    }

    if (
      date.isAfter(candidate && candidate.endDate) &&
      !date.isSame(candidate && candidate.endDate, "day")
    ) {
      return setTooltip(
        <Typography>
          {`Candidate last day is ${
            candidate && candidate.endDate.format("DD MMM")
          }`}
        </Typography>
      );
    }

    setTooltip(null);
  }, [date, project, candidate]);

  if (!candidate) return null;

  const isPossible = candidate.possibleDates?.some((validDate) =>
    validDate.isSame(date, "day")
  );

  const outOfDateRange =
    date.isBefore(project?.startDate) ||
    date.isAfter(project?.endDate) ||
    (date.isBefore(candidate.startDate) &&
      !date.isSame(candidate.startDate, "day")) ||
    (date.isAfter(candidate.endDate) &&
      !date.isSame(candidate.endDate, "day")) ||
    date.isBefore(dayjs(), "day");

  const greyBackground = outOfDateRange;

  return (
    <Tooltip title={tooltip}>
      <td
        ref={drop}
        style={{
          background: greyBackground
            ? "rgba(0, 0, 0, 0.08)"
            : item && candidate.possibleDates
            ? isPossible
              ? "rgba(0, 128, 0, 0.08)"
              : "rgba(255, 0, 0, 0.08)"
            : "inherit",
        }}
      >
        <Stack spacing={1}>
          {(candidate.roster || [])
            .filter((roster) => roster.startTime.isSame(date, "day"))
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
