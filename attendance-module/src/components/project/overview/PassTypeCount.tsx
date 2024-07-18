import { Box, Divider, Stack, Typography, Card } from "@mui/joy";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js/auto";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Headcount {
  [key: string]: number;
}

interface BarChartProps {
  headcount: Headcount;
}

const PassTypeCount: React.FC<BarChartProps> = ({ headcount }) => {
  const labels = Object.keys(headcount).map(nationality => nationality.charAt(0).toUpperCase() + nationality.slice(1));
  const dataValues = Object.values(headcount);

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {},
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card>
      <Box sx={{ mb: 1 }}>
        <Typography level="title-md">Headcount</Typography>
        <Typography level="body-sm">Pass types</Typography>
      </Box>
      <Divider />
      <Stack
        spacing={2}
        sx={{
          my: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", height: "400px" }}>
          <Bar data={data} options={options} />
        </Box>
      </Stack>
    </Card>
  );
};

export default PassTypeCount;