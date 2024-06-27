import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomRequest } from "../../../types";
import { useRequestContext } from "../../../providers/requestContextProvider";
import { readableEnum } from "../../../utils/capitalize";

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
  BlockRounded as BlockIcon,
  ClearRounded as ClearIcon,
  CheckRounded as CheckIcon,
  HourglassEmptyRounded as HourglassEmptyIcon,
} from "@mui/icons-material";
import ViewDetailsModal from "../../common/request/ViewDetailsModal";

// TODO: Add button to view details and approve/reject requests on mobile
const RequestHistoryM = () => {
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
                  type="ADMIN"
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
                        {listItem.Assign.Candidate &&
                          listItem.Assign.Candidate.name}
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
                          {dayjs(listItem.createdAt).format("DD/MM/YY HH:MM")}
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
                        PENDING: <HourglassEmptyIcon />,
                      }[listItem.status]
                    }
                    color={
                      {
                        APPROVED: "success",
                        CANCELLED: "neutral",
                        REJECTED: "danger",
                        PENDING: "warning",
                      }[listItem.status] as ColorPaletteProp
                    }
                  >
                    {readableEnum(listItem.status || "NO_SHOW")}
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

export default RequestHistoryM;
