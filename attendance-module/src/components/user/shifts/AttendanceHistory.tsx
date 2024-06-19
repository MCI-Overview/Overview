import { ColorPaletteProp } from "@mui/joy/styles";
import Chip from "@mui/joy/Chip";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import dayjs from "dayjs";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import BlockIcon from "@mui/icons-material/Block";
import { CustomAttendance } from "../../../types";
import { FC } from "react";

type Props = {
  data: CustomAttendance[];
};

const AttendanceHistory: FC<Props> = ({ data }) => {
  const attendanceData = data;

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
            {attendanceData &&
              attendanceData.map((row: CustomAttendance) => (
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
                          PRESENT: <CheckRoundedIcon />,
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
          </tbody>
        </Table>
      </Sheet>
    </>
  );
};

export default AttendanceHistory;
