import dayjs from "dayjs";
import { useEffect } from "react";
import { useDrag } from "react-dnd";

import {
  useRosterDraggingContext,
  useRosterItemContext,
} from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import RosterDisplay, { RosterDisplayProps } from "./RosterDisplay";

export type DraggableRosterProps = RosterDisplayProps["data"];

export default function DraggableRoster({
  breakDuration,
  shiftCuid,
  rosterCuid,
  projectCuid,
  startTime,
  endTime,
  originalStartTime,
  originalEndTime,
  clockInTime,
  clockOutTime,
  isPartial,
  type,
  state,
  status,
  leave,
  clientHolderCuids,
}: DraggableRosterProps) {
  const { project } = useProjectContext();

  const { draggingCuid, setDraggingCuid, setHoverDate, setHoverCandidateCuid } =
    useRosterDraggingContext();
  const { setItem, setItemType } = useRosterItemContext();

  const [{ isDragging, canDrag }, drag] = useDrag({
    type: "roster",
    item: () => {
      const item = {
        shiftCuid,
        rosterCuid,
        projectCuid,
        startTime,
        endTime,
        originalStartTime,
        originalEndTime,
        isPartial,
        type,
        state,
      };

      setItem(item);
      setItemType("roster");

      return item;
    },
    end: () => {
      setDraggingCuid(null);
      setHoverDate(null);
      setHoverCandidateCuid(null);
      setItem(null);
      setItemType(null);
    },
    canDrag: () => {
      const isSameProject = !projectCuid || projectCuid === project?.cuid;
      const futureRoster = startTime.isAfter(dayjs());

      return isSameProject && futureRoster && !status && !leave;
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
      canDrag: !!monitor.canDrag(),
    }),
  });

  useEffect(() => {
    if (!canDrag) return;

    if (isDragging) {
      setDraggingCuid(rosterCuid || null);
      return;
    }
  }, [isDragging, rosterCuid, setDraggingCuid, canDrag]);

  return (
    <span ref={drag}>
      <RosterDisplay
        data={{
          shiftCuid,
          rosterCuid,
          projectCuid,
          startTime,
          endTime,
          type,
          status,
          leave,
          state,
          isPartial,
          originalStartTime,
          originalEndTime,
          clientHolderCuids,
          clockInTime,
          clockOutTime,
          breakDuration,
        }}
        draggable={canDrag}
        opacity={draggingCuid === rosterCuid ? 0.5 : 1}
      />
    </span>
  );
}
