import { NO_SHOW_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import SellIcon from '@mui/icons-material/Sell';

type McCountProps = {
  count: number;
  total: number;
};

export default function OtherMoneyCount({ count, total }: McCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: NO_SHOW_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress
          size="lg"
          determinate
          value={total > 0 ? (count / total) * 100 : 0}
        >
          <SellIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" textColor="common.white">
            Other Expense
          </Typography>
          <Typography level="h2">$ {count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}