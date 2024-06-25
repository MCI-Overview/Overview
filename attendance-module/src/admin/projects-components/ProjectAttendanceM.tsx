import dayjs from "dayjs";
import { CustomAdminAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";

import {
  Box,
  Chip,
  Dropdown,
  IconButton,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Menu,
  MenuButton,
  MenuItem,
  Typography,
} from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
  MoreHorizRounded as MoreHorizIcon,
} from "@mui/icons-material";
import { ColorPaletteProp } from "@mui/joy/styles";

function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: "plain", color: "neutral", size: "sm" } }}
      >
        <MoreHorizIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit?</MenuItem>
      </Menu>
    </Dropdown>
  );
}

type Props = {
  data: CustomAdminAttendance[];
};

const ProjectAttendanceM: React.FC<Props> = ({ data }) => {
  const attendanceData = data;

  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {attendanceData.length == 0 ? (
        <Typography
          level="body-xs"
          sx={{ display: "flex", justifyContent: "center", py: 2 }}
        >
          No candidates found
        </Typography>
      ) : (
        attendanceData.map((listItem: CustomAdminAttendance) => (
          <List
            key={listItem.attendanceCuid}
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
                <Box>
                  <Typography fontWeight={600} gutterBottom>
                    {dayjs(listItem.date).format("DD MMM YYYY")}
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
                    <Typography level="body-md">{listItem.name}</Typography>
                    <Typography level="body-md">&bull;</Typography>
                    <Typography level="body-md">{listItem.nric}</Typography>
                  </Box>
                  <Typography level="body-xs">Shift</Typography>
                  <Typography level="body-md" gutterBottom>
                    {dayjs(listItem.shiftStart).format("hh:mm a")} -{" "}
                    {dayjs(listItem.shiftEnd).format("hh:mm a")}
                  </Typography>
                  <Typography level="body-xs">Clock in / out</Typography>
                  <Typography level="body-md" gutterBottom>
                    {listItem.rawStart
                      ? dayjs(listItem.rawStart).format("hh:mm a")
                      : "N/A"}{" "}
                    -{" "}
                    {listItem.rawEnd
                      ? dayjs(listItem.rawEnd).format("hh:mm a")
                      : "N/A"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <RowMenu />
                  </Box>
                </Box>
              </ListItemContent>
              <Chip
                variant="soft"
                size="sm"
                startDecorator={
                  {
                    ON_TIME: <CheckIcon />,
                    LATE: <QueryBuilderIcon />,
                    NO_SHOW: <BlockIcon />,
                    MEDICAL: <MedicalServicesIcon />,
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
          </List>
        ))
      )}
    </Box>
  );
};

export default ProjectAttendanceM;
