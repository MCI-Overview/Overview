import { Box, CssBaseline, CssVarsProvider } from "@mui/joy";
import { CustomRequest } from "../../types";
import axios from "axios";

import CurrentRequests from "./CurrentRequests";
import CurrentRequestsM from "./CurrentRequestsM";
import NewRequest from "./NewRequestModal";
import { RequestContextProvider } from "../../providers/requestContextProvider";

// TODO: Add filtering per request status and request type
const ViewRequests = () => {
  async function getCurrentRequests() {
    return axios
      .get("/api/user/requests/current")
      .then((response) => response.data as CustomRequest[]);
  }

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Box
          component="main"
          className="MainContent"
          sx={{
            px: { xs: 2, md: 6 },
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
    </CssVarsProvider>
  );
};

export default ViewRequests;
