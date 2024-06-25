import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import { BlockRounded } from "@mui/icons-material";

type LateCountProps = {
  count: number;
  total: number
};

export default function NoShowCount({ count, total }: LateCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: 'rgba(255, 150, 120, 0.8)',
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <BlockRounded />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">Absent</Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card >
  );
}