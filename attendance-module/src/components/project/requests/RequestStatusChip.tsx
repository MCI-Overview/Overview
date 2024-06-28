import {
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
  HourglassEmptyRounded as HourglassEmptyIcon,
} from "@mui/icons-material";
import { Chip, ColorPaletteProp } from "@mui/joy";
import { readableEnum } from "../../../utils/capitalize";

interface RequestStatusChipProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}

const RequestStatusChip = ({ status }: RequestStatusChipProps) => {
  return (
    <Chip
      variant="soft"
      size="sm"
      startDecorator={
        {
          APPROVED: <CheckIcon />,
          CANCELLED: <ClearIcon />,
          REJECTED: <BlockIcon />,
          PENDING: <HourglassEmptyIcon />,
        }[status]
      }
      color={
        {
          APPROVED: "success",
          CANCELLED: "neutral",
          REJECTED: "danger",
          PENDING: "warning",
        }[status] as ColorPaletteProp
      }
    >
      {readableEnum(status)}
    </Chip>
  );
};

export default RequestStatusChip;
