import { Button, Stack, Typography } from "@mui/joy";
import { CustomRequest } from "../../../types";
import axios from "axios";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

export default function ViewClaim({
  request,
  rosterRequestURL,
  imageRequestURL,
}: {
  request: CustomRequest;
  rosterRequestURL: string;
  imageRequestURL: string;
}) {
  const [affectedRoster, setAffectedRoster] = useState<{
    shiftDate: string;
    Shift: {
      startTime: string;
    };
  } | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState("");

  const requestData = request.data as {
    claimType: string;
    claimAmount: number;
    claimRosterCuid: string;
    claimDescription: string;
  };

  useEffect(() => {
    axios.get(rosterRequestURL).then((response) => {
      setAffectedRoster(response.data);
    });
  }, [rosterRequestURL]);

  useEffect(() => {
    if (showReceipt && !receiptPreview) {
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
  }, [showReceipt, receiptPreview, imageRequestURL]);

  if (!affectedRoster) return null;

  return (
    <Stack gap={1}>
      <Typography level="title-md">
        {request.Assign.Candidate?.name}'s {requestData.claimType} Claim
      </Typography>
      <Typography level="body-md">
        Date/Time:
        {`${dayjs(affectedRoster.shiftDate).format("DD/MM/YYYY")} -
          ${dayjs(affectedRoster.Shift.startTime).format("HHmm")}`}
      </Typography>
      <Typography level="body-md">
        Claim Amount: ${requestData.claimAmount}
      </Typography>
      <Typography level="body-md">
        Description: {requestData.claimDescription}
      </Typography>
      {showReceipt && receiptPreview && (
        <img src={receiptPreview} alt="Receipt" height={400} width={"auto"} />
      )}
      <Button onClick={() => setShowReceipt(!showReceipt)}>
        {showReceipt ? "Hide" : "Show"} Receipt
      </Button>
    </Stack>
  );
}
