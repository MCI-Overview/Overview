import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { CustomRequest } from "../../../types";
import { correctTimes } from "../../../utils/date-time";
import RequestStatusChip from "../../project/requests/RequestStatusChip";

import { Box, IconButton, Stack, Typography } from "@mui/joy";
import { DownloadOutlined as DownloadIcon } from "@mui/icons-material";

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
  const [mcPreview, setMcPreview] = useState("");

  const requestData = request.data as {
    startDate: string;
    numberOfDays: number;
  };

  useEffect(() => {
    axios.get(rosterRequestURL).then((response) => {
      setAffectedRosters(
        response.data.map(
          (roster: {
            cuid: string;
            shiftDate: string;
            shiftType: string;
            Shift: {
              halfDayStartTime: string;
              halfDayEndTime: string;
              startTime: string;
              endTime: string;
            };
          }) => {
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
              startTime: correctStart.format("HHmm"),
              endTime: correctEnd.format("HHmm"),
            };
          }
        )
      );
    });
  }, [rosterRequestURL]);

  useEffect(() => {
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
  }, [imageRequestURL]);

  const handleDownloadMc = () => {
    const link = document.createElement("a");
    link.href = mcPreview;
    link.download = `${request.cuid}.jpg`;
    link.click();
  };

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s Medical Leave
      </Typography>

      <RequestStatusChip status={request.status} />

      <Typography level="body-sm">
        {`Duration: ${dayjs(requestData.startDate).format(
          "DD/MM/YY"
        )} to ${dayjs(requestData.startDate)
          .add(requestData.numberOfDays - 1, "day")
          .format("DD/MM/YY")}`}
      </Typography>

      <Box>
        <Typography level="body-sm"> Affected rosters:</Typography>
        {affectedRosters.length === 0 ? (
          <Typography level="body-sm">None</Typography>
        ) : (
          affectedRosters.map(
            (roster: {
              cuid: string;
              shiftDate: string;
              startTime: string;
              endTime: string;
            }) => (
              <Typography key={roster.cuid} level="body-sm">
                {`• ${dayjs(roster.shiftDate).format("DD/MM/YY")} ${
                  roster.startTime
                } - ${roster.endTime}`}
              </Typography>
            )
          )
        )}
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "inline-block",
          maxWidth: "500px",
        }}
      >
        <img
          src={mcPreview}
          alt="Receipt"
          style={{
            width: "100%",
            maxHeight: "300px",
          }}
        />
        <IconButton
          onClick={handleDownloadMc}
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            },
          }}
        >
          <DownloadIcon />
        </IconButton>
      </Box>
    </Stack>
  );
}
