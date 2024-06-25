import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import { QueryBuilderRounded as QueryBuilderIcon } from "@mui/icons-material";

type LateCountProps = {
  count: number;
  total: number;
};

export default function HoursWorked({ count, total }: LateCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: "rgba(75, 192, 192)",
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <QueryBuilderIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">Hours worked</Typography>
          <Typography level="h2">{count.toFixed(2)}H</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
