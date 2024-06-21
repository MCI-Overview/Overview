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
import { useCallback, useEffect, useState } from "react";
import { CustomRequest } from "../../../types";
import axios from "axios";
import dayjs from "dayjs";

import RequestHistory from "./Requests";
import RequestHistoryM from "./RequestsM";
import { useProjectContext } from "../../../providers/projectContextProvider";

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
const RequestsPage = () => {
  const [data, setData] = useState<CustomRequest[] | null>(null);
  const [page, setPage] = useState<Page>({
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 0,
  });
  const { project } = useProjectContext();

  const fetchUpcomingShifts = useCallback(
    async (page: number, date?: string) => {
      try {
        let url = `/api/admin/project/${project?.cuid}/requests/${page}`;
        if (date) {
          const formattedDate = dayjs(date).format(
            "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
          );
          url += `?date=${formattedDate}`;
        }
        const response = await axios.get(url);
        const [fetchedData, paginationData] = response.data;
        setData(fetchedData);
        setPage(paginationData);
      } catch (error) {
        console.error("Error fetching upcoming shifts: ", error);
      }
    },
    [project],
  );

  useEffect(() => {
    fetchUpcomingShifts(page.currentPage);
  }, [page.currentPage, fetchUpcomingShifts]);

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

  useEffect(() => {
    fetchUpcomingShifts(page.currentPage);
  }, [fetchUpcomingShifts, page.currentPage]);

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
          <RequestHistory
            data={data}
            getCurrentRequests={() => fetchUpcomingShifts(page.currentPage)}
          />
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

export default RequestsPage;
