import dayjs from "dayjs";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { correctTimes } from "../../utils/date-time";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import AttendanceStatusChip from "../../components/project/attendance/AttendanceStatusChip";

import { Table, Sheet } from "@mui/joy";

interface AttendanceHistoryProps {
  data: CustomAttendance[] | null;
}

const AttendanceHistory = ({ data }: AttendanceHistoryProps) => {
  return (
    <Sheet
      variant="outlined"
      sx={{
        display: { xs: "none", sm: "initial" },
        width: "100%",
        borderRadius: "sm",
        flexShrink: 1,
        overflow: "auto",
        minHeight: 0,
      }}
    >
      <Table
        aria-labelledby="tableTitle"
        stickyHeader
        hoverRow
        sx={{
          "--TableCell-headBackground": "var(--joy-palette-background-level1)",
          "--Table-headerUnderlineThickness": "1px",
          "--TableRow-hoverBackground": "var(--joy-palette-background-level1)",
          "--TableCell-paddingY": "4px",
          "--TableCell-paddingX": "8px",
          "& tr > *": { textAlign: "center" },
        }}
      >
        <thead>
          <tr>
            <ThTypo>Project</ThTypo>
            <ThTypo>Type</ThTypo>
            <ThTypo>Date</ThTypo>
            <ThTypo>Start</ThTypo>
            <ThTypo>End</ThTypo>
            <ThTypo>Clock In</ThTypo>
            <ThTypo>Clock Out</ThTypo>
            <ThTypo>Status</ThTypo>
          </tr>
        </thead>
        {data && (
          <tbody>
            {data.length === 0 ? (
              <tr>
                <TdTypo colSpan={8}>No attendance history found</TdTypo>
              </tr>
            ) : (
              data.map((att: CustomAttendance) => {
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
                  <tr key={att.cuid}>
                    <TdTypo>{att.Shift.Project.name}</TdTypo>
                    <TdTypo>{readableEnum(att.shiftType)}</TdTypo>
                    <TdTypo>{dayjs(att.shiftDate).format("DD/MM/YYYY")}</TdTypo>
                    <TdTypo>{correctStart.format("HH:mm")}</TdTypo>
                    <TdTypo>{correctEnd.format("HH:mm")}</TdTypo>
                    <TdTypo>
                      {att.clockInTime
                        ? dayjs(att.clockInTime).format("HH:mm")
                        : "-"}
                    </TdTypo>
                    <TdTypo>
                      {att.clockOutTime
                        ? dayjs(att.clockOutTime).format("HH:mm")
                        : "-"}
                    </TdTypo>
                    <TdTypo>
                      <AttendanceStatusChip status={att.status} />
                    </TdTypo>
                  </tr>
                );
              })
            )}
          </tbody>
        )}
      </Table>
    </Sheet>
  );
};

export default AttendanceHistory;
