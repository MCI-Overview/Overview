import { CustomRequest } from "../../../types";
import RequestStatusChip from "../../project/requests/RequestStatusChip";

import { Box, Stack, Typography } from "@mui/joy";

export default function ViewResignation({
  request,
}: {
  request: CustomRequest;
}) {
  const requestData = request.data as {
    reason: string;
    lastDay: string;
  };

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s Resignation Request
      </Typography>

      <RequestStatusChip status={request.status} />

      <Box>
        <Typography level="body-sm">Last Day: {requestData.lastDay}</Typography>
        <Typography level="body-sm">Reason: {requestData.reason}</Typography>
      </Box>
    </Stack>
  );
}
