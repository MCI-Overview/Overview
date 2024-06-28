import dayjs from "dayjs";
import { CustomRequest } from "../../../types";
import { useRequestContext } from "../../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../ui/TableTypo";

import ViewDetailsModal from "../../common/request/ViewDetailsModal";
import RequestStatusChip from "./RequestStatusChip";
import RequestTypeChip from "./RequestTypeChip";

import { Table, Sheet } from "@mui/joy";

const AdminRequestsTable = () => {
  const { requests, updateRequest } = useRequestContext();
  if (!requests) return null;

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
              <ThTypo>Submitted at</ThTypo>
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
                <TdTypo colSpan={6}>No requests found</TdTypo>
              </tr>
            ) : (
              requests.map((req: CustomRequest) => (
                <tr key={req.cuid}>
                  <TdTypo>
                    {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TdTypo>
                  <TdTypo>
                    {req.Assign.Candidate && req.Assign.Candidate.nric}
                  </TdTypo>
                  <TdTypo>
                    {req.Assign.Candidate && req.Assign.Candidate.name}
                  </TdTypo>{" "}
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
                      type="ADMIN"
                      variant="DESKTOP"
                    />
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

export default AdminRequestsTable;
