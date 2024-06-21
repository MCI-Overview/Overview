import { Chip, Table, Sheet, Typography, ColorPaletteProp } from "@mui/joy";
import {
  CheckRounded as CheckIcon,
  BlockRounded as BlockIcon,
} from "@mui/icons-material";
import { CustomAttendance } from "../../types";
import dayjs from "dayjs";

interface AttendanceHistoryProps {
  data: CustomAttendance[] | null;
}

const AttendanceHistory = ({ data }: AttendanceHistoryProps) => {
  return (
    <>
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
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
            "--Table-headerUnderlineThickness": "1px",
            "--TableRow-hoverBackground":
              "var(--joy-palette-background-level1)",
            "--TableCell-paddingY": "4px",
            "--TableCell-paddingX": "8px",
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 120, padding: "12px 6px" }}>Date</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Project</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 100, padding: "12px 6px" }}>Type</th>
              <th style={{ width: 100, padding: "12px 6px" }}>Start</th>
              <th style={{ width: 100, padding: "12px 6px" }}>End</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((row: CustomAttendance) => (
                <tr key={row.cuid}>
                  <td>
                    <Typography level="body-xs">
                      {dayjs(row.shiftDate).format("DD MMM YYYY")}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {row.Shift.Project.name}
                    </Typography>
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={
                        {
                          PRESENT: <CheckIcon />,
                          NO_SHOW: <BlockIcon />,
                          MEDICAL: <BlockIcon />,
                        }[row.status || "NO_SHOW"]
                      }
                      color={
                        {
                          PRESENT: "success",
                          NO_SHOW: "danger",
                          MEDICAL: "neutral",
                        }[row.status || "NO_SHOW"] as ColorPaletteProp
                      }
                    >
                      {row.status || "NO_SHOW"}
                    </Chip>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.shiftType}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {dayjs(row.Shift?.startTime).format("hh:mm a") || "N/A"}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {dayjs(row.Shift?.endTime).format("hh:mm a") || "N/A"}
                    </Typography>
                  </td>
                </tr>
              ))}
            {data && data.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-md" sx={{ textAlign: "center" }}>
                    No attendance history found
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
    </>
  );
};

export default AttendanceHistory;
