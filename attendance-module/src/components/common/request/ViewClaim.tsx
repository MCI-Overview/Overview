import axios from "axios";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import { CustomRequest } from "../../../types";
import { readableEnum, removeSpaces } from "../../../utils/capitalize";
import RequestStatusChip from "../../project/requests/RequestStatusChip";

import { Box, IconButton, Stack, Typography } from "@mui/joy";
import { DownloadOutlined as DownloadIcon } from "@mui/icons-material";

export default function ViewClaim({
  request,
  imageRequestURL,
}: {
  request: CustomRequest;
  imageRequestURL: string;
}) {
  const [receiptPreview, setReceiptPreview] = useState("");

  const affectedRoster = request.affectedRosters?.[0];
  const requestData = request.data as {
    claimType: string;
    claimAmount: number;
    claimDescription: string;
  };

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

  const handleDownloadReceipt = () => {
    const link = document.createElement("a");
    link.href = receiptPreview;
    link.download = removeSpaces(
      `${request.Assign.Project?.name}_Claim_${readableEnum(
        requestData.claimType
      )}_${dayjs(request.createdAt).format("YYYYMMMDD")}_${
        request.Assign.Candidate?.name
      }.jpg`
    );
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
          alt="Receipt Image"
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
