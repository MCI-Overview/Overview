import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
} from "@mui/joy";
import AttendanceStatusChip from "../../components/project/attendance/AttendanceStatusChip";

interface AttendanceHistoryMProps {
  data: CustomAttendance[];
}

const AttendanceHistoryM = ({ data }: AttendanceHistoryMProps) => {
  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {data.length === 0 ? (
        <Typography level="body-xs" sx={{ py: 2, textAlign: "center" }}>
          No attendance history found
        </Typography>
      ) : (
        <List
          size="sm"
          sx={{
            "--ListItem-paddingX": 0,
          }}
        >
          {data.map((att: CustomAttendance) => (
            <Fragment key={att.cuid}>
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
                      {dayjs(att.shiftDate).format("DD/MM/YYYY")}
                    </Typography>
                    <Typography level="body-xs" gutterBottom>
                      {dayjs(att.Shift.startTime).format("HH:mm")} to{" "}
                      {dayjs(att.Shift.endTime).format("HH:mm")}
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
                      <Typography level="body-xs">
                        {att.Shift.Project.name}
                      </Typography>
                      <Typography level="body-xs">&bull;</Typography>
                      <Typography level="body-xs">
                        {readableEnum(att.shiftType)}
                      </Typography>
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

export default AttendanceHistoryM;
