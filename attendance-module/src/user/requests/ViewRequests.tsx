import axios from "axios";
import { CustomRequest } from "../../types";
import { RequestContextProvider } from "../../providers/requestContextProvider";

import CurrentRequests from "./CurrentRequests";
import CurrentRequestsM from "./CurrentRequestsM";
import NewRequest from "./NewRequestModal";

import { Box } from "@mui/joy";

// TODO: Add filtering per request status and request type
const ViewRequests = () => {
  async function getCurrentRequests() {
    return axios
      .get("/api/user/requests/current")
      .then((response) => response.data as CustomRequest[]);
  }

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
        <RequestContextProvider updateFunction={getCurrentRequests}>
          <CurrentRequests />
          <CurrentRequestsM />
          <NewRequest />
        </RequestContextProvider>
      </Box>
    </Box>
  );
};

export default ViewRequests;
