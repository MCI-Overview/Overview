import axios from "axios";
import dayjs from "dayjs";
import { CustomRequest } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { useRequestContext } from "../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";
import LoadingRequestIconButton from "../../components/LoadingRequestIconButton";

import {
  Chip,
  Table,
  Sheet,
  Typography,
  ColorPaletteProp,
  Box,
  Stack,
  Tooltip,
} from "@mui/joy";
import {
  PendingRounded as PendingIcon,
  BlockRounded as BlockIcon,
  AutorenewRounded as AutorenewIcon,
  CheckRounded as CheckIcon,
} from "@mui/icons-material";

// TODO: Add editing of requests
const CurrentRequests = () => {
  const { requests, updateRequest } = useRequestContext();
  if (!requests) return null;

  async function cancelRequest(requestCuid: string) {
    axios.post("/api/user/request/cancel", { requestCuid }).then(updateRequest);
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
              <ThTypo>Project</ThTypo>
              <ThTypo>Type</ThTypo>
              <ThTypo>Status</ThTypo>
              <ThTypo> </ThTypo>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <Typography level="body-md" sx={{ textAlign: "center" }}>
                    No current request found
                  </Typography>
                </td>
              </tr>
            ) : (
              requests.map((row: CustomRequest) => (
                <tr key={row.cuid}>
                  <TdTypo>{dayjs(row.createdAt).format("DD MMM YYYY")}</TdTypo>
                  <TdTypo>
                    {row.Assign.Project && row.Assign.Project.name}
                  </TdTypo>
                  <TdTypo>{readableEnum(row.type)}</TdTypo>
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
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <td>
                        <Stack direction="row" gap={1}>
                          <ViewDetailsModal
                            data={row}
                            type="USER"
                            variant="DESKTOP"
                          />
                          {row.status === "PENDING" && (
                            <>
                              <Tooltip title="Cancel">
                                <LoadingRequestIconButton
                                  promise={() => cancelRequest(row.cuid)}
                                  icon={<BlockIcon />}
                                  color="danger"
                                />
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </td>
                    </Box>
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

export default CurrentRequests;
