import dayjs from "dayjs";
import { useState } from "react";
import { CustomRequest } from "../../../types";
import { useRequestContext } from "../../../providers/requestContextProvider";
import { TdTypo, ThTypo } from "../ui/TableTypo";

import ViewDetailsModal from "../../common/request/ViewDetailsModal";
import RequestStatusChip from "./RequestStatusChip";
import RequestTypeChip from "./RequestTypeChip";

import { Table, Sheet } from "@mui/joy";

const AdminRequestsTable = () => {
  const { requests, updateRequest, error } = useRequestContext();
  const [currentRequestIndex, setCurrentRequestIndex] = useState<number>(0);

  const handleNextRequest = () => {
    if (!requests) return;
    setCurrentRequestIndex((prev) => (prev + 1) % requests.length);
  };

  const handlePreviousRequest = () => {
    if (!requests) return;
    setCurrentRequestIndex((prev) =>
      prev === 0 ? requests?.length - 1 : prev - 1
    );
  };

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
              <ThTypo>Nric</ThTypo>
              <ThTypo>Name</ThTypo>
              <ThTypo>Submitted at</ThTypo>
              <ThTypo>Type</ThTypo>
              <ThTypo>Status</ThTypo>
              <ThTypo>Action</ThTypo>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <TdTypo colSpan={6}>Error loading requests</TdTypo>
              </tr>
            )}
            {!error && !requests && (
              <tr>
                <TdTypo colSpan={6}>Loading...</TdTypo>
              </tr>
            )}
            {!error && requests && requests.length === 0 ? (
              <tr>
                <TdTypo colSpan={6}>No requests found</TdTypo>
              </tr>
            ) : (
              !error &&
              requests &&
              requests.map((req: CustomRequest, index) => (
                <tr key={req.cuid}>
                  <TdTypo>
                    {req.Assign.Candidate && req.Assign.Candidate.nric}
                  </TdTypo>
                  <TdTypo>
                    {req.Assign.Candidate && req.Assign.Candidate.name}
                  </TdTypo>
                  <TdTypo>
                    {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                  </TdTypo>
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
                      handleNextRequest={handleNextRequest}
                      handlePreviousRequest={handlePreviousRequest}
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
