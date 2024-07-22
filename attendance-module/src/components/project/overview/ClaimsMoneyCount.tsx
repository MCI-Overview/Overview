import { MEDICAL_COLOR } from "../../../utils/colors";

import { Card, CardContent, CircularProgress, Typography } from "@mui/joy";
import { MedicalServicesRounded as MedicalServicesIcon } from "@mui/icons-material";

type McCountProps = {
  count: number;
  total: number;
};

export default function ClaimsMoneyCount({ count, total }: McCountProps) {
  return (
    <Card
      variant="solid"
      invertedColors
      sx={{
        backgroundColor: MEDICAL_COLOR,
      }}
    >
      <CardContent orientation="horizontal">
        <CircularProgress
          size="lg"
          determinate
          value={total > 0 ? (count / total) * 100 : 0}
        >
          <MedicalServicesIcon />
        </CircularProgress>
        <CardContent>
          <Typography level="body-md" textColor="common.white">
            Claims
          </Typography>
          <Typography level="h2">$ {count}</Typography>
        </CardContent>
      </CardContent>
    </Card>
  );
}