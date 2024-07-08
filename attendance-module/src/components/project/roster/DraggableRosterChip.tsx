import { DragPreviewImage, useDrag } from "react-dnd";
import dayjs from "dayjs";

import RosterDisplay from "./RosterDisplay";

export type RosterChipProps = {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  cuid: string;
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
};

export default function RosterChip({
  type,
  cuid,
  startTime,
  endTime,
}: RosterChipProps) {
  const [{ isDragging }, drag, preview] = useDrag({
    type: "shift",
    item: { type, cuid, startTime, endTime },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <>
      <DragPreviewImage
        connect={preview}
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
      />
      <span ref={drag}>
        <RosterDisplay
          data={{
            type,
            shiftCuid: cuid,
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
    </>
  );
}
