import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type AttendanceGraphProps = {
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
  weekStart: Date;
};

const options = {
  plugins: {
    tooltip: {
      mode: "index" as const,
      intersect: false,
    },
    legend: {
      display: true,
      position: "top" as const,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
      ticks: {
        stepSize: 1,
      },
    },
  },
};

const AttendanceGraph: React.FC<AttendanceGraphProps> = ({
  datasets,
  weekStart,
}) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const labels = days.map(
    (day, index) =>
      `${day.substring(0, 3)} ${dayjs(weekStart)
        .add(index, "days")
        .format("DD/MM")}`
  );
  const data = {
    labels,
    datasets: [
      {
        label: "Leave",
        data: datasets.leave.data,
        backgroundColor: "rgba(75, 90, 192, 0.5)",
      },
      {
        label: "Late",
        data: datasets.late.data,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Medical",
        data: datasets.medical.data,
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "Absent",
        data: datasets.absent.data,
        backgroundColor: "rgba(255, 150, 120, 0.5)",
      },
      {
        label: "On Time",
        data: datasets.ontime.data,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  return (
    <div style={{ minHeight: "500px" }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default AttendanceGraph;
