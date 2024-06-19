import { FC, Fragment, useState } from "react";
import { ColorPaletteProp } from "@mui/joy/styles";
import Chip from "@mui/joy/Chip";
import Link from "@mui/joy/Link";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import dayjs from "dayjs";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import BlockIcon from "@mui/icons-material/Block";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import { CustomAttendance } from "../../../types";

type Order = "asc" | "desc";

type Props = {
  data: CustomAttendance[];
};

const UpcomingShifts: FC<Props> = ({ data }) => {
  const attendanceData = data;
  const [order, setOrder] = useState<Order>("desc");

  return (
    <>
      <Fragment>
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
                <th style={{ width: 120, padding: "12px 6px" }}>
                  <Link
                    underline="none"
                    color="primary"
                    component="button"
                    onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                    fontWeight="lg"
                    endDecorator={<ArrowDropDownIcon />}
                    sx={{
                      "& svg": {
                        transition: "0.2s",
                        transform:
                          order === "desc" ? "rotate(0deg)" : "rotate(180deg)",
                      },
                    }}
                  >
                    Date
                  </Link>
                </th>
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
                            NO_SHOW: <AutorenewRoundedIcon />,
                            MEDICAL: <BlockIcon />,
                            UPCOMING: <CheckRoundedIcon />,
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
                    <td></td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Sheet>
      </Fragment>
    </>
  );
};

export default UpcomingShifts;
