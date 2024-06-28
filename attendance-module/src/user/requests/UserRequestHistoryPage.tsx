import axios from "axios";
import { useState } from "react";
import { CustomRequest } from "../../types";
import { RequestContextProvider } from "../../providers/requestContextProvider";

import UserRequestHistoryTable from "./UserRequestHistoryTable";
import UserRequestHistoryList from "./UserRequestHistoryList";
import NewRequestModal from "./NewRequestModal";
import SmallScreenDivider from "../../components/project/ui/SmallScreenDivider";
import PaginationFooter from "../../components/project/ui/PaginationFooter";

import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Option,
  Select,
} from "@mui/joy";

function buildUrl(
  currentPage: number,
  searchValue: string,
  typeFilter: string,
  statusFilter: string
): string {
  let url = `/api/user/requests/history/${currentPage}`;

  const queryParams = [];
  if (searchValue) {
    queryParams.push(`searchValue=${searchValue}`);
  }
  if (typeFilter) {
    queryParams.push(`typeFilter=${typeFilter}`);
  }
  if (statusFilter) {
    queryParams.push(`statusFilter=${statusFilter}`);
  }

  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  return url;
}

// TODO: Add filtering per request status and request type
const UserRequestHistoryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);

  const [searchValue, setSearchValue] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchUpcomingShifts = async (currentPage: number) => {
    try {
      const url = buildUrl(currentPage, searchValue, typeFilter, statusFilter);
      const response = await axios.get(url);
      const [fetchedData, paginationData] = response.data;
      setMaxPage(paginationData.pageCount);

      return fetchedData as CustomRequest[];
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
      return [];
    }
  };

  return (
    <Box
      sx={{
        px: { md: 4 },
        pb: { xs: 2, sm: 2, md: 3 },
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        gap: 1,
      }}
    >
      <Grid container spacing={1} columns={{ xs: 6, sm: 12 }}>
        <Grid xs={4} sm={6}>
          <FormControl size="sm">
            <FormLabel>Search projects</FormLabel>
            <Input
              size="sm"
              placeholder="Search by project name"
              fullWidth
              onChange={(e) => setSearchValue(e.target.value.trim())}
            />
          </FormControl>
        </Grid>

        <Grid
          xs={2}
          sx={{ display: { xs: "block", sm: "none" }, whiteSpace: "nowrap" }}
        >
          <NewRequestModal />
        </Grid>

        <Grid xs={3} sm={2}>
          <FormControl size="sm">
            <FormLabel>Filter by type</FormLabel>
            <Select
              size="sm"
              value={typeFilter}
              onChange={(_e, value) => {
                setTypeFilter(value ?? "");
                setCurrentPage(1);
              }}
              slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
            >
              <Option value="">All</Option>
              <Option value="CLAIM">Claim</Option>
              <Option value="PAID_LEAVE">Paid Leave</Option>
              <Option value="UNPAID_LEAVE">Unpaid Leave</Option>
              <Option value="MEDICAL_LEAVE">Medical Leave</Option>
              <Option value="RESIGNATION">Resignation</Option>
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={3} sm={2}>
          <FormControl size="sm">
            <FormLabel sx={{ whiteSpace: "nowrap" }}>
              Filter by status
            </FormLabel>
            <Select
              size="sm"
              value={statusFilter}
              onChange={(_e, value) => {
                setStatusFilter(value ?? "");
                setCurrentPage(1);
              }}
              slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
            >
              <Option value="">All</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </FormControl>
        </Grid>

        <Grid
          xs={2}
          sx={{ display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}
        >
          <NewRequestModal />
        </Grid>
      </Grid>

      <SmallScreenDivider />

      <RequestContextProvider
        updateFunction={() => fetchUpcomingShifts(currentPage)}
      >
        <UserRequestHistoryTable />
        <UserRequestHistoryList />
      </RequestContextProvider>

      <PaginationFooter
        maxPage={maxPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </Box>
  );
};

export default UserRequestHistoryPage;
