import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import { QueryBuilderRounded as QueryBuilderIcon } from "@mui/icons-material";

type LateCountProps = {
  count: number;
  total: number
};

export default function LateCount({ count, total }: LateCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <QueryBuilderIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">Late</Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card >
  );
}