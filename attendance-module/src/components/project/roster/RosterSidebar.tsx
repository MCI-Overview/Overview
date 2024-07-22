import axios from "axios";
import toast from "react-hot-toast";

import NewDeleteBin from "./DeleteBin";
import CreateShiftModal from "./CreateShiftModal";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { useRosterContext } from "../../../providers/rosterContextProvider";

import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Sheet,
  Table,
  ToggleButtonGroup,
  Typography,
} from "@mui/joy";

import {
  CopyAllRounded as CopyAllIcon,
  ClearRounded as ClearIcon,
  DeleteForeverRounded as DeleteForeverIcon,
  HourglassFullRounded as HourglassIcon,
  HourglassTopRounded as HourglassTopIcon,
  HourglassBottomRounded as HourglassBottomIcon,
} from "@mui/icons-material";
import { useState } from "react";
import DraggableRosterChip from "./DraggableRosterChip";

export default function RosterSidebar() {
  const { project, updateProject } = useProjectContext();
  const { dateRangeStart, dateRangeEnd, updateRosterData, selectedCandidates } =
    useRosterContext();
  const [filterState, setFilterState] = useState<
    "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF"
  >("FULL_DAY");

  return (
    <Sheet
      className="Sidebar"
      sx={{
        height: "100dvh",
        overflow: "auto",
        width: "14rem",
        top: 0,
        py: 2,
        pr: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography level="title-lg">Shifts</Typography>
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
      <div
        style={{
          height: "100%",
          overflow: "auto",
        }}
      >
        <Table borderAxis="none">
          <tbody>
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
                <tr>
                  <td>
                    <DraggableRosterChip
                      type={
                        shift.type as "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF"
                      }
                      shiftCuid={shift.cuid}
                      startTime={shift.startTime}
                      endTime={shift.endTime}
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
      <Box sx={{ mt: "auto", flexGrow: 0, mb: 2 }}>
        <Divider />
        <List
          size="sm"
          sx={{
            "--ListItem-radius": (theme) => theme.vars.radius.sm,
            "--List-gap": "8px",
          }}
        >
          <ListItem>
            <CreateShiftModal />
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                axios
                  .post(`/api/admin/project/${project?.cuid}/roster/copy`, {
                    candidateCuids: selectedCandidates,
                    startDate: dateRangeStart?.toISOString(),
                    endDate: dateRangeEnd?.toISOString(),
                  })
                  .then(() => {
                    toast.success("Successfully copied roster to next week.");
                  })
                  .catch(() => {
                    toast.error("Failed to copy roster to next week.");
                  });
              }}
            >
              <CopyAllIcon />
              Copy to Next Week
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                axios
                  .post(`/api/admin/project/${project?.cuid}/shifts/archive`, {
                    startDate: dateRangeStart?.toISOString(),
                  })
                  .then(() => {
                    toast.success("Successfully removed unused shifts.");
                    updateProject();
                  })
                  .catch(() => {
                    toast.error("Failed to remove unused shifts.");
                  });
              }}
            >
              <DeleteForeverIcon />
              Remove Unused Shifts
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                axios
                  .post(`/api/admin/project/${project?.cuid}/roster/clear`, {
                    startDate: dateRangeStart?.toISOString(),
                  })
                  .then(() => {
                    toast.success("Successfully cleared this weeks's roster.");
                    updateRosterData();
                  })
                  .catch(() => {
                    toast.error("Failed to clear this week's roster.");
                  });
              }}
            >
              <ClearIcon />
              Clear Roster
            </ListItemButton>
          </ListItem>
          <ListItem>
            <NewDeleteBin />
          </ListItem>
        </List>
      </Box>
    </Sheet>
  );
}
