import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CustomAdminAttendance } from "../../types";
import { useProjectContext } from "../../providers/projectContextProvider";
import ProjectAttendance from "./ProjectAttendance";
import ProjectAttendanceM from "./ProjectAttendanceM";

import { Box, FormControl, FormLabel, Input, Option, Select } from "@mui/joy";
import SearchIcon from "@mui/icons-material/Search";
import CssBaseline from "@mui/joy/CssBaseline";
import { CssVarsProvider } from "@mui/joy/styles";

const Attendance = () => {
  const [data, setData] = useState<CustomAdminAttendance[]>([]);
  const [startDate, setStartDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | null>("");

  const context = useProjectContext();
  const projectCuid = context.project?.cuid;

  const handleStartDateChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleStatusChange = (_event: any, value: string | null) => {
    setStatusFilter(value === "" ? null : value);
  };

  useEffect(() => {
    fetchUpcomingShifts(startDate, endDate);
  }, [startDate, endDate]);

  const fetchUpcomingShifts = async (startDate: string, endDate: string) => {
    try {
      const formattedStartDate = dayjs(startDate).format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      );
      const formattedEndDate = dayjs(endDate).format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      );
      const url = `/api/admin/project/${projectCuid}/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
      const response = await axios.get(url);
      const fetchedData = response.data;
      setData(fetchedData);
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) ||
      item.nric.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          px: { xs: 2, md: 6 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          flexDirection: "column",
          minWidth: 0,
          gap: 1,
        }}
      >
        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: "sm",
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            "& > *": {
              minWidth: { xs: "120px", md: "160px" },
            },
          }}
        >
          <FormControl sx={{ flex: 1 }} size="sm">
            <FormLabel>Search candidate</FormLabel>
            <Input
              size="sm"
              placeholder="Search"
              startDecorator={<SearchIcon />}
              onChange={handleSearchChange}
            />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>Search from</FormLabel>
            <Input
              type="date"
              size="sm"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>To</FormLabel>
            <Input
              type="date"
              size="sm"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </FormControl>

          <FormControl size="sm">
            <FormLabel>Status</FormLabel>
            <Select
              size="sm"
              placeholder="Filter by status"
              onChange={handleStatusChange}
              slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
            >
              <Option value="">All</Option>
              <Option value="ON_TIME">On Time</Option>
              <Option value="LATE">Late</Option>
              <Option value="NO_SHOW">No Show</Option>
              <Option value="MEDICAL">Medical</Option>
            </Select>
          </FormControl>
        </Box>

        <ProjectAttendance data={filteredData} />

        <ProjectAttendanceM data={filteredData} />
      </Box>
    </CssVarsProvider>
  );
};

export default Attendance;
