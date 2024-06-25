import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomAttendance } from "../../types";
import { readableEnum } from "../../utils/capitalize";

import {
  ColorPaletteProp,
  Box,
  Chip,
  Typography,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
} from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  CheckRounded as CheckIcon,
  QueryBuilderRounded as QueryBuilderIcon,
  MedicalServicesOutlined as MedicalServicesIcon,
} from "@mui/icons-material";

interface UpcomingShiftsMProps {
  data: CustomAttendance[];
}

const UpcomingShiftsM = ({ data }: UpcomingShiftsMProps) => {
  return (
    <>
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        {data.length === 0 ? (
          <Typography level="body-xs" sx={{ py: 2, textAlign: "center" }}>
            No upcoming shifts found
          </Typography>
        ) : (
          <List
            size="sm"
            sx={{
              "--ListItem-paddingX": 0,
            }}
          >
            {data.map((listItem: CustomAttendance) => (
              <Fragment key={listItem.cuid}>
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
                        LATE: <QueryBuilderIcon />,
                        NO_SHOW: <BlockIcon />,
                        MEDICAL: <MedicalServicesIcon />,
                        UPCOMING: null,
                      }[listItem.status || "UPCOMING"]
                    }
                    color={
                      {
                        ON_TIME: "success",
                        LATE: "warning",
                        NO_SHOW: "danger",
                        MEDICAL: "neutral",
                        UPCOMING: "success",
                      }[listItem.status || "UPCOMING"] as ColorPaletteProp
                    }
                  >
                    {readableEnum(listItem.status || "UPCOMING")}
                  </Chip>
                </ListItem>
                <ListDivider />
              </Fragment>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};

export default UpcomingShiftsM;
