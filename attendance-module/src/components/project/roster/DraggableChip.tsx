import { Chip } from "@mui/joy";
import { useDrag } from "react-dnd";
import { Dayjs } from "dayjs";
import { DraggableChipProps } from "../../../types";

export type Shift = {
  cuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
};

function getPrefix(type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF") {
  switch (type) {
    case "FULL_DAY":
      return "Full:";
    case "FIRST_HALF":
      return "AM:";
    case "SECOND_HALF":
      return "PM:";
  }
}

export default function DraggableChip({
  type,
  cuid,
  startTime,
  endTime,
}: DraggableChipProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "shift",
    item: { type, cuid, startTime, endTime },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Chip
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {`${getPrefix(type)} ${startTime.format("HHmm")} - ${endTime.format(
        "HHmm"
      )}`}
    </Chip>
  );
}
