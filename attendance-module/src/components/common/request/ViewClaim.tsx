import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";
import { CustomRequest } from "../../../types";
import { correctTimes } from "../../../utils/date-time";
import { readableEnum } from "../../../utils/capitalize";
import RequestStatusChip from "../../project/requests/RequestStatusChip";

import { Box, IconButton, Stack, Typography } from "@mui/joy";
import { DownloadOutlined as DownloadIcon } from "@mui/icons-material";

export default function ViewClaim({
  request,
  rosterRequestURL,
  imageRequestURL,
}: {
  request: CustomRequest;
  rosterRequestURL: string;
  imageRequestURL: string;
}) {
  const [receiptPreview, setReceiptPreview] = useState("");
  const [affectedRoster, setAffectedRoster] = useState<{
    shiftDate: Dayjs;
    correctStart: Dayjs;
    correctEnd: Dayjs;
  } | null>(null);

  const requestData = request.data as {
    claimType: string;
    claimAmount: number;
    claimRosterCuid: string;
    claimDescription: string;
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

  useEffect(() => {
    if (!receiptPreview) {
      axios
        .get(imageRequestURL, {
          responseType: "blob",
        })
        .then((response) => {
          const reader = new FileReader();
          reader.readAsDataURL(response.data);
          reader.onload = () => {
            setReceiptPreview(reader.result as string);
          };
        });
    }
  }, [receiptPreview, imageRequestURL]);

  if (!affectedRoster) return null;

  const handleDownloadReceipt = () => {
    const link = document.createElement("a");
    link.href = receiptPreview;
    link.download = `${requestData.claimRosterCuid}.jpg`;
    link.click();
  };

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s {readableEnum(requestData.claimType)}{" "}
        Claim
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
          Claim amount: ${requestData.claimAmount}
        </Typography>
        <Typography level="body-sm">
          Description: {requestData.claimDescription}
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          display: "flex",
        }}
      >
        <img
          src={receiptPreview}
          alt="Receipt"
          style={{
            width: "100%",
            height: "auto",
          }}
        />
        <IconButton
          onClick={handleDownloadReceipt}
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
