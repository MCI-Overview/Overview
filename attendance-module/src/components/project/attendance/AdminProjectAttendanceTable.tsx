import { useState } from "react";
import { Dayjs } from "dayjs";
import { CustomAdminAttendance } from "../../../types";
import { TdTypo, ThTypo } from "../ui/TableTypo";
import AttendanceStatusChip from "./AttendanceStatusChip";
import {
  Sheet,
  Table,
  Dropdown,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  MenuButton
} from "@mui/joy";
import { MoreHorizRounded as MoreHorizRoundedIcon } from "@mui/icons-material";
import AdminProjectAttendanceEditModal from "./AdminProjectAttendanceEditModal";

type AdminProjectAttendanceTableProps = {
  data: CustomAdminAttendance[] | null;
};

const AdminProjectAttendanceTable = ({
  data,
}: AdminProjectAttendanceTableProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAtt, setSelectedAtt] = useState<CustomAdminAttendance | null>(null);

  const handleOpenEditModal = (att: CustomAdminAttendance) => {
    setSelectedAtt(att);
    setIsOpen(true);
  }

  function RowMenu({ att }: { att: CustomAdminAttendance }) {
    return (
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
        >
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          <MenuItem>View photo</MenuItem>
          <Divider />
          <MenuItem onClick={() => handleOpenEditModal(att)} color="danger">Edit</MenuItem>
        </Menu>
      </Dropdown>
    );
  }

  return (
    <>
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
              <ThTypo>Nric</ThTypo>
              <ThTypo>Name</ThTypo>
              <ThTypo>Date</ThTypo>
              <ThTypo>Start Time</ThTypo>
              <ThTypo>End Time</ThTypo>
              <ThTypo>Clock In</ThTypo>
              <ThTypo>Clock Out</ThTypo>
              <ThTypo>Location</ThTypo>
              <ThTypo>Status</ThTypo>
              <th></th>
            </tr>
          </thead>
          {data && (
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <TdTypo colSpan={9}>No candidates found</TdTypo>
                </tr>
              ) : (
                data.map((att: CustomAdminAttendance) => (
                  <tr key={att.attendanceCuid}>
                    <TdTypo>{att.nric}</TdTypo>
                    <TdTypo>{att.name}</TdTypo>
                    <TdTypo>{att.date.format("DD/MM/YYYY")}</TdTypo>
                    <TdTypo>{att.shiftStart.format("HH:mm")}</TdTypo>
                    <TdTypo>{att.shiftEnd.format("HH:mm")}</TdTypo>
                    <TdTypo color={getStartColor(att.rawStart, att.shiftStart)}>
                      {att.rawStart ? att.rawStart.format("HH:mm") : "-"}
                    </TdTypo>
                    <TdTypo
                      color={getEndColor(att.rawStart, att.rawEnd, att.shiftEnd)}
                    >
                      {att.rawEnd
                        ? att.rawEnd.format("HH:mm")
                        : att.rawStart
                          ? "NIL"
                          : "-"}
                    </TdTypo>
                    <TdTypo>{att.postalCode ? att.postalCode : "-"}</TdTypo>
                    <TdTypo>
                      <AttendanceStatusChip
                        leave={att.leave}
                        status={att.status}
                      />
                    </TdTypo>
                    <td>
                      <RowMenu att={att} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          )}
        </Table>
      </Sheet>
      {selectedAtt && (
        <AdminProjectAttendanceEditModal isOpen={isOpen} setIsOpen={setIsOpen} selectedAtt={selectedAtt} />
      )}
    </>
  );
};

const getStartColor = (rawStart: Dayjs | null, shiftStart: Dayjs) => {
  if (!rawStart) return undefined;

  const diff = rawStart.diff(shiftStart);
  return diff < 0 ? "success" : "warning";
};

const getEndColor = (
  rawStart: Dayjs | null,
  rawEnd: Dayjs | null,
  shiftEnd: Dayjs
) => {
  if (!rawEnd) return rawStart ? "warning" : undefined;

  const diff = rawEnd.diff(shiftEnd);
  return diff > 0 ? "success" : "warning";
};

export default AdminProjectAttendanceTable;