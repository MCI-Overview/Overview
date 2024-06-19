import { FC } from "react";
import { ColorPaletteProp } from "@mui/joy/styles";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import ListDivider from "@mui/joy/ListDivider";
import dayjs from "dayjs";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import BlockIcon from "@mui/icons-material/Block";
import { CustomAttendance } from "../../../types";

type Props = {
  data: CustomAttendance[];
};

const AttendanceHistoryM: FC<Props> = ({ data }) => {
  const attendanceData = data;

  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {attendanceData &&
        attendanceData.map((listItem: CustomAttendance) => (
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
                    PRESENT: <CheckRoundedIcon />,
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
    </Box>
  );
};

export default AttendanceHistoryM;
