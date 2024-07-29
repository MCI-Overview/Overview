import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { correctTimes } from "../../utils/date-time";

import AttendanceStatusChip from "../../components/project/attendance/AttendanceStatusChip";

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
} from "@mui/joy";

interface AttendanceHistoryMProps {
  data: CustomAttendance[] | null;
}

const AttendanceHistoryM = ({ data }: AttendanceHistoryMProps) => {
  if (!data) return null;

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
          {data.map((att: CustomAttendance) => {
            const { correctStart, correctEnd } = correctTimes(
              dayjs(att.shiftDate),
              dayjs(
                att.shiftType === "SECOND_HALF"
                  ? att.Shift.halfDayStartTime
                  : att.Shift.startTime
              ),
              dayjs(
                att.shiftType === "FIRST_HALF"
                  ? att.Shift.halfDayEndTime
                  : att.Shift.endTime
              )
            );

            return (
              <Fragment key={att.cuid}>
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <ListItemContent>
                    <Typography fontWeight={600}>
                      {dayjs(att.shiftDate).format("DD/MM/YYYY")}
                    </Typography>
                    <Typography level="body-xs">
                      {att.Shift.Project.name}
                    </Typography>
                    <Typography level="body-xs">
                      {"Shift Type: "}
                      {readableEnum(att.shiftType)}
                    </Typography>
                    <Typography level="body-xs">
                      {"Shift Time: "}
                      {correctStart.format("HH:mm")} to{" "}
                      {correctEnd.format("HH:mm")}
                    </Typography>
                    <Typography level="body-xs">
                      {"Clocked In: "}
                      {dayjs(att.clockInTime).isValid()
                        ? dayjs(att.clockInTime).format("HH:mm")
                        : "NIL"}{" "}
                      to{" "}
                      {dayjs(att.clockOutTime).isValid()
                        ? dayjs(att.clockOutTime).format("HH:mm")
                        : "NIL"}
                    </Typography>
                  </ListItemContent>

                  <AttendanceStatusChip leave={att.leave} status={att.status} />
                </ListItem>

                <ListDivider />
              </Fragment>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default AttendanceHistoryM;
