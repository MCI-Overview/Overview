import axios from "axios";
import dayjs from "dayjs";
import { CustomRequest } from "../../../types";
import { useRequestContext } from "../../../providers/requestContextProvider";
import { readableEnum } from "../../../utils/capitalize";
import { TdTypo, ThTypo } from "../ui/TableTypo";

import ViewDetailsModal from "../../common/request/ViewDetailsModal";
import LoadingRequestIconButton from "../../LoadingRequestIconButton";

import {
  Chip,
  Table,
  Sheet,
  Typography,
  ColorPaletteProp,
  Stack,
  Tooltip,
} from "@mui/joy";
import {
  PendingRounded as PendingIcon,
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
} from "@mui/icons-material";

const RequestHistory = () => {
  const { requests, updateRequest } = useRequestContext();
  if (!requests) return null;

  async function approveRequest(requestCuid: string) {
    axios
      .post(`/api/admin/request/${requestCuid}/approve`)
      .then(() => updateRequest());
  }

  async function rejectRequest(requestCuid: string) {
    axios
      .post(`/api/admin/request/${requestCuid}/reject`)
      .then(() => updateRequest());
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
            "--TableCell-headBackground":
              "var(--joy-palette-background-level1)",
            "--Table-headerUnderlineThickness": "1px",
            "--TableRow-hoverBackground":
              "var(--joy-palette-background-level1)",
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
              <ThTypo>Type</ThTypo>
              <ThTypo>Status</ThTypo>
              <ThTypo> </ThTypo>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-xs">No requests found</Typography>
                </td>
              </tr>
            ) : (
              requests.map((row: CustomRequest) => (
                <tr key={row.cuid}>
                  <TdTypo>{dayjs(row.createdAt).format("DD MMM YYYY")}</TdTypo>
                  <TdTypo>
                    {row.Assign.Candidate && row.Assign.Candidate.nric}
                  </TdTypo>
                  <TdTypo>
                    {row.Assign.Candidate && row.Assign.Candidate.name}
                  </TdTypo>
                  <TdTypo>{readableEnum(row.type)}</TdTypo>
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
                      {readableEnum(row.status || "UPCOMING")}
                    </Chip>
                  </td>
                  <td>
                    <Stack direction="row" gap={1}>
                      <ViewDetailsModal
                        data={row}
                        type="ADMIN"
                        variant="DESKTOP"
                      />
                      {row.status === "PENDING" && (
                        <>
                          <Tooltip title="Approve">
                            <LoadingRequestIconButton
                              promise={() => approveRequest(row.cuid)}
                              icon={<CheckIcon />}
                              color="success"
                            />
                          </Tooltip>
                          <Tooltip title="Reject">
                            <LoadingRequestIconButton
                              promise={() => rejectRequest(row.cuid)}
                              icon={<BlockIcon />}
                              color="danger"
                            />
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>
    </>
  );
};

export default RequestHistory;
