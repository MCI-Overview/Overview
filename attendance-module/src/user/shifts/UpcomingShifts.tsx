import dayjs from "dayjs";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import { ColorPaletteProp, Chip, Table, Sheet, Typography } from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
} from "@mui/icons-material";

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
              <td colSpan={6}>
                <Typography level="body-xs" sx={{ py: 2, textAlign: "center" }}>
                  No upcoming shifts found
                </Typography>
              </td>
            </tr>
          ) : (
            data.map((row: CustomAttendance) => (
              <tr key={row.cuid}>
                <TdTypo>{dayjs(row.shiftDate).format("DD MMM YYYY")}</TdTypo>
                <TdTypo>{row.Shift.Project.name}</TdTypo>
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
                        UPCOMING: null,
                      }[row.status || "UPCOMING"]
                    }
                    color={
                      {
                        ON_TIME: "success",
                        LATE: "warning",
                        NO_SHOW: "danger",
                        MEDICAL: "neutral",
                        UPCOMING: "success",
                      }[row.status || "UPCOMING"] as ColorPaletteProp
                    }
                  >
                    {readableEnum(row.status || "UPCOMING")}
                  </Chip>
                </td>
                <TdTypo>{readableEnum(row.shiftType)}</TdTypo>
                <TdTypo>{dayjs(row.Shift.startTime).format("hh:mm a")}</TdTypo>
                <TdTypo>{dayjs(row.Shift.endTime).format("hh:mm a")}</TdTypo>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default UpcomingShifts;
