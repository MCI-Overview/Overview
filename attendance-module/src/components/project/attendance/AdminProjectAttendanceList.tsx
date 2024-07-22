import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomAdminAttendance } from "../../../types";

import AttendanceStatusChip from "./AttendanceStatusChip";

import {
  Box,
  Grid,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Typography,
} from "@mui/joy";

// function RowMenu() {
//   return (
//     <Dropdown>
//       <MenuButton
//         slots={{ root: IconButton }}
//         slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
//       >
//         <MoreHorizIcon />
//       </MenuButton>
//       <Menu size="sm" sx={{ minWidth: 140 }}>
//         <MenuItem>Edit?</MenuItem>
//       </Menu>
//     </Dropdown>
//   );
// }

type AdminProjectAttendanceListProps = {
  data: CustomAdminAttendance[] | null;
};

const AdminProjectAttendanceList = ({
  data,
}: AdminProjectAttendanceListProps) => {
  if (!data) return null;

  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {data.length == 0 ? (
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
          {data.map((att: CustomAdminAttendance) => (
            <Fragment key={att.attendanceCuid}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <ListItemContent>
                  <Typography fontWeight={600} gutterBottom>
                    {dayjs(att.date).format("DD MMM YYYY")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <Typography level="body-sm">{att.name}</Typography>
                    <Typography level="body-sm">&bull;</Typography>
                    <Typography level="body-sm">{att.nric}</Typography>
                  </Box>

                  <Grid container>
                    <Grid xs={6}>
                      <Typography level="body-xs">Shift</Typography>
                      <Typography level="body-sm" gutterBottom>
                        {att.shiftStart.format("HH:mm")} -{" "}
                        {att.shiftEnd.format("HH:mm")}
                      </Typography>
                    </Grid>
                    <Grid xs={6}>
                      <Typography level="body-xs">Clock in / out</Typography>
                      <Typography level="body-sm" gutterBottom>
                        {att.rawStart ? att.rawStart.format("HH:mm") : "N/A"} -{" "}
                        {att.rawEnd ? att.rawEnd.format("HH:mm") : "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>


                </ListItemContent>
                <AttendanceStatusChip leave={att.leave} status={att.status} />
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
