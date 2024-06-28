import {
  Box,
  Divider,
  Stack,
  Typography,
  Card,
  Sheet
} from "@mui/joy";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  active: number,
  inactive: number
};

const HeadcountSection: React.FC<Props> = ({ active, inactive }) => {
  const data = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [active, inactive],
        backgroundColor: ["rgba(54, 162, 235)", "rgba(255, 99, 132, 0.6)"],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      <Card>
        <Box sx={{ mb: 1 }}>
          <Typography level="title-md">Headcount</Typography>
          <Typography level="body-sm">Project candidates</Typography>
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
          <Box sx={{ width: '100%', height: '317px' }}>
            <Doughnut
              data={data}
              options={options}
            />
          </Box>
          <Sheet
            sx={{
              bgcolor: 'background.level1',
              borderRadius: 'sm',
              p: 1.5,
              my: 1.5,
              display: 'flex',
              gap: 2,
              '& > div': { flex: 1 },
            }}
          >
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Active
              </Typography>
              <Typography fontWeight="lg">{active}</Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Inactive
              </Typography>
              <Typography fontWeight="lg">{inactive}</Typography>
            </div>
            <div>
              <Typography level="body-xs" fontWeight="lg">
                Total
              </Typography>
              <Typography fontWeight="lg">{active + inactive}</Typography>
            </div>
          </Sheet>
        </Stack>
      </Card>
    </>
  );
};

export default HeadcountSection;