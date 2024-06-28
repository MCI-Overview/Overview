import axios from "axios";
import { useState } from "react";
import { CustomRequest } from "../../types";
import { RequestContextProvider } from "../../providers/requestContextProvider";

import UserCurrentRequestsTable from "./UserCurrentRequestsTable";
import UserCurrentRequestsList from "./UserCurrentRequestsList";
import NewRequestModal from "./NewRequestModal";
import SmallScreenDivider from "../../components/project/ui/SmallScreenDivider";

import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Option,
  Select,
} from "@mui/joy";

const UserCurrentRequestsPage = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  async function getCurrentRequests() {
    return axios.get("/api/user/requests/current").then((res) => {
      const requests = res.data as CustomRequest[];
      return requests.filter((req) => {
        if (searchValue !== "") {
          const projectName = req.Assign.Project?.name.toLowerCase();
          if (
            !projectName ||
            !projectName.includes(searchValue.toLowerCase())
          ) {
            return false;
          }
        }

        if (typeFilter && req.type !== typeFilter) {
          return false;
        }

        if (statusFilter && req.status !== statusFilter) {
          return false;
        }

        return true;
      });
    });
  }

  return (
    <RequestContextProvider updateFunction={getCurrentRequests}>
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

          <Grid xs={3} sm={2}>
            <FormControl size="sm">
              <FormLabel sx={{ whiteSpace: "nowrap" }}>
                Filter by status
              </FormLabel>
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

          <Grid
            xs={2}
            sx={{ display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}
          >
            <NewRequestModal />
          </Grid>
        </Grid>

        <SmallScreenDivider />

        <UserCurrentRequestsTable />
        <UserCurrentRequestsList />
      </Box>
    </RequestContextProvider>
  );
};

export default UserCurrentRequestsPage;
