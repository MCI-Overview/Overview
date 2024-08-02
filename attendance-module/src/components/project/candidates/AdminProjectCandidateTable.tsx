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
  Input,
  Link,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Option,
  Select,
  Sheet,
  Table,
  Tooltip,
  Typography,
} from "@mui/joy";
import {
  ArrowUpwardRounded as ArrowUpwardIcon,
  ArrowDownwardRounded as ArrowDownwardIcon,
  CheckCircleRounded as CheckCircleIcon,
  DeleteRounded as DeleteIcon,
  SwapVertRounded as SwapVertIcon,
} from "@mui/icons-material";

const EDIT_COLOUR = "#fff7d9"; // Light yellow
const ERROR_COLOUR = "#fde8e8"; // Light red

//TODO: Fix type
export type CddTableDataType = CommonCandidate & {
  consultantName: string;
};

export interface CandidateTableProps {
  tableData: CddTableDataType[];
  showColumnsList?: boolean[];
  newTableData: CddTableDataType[];
  setNewTableData: (newTableData: CddTableDataType[]) => void;
  handleDelete?: (cuidList: string[]) => void;
}

type SortableKeys = "age" | "startDate" | "endDate";
const getHeadComponents: () => {
  name: string;
  sortKey?: SortableKeys;
}[] = () => {
  return [
    { name: "Employee ID" },
    { name: "NRIC" },
    { name: "Name" },
    { name: "Contact" },
    { name: "Date of Birth" },
    { name: "Age", sortKey: "age" },
    { name: "Residency" },
    { name: "Start Date", sortKey: "startDate" },
    { name: "End Date", sortKey: "endDate" },
    { name: "Employment Type" },
    { name: "Rest Day" },
    { name: "Consultant" },
    { name: "Action" },
  ];
};

const AdminProjectCandidateTable = ({
  tableData,
  handleDelete,
  showColumnsList,
  newTableData,
  setNewTableData,
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

  const sortedData = [...newTableData].sort((a, b) => {
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

  const getStartDateColour = (
    startDate: string,
    oldStartDate: string,
    endDate: string
  ) => {
    if (!startDate) return ERROR_COLOUR;

    if (endDate && dayjs(startDate).isAfter(dayjs(endDate), "day"))
      return ERROR_COLOUR;

    if (dayjs(startDate).isAfter(dayjs(endDate))) return ERROR_COLOUR;

    return dayjs(startDate).isSame(dayjs(oldStartDate), "day")
      ? undefined
      : EDIT_COLOUR;
  };

  const getEndDateColour = (
    endDate: string,
    oldEndDate: string,
    startDate: string
  ) => {
    if (!endDate) return ERROR_COLOUR;

    if (startDate && dayjs(endDate).isBefore(dayjs(startDate), "day"))
      return ERROR_COLOUR;

    if (dayjs(endDate).isBefore(dayjs(startDate))) return ERROR_COLOUR;

    return dayjs(endDate).isSame(dayjs(oldEndDate), "day")
      ? undefined
      : EDIT_COLOUR;
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

  const getBodyComponents = (
    currRow: CddTableDataType,
    oldRow: CddTableDataType
  ) => {
    return [
      {
        key: "employeeId",
        currValue: currRow.employeeId,
        component: (
          <TdTypo>
            <Input
              value={currRow.employeeId}
              onChange={(e) => {
                const tmpNewTableData = [...newTableData];
                const index = tmpNewTableData.findIndex(
                  (c) => c.cuid === currRow.cuid
                );
                tmpNewTableData[index].employeeId = e.target.value;
                setNewTableData(tmpNewTableData);
              }}
              variant="plain"
              size="sm"
              sx={{
                fontFamily: "var(--joy-fontFamily-body)",
                fontWeight: "var(--joy-fontWeight-md, 500)",
                fontSize: "var(--joy-fontSize-xs, 0.75rem)",

                display: "flex",
                alignItems: "center",
                justifyItems: "center",

                backgroundColor:
                  currRow.employeeId === oldRow.employeeId
                    ? undefined
                    : EDIT_COLOUR,
              }}
            />
          </TdTypo>
        ),
      },
      {
        key: "nric",
        currValue: currRow.nric,
        component: <TdTypo>{currRow.nric}</TdTypo>,
      },
      {
        key: "name",
        currValue: currRow.name,
        component: (
          <TdTypo>
            <Link href={`#/admin/candidate/${currRow.cuid}`}>
              {currRow.name}
              {currRow.hasOnboarded && (
                <Typography color="success">
                  <CheckCircleIcon />
                </Typography>
              )}
            </Link>
          </TdTypo>
        ),
      },
      {
        key: "contact",
        currValue: currRow.contact,
        component: <TdTypo>{currRow.contact}</TdTypo>,
      },
      {
        key: "dateOfBirth",
        currValue: currRow.dateOfBirth,
        component: (
          <TdTypo>{dayjs(currRow.dateOfBirth).format("DD/MM/YY")}</TdTypo>
        ),
      },
      {
        key: "age",
        value: dayjs().diff(currRow.dateOfBirth, "years"),
        component: (
          <TdTypo>{dayjs().diff(currRow.dateOfBirth, "years")}</TdTypo>
        ),
      },
      {
        key: "residency",
        currValue: currRow.residency,
        component: <TdTypo>{readableEnum(currRow.residency)}</TdTypo>,
      },
      {
        key: "startDate",
        currValue: currRow.startDate,
        component: (
          <TdTypo>
            <Input
              type="date"
              value={dayjs(currRow.startDate).format("YYYY-MM-DD")}
              onChange={(e) => {
                const newDate = e.target.value;
                const tmpNewTableData = [...newTableData];
                const index = tmpNewTableData.findIndex(
                  (c) => c.cuid === currRow.cuid
                );
                tmpNewTableData[index].startDate = newDate;
                setNewTableData(tmpNewTableData);
              }}
              size="sm"
              variant="plain"
              sx={{
                fontFamily: "var(--joy-fontFamily-body)",
                fontWeight: "var(--joy-fontWeight-md, 500)",
                fontSize: "var(--joy-fontSize-xs, 0.75rem)",

                backgroundColor: getStartDateColour(
                  currRow.startDate,
                  oldRow.startDate,
                  currRow.endDate
                ),
              }}
              slotProps={{
                input: {
                  min: project.startDate.format("YYYY-MM-DD"),
                  max: project.endDate.format("YYYY-MM-DD"),
                },
              }}
            />
          </TdTypo>
        ),
      },
      {
        key: "endDate",
        currValue: currRow.endDate,
        component: (
          <TdTypo>
            <Input
              type="date"
              value={dayjs(currRow.endDate).format("YYYY-MM-DD")}
              onChange={(e) => {
                const tmpNewTableData = [...newTableData];
                const index = tmpNewTableData.findIndex(
                  (c) => c.cuid === currRow.cuid
                );
                tmpNewTableData[index].endDate = e.target.value;
                setNewTableData(tmpNewTableData);
              }}
              variant="plain"
              size="sm"
              sx={{
                fontFamily: "var(--joy-fontFamily-body)",
                fontWeight: "var(--joy-fontWeight-md, 500)",
                fontSize: "var(--joy-fontSize-xs, 0.75rem)",

                backgroundColor: getEndDateColour(
                  currRow.endDate,
                  oldRow.endDate,
                  currRow.startDate
                ),
              }}
              slotProps={{
                input: {
                  min: project.startDate.format("YYYY-MM-DD"),
                  max: project.endDate.format("YYYY-MM-DD"),
                },
              }}
            />
          </TdTypo>
        ),
      },
      {
        key: "employmentType",
        currValue: currRow.employmentType,
        component: (
          <TdTypo>
            <Select
              value={currRow.employmentType}
              onChange={(_e, value) => {
                if (!value) return;

                const tmpNewTableData = [...newTableData];
                const index = tmpNewTableData.findIndex(
                  (c) => c.cuid === currRow.cuid
                );
                tmpNewTableData[index].employmentType = value;
                setNewTableData(tmpNewTableData);
              }}
              variant="plain"
              size="sm"
              sx={{
                fontFamily: "var(--joy-fontFamily-body)",
                fontWeight: "var(--joy-fontWeight-sm, 500)",
                fontSize: "var(--joy-fontSize-xs, 0.75rem)",

                backgroundColor:
                  currRow.employmentType === oldRow.employmentType
                    ? undefined
                    : EDIT_COLOUR,
              }}
            >
              <Option value="FULL_TIME">Full Time</Option>
              <Option value="PART_TIME">Part Time</Option>
              <Option value="CONTRACT">Contract</Option>
            </Select>
          </TdTypo>
        ),
      },
      {
        key: "restDay",
        currValue: currRow.restDay,
        component: (
          <TdTypo>
            <Select
              value={currRow.restDay}
              onChange={(_e, value) => {
                if (!value) return;

                const tmpNewTableData = [...newTableData];
                const index = tmpNewTableData.findIndex(
                  (c) => c.cuid === currRow.cuid
                );
                tmpNewTableData[index].restDay = value;
                setNewTableData(tmpNewTableData);
              }}
              variant="plain"
              size="sm"
              sx={{
                fontFamily: "var(--joy-fontFamily-body)",
                fontWeight: "var(--joy-fontWeight-md, 500)",
                fontSize: "var(--joy-fontSize-xs, 0.75rem)",

                backgroundColor:
                  currRow.restDay === oldRow.restDay ? undefined : EDIT_COLOUR,
              }}
            >
              <Option value="MON">Monday</Option>
              <Option value="TUE">Tuesday</Option>
              <Option value="WED">Wednesday</Option>
              <Option value="THU">Thursday</Option>
              <Option value="FRI">Friday</Option>
              <Option value="SAT">Saturday</Option>
              <Option value="SUN">Sunday</Option>
            </Select>
          </TdTypo>
        ),
      },
      {
        key: "consultantCuid",
        currValue: currRow.consultantCuid,
        component: (
          <TdTypo>
            <Select
              value={currRow.consultantCuid}
              onChange={(_e, value) => {
                if (!value) return;

                const tmpNewTableData = [...newTableData];
                const index = tmpNewTableData.findIndex(
                  (c) => c.cuid === currRow.cuid
                );
                tmpNewTableData[index].consultantCuid = value;
                setNewTableData(tmpNewTableData);
              }}
              variant="plain"
              size="sm"
              sx={{
                fontFamily: "var(--joy-fontFamily-body)",
                fontWeight: "var(--joy-fontWeight-md, 500)",
                fontSize: "var(--joy-fontSize-xs, 0.75rem)",

                backgroundColor:
                  currRow.consultantCuid === oldRow.consultantCuid
                    ? undefined
                    : EDIT_COLOUR,
              }}
            >
              {project.consultants.map((c) => (
                <Option key={c.cuid} value={c.cuid}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </TdTypo>
        ),
      },
      {
        key: "action",
        currValue: currRow.cuid,
        component: (
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
                    onClick={() => handleDelete([currRow.cuid])}
                    disabled={
                      !hasEditProjectPermission && !isHolder(currRow.cuid)
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </td>
        ),
      },
    ];
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
            >
              <thead>
                <tr>
                  {getHeadComponents()
                    .filter((_c, index) => {
                      if (!showColumnsList) return true;
                      return showColumnsList[index];
                    })
                    .map((component) => (
                      <Fragment key={component.name}>
                        {
                          <ThTypo
                            onClick={() =>
                              component.sortKey &&
                              requestSort(component.sortKey)
                            }
                          >
                            {component.sortKey &&
                              renderSortIcon(component.sortKey)}{" "}
                            {component.name}
                          </ThTypo>
                        }
                      </Fragment>
                    ))}
                </tr>
              </thead>

              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <TdTypo colSpan={handleDelete ? 10 : 9}>
                      {/* TODO!!!! */}
                      No candidates found
                    </TdTypo>
                  </tr>
                ) : (
                  sortedData.map((row) => (
                    <tr key={row.cuid}>
                      {getBodyComponents(
                        row,
                        tableData.find((oldRow) => oldRow.cuid === row.cuid)!
                      )
                        .filter((_c, index) => {
                          if (!showColumnsList) return true;
                          return showColumnsList[index];
                        })
                        .map((component) => (
                          <Fragment key={component.key}>
                            {component.component}
                          </Fragment>
                        ))}
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
            {sortedData.map((listItem) => {
              return (
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
              );
            })}
          </List>
        )}
      </Box>
    </>
  );
};

export default AdminProjectCandidateTable;
