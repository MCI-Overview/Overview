import dayjs from "dayjs";
import { CustomAdminAttendance } from "../../../types";
import { TdTypo, ThTypo } from "../ui/TableTypo";

import AttendanceStatusChip from "./AttendanceStatusChip";

import {
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Sheet,
  Table,
} from "@mui/joy";
import { MoreHorizRounded as MoreHorizIcon } from "@mui/icons-material";

type Props = {
  data: CustomAdminAttendance[];
};

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
        <MenuItem>Edit</MenuItem>
      </Menu>
    </Dropdown>
  );
}

const AdminProjectAttendanceTable: React.FC<Props> = ({ data }) => {
  const attendanceData = data;

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
            <ThTypo>Nric</ThTypo>
            <ThTypo>Name</ThTypo>
            <ThTypo>Status</ThTypo>
            <ThTypo>Start Time</ThTypo>
            <ThTypo>End Time</ThTypo>
            <ThTypo>Clock In</ThTypo>
            <ThTypo>Clock Out</ThTypo>
            <ThTypo> </ThTypo>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length === 0 ? (
            <tr>
              <TdTypo colSpan={9}>No candidates found</TdTypo>
            </tr>
          ) : (
            attendanceData.map((att: CustomAdminAttendance) => (
              <tr key={att.attendanceCuid}>
                <TdTypo>{dayjs(att.date).format("DD/MM/YYYY")}</TdTypo>
                <TdTypo>{att.nric}</TdTypo>
                <TdTypo>{att.name}</TdTypo>
                <td style={{ overflow: "clip" }}>
                  <AttendanceStatusChip status={att.status} />
                </td>
                <TdTypo>{dayjs(att.shiftStart).format("HH:mm")}</TdTypo>
                <TdTypo>{dayjs(att.shiftEnd).format("HH:mm")}</TdTypo>
                <TdTypo>
                  {att.rawStart ? dayjs(att.rawStart).format("HH:mm") : "-"}
                </TdTypo>
                <TdTypo>
                  {att.rawEnd ? dayjs(att.rawEnd).format("HH:mm") : "-"}
                </TdTypo>
                <td>
                  <RowMenu />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default AdminProjectAttendanceTable;
