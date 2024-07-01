import { Chip } from "@mui/joy";
import { useDrag } from "react-dnd";
import { Dayjs } from "dayjs";
import { DraggableChipProps } from "../../../types";

import {
  HourglassFullRounded as HourglassFullIcon,
  HourglassTopRounded as HourglassTopIcon,
  HourglassBottomRounded as HourglassBottomIcon,
} from "@mui/icons-material";

export type Shift = {
  cuid: string;
  startTime: Dayjs;
  endTime: Dayjs;
};

function getPrefix(type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF") {
  switch (type) {
    case "FULL_DAY":
      return <HourglassFullIcon />;
    case "FIRST_HALF":
      return <HourglassTopIcon />;
    case "SECOND_HALF":
      return <HourglassBottomIcon />;
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
      size="sm"
      startDecorator={getPrefix(type)}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {`${startTime.format("HHmm")} - ${endTime.format("HHmm")}`}
    </Chip>
  );
}
