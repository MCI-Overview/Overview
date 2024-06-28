import {
  WorkOffOutlined as WorkOffIcon,
  FlightTakeoffRounded as FlightTakeoffIcon,
  ReceiptLongRounded as ReceiptLongIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
} from "@mui/icons-material";
import { Chip, ColorPaletteProp } from "@mui/joy";
import { readableEnum } from "../../../utils/capitalize";

interface RequestTypeChipProps {
  type:
    | "CLAIM"
    | "PAID_LEAVE"
    | "UNPAID_LEAVE"
    | "MEDICAL_LEAVE"
    | "RESIGNATION";
  size?: "sm" | "md" | "lg";
}

const RequestTypeChip = ({ type, size }: RequestTypeChipProps) => {
  return (
    <Chip
      variant="soft"
      size={size || "sm"}
      startDecorator={
        {
          CLAIM: <ReceiptLongIcon />,
          PAID_LEAVE: <WorkOffIcon />,
          UNPAID_LEAVE: <WorkOffIcon />,
          MEDICAL_LEAVE: <MedicalServicesIcon />,
          RESIGNATION: <FlightTakeoffIcon />,
        }[type]
      }
      color={
        {
          CLAIM: "success",
          PAID_LEAVE: "primary",
          UNPAID_LEAVE: "primary",
          MEDICAL_LEAVE: "neutral",
          RESIGNATION: "danger",
        }[type] as ColorPaletteProp
      }
    >
      {readableEnum(type)}
    </Chip>
  );
};

export default RequestTypeChip;
