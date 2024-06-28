import axios from "axios";
import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomRequest } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { useRequestContext } from "../../providers/requestContextProvider";

import {
  Box,
  Chip,
  Typography,
  ColorPaletteProp,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
} from "@mui/joy";
import {
  PendingRounded as PendingIcon,
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
  MoreHorizRounded as MoreHorizIcon,
} from "@mui/icons-material";

// TODO: Add viewing and editing of requests
function RowMenu({ requestCuid }: { requestCuid: string }) {
  const { updateRequest } = useRequestContext();
  function handleCancel() {
    axios
      .post("/api/user/request/cancel", { requestCuid })
      .then(() => updateRequest());
  }
  return (
    <>
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{
            root: { variant: "plain", color: "neutral", size: "sm" },
          }}
        >
          <MoreHorizIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          {/* <MenuItem>View / Edit</MenuItem> */}
          <MenuItem onClick={handleCancel}>Cancel</MenuItem>
        </Menu>
      </Dropdown>
    </>
  );
}

const CurrentRequestsM = () => {
  const { requests } = useRequestContext();
  if (!requests) return null;

  return (
    <>
      <Box sx={{ display: { xs: "block", sm: "none" } }}>
        {requests.length === 0 ? (
          <Typography level="body-xs" sx={{ py: 2, textAlign: "center" }}>
            No requests found
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
                          {listItem.Assign.Project &&
                            listItem.Assign.Project.name}
                        </Typography>
                        <Typography level="body-xs">&bull;</Typography>
                        <Typography level="body-xs">
                          {readableEnum(listItem.type)}
                        </Typography>
                      </Box>
                    </div>
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
                    {readableEnum(listItem.status || "UPCOMING")}
                  </Chip>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: "auto",
                      mb: "auto",
                    }}
                  >
                    <RowMenu requestCuid={listItem.cuid} />
                  </Box>
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

export default CurrentRequestsM;
