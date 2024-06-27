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

const RequestHistory = () => {
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
            requests.map((row: CustomRequest) => (
              <tr key={row.cuid}>
                <TdTypo>{dayjs(row.createdAt).format("DD/MM/YY HH:MM")}</TdTypo>
                <TdTypo>{row.Assign.Project && row.Assign.Project.name}</TdTypo>
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
                        PENDING: <HourglassEmptyIcon />,
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
                  <ViewDetailsModal
                    request={row}
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

export default RequestHistory;
