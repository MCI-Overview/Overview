import { ColorPaletteProp, Chip, Table, Sheet, Typography } from "@mui/joy";
import dayjs from "dayjs";

import {
  CheckRounded as CheckIcon,
  BlockRounded as BlockIcon,
  AutorenewRounded as AutorenewIcon,
} from "@mui/icons-material";

import { CustomAttendance } from "../../../types";

interface UpcomingShiftsProps {
  data: CustomAttendance[] | null;
}

const UpcomingShifts = ({ data }: UpcomingShiftsProps) => {
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
                          NO_SHOW: <AutorenewIcon />,
                          MEDICAL: <BlockIcon />,
                          UPCOMING: <CheckIcon />,
                        }[row.status || "UPCOMING"]
                      }
                      color={
                        {
                          PRESENT: "success",
                          NO_SHOW: "neutral",
                          MEDICAL: "danger",
                          UPCOMING: "success",
                        }[row.status || "UPCOMING"] as ColorPaletteProp
                      }
                    >
                      {row.status || "UPCOMING"}
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
                    No upcoming shifts found
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

export default UpcomingShifts;
