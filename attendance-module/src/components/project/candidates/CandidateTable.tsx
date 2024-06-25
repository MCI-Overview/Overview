import dayjs from "dayjs";
import { useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { checkPermission } from "../../../utils/permission";
import { readableEnum } from "../../../utils/capitalize";
import { CommonCandidate, PermissionList } from "../../../types/common";
import { ThTypo, TdTypo } from "../ui/TableTypo";

import {
  Box,
  Table,
  TableProps,
  Typography,
  Tooltip,
  IconButton,
  Sheet,
  CssBaseline,
  CssVarsProvider,
  List,
  ListItem,
  ListItemContent,
  Chip,
  ColorPaletteProp,
  ListDivider,
} from "@mui/joy";
import {
  DeleteRounded as DeleteIcon,
  ArrowUpwardRounded as ArrowUpwardIcon,
  ArrowDownwardRounded as ArrowDownwardIcon,
  SwapVertRounded as SwapVertIcon,
} from "@mui/icons-material";

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
      return <SwapVertIcon fontSize="medium" color="disabled" />;
    }
    if (sortConfig.direction === "ascending") {
      return <ArrowUpwardIcon fontSize="large" />;
    }
    return <ArrowDownwardIcon fontSize="small" />;
  };

  return (
    <>
      <CssVarsProvider disableTransitionOnChange>
        <CssBaseline />
        <Sheet
          className="OrderTableContainer"
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
                <ThTypo>Contact</ThTypo>
                <ThTypo>Date of birth</ThTypo>
                <ThTypo onClick={() => requestSort("age")}>
                  {renderSortIcon("age")} Age
                </ThTypo>
                <ThTypo onClick={() => requestSort("startDate")}>
                  {renderSortIcon("startDate")} Start date
                </ThTypo>
                <ThTypo onClick={() => requestSort("endDate")}>
                  {renderSortIcon("endDate")} End date
                </ThTypo>
                <ThTypo>Type</ThTypo>
                {showCandidateHolder && <ThTypo>Consultant</ThTypo>}
                {handleDelete && <ThTypo>Action</ThTypo>}
              </tr>
            </thead>

            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={handleDelete ? 10 : 9}
                    style={{ textAlign: "center" }}
                  >
                    No candidates found.
                  </td>
                </tr>
              ) : (
                sortedData.map((row) => (
                  <tr key={row.cuid}>
                    <TdTypo>{row.nric}</TdTypo>
                    <TdTypo>{row.name}</TdTypo>
                    <TdTypo>{row.contact}</TdTypo>
                    <TdTypo>
                      {dayjs(row.dateOfBirth).format("DD/MM/YYYY")}
                    </TdTypo>
                    <TdTypo>{dayjs().diff(row.dateOfBirth, "years")}</TdTypo>
                    <TdTypo>{dayjs(row.startDate).format("DD/MM/YYYY")}</TdTypo>
                    <TdTypo>{dayjs(row.endDate).format("DD/MM/YYYY")}</TdTypo>
                    <TdTypo>{readableEnum(row.employmentType)}</TdTypo>
                    {showCandidateHolder && (
                      <TdTypo>{row.consultantName}</TdTypo>
                    )}

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
                                  !hasEditProjectPermission &&
                                  !isHolder(row.cuid)
                                }
                              >
                                <DeleteIcon />
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
        </Sheet>

        {/* List display for smaller screens */}
        <Box sx={{ display: { xs: "block", sm: "none" } }}>
          {sortedData &&
            sortedData.map((listItem) => (
              <List
                key={listItem.cuid}
                size="sm"
                sx={{
                  "--ListItem-paddingX": 0,
                }}
              >
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <ListItemContent
                    sx={{ display: "flex", gap: 2, alignItems: "start" }}
                  >
                    <div>
                      <Typography fontWeight={600} gutterBottom>
                        {listItem.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 0.5,
                          mb: 1,
                        }}
                      >
                        <Typography level="body-md">{listItem.nric}</Typography>
                        <Typography level="body-md">&bull;</Typography>
                        <Typography level="body-md">
                          {dayjs(listItem.dateOfBirth).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                      <Typography level="body-xs">Contact</Typography>
                      <Typography level="body-md" gutterBottom>
                        {listItem.contact}
                      </Typography>
                      <Typography level="body-xs">Work period</Typography>
                      <Typography level="body-md" gutterBottom>
                        {dayjs(listItem.startDate).format("DD/MM/YYYY")} -{" "}
                        {dayjs(listItem.endDate).format("DD/MM/YYYY")}
                      </Typography>
                      <Typography level="body-xs">Candidate holder</Typography>
                      <Typography level="body-md" gutterBottom>
                        {listItem.consultantName}
                      </Typography>
                    </div>
                  </ListItemContent>
                  <Chip
                    variant="soft"
                    size="sm"
                    color={
                      {
                        FULL_TIME: "success",
                        PART_TIME: "neutral",
                        CONTRACT: "warning",
                      }[listItem.employmentType] as ColorPaletteProp
                    }
                  >
                    {listItem.employmentType}
                  </Chip>
                </ListItem>
                <ListDivider />
              </List>
            ))}
        </Box>
      </CssVarsProvider>
    </>
  );
};

export default CandidateTable;
