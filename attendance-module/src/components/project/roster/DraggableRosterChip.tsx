import dayjs from "dayjs";
import { useDrag } from "react-dnd";

import { useRosterTableContext } from "../../../providers/rosterContextProvider";

import RosterDisplay from "./RosterDisplay";

export type DraggableRosterChipProps = {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  shiftCuid: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
};

export default function DraggableRosterChip({
  type,
  shiftCuid,
  startTime,
  endTime,
}: DraggableRosterChipProps) {
  const { setHoverDate, setCandidateHoverCuid, setItem, setItemType } =
    useRosterTableContext();
  const [{ isDragging }, drag] = useDrag({
    type: "shift",
    item: () => {
      const item = {
        type,
        shiftCuid,
        startTime,
        endTime,
      };

      setItem(item);
      setItemType("shift");

      return item;
    },
    end: () => {
      setItem(null);
      setItemType(null);
      setHoverDate(null);
      setCandidateHoverCuid(null);
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <span ref={drag}>
      <RosterDisplay
        data={{
          isPartial: false,
          type,
          shiftCuid,
          startTime,
          originalStartTime: startTime,
          originalEndTime: endTime,
          endTime,
          displayType: "ROSTER",
        }}
        draggable
        opacity={isDragging ? 0.5 : 1}
      />
    </span>
  );
}
