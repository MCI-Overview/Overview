import { LEAVE_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import { DirectionsWalkRounded as DirectionsWalkIcon } from "@mui/icons-material";

type OnLeaveCountProps = {
  count: number;
  total: number;
};

export default function OnLeaveCount({ count, total }: OnLeaveCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: LEAVE_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress
          size="lg"
          determinate
          value={total > 0 ? (count / total) * 100 : 0}
        >
          <DirectionsWalkIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" textColor="common.white">
            On leave
          </Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
