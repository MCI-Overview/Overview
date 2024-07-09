import { NO_SHOW_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import { BlockRounded as BlockIcon } from "@mui/icons-material";

type NoShowCountProps = {
  count: number;
  total: number;
};

export default function NoShowCount({ count, total }: NoShowCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: NO_SHOW_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress size="lg" determinate value={(count / total) * 100}>
          <BlockIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" textColor="common.white">
            Absent
          </Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
