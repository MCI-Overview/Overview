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
import { useEffect, useState } from "react";
import { CustomRequest } from "../../types";
import axios from "axios";

import RequestHistory from "./RequestHistory";
import RequestHistoryM from "./RequestHistoryM";
import { RequestContextProvider } from "../../providers/requestContextProvider";

type Page = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

// TODO: Add filtering per request status and request type
const ViewRequestHistory = () => {
  const [page, setPage] = useState<Page>({
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 0,
  });

  const fetchUpcomingShifts = async (page: number) => {
    try {
      const url = `/api/user/requests/history/${page}`;
      const response = await axios.get(url);
      const [fetchedData, paginationData] = response.data;
      setPage(paginationData);

      return fetchedData as CustomRequest[];
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
      return [];
    }
  };

  useEffect(() => {
    fetchUpcomingShifts(page.currentPage);
  }, [page.currentPage]);

  const handleNextPage = () => {
    if (!page.isLastPage && page.nextPage !== null) {
      setPage((prev) => ({
        ...prev,
        currentPage: prev.nextPage || prev.currentPage,
      }));
    }
  };

  const handlePreviousPage = () => {
    if (!page.isFirstPage && page.previousPage !== null) {
      setPage((prev) => ({
        ...prev,
        currentPage: prev.previousPage || prev.currentPage,
      }));
    }
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
          <RequestContextProvider
            updateFunction={() => fetchUpcomingShifts(page.currentPage)}
          >
            <RequestHistory />
            <RequestHistoryM />
          </RequestContextProvider>

          {page.pageCount > 1 && (
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
                disabled={page.isFirstPage}
              >
                Previous
              </Button>

              <Box sx={{ flex: 1 }} />
              <Button size="sm" variant="outlined" color="neutral">
                {page.currentPage} / {page.pageCount}
              </Button>
              <Box sx={{ flex: 1 }} />

              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                endDecorator={<KeyboardArrowRightIcon />}
                onClick={handleNextPage}
                disabled={page.isLastPage}
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

export default ViewRequestHistory;
