import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomRequest } from "../../types";
import { readableEnum } from "../../utils/capitalize";
import { useRequestContext } from "../../providers/requestContextProvider";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";

import {
  Box,
  Chip,
  ColorPaletteProp,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Typography,
} from "@mui/joy";
import {
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
  HourglassEmptyRounded as HourglassEmptyIcon,
} from "@mui/icons-material";

// TODO: Add editing of requests
const CurrentRequestsM = () => {
  const { requests, updateRequest } = useRequestContext();
  if (!requests) return null;

  return (
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
              <ListItem>
                <ViewDetailsModal
                  request={listItem}
                  updateRequest={updateRequest}
                  type="USER"
                  variant="MOBILE"
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
                        {dayjs(listItem.createdAt).format("DD/MM/YY HH:MM")}
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
                    sx={{}}
                    startDecorator={
                      {
                        APPROVED: <CheckIcon />,
                        CANCELLED: <ClearIcon />,
                        REJECTED: <BlockIcon />,
                        PENDING: <HourglassEmptyIcon />,
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
                </ViewDetailsModal>
              </ListItem>
              <ListDivider />
            </Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CurrentRequestsM;
