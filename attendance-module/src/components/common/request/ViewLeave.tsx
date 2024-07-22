import dayjs from "dayjs";
import { CustomRequest } from "../../../types";
import { readableEnum } from "../../../utils/capitalize";
import RequestStatusChip from "../../project/requests/RequestStatusChip";

import { Box, Stack, Typography } from "@mui/joy";

export default function ViewClaim({ request }: { request: CustomRequest }) {
  const affectedRoster =
    request.affectedRosters.length === 0 ? null : request.affectedRosters[0];
  const requestData = request.data as {
    leaveDuration: string;
    reason: string;
  };

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s {readableEnum(request.type)}
      </Typography>

      <RequestStatusChip status={request.status} />

      <Box>
        {affectedRoster ? (
          <Typography level="body-sm">
            {`Roster: ${dayjs(affectedRoster.correctStartTime).format(
              "DD/MM/YY"
            )} ${dayjs(affectedRoster.correctStartTime).format(
              "HHmm"
            )} - ${dayjs(affectedRoster.correctEndTime).format("HHmm")}`}
          </Typography>
        ) : (
          <Typography level="body-sm" color="danger">
            Roster has been deleted
          </Typography>
        )}

        <Typography level="body-sm">
          Leave duration: {readableEnum(requestData.leaveDuration)}
        </Typography>

        <Typography level="body-sm">Reason: {requestData.reason}</Typography>
      </Box>
    </Stack>
  );
}
