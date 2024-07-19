import { useState, useEffect } from "react";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { OpUnitType } from "dayjs";

import McCount from "./McCount";
import OnLeaveCount from "./OnLeaveCount";
import LateCount from "./LateCount";
import NoShowCount from "./NoShowCount";
import OnTimeCount from "./OnTimeCount";
import AttendanceGraph from "./AttendanceGraph";
import HeadcountSection from "./HeadcountSection";
import NationalityCount from "./NationalityCount";
import { CustomAdminAttendance } from "../../../types";
import { useProjectContext } from "../../../providers/projectContextProvider";
import AdminProjectAttendanceList from "../attendance/AdminProjectAttendanceList";
import AdminProjectAttendanceTable from "../attendance/AdminProjectAttendanceTable";

import {
  Grid,
  Stack,
  Typography,
  Box,
  Divider,
  Button,
  iconButtonClasses,
  CircularProgress,
  Select,
  Option,
} from "@mui/joy";
import {
  KeyboardArrowRightRounded as KeyboardArrowRightIcon,
  KeyboardArrowLeftRounded as KeyboardArrowLeftIcon,
} from "@mui/icons-material";
import { correctTimes } from "../../../utils/date-time";
import MCMoneyCount from "./MCMoneyCount";
import TransportMoneyCount from "./TransportMoneyCount";
import OtherMoneyCount from "./OtherMoneyCount";

type DisplayData = {
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
  expenses: {
    medical: number;
    transport: number;
    others: number;
  };
};

const ProjectOverview = () => {
  const [timeSpan, setTimeSpan] = useState<string>("week");
  const [data, setData] = useState<CustomAdminAttendance[]>([]);
  const [plotData, setPlotData] = useState<DisplayData>();
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().startOf("isoWeek"));
  const { project } = useProjectContext();

  const projectCuid = project?.cuid;
  let graphStartDate = dayjs(startDate);
  useEffect(() => {
    if (timeSpan === "day") {
      graphStartDate = dayjs(startDate).startOf("day");
    } else if (timeSpan === "week") {
      graphStartDate = dayjs(startDate).startOf("isoWeek");
    } else if (timeSpan === "month") {
      graphStartDate = dayjs(startDate).startOf("month");
    }

    const fetchUpcomingShifts = async () => {
      try {
        const formattedStartDate = dayjs()
          .startOf("day")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        const formattedEndDate = dayjs()
          .endOf("day")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

        axios
          .get(
            `/api/admin/project/${projectCuid}/history?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
          )
          .then((response) => {
            const fetchedData = response.data.map(
              (att: CustomAdminAttendance) => {
                const { correctStart, correctEnd } = correctTimes(
                  att.date,
                  att.shiftStart,
                  att.shiftEnd
                );

                // Needed to convert all string to dayjs object
                return {
                  ...att,
                  date: dayjs(att.date),
                  shiftStart: correctStart,
                  shiftEnd: correctEnd,
                  rawStart: att.rawStart ? dayjs(att.rawStart) : null,
                  rawEnd: att.rawEnd ? dayjs(att.rawEnd) : null,
                };
              }
            );

            setData(fetchedData);
          });
      } catch (error) {
        console.error("Error fetching upcoming shifts: ", error);
      }
    };

    const getDisplayData = async () => {
      let formattedStartDate, formattedEndDate;

      if (timeSpan === "day") {
        formattedStartDate = startDate
          .startOf("day")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        formattedEndDate = startDate
          .endOf("day")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      } else if (timeSpan === "week") {
        formattedStartDate = startDate
          .startOf("isoWeek")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        formattedEndDate = startDate
          .endOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      } else if (timeSpan === "month") {
        formattedStartDate = startDate
          .startOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
        formattedEndDate = startDate
          .endOf("month")
          .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
      }

      axios
        .get(
          `/api/admin/project/${projectCuid}/overview?weekStart=${formattedStartDate}&endDate=${formattedEndDate}`
        )
        .then((response) => {
          setPlotData(response.data);
        });
    };

    getDisplayData();
    fetchUpcomingShifts();
  }, [projectCuid, startDate, timeSpan]);

  const sumArray = (arr: number[]) => arr.reduce((acc, curr) => acc + curr, 0);

  const total = plotData
    ? sumArray(plotData.datasets.leave.data) +
      sumArray(plotData.datasets.late.data) +
      sumArray(plotData.datasets.ontime.data) +
      sumArray(plotData.datasets.medical.data) +
      sumArray(plotData.datasets.absent.data)
    : 0;

  const handlePrevious = () => {
    if (timeSpan === "day") {
      setStartDate((prev) => prev.subtract(1, "day"));
    } else if (timeSpan === "week") {
      setStartDate((prev) => prev.subtract(1, "week").startOf("isoWeek"));
    } else if (timeSpan === "month") {
      setStartDate((prev) => prev.subtract(1, "month").startOf("month"));
    }
  };

  const handleNext = () => {
    if (timeSpan === "day") {
      setStartDate((prev) => prev.add(1, "day"));
    } else if (timeSpan === "week") {
      setStartDate((prev) => prev.add(1, "week").startOf("isoWeek"));
    } else if (timeSpan === "month") {
      setStartDate((prev) => prev.add(1, "month").startOf("month"));
    }
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
                Attendance stats for the {timeSpan}
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
                <OnLeaveCount
                  count={sumArray(plotData?.datasets.leave.data ?? [])}
                  total={total}
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={3}>
                <MCMoneyCount
                  count={plotData?.expenses.medical ?? 0}
                  total={
                    plotData?.expenses.medical +
                    plotData?.expenses.transport +
                    plotData?.expenses.others
                  }
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={3}>
                <TransportMoneyCount
                  count={plotData?.expenses.transport ?? 0}
                  total={
                    plotData?.expenses.medical +
                    plotData?.expenses.transport +
                    plotData?.expenses.others
                  }
                />
              </Grid>
              <Grid xs={12} sm={5} lg={3} xl={3}>
                <OtherMoneyCount
                  count={plotData?.expenses.others ?? 0}
                  total={
                    plotData?.expenses.medical +
                    plotData?.expenses.transport +
                    plotData?.expenses.others
                  }
                />
              </Grid>
            </Grid>

            <Typography level="body-sm">
              {timeSpan.charAt(0).toUpperCase() + timeSpan.slice(1)} attendance
              trends
            </Typography>
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
              <Select
                name={"timeSpan"}
                defaultValue={"week"}
                onChange={(_e, value) => setTimeSpan(value ?? "week")}
              >
                <Option value={"day"}>{startDate.format("DD/MM/YY")}</Option>
                <Option value={"week"}>
                  Week of {startDate.format("DD/MM/YY")}
                </Option>
                <Option value={"month"}>
                  Month of {startDate.format("MMMM")}
                </Option>
              </Select>
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
                weekStart={graphStartDate
                  .startOf(
                    timeSpan === "day"
                      ? "day"
                      : timeSpan === "week"
                      ? ("isoWeek" as OpUnitType)
                      : ("month" as OpUnitType)
                  )
                  .toDate()}
                endDate={startDate
                  .clone()
                  .endOf(
                    timeSpan === "day"
                      ? "day"
                      : timeSpan === "week"
                      ? ("isoWeek" as OpUnitType)
                      : ("month" as OpUnitType)
                  )
                  .toDate()}
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
                Attendance history for {dayjs().format("DD MMM YYYY")}
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
