import {
  Select,
  Stack,
  Option,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Box,
} from "@mui/joy";
import { useUserContext } from "../providers/userContextProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  LocalHospitalRounded as HospitalIcon,
  AccessTimeFilledRounded as AccessTimeIcon,
  BeachAccessRounded as LeaveIcon,
} from "@mui/icons-material";
import axios from "axios";

type Report = {
  onTime: number;
  late: number;
  noShow: number;
  hoursWorked: number;
  scheduledHoursWorked: number;
  mc: number;
  leave: number;
};

export default function UserReport() {
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const { user } = useUserContext();
  const userStartDate = user?.userType === "User" && dayjs(user.createdAt);
  const currentDate = dayjs();

  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.month(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.year());

  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    axios
      .get("/api/user/report", {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      })
      .then((response) => {
        setReport(response.data);
      });
  }, [selectedMonth, selectedYear]);

  if (!userStartDate) return null;

  if (!report) return null;

  const data = {
    labels: ["On Time", "Late", "Absent"],
    datasets: [
      {
        data: [report.onTime, report.late, report.noShow],
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 99, 132, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Stack
      spacing={4}
      sx={{
        display: "flex",
        maxWidth: "600px",
        mx: "auto",
      }}
    >
      <Card
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack direction="row" justifyContent="center" gap={1}>
          <Select
            value={selectedMonth}
            onChange={(_e, value) => {
              if (typeof value !== "number") return;
              setSelectedMonth(value);
            }}
          >
            {MONTHS.map((month, index) => (
              <Option
                key={index}
                value={index}
                disabled={
                  (selectedYear === userStartDate.year() &&
                    index < userStartDate.month()) ||
                  (selectedYear === currentDate.year() &&
                    index > currentDate.month())
                }
              >
                {month}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedYear}
            onChange={(_e, value) => {
              if (typeof value !== "number") return;
              setSelectedYear(value);

              if (
                value === userStartDate.year() &&
                selectedMonth < userStartDate.month()
              ) {
                setSelectedMonth(userStartDate.month());
              }

              if (
                value === currentDate.year() &&
                selectedMonth > currentDate.month()
              ) {
                setSelectedMonth(currentDate.month());
              }
            }}
          >
            {Array.from(
              { length: dayjs().year() - userStartDate.year() + 1 },
              (_, index) => {
                const year = userStartDate.year() + index;
                return (
                  <Option key={index} value={year}>
                    {year}
                  </Option>
                );
              },
            )}
          </Select>
        </Stack>
        <Stack
          sx={{
            flexDirection: {
              sm: "column",
              md: "row",
            },
          }}
        >
          <Box sx={{ maxWidth: "300px" }}>
            {report.onTime || report.late || report.noShow ? (
              <Doughnut data={data} />
            ) : null}
            {!report.onTime && !report.late && !report.noShow && (
              <Typography
                height="300px"
                width="300px"
                textAlign="center"
                alignContent="center"
              >
                No data available
              </Typography>
            )}
          </Box>
          <Stack
            sx={{
              flexDirection: {
                xs: "row",
                md: "column",
              },
              rowGap: {
                sm: "4px",
                md: "4px",
              },
              columnGap: {
                sm: "0.25rem",
                md: "0.25rem",
              },
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Card
              variant="solid"
              color="primary"
              invertedColors
              sx={{
                margin: "0.15rem",
                width: { xs: "100%", sm: "11.25rem" },
              }}
            >
              <CardContent orientation="horizontal">
                <CircularProgress
                  size="md"
                  determinate
                  value={
                    (report.hoursWorked / report.scheduledHoursWorked) * 100
                  }
                >
                  <AccessTimeIcon />
                </CircularProgress>
                <CardContent>
                  <Typography level="body-xs">Hours Worked</Typography>
                  <Typography level="title-sm">
                    {report.hoursWorked.toFixed(2)} H
                  </Typography>
                </CardContent>
              </CardContent>
            </Card>
            <Card
              variant="solid"
              color="danger"
              invertedColors
              sx={{
                margin: "0.15rem",
                width: { xs: "100%", sm: "11.25rem" },
              }}
            >
              <CardContent orientation="horizontal">
                <CircularProgress
                  size="md"
                  determinate
                  value={(report.mc / 14) * 100}
                >
                  <HospitalIcon />
                </CircularProgress>
                <CardContent>
                  <Typography level="body-xs">MCs Taken</Typography>
                  <Typography level="title-sm">{report.mc}</Typography>
                </CardContent>
              </CardContent>
            </Card>
            <Card
              variant="solid"
              color="success"
              invertedColors
              sx={{
                margin: "0.15rem",
                width: { xs: "100%", sm: "11.25rem" },
              }}
            >
              <CardContent orientation="horizontal">
                <CircularProgress
                  size="md"
                  determinate
                  value={(report.leave / 14) * 100}
                >
                  <LeaveIcon />
                </CircularProgress>
                <CardContent>
                  <Typography level="body-xs">Leave Taken</Typography>
                  <Typography level="title-sm">{report.leave}</Typography>
                </CardContent>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
}
