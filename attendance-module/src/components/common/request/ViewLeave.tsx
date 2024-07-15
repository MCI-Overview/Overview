import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";
import { CustomRequest } from "../../../types";
import { correctTimes } from "../../../utils/date-time";
import { readableEnum } from "../../../utils/capitalize";
import RequestStatusChip from "../../project/requests/RequestStatusChip";

import { Box, Stack, Typography } from "@mui/joy";

export default function ViewClaim({
  request,
  rosterRequestURL,
}: {
  request: CustomRequest;
  rosterRequestURL: string;
}) {
  const [affectedRoster, setAffectedRoster] = useState<{
    shiftDate: Dayjs;
    correctStart: Dayjs;
    correctEnd: Dayjs;
  } | null>(null);

  const requestData = request.data as {
    leaveDuration: string;
    reason: string;
  };

  useEffect(() => {
    axios.get(rosterRequestURL).then((response) => {
      const { correctStart, correctEnd } = correctTimes(
        dayjs(response.data.shiftDate),
        response.data.shiftType === "SECOND_HALF"
          ? dayjs(response.data.Shift.halfDayStartTime)
          : dayjs(response.data.Shift.startTime),
        response.data.shiftType === "FIRST_HALF"
          ? dayjs(response.data.Shift.halfDayEndTime)
          : dayjs(response.data.Shift.endTime)
      );

      setAffectedRoster({
        shiftDate: dayjs(response.data.shiftDate),
        correctStart,
        correctEnd,
      });
    });
  }, [rosterRequestURL]);

  if (!affectedRoster) return null;

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s {readableEnum(request.type)}
      </Typography>

      <RequestStatusChip status={request.status} />

      <Box>
        <Typography level="body-sm">
          Roster:{" "}
          {`${affectedRoster.shiftDate.format(
            "DD/MM/YY"
          )} ${affectedRoster.correctStart.format(
            "HHmm"
          )} - ${affectedRoster.correctEnd.format("HHmm")}`}
        </Typography>

        <Typography level="body-sm">
          Leave duration: {readableEnum(requestData.leaveDuration)}
        </Typography>

        <Typography level="body-sm">Reason: {requestData.reason}</Typography>
      </Box>
    </Stack>
  );
}
