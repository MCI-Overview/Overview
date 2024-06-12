import { useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
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
import {
  Delete,
  ArrowUpward,
  ArrowDownward,
  SwapVert,
} from "@mui/icons-material";
import dayjs from "dayjs";

//TODO: Fix type
export type CddTableDataType = Omit<
  Omit<Omit<CommonCandidate, "dateOfBirth">, "startDate">,
  "endDate"
> & {
  consultantName: string;
} & { dateOfBirth: string; startDate: string; endDate: string };

export interface CandidateTableProps {
  tableTitle?: string;
  tableDescription?: string;
  tableProps?: TableProps;
  tableData: CddTableDataType[];
  handleDelete?: (nricList: string[]) => void;
  showCandidateHolder?: boolean;
}

// List of sortable keys
type SortableKeys = "age" | "startDate" | "endDate";

const CandidateTable = ({
  tableTitle,
  tableDescription,
  tableProps,
  tableData,
  handleDelete,
  showCandidateHolder = false,
}: CandidateTableProps) => {
  const { user } = useUserContext();
  const { project } = useProjectContext();

  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys | "";
    direction: "ascending" | "descending";
  }>({
    key: "",
    direction: "ascending",
  });

  // Early return if user or project is null
  if (!project || !user) return null;

  const hasEditProjectPermission =
    project.consultants.find((c) => c.role === "CLIENT_HOLDER")?.cuid ===
      user.cuid || checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS);

  const isHolder = (cddCuid: string) => {
    return (
      project.candidates.find((c) => c.cuid === cddCuid)?.consultantCuid ===
      user.cuid
    );
  };

  const sortedData = [...tableData].sort((a, b) => {
    if (sortConfig.key) {
      const getValue = (row: CddTableDataType, key: SortableKeys) => {
        if (key === "age") {
          return dayjs().diff(row.dateOfBirth, "years");
        } else if (key === "startDate" || key === "endDate") {
          return dayjs(row[key]).unix();
        }
      };

      const aValue = getValue(a, sortConfig.key);
      const bValue = getValue(b, sortConfig.key);

      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const requestSort = (key: SortableKeys) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: SortableKeys) => {
    if (sortConfig.key !== key) {
      return <SwapVert fontSize="medium" color="disabled" />;
    }
    if (sortConfig.direction === "ascending") {
      return <ArrowUpward fontSize="large" />;
    }
    return <ArrowDownward fontSize="small" />;
  };

  return (
    <Box>
      <Typography level="title-sm">{tableTitle}</Typography>
      <Typography level="body-xs">{tableDescription}</Typography>
      <Table sx={{ "& tr > *": { textAlign: "center" } }} {...tableProps}>
        <thead>
          <tr>
            <th>NRIC</th>
            <th>Full name</th>
            <th>Contact number</th>
            <th>Date of birth</th>
            <th onClick={() => requestSort("age")}>
              {renderSortIcon("age")} Age
            </th>
            <th onClick={() => requestSort("startDate")}>
              {renderSortIcon("startDate")} Start date
            </th>
            <th onClick={() => requestSort("endDate")}>
              {renderSortIcon("endDate")} End date
            </th>
            <th>Type</th>
            {showCandidateHolder && <th>Candidate holder</th>}
            {handleDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={handleDelete ? 10 : 9}>No candidates found.</td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr key={row.cuid}>
                <td>{row.nric}</td>
                <td>{row.name}</td>
                <td>{row.contact}</td>
                <td>{dayjs(row.dateOfBirth).format("DD/MM/YYYY")}</td>
                <td>{dayjs().diff(row.dateOfBirth, "years")}</td>
                <td>{dayjs(row.startDate).format("DD/MM/YYYY")}</td>
                <td>{dayjs(row.endDate).format("DD/MM/YYYY")}</td>
                <td>{row.employmentType}</td>
                {showCandidateHolder && <td>{row.consultantName}</td>}
                {handleDelete && (
                  <td>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      {handleDelete && (
                        <Tooltip size="sm" title="Delete" placement="right">
                          <IconButton
                            size="sm"
                            color="danger"
                            onClick={() => handleDelete([row.cuid])}
                            disabled={
                              !hasEditProjectPermission && !isHolder(row.cuid)
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
