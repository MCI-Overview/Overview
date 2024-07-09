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
import {
  LATE_COLOR,
  LEAVE_COLOR,
  MEDICAL_COLOR,
  NO_SHOW_COLOR,
  ON_TIME_COLOR,
  UPCOMING_COLOR,
} from "../../../utils/colors";

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
        sx={{
          color: "white",
          backgroundColor: LEAVE_COLOR,
        }}
      >
        On Leave
      </Chip>
    );

  if (!status)
    return (
      <Chip
        variant="outlined"
        size="sm"
        startDecorator={<EventNoteIcon />}
        sx={{
          color: "white",
          backgroundColor: UPCOMING_COLOR,
        }}
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
      sx={{
        color: "white",
        backgroundColor: {
          ON_TIME: ON_TIME_COLOR,
          LATE: LATE_COLOR,
          NO_SHOW: NO_SHOW_COLOR,
          MEDICAL: MEDICAL_COLOR,
        }[status] as ColorPaletteProp,
      }}
    >
      {readableEnum(status)}
    </Chip>
  );
};

export default AttendanceStatusChip;
