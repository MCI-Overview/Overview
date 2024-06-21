import dayjs from "dayjs";
import { CustomAdminAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import {
  Box,
  Chip,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  Sheet,
  Table,
} from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesRounded as MedicalServicesIcon,
  MoreHorizRounded as MoreHorizIcon,
} from "@mui/icons-material";
import { ColorPaletteProp } from "@mui/joy/styles";

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

const ProjectAttendance: React.FC<Props> = ({ data }) => {
  const attendanceData = data;
  console.log(data);

  return (
    <Sheet
      className="OrderTableContainer"
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
            <ThTypo>Shift Start</ThTypo>
            <ThTypo>Shift End</ThTypo>
            <ThTypo>Clock In</ThTypo>
            <ThTypo>Clock Out</ThTypo>
            <ThTypo> </ThTypo>
          </tr>
        </thead>
        <tbody>
          {attendanceData.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: "center" }}>
                No candidates found.
              </td>
            </tr>
          ) : (
            attendanceData.map((row: CustomAdminAttendance) => (
              <tr key={row.attendanceCuid}>
                <TdTypo>{dayjs(row.date).format("DD MMM YYYY")}</TdTypo>
                <TdTypo>{row.nric}</TdTypo>
                <TdTypo>{row.name}</TdTypo>
                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={
                      {
                        ON_TIME: <CheckIcon />,
                        LATE: <QueryBuilderIcon />,
                        NO_SHOW: <BlockIcon />,
                        MEDICAL: <MedicalServicesIcon />,
                      }[row.status || "NO_SHOW"]
                    }
                    color={
                      {
                        ON_TIME: "success",
                        LATE: "warning",
                        NO_SHOW: "danger",
                        MEDICAL: "neutral",
                      }[row.status || "NO_SHOW"] as ColorPaletteProp
                    }
                  >
                    {readableEnum(row.status || "NO_SHOW")}
                  </Chip>
                </td>
                <TdTypo>
                  {row.shiftStart
                    ? dayjs(row.shiftStart).format("hh:mm a")
                    : "-"}
                </TdTypo>
                <TdTypo>
                  {row.shiftEnd ? dayjs(row.shiftEnd).format("hh:mm a") : "-"}
                </TdTypo>
                <TdTypo>
                  {row.rawStart ? dayjs(row.rawStart).format("hh:mm a") : "-"}
                </TdTypo>
                <TdTypo>
                  {row.rawEnd ? dayjs(row.rawEnd).format("hh:mm a") : "-"}
                </TdTypo>
                <td>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <RowMenu />
                  </Box>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default ProjectAttendance;
