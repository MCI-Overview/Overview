import {
  AlignHorizontalLeftRounded as AlignHorizontalLeftIcon,
  HourglassFullRounded as HourglassIcon,
  HourglassTopRounded as HourglassTopIcon,
  HourglassBottomRounded as HourglassBottomIcon,
} from "@mui/icons-material";

export default function RosterIcon({
  type,
  isPartial,
}: {
  type: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
  isPartial?: boolean;
}) {
  if (isPartial) {
    return <AlignHorizontalLeftIcon sx={{ color: "inherit" }} />;
  }

  if (type === "FULL_DAY") {
    return <HourglassIcon sx={{ color: "inherit" }} />;
  }

  if (type === "FIRST_HALF") {
    return <HourglassTopIcon sx={{ color: "inherit" }} />;
  }

  if (type === "SECOND_HALF") {
    return <HourglassBottomIcon sx={{ color: "inherit" }} />;
  }

  return null;
}
