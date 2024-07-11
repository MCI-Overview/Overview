import dayjs from "dayjs";
import { Fragment, useState } from "react";
import { useUserContext } from "../../../providers/userContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { checkPermission } from "../../../utils/permission";
import { readableEnum } from "../../../utils/capitalize";
import { CommonCandidate, PermissionList } from "../../../types/common";
import { ThTypo, TdTypo } from "../ui/TableTypo";

import {
  Box,
  Card,
  CardOverflow,
  Chip,
  ColorPaletteProp,
  IconButton,
  Link,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Sheet,
  Table,
  TableProps,
  Tooltip,
  Typography,
} from "@mui/joy";
import {
  DeleteRounded as DeleteIcon,
  ArrowUpwardRounded as ArrowUpwardIcon,
  ArrowDownwardRounded as ArrowDownwardIcon,
  SwapVertRounded as SwapVertIcon,
} from "@mui/icons-material";

//TODO: Fix type
export type CddTableDataType = CommonCandidate & {
  consultantName: string;
};

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
    project.consultants
      .filter((c) => c.role === "CLIENT_HOLDER")
      .some((c) => c.cuid === user.cuid) ||
    checkPermission(user, PermissionList.CAN_EDIT_ALL_PROJECTS);

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
      <Sheet
        sx={{
          display: { xs: "none", sm: "initial" },
          width: "100%",
          borderRadius: "sm",
          flexShrink: 1,
          overflow: "auto",
          minHeight: 0,
        }}
      >
        {tableTitle && tableDescription && (
          <Box sx={{ mb: 1 }}>
            <Typography level="title-sm">{tableTitle}</Typography>
            <Typography level="body-xs">{tableDescription}</Typography>
          </Box>
        )}

        <Card>
          <CardOverflow sx={{ px: "0px" }}>
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
              {...tableProps}
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
                  <ThTypo>Residency</ThTypo>
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
                    <TdTypo colSpan={handleDelete ? 10 : 9}>
                      No candidates found
                    </TdTypo>
                  </tr>
                ) : (
                  sortedData.map((row) => (
                    <tr key={row.nric}>
                      <TdTypo>{row.nric}</TdTypo>
                      <TdTypo>
                        {row.cuid ? (
                          <Link href={`#/admin/candidate/${row.cuid}`}>
                            {row.name}
                          </Link>
                        ) : (
                          // Should not link during candidates assigning
                          row.name
                        )}
                      </TdTypo>
                      <TdTypo>{row.contact}</TdTypo>
                      <TdTypo>
                        {dayjs(row.dateOfBirth).format("DD/MM/YY")}
                      </TdTypo>
                      <TdTypo>{dayjs().diff(row.dateOfBirth, "years")}</TdTypo>
                      <TdTypo>{readableEnum(row.residency)}</TdTypo>
                      <TdTypo>{dayjs(row.startDate).format("DD/MM/YY")}</TdTypo>
                      <TdTypo>{dayjs(row.endDate).format("DD/MM/YY")}</TdTypo>
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
                              <Tooltip
                                size="sm"
                                title="Delete"
                                placement="right"
                              >
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
          </CardOverflow>
        </Card>
      </Sheet>

      {/* List display for smaller screens */}
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        {sortedData.length == 0 ? (
          <Typography level="body-xs" sx={{ py: 2, textAlign: "center" }}>
            No candidates found
          </Typography>
        ) : (
          <List
            size="sm"
            sx={{
              "--ListItem-paddingX": 0,
            }}
          >
            {sortedData.map((listItem) => (
              <Fragment key={listItem.cuid}>
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <ListItemContent>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography level="body-xs">
                          Name: {listItem.name}
                        </Typography>

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
                          sx={{
                            my: "auto",
                          }}
                        >
                          {readableEnum(listItem.employmentType)}
                        </Chip>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography level="body-xs">
                            NRIC: {listItem.nric}
                          </Typography>
                          <Typography level="body-xs">
                            Contact: {listItem.contact}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography level="body-xs">
                            Start:{" "}
                            {dayjs(listItem.startDate).format("DD/MM/YY")}
                          </Typography>
                          <Typography level="body-xs">
                            End: {dayjs(listItem.endDate).format("DD/MM/YY")}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography level="body-xs">
                      Holder: {listItem.consultantName}
                    </Typography>
                  </ListItemContent>
                </ListItem>
                <ListDivider />
              </Fragment>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};

export default CandidateTable;
