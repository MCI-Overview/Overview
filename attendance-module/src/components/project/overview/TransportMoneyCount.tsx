import { LATE_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';

type McCountProps = {
  count: number;
  total: number;
};

export default function TransportMoneyCount({ count, total }: McCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: LATE_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress
          size="lg"
          determinate
          value={total > 0 ? (count / total) * 100 : 0}
        >
          <TimeToLeaveIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" textColor="common.white">
            Transport Expense
          </Typography>
          <Typography level="h2">$ {count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}