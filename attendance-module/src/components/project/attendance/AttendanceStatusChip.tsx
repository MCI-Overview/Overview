import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
} from "@mui/icons-material";
import { Chip, ColorPaletteProp } from "@mui/joy";
import { readableEnum } from "../../../utils/capitalize";

interface AttendanceStatusChipProps {
  status: "ON_TIME" | "LATE" | "NO_SHOW" | "MEDICAL" | null;
}

const AttendanceStatusChip = ({ status }: AttendanceStatusChipProps) => {
  return (
    <Chip
      variant="soft"
      size="sm"
      startDecorator={
        {
          ON_TIME: <CheckIcon />,
          LATE: <QueryBuilderIcon />,
          NO_SHOW: <BlockIcon />,
          MEDICAL: <MedicalServicesIcon />,
        }[status || "NO_SHOW"]
      }
      color={
        {
          ON_TIME: "success",
          LATE: "warning",
          NO_SHOW: "danger",
          MEDICAL: "neutral",
        }[status || "NO_SHOW"] as ColorPaletteProp
      }
    >
      {readableEnum(status || "NO_SHOW")}
    </Chip>
  );
};

export default AttendanceStatusChip;
