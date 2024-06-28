import dayjs from "dayjs";
import { Fragment } from "react";
import { CustomRequest } from "../../types";
import { useRequestContext } from "../../providers/requestContextProvider";

import ViewDetailsModal from "../../components/common/request/ViewDetailsModal";
import RequestStatusChip from "../../components/project/requests/RequestStatusChip";
import RequestTypeChip from "../../components/project/requests/RequestTypeChip";

import {
  Box,
  List,
  ListDivider,
  ListItem,
  ListItemContent,
  Typography,
} from "@mui/joy";

const UserRequestHistoryList = () => {
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
          {requests.map((req: CustomRequest) => (
            <Fragment key={req.cuid}>
              <ListItem>
                {" "}
                <ViewDetailsModal
                  request={req}
                  updateRequest={updateRequest}
                  type="USER"
                  variant="MOBILE"
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <ListItemContent>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <RequestTypeChip type={req.type} />
                      <RequestStatusChip status={req.status} />
                    </Box>

                    <Box sx={{ my: 0.5, width: "100%" }}>
                      <Typography level="body-xs">
                        Proj name:{" "}
                        {req.Assign.Project && req.Assign.Project.name}
                      </Typography>

                      <Typography level="body-xs">
                        Submitted:{" "}
                        {dayjs(req.createdAt).format("DD/MM/YY HH:mm")}
                      </Typography>
                    </Box>
                  </ListItemContent>
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

export default UserRequestHistoryList;
