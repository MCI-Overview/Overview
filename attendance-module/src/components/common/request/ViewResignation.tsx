import { Stack, Typography } from "@mui/joy";
import { CustomRequest } from "../../../types";

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
      <Typography level="body-md">Last Day: {requestData.lastDay}</Typography>
      <Typography level="body-md">Reason: {requestData.reason}</Typography>
    </Stack>
  );
}
