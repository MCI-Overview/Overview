import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Stack, IconButton, Typography, Card, Grid, Box, Chip } from "@mui/joy";
import moment from "moment";
import { useState } from "react";
import { useProjectContext } from "../../../providers/projectContextProvider";
import { capitalizeWords } from "../../../utils/capitalize";
import { Dustbin } from "../assign/Dustbin";
import { DraggableChip } from "./DraggableChip";
import axios from "axios";

function getInitialDay(date: string, weekOffset: number) {
  const initialDay = moment(new Date(date))
    .add(weekOffset * 2, "weeks")
    .startOf("isoWeek");
  return (
    initialDay.format("DD MMM YY") +
    " - " +
    initialDay.add(13, "days").format("DD MMM YY")
  );
}

function getWeekRange(date: string, weekOffset: number) {
  const startOfWeek = moment(new Date(date))
    .startOf("isoWeek")
    .add(weekOffset, "weeks");
  return Array.from({ length: 14 }, (_, i) =>
    startOfWeek.clone().add(i, "days"),
  );
}

export default function RosterPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { project } = useProjectContext();

  if (!project) return null;

  const days = getWeekRange(project.startDate, weekOffset);
  const searchParams = new URLSearchParams();
  searchParams.append("startDate", days[0].toDate().toISOString());
  searchParams.append("endDate", days[13].toDate().toISOString());
  axios
    .get(
      `/api/admin/project/${
        project.cuid
      }/candidates/roster?${searchParams.toString()}`,
    )
    .then((res) => {
      console.log(res.data);
    });

  return (
    <Card>
      <Stack
        spacing={0}
        sx={{
          "--Grid-borderWidth": "1px",
          borderTop: "var(--Grid-borderWidth) solid",
          borderLeft: "var(--Grid-borderWidth) solid",
          borderColor: "divider",
          "& > div": {
            borderRight: "var(--Grid-borderWidth) solid",
            borderBottom: "var(--Grid-borderWidth) solid",
            borderColor: "divider",
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <IconButton onClick={() => setWeekOffset(weekOffset - 1)}>
            <ChevronLeft />
          </IconButton>
          <Typography level="h4">
            {getInitialDay(project.startDate, weekOffset)}
          </Typography>
          <IconButton onClick={() => setWeekOffset(weekOffset + 1)}>
            <ChevronRight />
          </IconButton>
        </Stack>

        <Grid container spacing={0}>
          <Grid xs={2}>
            <Box />
          </Grid>
          {getWeekRange(project.startDate, weekOffset).map((date, index) => (
            <Grid xs key={index}>
              <Typography textAlign="center">{date.format("MM/DD")}</Typography>
              <Typography textAlign="center">
                {capitalizeWords(date.format("ddd"))}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {project.Assign.map((assign) => (
          <>
            <Grid container spacing={0}>
              <Grid xs={2}>
                <Typography>{assign.Candidate.name}</Typography>
              </Grid>
              <Grid xs={5}>
                <Dustbin name="Week 1" accept={[]} />
              </Grid>
              <Grid xs={5}>
                <Dustbin accept={["test"]} name="Week 2" />
              </Grid>
            </Grid>
          </>
        ))}

        <Stack>
          {project.ShiftGroup.map((shiftGroup) => (
            <DraggableChip key={shiftGroup.cuid} type="test" isDropped={false}>
              <Typography level="body-md">{shiftGroup.name}</Typography>
            </DraggableChip>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
