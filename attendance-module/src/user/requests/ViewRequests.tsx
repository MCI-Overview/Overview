import { Box, CssBaseline, CssVarsProvider } from "@mui/joy";
import { useEffect, useState } from "react";
import { CustomRequest } from "../../types";
import axios from "axios";

import CurrentRequests from "./CurrentRequests";
import CurrentRequestsM from "./CurrentRequestsM";
import NewRequest from "./NewRequestModal";

// TODO: Add filtering per request status and request type
const ViewRequests = () => {
  const [data, setData] = useState<CustomRequest[] | null>(null);

  function getCurrentRequests() {
    axios.get("/api/user/requests/current").then((response) => {
      setData(response.data);
    });
  }

  useEffect(() => {
    getCurrentRequests();
  }, []);

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
          <CurrentRequests
            data={data}
            getCurrentRequests={getCurrentRequests}
          />
          <CurrentRequestsM
            data={data}
            getCurrentRequests={getCurrentRequests}
          />
          <NewRequest />
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default ViewRequests;
