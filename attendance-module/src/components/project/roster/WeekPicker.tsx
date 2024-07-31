import dayjs from "dayjs";

import { useRosterTableContext } from "../../../providers/rosterContextProvider";
import { useProjectContext } from "../../../providers/projectContextProvider";

import {
  Box,
  iconButtonClasses,
  Button,
  Select,
  Option,
  Stack,
} from "@mui/joy";
import {
  KeyboardArrowRightRounded as KeyboardArrowRightIcon,
  KeyboardArrowLeftRounded as KeyboardArrowLeftIcon,
} from "@mui/icons-material";

export default function WeekPicker() {
  const { project } = useProjectContext();
  const {
    dateRangeStart,
    dateRangeEnd,
    weekOffset,
    setSortOrder,
    setWeekOffset,
    setDates,
  } = useRosterTableContext();
  const projectStartDate = dayjs(project?.startDate);
  const projectEndDate = dayjs(project?.endDate);

  const baseDay = projectStartDate.startOf("isoWeek");

  const maxWeekOffset = Math.ceil(projectEndDate.diff(baseDay, "weeks"));

  const handlePrevious = () => {
    setWeekOffset(Math.max(weekOffset - 1, 0));
    setDates([]);
  };

  const handleNext = () => {
    setWeekOffset(weekOffset + 1);
    setDates([]);
  };

  if (!project) {
    return null;
  }

  return (
    <Box
      className="Pagination-laptopUp"
      sx={{
        pt: 2,
        gap: 1,
        [`& .${iconButtonClasses.root}`]: { borderRadius: "50%" },
        display: {
          xs: "flex",
          md: "flex",
        },
      }}
    >
      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        startDecorator={<KeyboardArrowLeftIcon />}
        onClick={handlePrevious}
        disabled={weekOffset === 0}
      >
        Previous
      </Button>

      <Box sx={{ flex: 1 }} />
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Button variant="outlined" color="neutral">
          {`${dateRangeStart?.format("DD/MM/YY")} -
        ${dateRangeEnd?.format("DD/MM/YY")}`}
        </Button>
        <Select
          defaultValue="selected"
          sx={{
            width: "9rem",
          }}
          onChange={(_, value) => {
            setSortOrder(
              value as
                | "name-asc"
                | "name-desc"
                | "unassign"
                | "assign"
                | "selected"
            );
          }}
        >
          <Option value="selected">Selected</Option>
          <Option value="name-asc">Name (Asc)</Option>
          <Option value="name-desc">Name (Desc)</Option>
          <Option value="unassign">Unassigned</Option>
          <Option value="assign">Assigned</Option>
        </Select>
      </Stack>
      <Box sx={{ flex: 1 }} />

      <Button
        size="sm"
        variant="outlined"
        color="neutral"
        endDecorator={<KeyboardArrowRightIcon />}
        onClick={handleNext}
        disabled={weekOffset === maxWeekOffset}
      >
        Next
      </Button>
    </Box>
  );
}
