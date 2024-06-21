import { CustomRequest } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import dayjs from "dayjs";

import { Chip, Table, Sheet, Typography, ColorPaletteProp } from "@mui/joy";
import {
  PendingRounded as PendingIcon,
  BlockRounded as BlockIcon,
  AutorenewRounded as AutorenewIcon,
  CheckRounded as CheckIcon,
} from "@mui/icons-material";

interface RequestHistoryProps {
  data: CustomRequest[] | null;
}

const RequestHistory = ({ data }: RequestHistoryProps) => {
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
              <th style={{ width: 140, padding: "12px 6px" }}>Type</th>
              <th style={{ width: 100, padding: "12px 6px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((row: CustomRequest) => (
                <tr key={row.cuid}>
                  <td>
                    <Typography level="body-xs">
                      {dayjs(row.createdAt).format("DD MMM YYYY")}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {row.Assign.Project && row.Assign.Project.name}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.type}</Typography>
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={
                        {
                          APPROVED: <CheckIcon />,
                          CANCELLED: <AutorenewIcon />,
                          REJECTED: <BlockIcon />,
                          PENDING: <PendingIcon />,
                        }[row.status || "UPCOMING"]
                      }
                      color={
                        {
                          APPROVED: "success",
                          CANCELLED: "neutral",
                          REJECTED: "danger",
                          PENDING: "warning",
                        }[row.status || "UPCOMING"] as ColorPaletteProp
                      }
                    >
                      {readableEnum(row.status || "UPCOMING")}
                    </Chip>
                  </td>
                  <td>
                    <Typography level="body-xs">
                      {readableEnum(row.type)}
                    </Typography>
                  </td>
                </tr>
              ))}
            {data && data.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <Typography level="body-md" sx={{ textAlign: "center" }}>
                    No request history found
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

export default RequestHistory;
