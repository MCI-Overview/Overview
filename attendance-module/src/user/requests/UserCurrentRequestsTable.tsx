import dayjs from "dayjs";
import { useState } from "react";
import { CustomRequest } from "../../types";
import { useRequestContext } from "../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../../components/project/ui/TableTypo";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";
import RequestStatusChip from "../../components/project/requests/RequestStatusChip";
import RequestTypeChip from "../../components/project/requests/RequestTypeChip";

import { Table, Sheet } from "@mui/joy";

// TODO: Add editing of requests
const UserCurrentRequestsTable = () => {
  const { requests, updateRequest } = useRequestContext();
  const [currentRequestIndex, setCurrentRequestIndex] = useState<number>(0);

  // const handleNextRequest = () => {
  //   if (!requests) return;
  //   setCurrentRequestIndex((prev) => (prev + 1) % requests.length);
  // };

  // const handlePreviousRequest = () => {
  //   if (!requests) return;
  //   setCurrentRequestIndex((prev) =>
  //     prev === 0 ? requests?.length - 1 : prev - 1
  //   );
  // };

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
              <TdTypo colSpan={5}>No requests found</TdTypo>
            </tr>
          ) : (
            requests.map((req: CustomRequest, index) => (
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
                    onClick={() => setCurrentRequestIndex(index)}
                    request={requests[currentRequestIndex]}
                    updateRequest={updateRequest}
                    // handleNextRequest={handleNextRequest}
                    // handlePreviousRequest={handlePreviousRequest}
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

export default UserCurrentRequestsTable;
