import { DragPreviewImage, useDrag } from "react-dnd";
import RosterDisplay from "./RosterDisplay";
import { useProjectContext } from "../../../providers/projectContextProvider";
import dayjs from "dayjs";
import { useRosterContext } from "../../../providers/rosterContextProvider";
import { useEffect } from "react";

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
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF" | "OVERLAP";
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
  type,
  state,
  status,
  leave,
}: DraggableRosterProps) {
  const { project } = useProjectContext();
  const { setDraggingCuid, draggingCuid } = useRosterContext();

  const [{ isDragging, canDrag }, drag, preview] = useDrag({
    type: "roster",
    item: {
      shiftCuid,
      rosterCuid,
      projectCuid,
      candidateCuid,
      startTime,
      endTime,
      originalStartTime,
      originalEndTime,
      type,
      state,
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

    setDraggingCuid(null);
  }, [isDragging, rosterCuid, setDraggingCuid, canDrag]);

  return (
    <>
      <DragPreviewImage
        connect={preview}
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
      />
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
            originalStartTime,
            originalEndTime,
          }}
          draggable={canDrag}
          opacity={draggingCuid === rosterCuid ? 0.5 : 1}
        />
      </span>
    </>
  );
}
