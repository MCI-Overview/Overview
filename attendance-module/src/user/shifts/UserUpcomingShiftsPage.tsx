import axios from "axios";
import dayjs from "dayjs";
import { ChangeEvent, useEffect, useState } from "react";
import { CustomAttendance } from "../../types";

import UpcomingShifts from "./UserUpcomingShiftsTable";
import UpcomingShiftsM from "./UserUpcomingShiftsList";
import SmallScreenDivider from "../../components/project/ui/SmallScreenDivider";
import PaginationFooter from "../../components/project/ui/PaginationFooter";

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

const ViewShifts = () => {
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

  const sortedData =
    data?.sort((a, b) => {
      if (dayjs(a.shiftDate).isBefore(dayjs(b.shiftDate))) return -1;
      if (dayjs(a.shiftDate).isAfter(dayjs(b.shiftDate))) return 1;

      if (a.Shift.startTime < b.Shift.startTime) return -1;
      if (a.Shift.startTime > b.Shift.startTime) return 1;

      return 0;
    }) || null;

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
            disabled={!data}
            slotProps={{
              input: {
                min: dayjs().format("YYYY-MM-DD"),
              },
            }}
          />
        </FormControl>
      </Box>

      <SmallScreenDivider />

      <UpcomingShifts data={sortedData} />
      <UpcomingShiftsM data={sortedData} />

      <PaginationFooter
        maxPage={page.pageCount}
        currentPage={page.currentPage}
        setCurrentPage={fetchUpcomingShifts}
      />
    </Box>
  );
};

export default ViewShifts;
