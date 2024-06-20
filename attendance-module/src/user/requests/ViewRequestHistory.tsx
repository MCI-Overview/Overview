import {
  Box,
  CssBaseline,
  CssVarsProvider,
  Button,
  iconButtonClasses,
} from "@mui/joy";
import {
  KeyboardArrowLeftRounded,
  KeyboardArrowRightRounded,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { CustomRequest } from "../../types";
import axios from "axios";
import dayjs from "dayjs";

import RequestHistory from "./RequestHistory";
import RequestHistoryM from "./RequestHistoryM";

type Page = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

const ViewRequestHistory = () => {
  const [data, setData] = useState<CustomRequest[]>([]);
  const [page, setPage] = useState<Page>({
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 0,
  });

  const fetchUpcomingShifts = async (page: number, date?: string) => {
    try {
      let url = `/api/user/requests/history/${page}`;
      if (date) {
        const formattedDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        url += `?date=${formattedDate}`;
      }
      const response = await axios.get(url);
      const [fetchedData, paginationData] = response.data;
      setData(fetchedData);
      setPage(paginationData);
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
    }
  };

  useEffect(() => {
    fetchUpcomingShifts(page.currentPage);
  }, [page.currentPage]);

  const handleNextPage = () => {
    if (!page.isLastPage && page.nextPage !== null) {
      fetchUpcomingShifts(page.nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (!page.isFirstPage && page.previousPage !== null) {
      fetchUpcomingShifts(page.previousPage);
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
          <RequestHistory data={data} />
          <RequestHistoryM data={data} />

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
                startDecorator={<KeyboardArrowLeftRounded />}
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
                endDecorator={<KeyboardArrowRightRounded />}
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
