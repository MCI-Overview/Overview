import {
  Box,
  Chip,
  Typography,
  ColorPaletteProp,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
} from "@mui/joy";
import {
  PendingRounded as PendingIcon,
  BlockRounded as BlockIcon,
  AutorenewRounded as AutorenewIcon,
  CheckRounded as CheckIcon,
} from "@mui/icons-material";
import { CustomRequest } from "../../types";
import dayjs from "dayjs";

const CurrentRequestsM = ({ data }: { data: CustomRequest[] }) => {
  return (
    <>
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        {data &&
          data.map((listItem: CustomRequest) => (
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
                      {dayjs(listItem.createdAt).format("DD MMM YYYY")}
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
                        {listItem.Assign.Project.name}
                      </Typography>
                      <Typography level="body-xs">&bull;</Typography>
                      <Typography level="body-xs">{listItem.type}</Typography>
                    </Box>
                  </div>
                </ListItemContent>
                <Chip
                  variant="soft"
                  size="sm"
                  startDecorator={
                    {
                      APPROVED: <CheckIcon />,
                      CANCELLED: <AutorenewIcon />,
                      REJECTED: <BlockIcon />,
                      PENDING: <PendingIcon />,
                    }[listItem.status || "UPCOMING"]
                  }
                  color={
                    {
                      APPROVED: "success",
                      CANCELLED: "neutral",
                      REJECTED: "danger",
                      PENDING: "warning",
                    }[listItem.status || "UPCOMING"] as ColorPaletteProp
                  }
                >
                  {listItem.status || "UPCOMING"}
                </Chip>
              </ListItem>
              <ListDivider />
            </List>
          ))}
        {(!data || data.length === 0) && (
          <Typography level="body-md" textAlign="center">
            No current requests
          </Typography>
        )}
      </Box>
    </>
  );
};

export default CurrentRequestsM;
