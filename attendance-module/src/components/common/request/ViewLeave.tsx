import { Stack, Typography } from "@mui/joy";
import { CustomRequest } from "../../../types";
import axios from "axios";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { readableEnum } from "../../../utils/capitalize";

export default function ViewClaim({
  request,
  rosterRequestURL,
}: {
  request: CustomRequest;
  rosterRequestURL: string;
}) {
  const [affectedRoster, setAffectedRoster] = useState<{
    shiftDate: string;
    Shift: {
      startTime: string;
    };
  } | null>(null);

  const requestData = request.data as {
    leaveDuration: string;
    reason: string;
  };

  useEffect(() => {
    axios.get(rosterRequestURL).then((response) => {
      setAffectedRoster(response.data);
    });
  }, [rosterRequestURL]);

  if (!affectedRoster) return null;

  return (
    <Stack>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s {readableEnum(request.type)}
      </Typography>
      <Typography level="body-md">
        Date/Time:{" "}
        {`${dayjs(affectedRoster.shiftDate).format("DD/MM/YYYY")} -
          ${dayjs(affectedRoster.Shift.startTime).format("HHmm")}`}
      </Typography>
      <Typography level="body-md">
        Leave duration: {readableEnum(requestData.leaveDuration)}
      </Typography>
      <Typography level="body-md">Reason: {requestData.reason}</Typography>
    </Stack>
  );
}
