import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
  EventNoteOutlined as EventNoteIcon,
} from "@mui/icons-material";
import { Chip, ColorPaletteProp } from "@mui/joy";
import { readableEnum } from "../../../utils/capitalize";

interface AttendanceStatusChipProps {
  status: "ON_TIME" | "LATE" | "NO_SHOW" | "MEDICAL" | null;
}

const AttendanceStatusChip = ({ status }: AttendanceStatusChipProps) => {
  if (!status)
    return (
      <Chip
        variant="outlined"
        size="sm"
        color="primary"
        startDecorator={<EventNoteIcon />}
      >
        Upcoming
      </Chip>
    );

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
        }[status]
      }
      color={
        {
          ON_TIME: "success",
          LATE: "warning",
          NO_SHOW: "danger",
          MEDICAL: "neutral",
        }[status] as ColorPaletteProp
      }
    >
      {readableEnum(status)}
    </Chip>
  );
};

export default AttendanceStatusChip;
