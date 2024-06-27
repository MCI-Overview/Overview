import dayjs from "dayjs";
import { CustomRequest } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { useRequestContext } from "../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";

import { Chip, Table, Sheet, Typography, ColorPaletteProp } from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
  HourglassEmptyRounded as HourglassEmptyIcon,
} from "@mui/icons-material";

// TODO: Add editing of requests
const CurrentRequests = () => {
  const { requests, updateRequest } = useRequestContext();
  if (!requests) return null;

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
            <ThTypo>Submitted at</ThTypo>
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
                <Typography level="body-xs">No requests found</Typography>
              </td>
            </tr>
          ) : (
            requests.map((req: CustomRequest) => (
              <tr key={req.cuid}>
                <TdTypo>
                  {dayjs(req.createdAt).format("DD/MM/YYYY HH:MM")}
                </TdTypo>
                <TdTypo>{req.Assign.Project && req.Assign.Project.name}</TdTypo>
                <TdTypo>{readableEnum(req.type)}</TdTypo>
                <td>
                  <Chip
                    variant="soft"
                    size="sm"
                    startDecorator={
                      {
                        APPROVED: <CheckIcon />,
                        CANCELLED: <ClearIcon />,
                        REJECTED: <BlockIcon />,
                        PENDING: <HourglassEmptyIcon />,
                      }[req.status || "UPCOMING"]
                    }
                    color={
                      {
                        APPROVED: "success",
                        CANCELLED: "neutral",
                        REJECTED: "danger",
                        PENDING: "warning",
                      }[req.status || "UPCOMING"] as ColorPaletteProp
                    }
                  >
                    {readableEnum(req.status || "UPCOMING")}
                  </Chip>
                </td>
                <td>
                  <ViewDetailsModal
                    request={req}
                    updateRequest={updateRequest}
                    type="USER"
                    variant="DESKTOP"
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default CurrentRequests;
