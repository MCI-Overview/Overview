import { Select, Stack, Option, Card, Typography, Box } from "@mui/joy";
import { useUserContext } from "../providers/userContextProvider";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import OnLeaveCount from "../components/project/overview/OnLeaveCount";
import McCount from "../components/project/overview/McCount";
import HoursWorked from "../components/project/overview/HoursWorked";

ChartJS.register(ArcElement, Tooltip, Legend);

type Report = {
  onTime: number;
  late: number;
  noShow: number;
  others: number;
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
    currentDate.month()
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
    labels: ["On Time", "Late", "Absent", "Others"],
    datasets: [
      {
        data: [report.onTime, report.late, report.noShow, report.others],
        backgroundColor: [
          "rgba(75, 192, 192, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 150, 120, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
      },
    ],
  };

  return (
    <Stack
      spacing={2}
      sx={{
        display: "flex",
        maxWidth: "800px",
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
              }
            )}
          </Select>
        </Stack>
        <Stack
          spacing={2}
          sx={{
            justifyContent: "center",
            alignItems: "center",
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
        </Stack>
      </Card>

      <HoursWorked
        count={report.hoursWorked}
        total={report.scheduledHoursWorked}
      />
      <McCount count={report.mc} total={14} />
      <OnLeaveCount count={report.leave} total={14} />
    </Stack>
  );
}
