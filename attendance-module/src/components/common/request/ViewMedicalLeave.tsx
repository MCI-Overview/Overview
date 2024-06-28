import { Button, List, ListItem, Stack, Typography } from "@mui/joy";
import { CustomRequest } from "../../../types";
import axios from "axios";
import { useEffect, useState } from "react";

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
      setAffectedRosters(response.data);
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
      <Typography level="body-md">
        Start Date: {requestData.startDate}
      </Typography>
      <Typography level="body-md">
        Number of Days: {requestData.numberOfDays}
      </Typography>
      <List>
        {affectedRosters.map((roster: { cuid: string; shiftDate: string }) => (
          <ListItem key={roster.cuid}>Roster: {roster.shiftDate}</ListItem>
        ))}
      </List>
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
