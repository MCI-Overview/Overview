import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomAdminAttendance } from "../../../types";

import AttendanceStatusChip from "./AttendanceStatusChip";

import {
  Box,
  Dropdown,
  IconButton,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
} from "@mui/joy";
import { MoreHorizRounded as MoreHorizIcon } from "@mui/icons-material";

function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
      >
        <MoreHorizIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit?</MenuItem>
      </Menu>
    </Dropdown>
  );
}

type AdminProjectAttendanceListProps = {
  data: CustomAdminAttendance[];
};

const AdminProjectAttendanceList = ({
  data,
}: AdminProjectAttendanceListProps) => {
  const attendanceData = data;

  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {attendanceData.length == 0 ? (
        <Typography
          level="body-xs"
          sx={{ display: "flex", justifyContent: "center", py: 2 }}
        >
          No candidates found
        </Typography>
      ) : (
        <List
          size="sm"
          sx={{
            "--ListItem-paddingX": 0,
          }}
        >
          {attendanceData.map((att: CustomAdminAttendance) => (
            <Fragment key={att.attendanceCuid}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <ListItemContent
                  sx={{ display: "flex", gap: 2, alignItems: "start" }}
                >
                  <Box>
                    <Typography fontWeight={600} gutterBottom>
                      {dayjs(att.date).format("DD MMM YYYY")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 0.5,
                        mb: 1,
                      }}
                    >
                      <Typography level="body-md">{att.name}</Typography>
                      <Typography level="body-md">&bull;</Typography>
                      <Typography level="body-md">{att.nric}</Typography>
                    </Box>
                    <Typography level="body-xs">Shift</Typography>
                    <Typography level="body-md" gutterBottom>
                      {att.shiftStart.format("HH:mm")} -{" "}
                      {att.shiftEnd.format("HH:mm")}
                    </Typography>
                    <Typography level="body-xs">Clock in / out</Typography>
                    <Typography level="body-md" gutterBottom>
                      {att.rawStart ? att.rawStart.format("HH:mm") : "N/A"} -{" "}
                      {att.rawEnd ? att.rawEnd.format("HH:mm") : "N/A"}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <RowMenu />
                    </Box>
                  </Box>
                </ListItemContent>
                <AttendanceStatusChip status={att.status} />
              </ListItem>
              <ListDivider />
            </Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AdminProjectAttendanceList;
