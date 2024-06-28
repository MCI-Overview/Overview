import axios from "axios";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { CustomAttendance } from "../../types";

import UpcomingShifts from "./UpcomingShifts";
import UpcomingShiftsM from "./UpcomingShiftsM";

import { Box, FormControl, FormLabel, Input } from "@mui/joy";
import { SearchRounded as SearchIcon } from "@mui/icons-material";
import PaginationFooter from "../../components/project/ui/PaginationFooter";
import SmallScreenDivider from "../../components/project/ui/SmallScreenDivider";

type Page = {
  isFirstPage: boolean;
  isLastPage: boolean;
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  pageCount: number;
  totalCount: number;
};

const ViewShifts = () => {
  const [data, setData] = useState<CustomAttendance[]>([]);
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
      let url = `/api/user/upcoming/${page}`;
      if (date) {
        const formattedDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
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
        px: { md: 4 },
        pb: { xs: 2, sm: 2, md: 3 },
        flex: 1,
        display: "flex",
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
            disabled={data.length === 0}
          />
        </FormControl>
      </Box>

      <SmallScreenDivider />

      <UpcomingShifts data={data} />
      <UpcomingShiftsM data={data} />

      <PaginationFooter
        maxPage={page.pageCount}
        currentPage={page.currentPage}
        setCurrentPage={fetchUpcomingShifts}
      />
    </Box>
  );
};

export default ViewShifts;
