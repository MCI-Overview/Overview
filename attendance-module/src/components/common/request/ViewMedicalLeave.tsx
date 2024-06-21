import { Button, List, ListItem, Stack, Typography } from "@mui/joy";
import { CustomRequest } from "../../../types";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ViewMedicalLeave({
  request,
}: {
  request: CustomRequest;
}) {
  const [affectedRosters, setAffectedRosters] = useState([]);
  const [showMc, setShowMc] = useState(false);
  const [mcPreview, setMcPreview] = useState("");

  const requestData = request.data as {
    startDate: string;
    numberOfDays: number;
  };

  useEffect(() => {
    axios.get(`/api/admin/request/${request.cuid}/roster`).then((response) => {
      setAffectedRosters(response.data);
    });
  }, [request.cuid]);

  useEffect(() => {
    if (showMc && !mcPreview) {
      axios
        .get(`/api/admin/request/${request.cuid}/image`, {
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
  }, [request.cuid, showMc, mcPreview]);

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
          height={400}
          width={"auto"}
        />
      )}
      <Button onClick={() => setShowMc(!showMc)}>
        {showMc ? "Hide" : "Show"} Medical Certificate
      </Button>
    </Stack>
  );
}
