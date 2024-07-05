import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CustomRequest } from "../../../types";

import { Box, Button, Stack, Typography } from "@mui/joy";
import { correctTimes } from "../../../utils/date-time";

export default function ViewMedicalLeave({
  request,
  rosterRequestURL,
  imageRequestURL,
}: {
  request: CustomRequest;
  rosterRequestURL: string;
  imageRequestURL: string;
}) {
  const [affectedRosters, setAffectedRosters] = useState([]);
  const [showMc, setShowMc] = useState(false);
  const [mcPreview, setMcPreview] = useState("");

  const requestData = request.data as {
    startDate: string;
    numberOfDays: number;
  };

  useEffect(() => {
    axios.get(rosterRequestURL).then((response) => {
      setAffectedRosters(
        response.data.map((roster: any) => {
          const { correctStart, correctEnd } = correctTimes(
            dayjs(roster.shiftDate),
            roster.shiftType === "SECOND_HALF"
              ? dayjs(roster.Shift.halfDayStartTime)
              : dayjs(roster.Shift.startTime),
            roster.shiftType === "FIRST_HALF"
              ? dayjs(roster.Shift.halfDayEndTime)
              : dayjs(roster.Shift.endTime)
          );

          return {
            cuid: roster.cuid,
            shiftDate: dayjs(roster.shiftDate).format("DD/MM/YY"),
            startTime: correctStart.format("HH:mm"),
            endTime: correctEnd.format("HH:mm"),
          };
        })
      );
    });
  }, [rosterRequestURL]);

  useEffect(() => {
    if (showMc && !mcPreview) {
      axios
        .get(imageRequestURL, {
          responseType: "blob",
        })
        .then((response) => {
          const reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onload = () => {
            setMcPreview(reader.result as string);
          };
        });
    }
  }, [imageRequestURL, showMc, mcPreview]);

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s Medical Leave
      </Typography>
      <Typography level="body-sm">
        Duration: {dayjs(requestData.startDate).format("DD/MM/YY")}
        {" to "}
        {dayjs(requestData.startDate)
          .add(requestData.numberOfDays - 1, "day")
          .format("DD/MM/YY")}
      </Typography>

      <Box>
        <Typography level="body-sm">Affected Rosters:</Typography>
        {affectedRosters.map(
          (roster: {
            cuid: string;
            shiftDate: string;
            startTime: string;
            endTime: string;
          }) => (
            <Typography key={roster.cuid} level="body-sm">
              {dayjs(roster.shiftDate).format("DD/MM/YY")}
              {": "}
              {roster.startTime} {" - "} {roster.endTime}
            </Typography>
          )
        )}
      </Box>

      {showMc && mcPreview && (
        <img
          src={mcPreview}
          alt="Medical Certificate"
          style={{
            maxWidth: "500px",
          }}
        />
      )}
      <Button onClick={() => setShowMc(!showMc)}>
        {showMc ? "Hide" : "Show"} Medical Certificate
      </Button>
    </Stack>
  );
}
