import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomRequest } from "../../types";
import { useRequestContext } from "../../providers/requestContextProvider";
import { readableEnum } from "../../utils/capitalize";

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
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
} from "@mui/icons-material";

//TODO: Add viewing on mobile
const RequestHistoryM = () => {
  const { requests } = useRequestContext();
  if (!requests) return null;

  return (
    <Box sx={{ display: { xs: "block", sm: "none" } }}>
      {requests.length === 0 ? (
        <Typography level="body-md" sx={{ py: 2, textAlign: "center" }}>
          No request history found
        </Typography>
      ) : (
        <List
          size="sm"
          sx={{
            "--ListItem-paddingX": 0,
          }}
        >
          {requests.map((listItem: CustomRequest) => (
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
                        {listItem.Assign.Project &&
                          listItem.Assign.Project.name}
                      </Typography>
                      <Typography level="body-xs">&bull;</Typography>
                      <Typography level="body-xs">
                        {readableEnum(listItem.type)}
                      </Typography>
                    </Box>
                  </Box>
                </ListItemContent>
                <Chip
                  variant="soft"
                  size="sm"
                  startDecorator={
                    {
                      APPROVED: <CheckIcon />,
                      CANCELLED: <ClearIcon />,
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
                  {readableEnum(listItem.status || "NO_SHOW")}
                </Chip>
              </ListItem>
              <ListDivider />
            </Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RequestHistoryM;
