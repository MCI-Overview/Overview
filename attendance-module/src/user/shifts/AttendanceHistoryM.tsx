import dayjs from "dayjs";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";

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

interface AttendanceHistoryMProps {
  data: CustomAttendance[];
}

const AttendanceHistoryM = ({ data }: AttendanceHistoryMProps) => {
  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {data.length === 0 ? (
        <Typography level="body-xs" sx={{ py: 2, textAlign: "center" }}>
          No attendance history found
        </Typography>
      ) : (
        <List
          size="sm"
          sx={{
            "--ListItem-paddingX": 0,
          }}
        >
          {data.map((listItem: CustomAttendance) => (
            <>
              <ListItem
                key={listItem.cuid}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <ListItemContent
                  sx={{ display: "flex", gap: 2, alignItems: "start" }}
                >
                  <Box>
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
                        {readableEnum(listItem.shiftType)}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemContent>

                <Chip
                  variant="soft"
                  size="sm"
                  startDecorator={
                    {
                      ON_TIME: <CheckIcon />,
                      LATE: <CheckIcon />,
                      NO_SHOW: <BlockIcon />,
                      MEDICAL: <BlockIcon />,
                    }[listItem.status || "NO_SHOW"]
                  }
                  color={
                    {
                      ON_TIME: "success",
                      LATE: "warning",
                      NO_SHOW: "danger",
                      MEDICAL: "neutral",
                    }[listItem.status || "NO_SHOW"] as ColorPaletteProp
                  }
                >
                  {readableEnum(listItem.status || "NO_SHOW")}
                </Chip>
              </ListItem>

              <ListDivider />
            </>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AttendanceHistoryM;
