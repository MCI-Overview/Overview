import { useState, useEffect } from "react";
import { CustomAdminAttendance } from "../../../types";
import { useProjectContext } from "../../../providers/projectContextProvider";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import AdminProjectAttendanceTable from "../attendance/AdminProjectAttendanceTable";
import AdminProjectAttendanceList from "../attendance/AdminProjectAttendanceList";
import LateCount from "./LateCount";
import McCount from "./McCount";
import NoShowCount from "./NoShowCount";
import OnTimeCount from "./OnTimeCount";
import OnLeave from "./OnLeave";

import {
  Grid,
  Stack,
  Typography,
  Box,
  Divider,
  Button,
  iconButtonClasses,
  CircularProgress,
} from "@mui/joy";
import {
  KeyboardArrowRightRounded as KeyboardArrowRightIcon,
  KeyboardArrowLeftRounded as KeyboardArrowLeftIcon,
} from "@mui/icons-material";
import AttendanceGraph from "./AttendanceGraph";
import HeadcountSection from "./HeadcountSection";
import NationalityCount from "./NationalityCount";

type displayData = {
  datasets: {
    leave: {
      data: number[];
    };
    late: {
      data: number[];
    };
    ontime: {
      data: number[];
    };
    medical: {
      data: number[];
    };
    absent: {
      data: number[];
    };
  };
  headcount: {
    nationality: {
      singapore: number;
      malaysia: number;
      china: number;
    };
    endDate: {
      ongoing: number;
      hasEnded: number;
    };
  };
};

const ProjectOverview = () => {
  const [data, setData] = useState<CustomAdminAttendance[]>([]);
  const [plotData, setPlotData] = useState<displayData>();
  const [weekStart, setWeekStart] = useState<Dayjs>(dayjs().startOf("week"));
  const context = useProjectContext();
  const projectCuid = context.project?.cuid;
  const startDate = dayjs().startOf("day").toISOString();
  const endDate = dayjs().endOf("day").toISOString();

  useEffect(() => {
    const fetchUpcomingShifts = async (startDate: string, endDate: string) => {
      try {
        const formattedStartDate = dayjs(startDate).format(
          "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
        );
        const formattedEndDate = dayjs(endDate).format(
          "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
        );
        const url = `/api/admin/project/${projectCuid}/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
        const response = await axios.get(url);
        const fetchedData = response.data;
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching upcoming shifts: ", error);
      }
    };

    const getDisplayData = async () => {
      const formattedWeekStart = dayjs(weekStart).format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      );
      const url = `/api/admin/project/${projectCuid}/overview?weekStart=${formattedWeekStart}`;
      const response = await axios.get(url);
      const fetchedData = response.data;
      setPlotData(fetchedData);
    };

    getDisplayData();
    fetchUpcomingShifts(startDate, endDate);
  }, [startDate, endDate, projectCuid, weekStart]);

  const sumArray = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);

  const total = plotData
    ? sumArray(plotData.datasets.leave.data) +
      sumArray(plotData.datasets.late.data) +
      sumArray(plotData.datasets.ontime.data) +
      sumArray(plotData.datasets.medical.data) +
      sumArray(plotData.datasets.absent.data)
    : 0;

  const handlePrevious = () => {
    setWeekStart((prev) => prev.subtract(1, "week"));
  };

  const handleNext = () => {
    setWeekStart((prev) => prev.add(1, "week"));
  };

  const defaultHeadcount = {
    singapore: 0,
    malaysia: 0,
    china: 0,
  };

  const headcount = plotData?.headcount?.nationality ?? defaultHeadcount;

  if (!plotData)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </div>
      </div>
    );

  return (
    <>
      <Box
        sx={{
          display: "flex-start",
          px: { xs: 0, md: 4 },
          pb: { xs: 2, sm: 2, md: 3 },
          flex: 1,
          flexDirection: "column",
          minWidth: 0,
          gap: 1,
        }}
      >
        <Stack
          pt={2}
          spacing={2}
          sx={{
            display: "flex-start",
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  level="title-lg"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Attendance trends
                </Typography>
              </Box>

              <Typography level="body-sm">
                Attendance stats for the week
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            <Grid
              container
              columnGap={2}
              rowGap={2}
              sx={{ flexGrow: 1, mx: 0 }}
            >
              <Grid xs={12} sm={5} lg={3} xl={2}>
                <LateCount
                  count={sumArray(plotData?.datasets.late.data ?? [])}
                  total={total}
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={2}>
                <McCount
                  count={sumArray(plotData?.datasets.medical.data ?? [])}
                  total={total}
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={2}>
                <NoShowCount
                  count={sumArray(plotData?.datasets.absent.data ?? [])}
                  total={total}
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={2}>
                <OnTimeCount
                  count={sumArray(plotData?.datasets.ontime.data ?? [])}
                  total={total}
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={2}>
                <OnLeave
                  count={sumArray(plotData?.datasets.leave.data ?? [])}
                  total={total}
                />
              </Grid>
            </Grid>

            <Typography level="body-sm">Weekly attendance trends</Typography>
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
                onClick={handlePrevious}
              >
                Previous
              </Button>

              <Box sx={{ flex: 1 }} />
              <Button size="sm" variant="outlined" color="neutral">
                Week of {weekStart.format("DD/MM/YY")}
              </Button>
              <Box sx={{ flex: 1 }} />

              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                endDecorator={<KeyboardArrowRightIcon />}
                onClick={handleNext}
              >
                Next
              </Button>
            </Box>
            {plotData && (
              <AttendanceGraph
                datasets={plotData.datasets}
                weekStart={weekStart.toDate()}
              />
            )}
          </Stack>
        </Stack>

        <Stack
          pt={4}
          spacing={2}
          sx={{
            display: "flex-start",
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  level="title-lg"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Candidate report
                </Typography>
              </Box>

              <Typography level="body-sm">
                Overview of candidate information.
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Stack columnGap={2} rowGap={2} sx={{ flexGrow: 1, mx: 0 }}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <HeadcountSection
                  active={plotData?.headcount.endDate.ongoing ?? 0}
                  inactive={plotData?.headcount.endDate.hasEnded ?? 0}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <NationalityCount headcount={headcount} />
              </Grid>
            </Grid>
          </Stack>
        </Stack>

        <Stack
          pt={4}
          spacing={2}
          sx={{
            display: "flex-start",
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Typography
                  level="title-lg"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Daily attendance
                </Typography>
              </Box>

              <Typography level="body-sm">
                Attendance history for {dayjs(startDate).format("DD MMM YYYY")}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            <AdminProjectAttendanceTable data={data} />
            <AdminProjectAttendanceList data={data} />
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default ProjectOverview;
