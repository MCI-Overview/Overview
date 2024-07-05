import { LATE_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography} from "@mui/joy";
import { QueryBuilderRounded as QueryBuilderIcon } from "@mui/icons-material";

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
          <QueryBuilderIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md">Late</Typography>
          <Typography level="h2">{count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}
