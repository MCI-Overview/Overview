import axios from "axios";
import dayjs from "dayjs";
import { useDrop } from "react-dnd";
import { useState, useEffect } from "react";

import { RosterChipProps } from "./DraggableRosterChip";
import DraggableRoster, { DraggableRosterProps } from "./DraggableRoster";
import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Typography, Stack, Tooltip } from "@mui/joy";
import { RosterDisplayProps } from "./RosterDisplay";

type Candidate = {
  cuid: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  roster: RosterDisplayProps["data"][];
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
  const { updateRosterData } = useRosterContext();
  const [tooltip, setTooltip] = useState<React.ReactElement | null>(null);

  const [{ canDrop, item, itemType }, drop] = useDrop({
    accept: ["shift", "roster"],
    canDrop: (item: RosterChipProps | DraggableRosterProps) => {
      if (itemType === "shift") {
        const itemData = item as RosterChipProps;
        const itemStartTime = date
          .set("hour", itemData.startTime.hour())
          .set("minute", itemData.startTime.minute());
        let itemEndTime = date
          .set("hour", itemData.endTime.hour())
          .set("minute", itemData.endTime.minute());

        if (itemStartTime.isAfter(itemEndTime)) {
          itemEndTime = itemEndTime.add(1, "day");
        }

        if (itemStartTime.isBefore(dayjs())) return false;

        if (date.isAfter(candidate.endDate, "day")) return false;

        return candidate.roster.every(
          (roster) =>
            !(
              itemStartTime.isBetween(roster.startTime, roster.endTime) ||
              itemEndTime.isBetween(roster.startTime, roster.endTime) ||
              roster.startTime.isBetween(itemStartTime, itemEndTime) ||
              roster.endTime.isBetween(itemStartTime, itemEndTime) ||
              (itemStartTime.isSame(roster.startTime) &&
                itemEndTime.isSame(roster.endTime))
            ) &&
            candidate.roster.filter(
              (roster) =>
                (roster.startTime.isSame(date, "day") ||
                  roster.startTime.isSame(date.subtract(1, "day"), "day")) &&
                roster.shiftCuid === itemData.cuid &&
                roster.type !== "FULL_DAY" &&
                itemData.type !== "FULL_DAY"
            ).length === 0
        );
      }

      if (itemType === "roster") {
        const itemData = item as DraggableRosterProps;
        let itemStartTime = date
          .set("hour", itemData.originalStartTime.hour())
          .set("minute", itemData.originalStartTime.minute());
        let itemEndTime = date
          .set("hour", itemData.originalEndTime.hour())
          .set("minute", itemData.originalEndTime.minute());

        if (itemStartTime.isAfter(itemEndTime)) {
          itemEndTime = itemEndTime.add(1, "day");
        }

        if (itemData.type === "OVERLAP") {
          itemStartTime = itemStartTime.subtract(1, "day");
          itemEndTime = itemEndTime.subtract(1, "day");
        }

        if (itemStartTime.isBefore(dayjs())) return false;

        if (date.isAfter(candidate.endDate, "day")) return false;

        if (
          itemData.candidateCuid === candidate.cuid &&
          date.isSame(itemData.startTime, "day")
        ) {
          return false;
        }

        return candidate.roster
          .filter((roster) => roster.rosterCuid != itemData.rosterCuid)
          .every(
            (roster) =>
              !(
                itemStartTime.isBetween(roster.startTime, roster.endTime) ||
                itemEndTime.isBetween(roster.startTime, roster.endTime) ||
                roster.startTime.isBetween(itemStartTime, itemEndTime) ||
                roster.endTime.isBetween(itemStartTime, itemEndTime) ||
                (itemStartTime.isSame(roster.startTime) &&
                  itemEndTime.isSame(roster.endTime))
              ) &&
              candidate.roster.filter(
                (roster) =>
                  (roster.startTime.isSame(date, "day") ||
                    roster.startTime.isSame(date.subtract(1, "day"), "day")) &&
                  roster.shiftCuid === itemData.shiftCuid &&
                  roster.type !== "FULL_DAY" &&
                  itemData.type !== "FULL_DAY"
              ).length === 0
          );
      }

      return false;
    },
    drop: (item: RosterChipProps | DraggableRosterProps) => {
      if (!project) return;

      if (itemType === "shift") {
        const itemData = item as RosterChipProps;

        const itemStartTime = date
          .set("hour", itemData.startTime.hour())
          .set("minute", itemData.startTime.minute());
        let itemEndTime = date
          .set("hour", itemData.endTime.hour())
          .set("minute", itemData.endTime.minute());

        if (itemStartTime.isAfter(itemEndTime)) {
          itemEndTime = itemEndTime.add(1, "day");
        }

        axios
          .post(`/api/admin/project/${project?.cuid}/roster`, {
            candidateCuid: candidate.cuid,
            newShifts: [
              {
                type: item.type,
                shiftDate: date.toISOString(),
                shiftCuid: itemData.cuid,
              },
            ],
          })
          .then(updateRosterData);
      }

      if (itemType === "roster") {
        const itemData = item as DraggableRosterProps;

        const itemStartTime = date
          .set("hour", itemData.startTime.hour())
          .set("minute", itemData.startTime.minute());
        let itemEndTime = date
          .set("hour", itemData.endTime.hour())
          .set("minute", itemData.endTime.minute());

        if (itemStartTime.isAfter(itemEndTime)) {
          itemEndTime = itemEndTime.add(1, "day");
        }

        axios
          .patch(`/api/admin/roster`, {
            rosterCuid: itemData.rosterCuid,
            candidateCuid: candidate.cuid,
            rosterDate:
              itemData.type === "OVERLAP"
                ? date.subtract(1, "day").toISOString()
                : date.toISOString(),
          })
          .then(updateRosterData);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
    }),
  });

  useEffect(() => {
    if (date.isAfter(project?.endDate)) {
      return setTooltip(<Typography>Project has ended</Typography>);
    }

    if (date.isBefore(project?.startDate)) {
      return setTooltip(<Typography>Project has yet to start</Typography>);
    }

    if (
      date.isBefore(candidate.startDate) &&
      !date.isSame(candidate.startDate, "day")
    ) {
      return setTooltip(
        <Typography>
          Candidate start date is {candidate.startDate.format("DD MMM")}
        </Typography>
      );
    }

    if (
      date.isAfter(candidate.endDate) &&
      !date.isSame(candidate.endDate, "day")
    ) {
      return setTooltip(
        <Typography>
          Candidate last day is {candidate.endDate.format("DD MMM")}
        </Typography>
      );
    }

    setTooltip(null);
  }, [date, project, candidate]);

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
          background: item
            ? canDrop
              ? "rgba(0, 128, 0, 0.08)"
              : "rgba(255, 0, 0, 0.08)"
            : greyBackground
            ? "rgba(0, 0, 0, 0.08)"
            : "inherit",
        }}
      >
        <Stack spacing={1}>
          {(candidate.roster || [])
            .sort((a, b) => (a.startTime.isBefore(b.startTime) ? -1 : 1))
            .map((roster) => (
              <DraggableRoster
                displayType={type}
                key={roster.rosterCuid + roster.type}
                status={roster.status}
                leave={roster.leave}
                state={roster.state}
                type={roster.type}
                shiftCuid={roster.shiftCuid}
                rosterCuid={roster.rosterCuid || ""}
                projectCuid={roster.projectCuid || ""}
                startTime={roster.startTime}
                endTime={roster.endTime}
                originalStartTime={roster.originalStartTime}
                originalEndTime={roster.originalEndTime}
                candidateCuid={candidate.cuid}
              />
            ))}
        </Stack>
      </td>
    </Tooltip>
  );
}
