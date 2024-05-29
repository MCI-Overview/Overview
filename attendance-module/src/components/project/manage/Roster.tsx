import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Card, IconButton, Stack, Table, Typography } from "@mui/joy";
import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Project, ShiftGroup } from "../../../types";
import moment from "moment";
import CreateShiftModal from "./createShiftModal";
import { capitalizeWords } from "../../../utils/capitalize";
import Timetable from "./Timetable";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function updateWeekOffset(
  projectStartDate: Date,
  dateToCheck: Date,
  setWeekOffset: (offset: number) => void,
) {
  const startDate = moment(projectStartDate);
  const endDate = moment(dateToCheck);
  const days = endDate.diff(startDate, "days");
  const weeks = Math.floor(days / 7);
  setWeekOffset(weeks);
}

function getInitialDay(date: Date, weekOffset: number) {
  const initialDay = moment(date)
    .add(weekOffset * 2, "weeks")
    .startOf("week");
  return (
    initialDay.format("DD MMM YY") +
    " - " +
    initialDay.add(13, "days").format("DD MMM YY")
  );
}
export default function RosterPage() {
  const projectId = useParams().projectId;
  const [projectDetails, setProjectDetails] = useState<Project | null>(null);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [shiftGroups, setShiftGroups] = useState<ShiftGroup[] | null>(null);

  useEffect(() => {
    axios.get(`/api/admin/project/${projectId}`).then((response) => {
      setProjectDetails(response.data);
      updateWeekOffset(
        new Date(response.data.startDate),
        new Date(),
        setWeekOffset,
      );
    });
  }, [projectId]);

  useEffect(() => {
    axios
      .get(`/api/admin/project/${projectId}/shiftGroups`)
      .then((response) => {
        setShiftGroups(response.data);
      });
  }, [projectId]);

  if (!projectDetails) {
    return null;
  }

  return (
    <>
      <Timetable />
      <Card>
        <Stack>
          <Stack
            spacing={4}
            direction="row"
            alignItems="center"
            sx={{
              display: "flex",
              maxWidth: "800px",
              mx: "auto",
              px: { xs: 2, md: 6 },
              py: { xs: 2, md: 3 },
            }}
          >
            <IconButton
              onClick={() => setWeekOffset(weekOffset - 1)}
              disabled={weekOffset === 0}
            >
              <ChevronLeft />
            </IconButton>
            <Typography
              level="title-lg"
              sx={{ width: "14rem", textAlign: "center" }}
            >
              {getInitialDay(new Date(projectDetails.startDate), weekOffset)}
            </Typography>
            <IconButton onClick={() => setWeekOffset(weekOffset + 1)}>
              <ChevronRight />
            </IconButton>
          </Stack>
          <Table>
            <thead>
              <tr>
                <td>Shift Name</td>
                <td>Day</td>
                <td>Start Time</td>
                <td>End Time</td>
                <td>Headcount</td>
              </tr>
            </thead>
            <tbody>
              {shiftGroups?.map((group) =>
                group.Shift.sort((a, b) => {
                  if (a.day === b.day) {
                    return a.startTime < b.startTime ? -1 : 1;
                  }
                  return DAYS.indexOf(a.day) < DAYS.indexOf(b.day) ? -1 : 1;
                }).map((shift) => (
                  <tr key={shift.shiftId}>
                    {group.Shift.indexOf(shift) === 0 && (
                      <td rowSpan={group.Shift.length}>{group.name}</td>
                    )}
                    <td>{capitalizeWords(shift.day)}</td>
                    <td>{moment(shift.startTime).utc(true).format("HH:mm")}</td>
                    <td>{moment(shift.endTime).utc(true).format("HH:mm")}</td>
                    <td>{shift.headcount}</td>
                  </tr>
                )),
              )}
            </tbody>
          </Table>
          <CreateShiftModal />
        </Stack>
      </Card>
    </>
  );
}
