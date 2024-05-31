import { getExactAge } from "../../../utils/date-time";
import { Candidate } from "../../../types";

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
  tableData: Candidate[];
  // handleEdit?: (nric: string) => void;
  handleDelete?: (nricList: string[]) => void;
}

const CandidateTable = ({
  tableTitle,
  tableDescription,
  tableProps,
  tableData,
  // handleEdit,
  handleDelete,
}: CandidateTableProps) => {
  const showActions = handleDelete; // || handleEdit;

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
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 6 : 5}>No candidates found.</td>
            </tr>
          ) : (
            tableData.map((row: Candidate) => (
              <tr key={row.cuid}>
                <td>{row.nric}</td>
                <td>{row.name}</td>
                <td>{row.contact}</td>
                <td>{row.dateOfBirth ? row.dateOfBirth.slice(0, 10) : ""}</td>
                <td>
                  {row.dateOfBirth
                    ? getExactAge(row.dateOfBirth as string)
                    : "-"}
                </td>
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
