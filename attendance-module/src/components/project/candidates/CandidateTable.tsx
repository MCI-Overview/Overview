import { Data } from "react-spreadsheet-import/types/types";
import { getExactAge, formatDate } from "../../../utils/date-time";
import { mask } from "../../../utils/mask";

import { Box, Table, Typography, Tooltip, IconButton } from "@mui/joy";
import { Edit, Delete } from "@mui/icons-material";

interface CandidateTableProps {
  tableTitle?: string;
  tableDescription?: string;
  tableProps: any;
  tableData: Data<string>[];
  showActions?: boolean;
  handleDelete?: (nricList: string[]) => void;
}

const CandidateTable = ({
  tableTitle,
  tableDescription,
  tableProps,
  tableData,
  showActions,
  handleDelete,
}: CandidateTableProps) => (
  <Box>
    <Typography level="title-sm">{tableTitle}</Typography>
    <Typography level="body-xs">{tableDescription}</Typography>
    <Table sx={{ "& tr > *": { textAlign: "center" } }} {...tableProps}>
      <thead>
        <tr>
          <th>NRIC</th>
          <th>Full name</th>
          <th>Phone Number</th>
          <th>Date of birth</th>
          <th>Age</th>
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {tableData.map((row: any) => (
          <tr key={row.nric}>
            <td>{mask(row.nric)}</td>
            <td>{row.name}</td>
            <td>{row.phoneNumber}</td>
            <td>{formatDate(row.dateOfBirth)}</td>
            <td>
              {row.dateOfBirth ? getExactAge(row.dateOfBirth as string) : "-"}
            </td>
            {showActions && handleDelete && (
              <td>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Tooltip size="sm" title="Edit" placement="left">
                    <IconButton size="sm" color="neutral">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip size="sm" title="Delete" placement="right">
                    <IconButton
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete([row.nric])}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  </Box>
);

export default CandidateTable;
