import dayjs from "dayjs";
import { useDrag } from "react-dnd";

import {
  useRosterDraggingContext,
  useRosterItemContext,
} from "../../../providers/rosterContextProvider";

import RosterDisplay from "./RosterDisplay";

export type DraggableRosterChipProps = {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  shiftCuid: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  breakDuration: number;
};

export default function DraggableRosterChip({
  type,
  shiftCuid,
  startTime,
  endTime,
  breakDuration,
}: DraggableRosterChipProps) {
  const { setHoverDate, setHoverCandidateCuid } = useRosterDraggingContext();
  const { setItem, setItemType } = useRosterItemContext();

  const [{ isDragging }, drag] = useDrag({
    type: "shift",
    item: () => {
      const item = {
        type,
        shiftCuid,
        startTime,
        endTime,
        breakDuration,
      };

      setItem(item);
      setItemType("shift");

      return item;
    },
    end: () => {
      setItem(null);
      setItemType(null);
      setHoverDate(null);
      setHoverCandidateCuid(null);
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <span ref={drag}>
      <RosterDisplay
        data={{
          breakDuration,
          isPartial: false,
          type,
          shiftCuid,
          startTime,
          originalStartTime: startTime,
          originalEndTime: endTime,
          endTime,
        }}
        draggable
        opacity={isDragging ? 0.5 : 1}
      />
    </span>
  );
}
