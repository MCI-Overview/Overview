import {
  Chip,
  Table,
  Sheet,
  Typography,
  ColorPaletteProp,
  Stack,
} from "@mui/joy";
import {
  PendingRounded as PendingIcon,
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
} from "@mui/icons-material";
import { CustomRequest } from "../../../types";
import dayjs from "dayjs";
import axios from "axios";
import ViewDetailsModal from "../../common/request/ViewDetailsModal";
import LoadingRequestIconButton from "../../LoadingRequestIconButton";

interface RequestHistoryProps {
  data: CustomRequest[] | null;
  getCurrentRequests: () => void;
}

const RequestHistory = ({ data, getCurrentRequests }: RequestHistoryProps) => {
  async function approveRequest(requestCuid: string) {
    axios
      .post(`/api/admin/request/${requestCuid}/approve`)
      .then(() => getCurrentRequests());
  }

  async function rejectRequest(requestCuid: string) {
    axios
      .post(`/api/admin/request/${requestCuid}/reject`)
      .then(() => getCurrentRequests());
  }

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
              <th style={{ width: 100, padding: "12px 6px" }}>Date</th>
              <th style={{ width: 140, padding: "12px 6px" }}>Name</th>
              <th style={{ width: 100, padding: "12px 6px" }}>Type</th>
              <th style={{ width: 100, padding: "12px 6px" }}>Status</th>
              <th style={{ width: 100, padding: "12px 6px" }} />
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
                      {row.Assign.Candidate && row.Assign.Candidate.name}
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
                          CANCELLED: <ClearIcon />,
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
                      {row.status || "UPCOMING"}
                    </Chip>
                  </td>
                  <td>
                    <Stack direction="row" gap={1}>
                      <ViewDetailsModal data={row} />
                      {row.status === "PENDING" && (
                        <>
                          <LoadingRequestIconButton
                            promise={() => approveRequest(row.cuid)}
                            icon={<CheckIcon />}
                            color="success"
                          />
                          <LoadingRequestIconButton
                            promise={() => rejectRequest(row.cuid)}
                            icon={<BlockIcon />}
                            color="danger"
                          />
                        </>
                      )}
                    </Stack>
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
