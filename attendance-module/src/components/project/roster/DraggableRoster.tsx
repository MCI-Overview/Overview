import dayjs from "dayjs";
import { useEffect } from "react";
import { useDrag } from "react-dnd";

import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import RosterDisplay from "./RosterDisplay";

export type DraggableRosterProps = {
  displayType: "ATTENDANCE" | "ROSTER";
  shiftCuid: string;
  rosterCuid: string;
  projectCuid: string;
  candidateCuid: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  originalStartTime: dayjs.Dayjs;
  originalEndTime: dayjs.Dayjs;
  status: string | undefined;
  leave: string | undefined;
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  isPartial: boolean;
  state?: "PREVIEW" | "LOADING";
};

export default function DraggableRoster({
  displayType,
  shiftCuid,
  rosterCuid,
  projectCuid,
  candidateCuid,
  startTime,
  endTime,
  originalStartTime,
  originalEndTime,
  isPartial,
  type,
  state,
  status,
  leave,
}: DraggableRosterProps) {
  const { project } = useProjectContext();
  const {
    setHoverDate,
    setDraggingCuid,
    setCandidateHoverCuid,
    setItem,
    setItemType,
    draggingCuid,
  } = useRosterContext();

  const [{ isDragging, canDrag }, drag] = useDrag({
    type: "roster",
    item: () => {
      const item = {
        shiftCuid,
        rosterCuid,
        projectCuid,
        candidateCuid,
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
      setCandidateHoverCuid(null);
      setItem(null);
      setItemType(null);
    },
    canDrag: () => {
      const isSameProject = !projectCuid || projectCuid === project?.cuid;
      const futureRoster = startTime.isAfter(dayjs());

      return (
        isSameProject &&
        futureRoster &&
        !status &&
        !leave &&
        displayType === "ROSTER"
      );
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
          displayType,
          shiftCuid,
          rosterCuid,
          projectCuid,
          candidateCuid,
          startTime,
          endTime,
          type,
          status,
          leave,
          state,
          isPartial,
          originalStartTime,
          originalEndTime,
        }}
        draggable={canDrag}
        opacity={draggingCuid === rosterCuid ? 0.5 : 1}
      />
    </span>
  );
}
