import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import { MedicalServicesRounded } from "@mui/icons-material";

type LateCountProps = {
  count: number;
  total: number
};

export default function McCount({ count, total }: LateCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: 'rgba(54, 162, 235, 0.8 )',
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <MedicalServicesRounded />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">Medical</Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card >
  );
}