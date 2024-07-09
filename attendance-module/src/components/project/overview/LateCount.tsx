import { LATE_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import { WatchLaterRounded as WatchLaterIcon } from "@mui/icons-material";

type LateCountProps = {
  count: number;
  total: number;
};

export default function LateCount({ count, total }: LateCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: LATE_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <WatchLaterIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" textColor="common.white">
            Late
          </Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
