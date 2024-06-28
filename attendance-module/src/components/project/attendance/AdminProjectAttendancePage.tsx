import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CustomAdminAttendance } from "../../../types";
import { useProjectContext } from "../../../providers/projectContextProvider";

import AdminProjectAttendanceTable from "./AdminProjectAttendanceTable";
import AdminProjectAttendanceList from "./AdminProjectAttendanceList";
import SmallScreenDivider from "../ui/SmallScreenDivider";
import AttendanceExportModal from "./AttendanceExportModal";

import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Option,
  Select,
  Tooltip,
} from "@mui/joy";
import {
  GetAppRounded as GetAppIcon,
  SearchRounded as SearchIcon,
} from "@mui/icons-material/";

const AdminProjectAttendancePage = () => {
  const [data, setData] = useState<CustomAdminAttendance[]>([]);
  const [startDate, setStartDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const { project } = useProjectContext();

  useEffect(() => {
    if (!project) return;

    const fetchUpcomingShifts = async (startDate: string, endDate: string) => {
      try {
        const formattedStartDate = dayjs(startDate).format(
          "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
        );
        const formattedEndDate = dayjs(endDate).format(
          "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
        );
        const url = `/api/admin/project/${project.cuid}/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        const response = await axios.get(url);
        const fetchedData = response.data;
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching upcoming shifts: ", error);
      }
    };

    fetchUpcomingShifts(startDate, endDate);
  }, [startDate, endDate, project]);

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) ||
      item.nric.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  if (!project) return null;

  return (
    <Box
      sx={{
        display: "flex",
        px: { md: 4 },
        pb: { xs: 2, sm: 2, md: 3 },
        flex: 1,
        flexDirection: "column",
        minWidth: 0,
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box sx={{ width: "100%" }}>
          <Grid
            sx={{
              borderRadius: "sm",
              display: "flex",
              flexWrap: "wrap",
            }}
            container
            spacing={{ xs: 1, md: 2 }}
            columns={{ xs: 6, sm: 12 }}
          >
            <Grid xs={4} sm={6}>
              <FormControl sx={{ flex: 1 }} size="sm">
                <FormLabel>Search candidates</FormLabel>
                <Input
                  size="sm"
                  placeholder="Search by name/nric"
                  startDecorator={<SearchIcon />}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                  disabled={data.length === 0}
                />
              </FormControl>
            </Grid>

            <Grid xs={2} sm={2}>
              <FormControl size="sm">
                <FormLabel>Filter by status</FormLabel>
                <Select
                  size="sm"
                  value={statusFilter}
                  onChange={(_e, value) => setStatusFilter(value ?? "")}
                  slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
                >
                  <Option value="">All</Option>
                  <Option value="ON_TIME">On Time</Option>
                  <Option value="LATE">Late</Option>
                  <Option value="NO_SHOW">No Show</Option>
                  <Option value="MEDICAL">Medical</Option>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={3} sm={2}>
              <FormControl size="sm">
                <FormLabel>Search from</FormLabel>
                <Input
                  type="date"
                  size="sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </FormControl>
            </Grid>

            <Grid xs={3} sm={2}>
              <FormControl size="sm">
                <FormLabel>To</FormLabel>
                <Input
                  type="date"
                  size="sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Tooltip title="Export to excel" placement="top" size="sm">
          <IconButton
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            color="neutral"
            variant="outlined"
            sx={{ display: { xs: "none", sm: "flex" }, mt: "auto" }}
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <SmallScreenDivider />

      <AdminProjectAttendanceTable data={filteredData} />
      <AdminProjectAttendanceList data={filteredData} />

      <AttendanceExportModal
        show={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        projectCuid={project.cuid}
      />
    </Box>
  );
};

export default AdminProjectAttendancePage;
