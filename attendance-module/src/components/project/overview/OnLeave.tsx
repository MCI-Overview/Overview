import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CircularProgress from '@mui/joy/CircularProgress';
import Typography from '@mui/joy/Typography';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

type LateCountProps = {
  count: number;
  total: number
};

export default function OnLeave({ count, total }: LateCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: 'rgba(75, 90, 192, 0.8)',
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <DirectionsWalkIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">On leave</Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card >
  );
}