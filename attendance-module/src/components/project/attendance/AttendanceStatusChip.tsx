import { readableEnum } from "../../../utils/capitalize";

import { Chip, ColorPaletteProp } from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
  EventNoteOutlined as EventNoteIcon,
  WorkOffOutlined as WorkOffIcon,
} from "@mui/icons-material";

interface AttendanceStatusChipProps {
  leave: "FULLDAY" | "HALFDAY" | null;
  status: "ON_TIME" | "LATE" | "NO_SHOW" | "MEDICAL" | null;
}

const AttendanceStatusChip = ({ leave, status }: AttendanceStatusChipProps) => {
  // Only displays for full day leaves,
  // since half day leaves still have a status
  if (leave === "FULLDAY")
    return (
      <Chip
        variant="outlined"
        size="sm"
        color="primary"
        startDecorator={<WorkOffIcon />}
      >
        On Leave
      </Chip>
    );

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
