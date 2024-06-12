import { useDrop } from "react-dnd";
import axios from "axios";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { useState } from "react";
import { Dayjs } from "dayjs";
import { DraggableChipProps } from "../../../types";
import Square from "./Square";
import { Roster } from "../../../types/common";

export default function DayBin({
  date,
  candidateCuid,
  currentRoster,
  disabled,
  updateRosterData,
}: {
  date: Dayjs;
  candidateCuid: string;
  currentRoster: Roster[];
  disabled: boolean;
  updateRosterData: () => void;
}) {
  const { project } = useProjectContext();
  const [didDrop, setDidDrop] = useState(false);

  const [{ isOver, canDrop, item }, drop] = useDrop({
    accept: "shift",
    canDrop: (item) => {
      if (disabled) return false;

      const itemStartTime = date
        .set("hour", item.startTime.hour())
        .set("minute", item.startTime.minute());
      let itemEndTime = date
        .set("hour", item.endTime.hour())
        .set("minute", item.endTime.minute());

      if (itemStartTime.isAfter(itemEndTime)) {
        itemEndTime = itemEndTime.add(1, "day");
      }

      return currentRoster.every(
        (roster) =>
          !(
            itemStartTime.isBetween(roster.startTime, roster.endTime) ||
            itemEndTime.isBetween(roster.startTime, roster.endTime) ||
            (itemStartTime.isSame(roster.startTime) &&
              itemEndTime.isSame(roster.endTime))
          ),
      );
    },
    drop: (item: DraggableChipProps) => {
      setDidDrop(true);
      axios
        .post(`/api/admin/project/${project?.cuid}/roster`, {
          candidateCuid,
          newShifts: [
            {
              type: item.type,
              shiftDate: date.toISOString(),
              shiftCuid: item.cuid,
            },
          ],
        })
        .then(() => updateRosterData())
        .finally(() => setDidDrop(false));
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
      item: monitor.getItem(),
    }),
  });

  return (
    <div ref={drop}>
      <Square
        disabled={disabled}
        didDrop={didDrop}
        isOver={isOver}
        canDrop={canDrop}
        date={date}
        roster={currentRoster}
        item={item}
        updateRosterData={updateRosterData}
      />
    </div>
  );
}
