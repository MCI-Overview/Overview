import { Grid, Typography } from "@mui/joy";
import WeekBin from "./ShiftBin";
import { Dayjs } from "dayjs";
import { Attendance } from "../../../types/common";

function getWeeklyIntervals(startDate: Dayjs, endDate: Dayjs) {
  const intervals = [];
  let current = startDate.startOf("day");
  const end = endDate.endOf("day");

  while (current.isBefore(end) || current.isSame(end, "day")) {
    const weekEnd = current.endOf("day").add(6, "day");
    intervals.push({
      start: current,
      end: weekEnd.isAfter(end) ? end : weekEnd,
    });
    current = current.add(7, "day");
  }

  return intervals;
}

function getLatestDate(...dates: Dayjs[]) {
  return dates.reduce((acc, date) => (date.isAfter(acc) ? date : acc));
}

function getEarliestDate(...dates: Dayjs[]) {
  return dates.reduce((acc, date) => (date.isBefore(acc) ? date : acc));
}

export default function CandidateDisplay({
  name,
  cuid,
  shifts,
  startDate,
  endDate,
  firstDay,
  lastDay,
  projectStartDate,
  projectEndDate,
}: {
  name: string;
  cuid: string;
  shifts: Attendance[];
  startDate: Dayjs;
  endDate: Dayjs;
  firstDay: Dayjs;
  lastDay: Dayjs;
  projectStartDate: Dayjs;
  projectEndDate: Dayjs;
}) {
  const intervals = getWeeklyIntervals(startDate, endDate);
  const processedData = intervals.map((interval) =>
    shifts.filter((shift) =>
      shift.shiftStartTime.isBetween(interval.start, interval.end, null, "[]"),
    ),
  );

  console.log(processedData);

  return (
    <Grid container>
      <Grid xs={2} display="flex" justifyContent="center" alignItems="center">
        <Typography>{name}</Typography>
      </Grid>
      <Grid container xs={10} columns={intervals.length}>
        {intervals.map((interval, index) => (
          <Grid xs={1}>
            <WeekBin
              key={
                interval.start.format("YYYY-MM-DD") +
                interval.end.format("YYYY-MM-DD")
              }
              candidateCuid={cuid}
              startDate={interval.start}
              endDate={interval.end}
              disabledTo={getLatestDate(
                projectStartDate,
                interval.start.endOf("day").subtract(1, "day"),
                firstDay.endOf("day").subtract(1, "day"),
              )}
              disabledFrom={getEarliestDate(
                projectEndDate,
                interval.end.startOf("day").add(1, "day"),
                lastDay.startOf("day").add(1, "day"),
              )}
              data={processedData[index]}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
