import {
  Box,
  CssBaseline,
  CssVarsProvider,
  Button,
  iconButtonClasses,
} from "@mui/joy";
import {
  KeyboardArrowLeftRounded as KeyboardArrowLeftIcon,
  KeyboardArrowRightRounded as KeyboardArrowRightIcon,
} from "@mui/icons-material";
import { useCallback, useState } from "react";
import { CustomRequest } from "../../../types";
import axios from "axios";

import RequestHistory from "./Requests";
import RequestHistoryM from "./RequestsM";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { RequestContextProvider } from "../../../providers/requestContextProvider";

// TODO: Add filtering per request status and request type
const RequestsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const { project } = useProjectContext();

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === maxPage;

  const fetchUpcomingShifts = useCallback(async () => {
    try {
      const url = `/api/admin/project/${project?.cuid}/requests/${currentPage}`;

      const response = await axios.get(url);
      const [fetchedData, paginationData] = response.data;
      setMaxPage(paginationData.pageCount);
      return fetchedData as CustomRequest[];
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
      return [];
    }
  }, [currentPage, project?.cuid]);

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

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
          <RequestContextProvider updateFunction={() => fetchUpcomingShifts()}>
            <RequestHistory />
            <RequestHistoryM />
          </RequestContextProvider>

          {maxPage > 1 && (
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
                onClick={handlePreviousPage}
                disabled={isFirstPage}
              >
                Previous
              </Button>

              <Box sx={{ flex: 1 }} />
              <Button size="sm" variant="outlined" color="neutral">
                {currentPage} / {maxPage}
              </Button>
              <Box sx={{ flex: 1 }} />

              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                endDecorator={<KeyboardArrowRightIcon />}
                onClick={handleNextPage}
                disabled={isLastPage}
              >
                Next
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </CssVarsProvider>
  );
};

export default RequestsPage;
