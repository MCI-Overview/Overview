import dayjs from "dayjs";
import { CustomRequest } from "../../types";
import { useRequestContext } from "../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";
import RequestStatusChip from "../../components/project/requests/RequestStatusChip";
import RequestTypeChip from "../../components/project/requests/RequestTypeChip";

import { Table, Sheet } from "@mui/joy";

const UserRequestHistoryTable = () => {
  const { requests, updateRequest, error } = useRequestContext();

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
          {error && (
            <tr>
              <TdTypo colSpan={5}>Error loading requests</TdTypo>
            </tr>
          )}
          {!error && !requests && (
            <tr>
              <TdTypo colSpan={5}>Loading...</TdTypo>
            </tr>
          )}
          {!error && requests && requests.length === 0 ? (
            <tr>
              <TdTypo colSpan={5}>No requests found</TdTypo>
            </tr>
          ) : (
            !error &&
            requests &&
            requests.map((req: CustomRequest) => (
              <tr key={req.cuid}>
                <TdTypo>{dayjs(req.createdAt).format("DD/MM/YY HH:mm")}</TdTypo>
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

export default UserRequestHistoryTable;
