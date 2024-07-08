import { ON_TIME_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import { QueryBuilderRounded as QueryBuilderIcon } from "@mui/icons-material";

type OnTimeCountProps = {
  count: number;
  total: number;
};

export default function OnTimeCount({ count, total }: OnTimeCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: ON_TIME_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <QueryBuilderIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">On time</Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
