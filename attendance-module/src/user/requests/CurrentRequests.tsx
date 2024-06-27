import dayjs from "dayjs";
import { CustomRequest } from "../../types";
import { useRequestContext } from "../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";

import { Table, Sheet, Typography } from "@mui/joy";
import RequestStatusChip from "../../components/project/requests/RequestStatusChip";
import RequestTypeChip from "../../components/project/requests/RequestTypeChip";

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
                  {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                </TdTypo>
                <TdTypo>{req.Assign.Project && req.Assign.Project.name}</TdTypo>
                <td>
                  <RequestTypeChip type={req.type} />
                </td>
                <td>
                  <RequestStatusChip status={req.status} />
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
