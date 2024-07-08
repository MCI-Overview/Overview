import axios from "axios";
import toast from "react-hot-toast";

import NewDeleteBin from "./DeleteBin";
import ShiftDisplay from "./ShiftDisplay";
import CreateShiftModal from "./CreateShiftModal";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { useRosterContext } from "../../../providers/rosterContextProvider";

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Sheet,
  Typography,
} from "@mui/joy";

import {
  CopyAllRounded as CopyAllIcon,
  ClearRounded as ClearIcon,
  DeleteForeverRounded as DeleteForeverIcon,
} from "@mui/icons-material";

export default function RosterSidebar() {
  const { project } = useProjectContext();
  const { dateRangeStart, dateRangeEnd, updateRosterData } = useRosterContext();

  return (
    <Sheet
      className="Sidebar"
      sx={{
        height: "100dvh",
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

      <ShiftDisplay />
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
            <ListItemButton>
              <DeleteForeverIcon />
              Remove Unused Shifts
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton
              onClick={() => {
                axios
                  .post(`/api/admin/project/${project?.cuid}/roster/clear`, {
                    endDate: dateRangeEnd?.toISOString(),
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
              Clear all Roster
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
