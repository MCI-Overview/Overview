import { useState } from "react";

import RosterChip from "./DraggableRosterChip";
import { useProjectContext } from "../../../providers/projectContextProvider";

import { Stack, ToggleButtonGroup, Button, Table } from "@mui/joy";
import {
  HourglassFullRounded as HourglassIcon,
  HourglassTopRounded as HourglassTopIcon,
  HourglassBottomRounded as HourglassBottomIcon,
} from "@mui/icons-material";

export default function ShiftDisplay() {
  const { project } = useProjectContext();
  const [filterState, setFilterState] = useState<
    "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF"
  >("FULL_DAY");
  return (
    <Stack
      spacing={2}
      sx={{
        placeItems: "center",
      }}
    >
      <ToggleButtonGroup
        aria-label="outlined button group"
        value={filterState}
        onChange={(_e, value) =>
          setFilterState(value as "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF")
        }
      >
        <Button value="FULL_DAY">
          <HourglassIcon />
        </Button>
        <Button value="FIRST_HALF">
          <HourglassTopIcon />
        </Button>
        <Button value="SECOND_HALF">
          <HourglassBottomIcon />
        </Button>
      </ToggleButtonGroup>
      <Table>
        <Stack
          gap={1}
          sx={{
            placeItems: "center",
          }}
        >
          {project?.shifts
            .sort((a, b) => (a.startTime.isBefore(b.startTime) ? -1 : 1))
            .flatMap((shift) => {
              if (shift.halfDayStartTime && shift.halfDayEndTime) {
                return [
                  {
                    ...shift,
                    type: "FULL_DAY",
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                  },
                  {
                    ...shift,
                    type: "FIRST_HALF",
                    startTime: shift.startTime,
                    endTime: shift.halfDayEndTime,
                  },
                  {
                    ...shift,
                    type: "SECOND_HALF",
                    startTime: shift.halfDayStartTime,
                    endTime: shift.endTime,
                  },
                ];
              }

              return {
                ...shift,
                type: "FULL_DAY",
                startTime: shift.startTime,
                endTime: shift.endTime,
              };
            })
            .filter((shift) => shift.type === filterState)
            .sort((a, b) => (a.startTime.isBefore(b.startTime) ? -1 : 1))
            .map((shift) => (
              <RosterChip
                type={shift.type as "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF"}
                cuid={shift.cuid}
                startTime={shift.startTime}
                endTime={shift.endTime}
              />
            ))}
        </Stack>
      </Table>
    </Stack>
  );
}
