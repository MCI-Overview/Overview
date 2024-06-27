import {
  Chip,
  Card
} from "@mui/joy";
import { useDrag } from "react-dnd";
import { Dayjs } from "dayjs";
import { DraggableChipProps } from "../../../types";

export type Shift = {
  cuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
};

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
    <Card
      ref={drag}
      sx={{
        width: '200px',
        marginBottom: '15px'
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      <Chip>{type}</Chip>
      {`${startTime.format("HHmm")} - ${endTime.format(
        "HHmm"
      )}`}
    </Card>
  );
}
