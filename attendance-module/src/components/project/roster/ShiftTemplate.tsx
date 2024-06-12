/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Stack } from "@mui/joy";
import { useDrag } from "react-dnd";
import { DraggableChip, Shift } from "./DraggableChip";
import { useProjectContext } from "../../../providers/projectContextProvider";

export function ShiftTemplate({
  name,
  shiftCuids,
}: {
  name: string;
  shifts: string[];
}) {
  const { project } = useProjectContext();
  const shiftData = {};
  project?.shifts.forEach((shift) => {
    shiftData[shift.cuid] = shift;
  });
  const shifts = shiftCuids.map((shift) => shiftData[shift]);

  const [{ isDragging }, drag] = useDrag({
    type: "shiftTemplate",
    item: shifts,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Stack
      ref={drag}
      sx={{
        p: 2,
        border: "1px solid grey",
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    >
      {name}
      {shifts.map((data) => {
        return (
          <DraggableChip
            cuid={data.cuid}
            key={data.day}
            day={data.day}
            startTime={data.startTime}
            endTime={data.endTime}
          />
        );
      })}
    </Stack>
  );
}
