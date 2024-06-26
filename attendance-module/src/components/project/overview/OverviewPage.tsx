import { useState, useEffect } from "react";
import { CustomAdminAttendance } from "../../../types";
import { useProjectContext } from "../../../providers/projectContextProvider";
import axios from "axios";
import dayjs from "dayjs";
import ProjectAttendance from "../../../admin/projects-components/ProjectAttendance";
import ProjectAttendanceM from "../../../admin/projects-components/ProjectAttendanceM";
import LateCount from "./LateCount";
import McCount from "./McCount";
import NoShowCount from "./NoShowCount";
import OnTimeCount from "./OnTimeCount";
import CandidaeCount from "./CandidateCount";
import OnLeave from "./OnLeave";

import {
  Grid,
  Stack,
  Typography,
  Box,
  Divider
} from "@mui/joy";
import AttendanceGraph from "./AttendanceGraph";

type displayData = {
  datasets: {
    leave: {
      data: number[],
    },
    late: {
      data: number[],
    },
    ontime: {
      data: number[],
    },
    medical: {
      data: number[],
    },
    absent: {
      data: number[],
    },
  };
};

const ProjectOverview = () => {
  const [data, setData] = useState<CustomAdminAttendance[]>([]);
  const [plotData, setPlotData] = useState<displayData>();
  const context = useProjectContext();
  const projectCuid = context.project?.cuid;
  const startDate = dayjs().startOf('day').toISOString();
  const endDate = dayjs().endOf('day').toISOString();
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
      const weekStart = dayjs().startOf('week').toISOString();
      const formattedWeekStart = dayjs(weekStart).format(
        "YYYY-MM-DDTHH:mm:ss.SSS[Z]"
      );
      const url = `/api/admin/project/${projectCuid}/overview?weekStart=${formattedWeekStart}`;
      const response = await axios.get(url);
      const fetchedData = response.data;
      setPlotData(fetchedData);
    }

    getDisplayData();
    fetchUpcomingShifts(startDate, endDate);
  }, [startDate, endDate, projectCuid]);

  const sumArray = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);

  const total = plotData
    ? sumArray(plotData.datasets.leave.data) +
    sumArray(plotData.datasets.late.data) +
    sumArray(plotData.datasets.ontime.data) +
    sumArray(plotData.datasets.medical.data) +
    sumArray(plotData.datasets.absent.data)
    : 0;

  console.log('total', total);
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
                Attendance history for {dayjs(startDate).format('DD MMM YYYY')}
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            <ProjectAttendance data={data} />
            <ProjectAttendanceM data={data} />
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
                  Attendance trends
                </Typography>
              </Box>

              <Typography level="body-sm">
                Attendance stats for the entire project
              </Typography>
            </Box>
          </Box>
          <Divider />
          <Stack spacing={2} sx={{ my: 1 }}>
            <Grid container sx={{ flexGrow: 1 }}>
              <Grid xs={12} md={6} lg={3} pr={2} pb={2}>
                <LateCount count={sumArray(plotData?.datasets.late.data ?? [])} total={total} />
              </Grid>
              <Grid xs={12} md={6} lg={3} pr={2} pb={2}>
                <McCount count={sumArray(plotData?.datasets.medical.data ?? [])} total={total} />
              </Grid>
              <Grid xs={12} md={6} lg={3} pr={2} pb={2}>
                <NoShowCount count={sumArray(plotData?.datasets.absent.data ?? [])} total={total} />
              </Grid>
              <Grid xs={12} md={6} lg={3} pr={2} pb={2}>
                <OnTimeCount count={sumArray(plotData?.datasets.ontime.data ?? [])} total={total} />
              </Grid>
              <Grid xs={12} md={6} lg={3} pr={2} pb={2}>
                <OnLeave count={sumArray(plotData?.datasets.leave.data ?? [])} total={total} />
              </Grid>
            </Grid>

            <Typography level="body-sm">
              Weekly attendance trends
            </Typography>
            <Divider />
            {plotData && <AttendanceGraph datasets={plotData.datasets} />}
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
          <Stack spacing={2} sx={{ my: 1 }}>
            <CandidaeCount />
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default ProjectOverview;