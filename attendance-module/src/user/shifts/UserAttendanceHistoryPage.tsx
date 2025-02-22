import axios from "axios";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { CustomAttendance } from "../../types";

import AttendanceHistory from "./UserAttendanceHistoryTable";
import AttendanceHistoryM from "./UserAttendanceHistoryList";
import PaginationFooter from "../../components/project/ui/PaginationFooter";
import SmallScreenDivider from "../../components/project/ui/SmallScreenDivider";

import { Box, FormControl, FormLabel, Input } from "@mui/joy";
import { SearchRounded as SearchIcon } from "@mui/icons-material";

type Page = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

const UserAttendanceHistoryPage = () => {
  const [data, setData] = useState<CustomAttendance[] | null>(null);
  const [page, setPage] = useState<Page>({
    isFirstPage: true,
    isLastPage: true,
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    pageCount: 1,
    totalCount: 0,
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    if (selectedDate) {
      const formattedDate = dayjs(selectedDate).toISOString();
      setSelectedDate(formattedDate);
    } else {
      setSelectedDate(null);
    }
  };

  useEffect(() => {
    if (selectedDate !== null) {
      fetchUpcomingShifts(1, selectedDate);
    } else {
      fetchUpcomingShifts(1);
    }
  }, [selectedDate]);

  const fetchUpcomingShifts = async (page: number, date?: string) => {
    try {
      let url = `/api/user/history/${page}`;
      if (date) {
        const formattedDate = dayjs(date).toISOString();
        url += `?date=${formattedDate}`;
      }
      const response = await axios.get(url);
      const [fetchedData, paginationData] = response.data;
      setData(fetchedData || []);
      setPage(paginationData);
    } catch (error) {
      console.error("Error fetching upcoming shifts: ", error);
    }
  };

  useEffect(() => {
    fetchUpcomingShifts(page.currentPage);
  }, [page.currentPage]);

  return (
    <Box
      sx={{
        display: "flex",
        px: { md: 4 },
        pb: { xs: 2, sm: 2, md: 3 },
        flex: 1,
        flexDirection: "column",
        minWidth: 0,
        gap: 1,
      }}
    >
      <Box
        sx={{
          borderRadius: "sm",
          flexWrap: "wrap",
          gap: 1.5,
          "& > *": {
            minWidth: { xs: "120px", md: "160px" },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search for shift</FormLabel>
          <Input
            type="date"
            size="sm"
            placeholder="Search"
            startDecorator={<SearchIcon />}
            onChange={handleDateChange}
            disabled={!data}
            slotProps={{
              input: {
                max: dayjs().format("YYYY-MM-DD"),
              },
            }}
          />
        </FormControl>
      </Box>

      <SmallScreenDivider />

      <AttendanceHistory data={data} />
      <AttendanceHistoryM data={data} />

      <PaginationFooter
        maxPage={page.pageCount}
        currentPage={page.currentPage}
        setCurrentPage={fetchUpcomingShifts}
      />
    </Box>
  );
};

export default UserAttendanceHistoryPage;
