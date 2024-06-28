import dayjs from "dayjs";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import AttendanceStatusChip from "../../components/project/attendance/AttendanceStatusChip";

import { Table, Sheet } from "@mui/joy";

interface UpcomingShiftsProps {
  data: CustomAttendance[];
}

const UpcomingShifts = ({ data }: UpcomingShiftsProps) => {
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
            <ThTypo>Date</ThTypo>
            <ThTypo>Project</ThTypo>
            <ThTypo>Status</ThTypo>
            <ThTypo>Type</ThTypo>
            <ThTypo>Start</ThTypo>
            <ThTypo>End</ThTypo>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <TdTypo colSpan={6}>No shifts found</TdTypo>
            </tr>
          ) : (
            data.map((att: CustomAttendance) => (
              <tr key={att.cuid}>
                <TdTypo>{dayjs(att.shiftDate).format("DD/MM/YYYY")}</TdTypo>
                <TdTypo>{att.Shift.Project.name}</TdTypo>
                <td>
                  <AttendanceStatusChip status={att.status} />
                </td>
                <TdTypo>{readableEnum(att.shiftType)}</TdTypo>
                <TdTypo>{dayjs(att.Shift.startTime).format("HH:mm")}</TdTypo>
                <TdTypo>{dayjs(att.Shift.endTime).format("HH:mm")}</TdTypo>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default UpcomingShifts;
