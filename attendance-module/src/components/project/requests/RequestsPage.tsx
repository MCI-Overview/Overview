import axios from "axios";
import { useCallback, useState } from "react";
import { CustomRequest } from "../../../types";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { RequestContextProvider } from "../../../providers/requestContextProvider";

import RequestHistory from "./Requests";
import RequestHistoryM from "./RequestsM";
import PaginationFooter from "../ui/PaginationFooter";

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
  projectCuid: string,
  currentPage: number,
  searchValue: string,
  typeFilter: string,
  statusFilter: string
): string {
  let url = `/api/admin/project/${projectCuid}/requests/${currentPage}`;

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

const RequestsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [searchValue, setSearchValue] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { project } = useProjectContext();
  if (!project) return null;

  const fetchUpcomingShifts = useCallback(async () => {
    try {
      const url = buildUrl(
        project.cuid,
        currentPage,
        searchValue,
        typeFilter,
        statusFilter
      );

      const response = await axios.get(url);
      const [fetchedData, paginationData] = response.data;
      setMaxPage(paginationData.pageCount);
      return fetchedData as CustomRequest[];
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
      return [];
    }
  }, [project.cuid, currentPage, searchValue, typeFilter, statusFilter]);

  return (
    <Box sx={{ display: "flex" }}>
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
          <Grid xs={6}>
            <FormControl size="sm">
              <FormLabel>Search candidates</FormLabel>
              <Input
                size="sm"
                placeholder="Search by name/nric"
                fullWidth
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </FormControl>
          </Grid>

          <Grid xs={3}>
            <FormControl size="sm">
              <FormLabel>Filter by type</FormLabel>
              <Select
                size="sm"
                value={typeFilter}
                onChange={(_e, value) => setTypeFilter(value ?? "")}
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

          <Grid xs={3}>
            <FormControl size="sm">
              <FormLabel>Filter by status</FormLabel>
              <Select
                size="sm"
                value={statusFilter}
                onChange={(_e, value) => setStatusFilter(value ?? "")}
                slotProps={{ button: { sx: { whiteSpace: "nowrap" } } }}
              >
                <Option value="">All</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="APPROVED">Approved</Option>
                <Option value="REJECTED">Rejected</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <RequestContextProvider updateFunction={() => fetchUpcomingShifts()}>
          <RequestHistory />
          <RequestHistoryM />
        </RequestContextProvider>

        <PaginationFooter
          maxPage={maxPage}
          currentPage={currentPage}
          isFirstPage={currentPage === 1}
          isLastPage={currentPage === maxPage}
          handlePreviousPage={() => setCurrentPage((prev) => prev - 1)}
          handleNextPage={() => setCurrentPage((prev) => prev + 1)}
        />
      </Box>
    </Box>
  );
};

export default RequestsPage;
