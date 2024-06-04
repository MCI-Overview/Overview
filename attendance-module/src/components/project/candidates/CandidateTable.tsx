import { useUserContext } from "../../../providers/userContextProvider";
import { formatDate, getExactAge } from "../../../utils/date-time";
import { checkPermission } from "../../../utils/permission";
import { CommonCandidate, PermissionList } from "../../../types/common";

import {
  Box,
  Table,
  TableProps,
  Typography,
  Tooltip,
  IconButton,
} from "@mui/joy";
import { Delete } from "@mui/icons-material";

interface CandidateTableProps {
  tableTitle?: string;
  tableDescription?: string;
  tableProps: TableProps;
  tableData: (CommonCandidate & { consultantName: string })[];
  // handleEdit?: (nric: string) => void;
  handleDelete?: (nricList: string[]) => void;
  showCandidateHolder?: boolean;
}

const CandidateTable = ({
  tableTitle,
  tableDescription,
  tableProps,
  tableData,
  // handleEdit,
  handleDelete,
  showCandidateHolder = false,
}: CandidateTableProps) => {
  const showActions = handleDelete; // || handleEdit;
  const { user } = useUserContext();

  return (
    <Box>
      <Typography level="title-sm">{tableTitle}</Typography>
      <Typography level="body-xs">{tableDescription}</Typography>
      <Table sx={{ "& tr > *": { textAlign: "center" } }} {...tableProps}>
        <thead>
          <tr>
            <th>NRIC</th>
            <th>Full name</th>
            <th>Contact Number</th>
            <th>Date of birth</th>
            <th>Age</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Type</th>
            {showCandidateHolder && <th>Candidate Holder</th>}
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 10 : 9}>No candidates found.</td>
            </tr>
          ) : (
            tableData.map((row) => (
              <tr key={row.cuid}>
                <td>{row.nric}</td>
                <td>{row.name}</td>
                <td>{row.contact}</td>
                <td>
                  {row.dateOfBirth
                    ? // ? row.dateOfBirth.toISOString().slice(0, 10)
                      formatDate(row.dateOfBirth)
                    : ""}
                </td>
                <td>{row.dateOfBirth ? getExactAge(row.dateOfBirth) : "-"}</td>
                <td>{formatDate(row.startDate)}</td>
                <td>{formatDate(row.endDate)}</td>
                <td>{row.employmentType}</td>
                {showCandidateHolder && <td>{row.consultantName}</td>}
                {showActions && (
                  <td>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      {/* {handleEdit && (
                        <Tooltip size="sm" title="Edit" placement="left">
                          <IconButton
                            size="sm"
                            color="neutral"
                            onClick={() => handleEdit(row.cuid)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      )} */}
                      {handleDelete && (
                        <Tooltip size="sm" title="Delete" placement="right">
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete([row.cuid])}
                            disabled={
                              user
                                ? !checkPermission(
                                    user,
                                    PermissionList.CAN_EDIT_ALL_PROJECTS
                                  )
                                : false
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Box>
  );
};

export default CandidateTable;
