import {
  Box,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
  ColorPaletteProp,
} from "@mui/joy";
import {
  CheckRounded as CheckIcon,
  BlockRounded as BlockIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { CustomAttendance } from "../../../types";

interface AttendanceHistoryMProps {
  data: CustomAttendance[] | null;
}

const AttendanceHistoryM = ({ data }: AttendanceHistoryMProps) => {
  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {data &&
        data.map((listItem: CustomAttendance) => (
          <List
            key={listItem.cuid}
            size="sm"
            sx={{
              "--ListItem-paddingX": 0,
            }}
          >
            <ListItem
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <ListItemContent
                sx={{ display: "flex", gap: 2, alignItems: "start" }}
              >
                <div>
                  <Typography fontWeight={600} gutterBottom>
                    {dayjs(listItem.shiftDate).format("DD MMM YYYY")}
                  </Typography>
                  <Typography level="body-xs" gutterBottom>
                    {dayjs(listItem.Shift.startTime).format("hh:mm a")} to{" "}
                    {dayjs(listItem.Shift.endTime).format("hh:mm a")}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <Typography level="body-xs">
                      {listItem.Shift.Project.name}
                    </Typography>
                    <Typography level="body-xs">&bull;</Typography>
                    <Typography level="body-xs">
                      {listItem.shiftType}
                    </Typography>
                  </Box>
                </div>
              </ListItemContent>
              <Chip
                variant="soft"
                size="sm"
                startDecorator={
                  {
                    PRESENT: <CheckIcon />,
                    NO_SHOW: <BlockIcon />,
                    MEDICAL: <BlockIcon />,
                  }[listItem.status || "NO_SHOW"]
                }
                color={
                  {
                    PRESENT: "success",
                    NO_SHOW: "danger",
                    MEDICAL: "neutral",
                  }[listItem.status || "NO_SHOW"] as ColorPaletteProp
                }
              >
                {listItem.status || "NO_SHOW"}
              </Chip>
            </ListItem>
            <ListDivider />
          </List>
        ))}
      {data && data.length === 0 && (
        <Typography level="body-md" sx={{ textAlign: "center" }}>
          No attendance history found
        </Typography>
      )}
    </Box>
  );
};

export default AttendanceHistoryM;
