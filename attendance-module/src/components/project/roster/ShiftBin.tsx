import { Grid } from "@mui/joy";
import Square from "./Square";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useDrop } from "react-dnd";
import { Shift } from "./DraggableChip";
import { Attendance } from "../../../types/common";
import isBetween from "dayjs/plugin/isBetween";
import { useState } from "react";
import axios from "axios";
import { useProjectContext } from "../../../providers/projectContextProvider";

dayjs.extend(isoWeek);
dayjs.extend(isBetween);

function convertDayToNumber(day: string) {
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  return days.indexOf(day) + 1;
}

function enumerateDaysBetweenDates(startDate: Dayjs, endDate: Dayjs) {
  const days = [];
  let current = startDate.startOf("day");

  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    days.push(current);
    current = current.add(1, "day");
  }

  return days;
}

function getDayDates(dates: Dayjs[], day) {
  return dates.filter((date) => date.isoWeekday() === convertDayToNumber(day));
}

function getStartAndEndDateTime(date: Dayjs, startTime: Dayjs, endTime: Dayjs) {
  const startDateTime = date
    .set("hour", startTime.hour())
    .set("minute", startTime.minute());
  const endDateTime = date
    .set("hour", endTime.hour())
    .set("minute", endTime.minute());

  if (endDateTime.isBefore(startDateTime)) {
    endDateTime.add(1, "day");
  }

  return { startDateTime, endDateTime };
}

function checkCanDrop(
  dateRange: Dayjs[],
  disabledFrom: Dayjs,
  disabledTo: Dayjs,
  shift: Shift,
  data: Attendance[],
) {
  const { day, startTime, endTime } = shift as Shift;
  const newShifts = getDayDates(dateRange, day).map((date) =>
    getStartAndEndDateTime(date, startTime, endTime),
  );

  return newShifts.every((shift) => {
    if (!data || data.length === 0) {
      return !(
        shift.endDateTime.isBefore(disabledTo) ||
        shift.startDateTime.isAfter(disabledFrom)
      );
    }

    return !data.some((existingShift: Attendance) => {
      return (
        (shift.startDateTime.isBetween(
          existingShift.shiftStartTime,
          existingShift.shiftEndTime,
        ) &&
          shift.endDateTime.isBetween(
            existingShift.shiftStartTime,
            existingShift.shiftEndTime,
          )) ||
        (shift.startDateTime.isSame(existingShift.shiftStartTime) &&
          shift.endDateTime.isSame(existingShift.shiftEndTime))
      );
    });
  });
}

export default function WeekBin({
  candidateCuid,
  startDate,
  endDate,
  disabledFrom,
  disabledTo,
  data,
}: {
  candidateCuid: string;
  startDate: Dayjs;
  endDate: Dayjs;
  disabledFrom: Dayjs;
  disabledTo: Dayjs;
  data: Attendance[];
}) {
  const { project, updateProject } = useProjectContext();
  const dateRange = enumerateDaysBetweenDates(startDate, endDate);
  const [isPotential, setIsPotential] = useState(dateRange.map(() => false));

  const processedData = dateRange.map((date) =>
    data.filter((shift) =>
      shift.shiftStartTime.isBetween(date, date.add(1, "day")),
    ),
  );

  const [didDrop, setDidDrop] = useState(false);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ["shift", "shiftTemplate"],
      drop: (item, monitor) => {
        if (monitor.getItemType() === "shiftTemplate") {
          setDidDrop(true);
          const shifts = item as Shift[];

          axios
            .post(`/api/admin/project/${project?.cuid}/roster`, {
              candidateCuid,
              newShifts: shifts.flatMap((shift) => {
                const { day, cuid } = shift as Shift;
                const dates = getDayDates(dateRange, day);

                return dates.map((date) => ({
                  shiftDate: date.toISOString(),
                  shiftCuid: cuid,
                }));
              }),
            })
            .then(() => updateProject())
            .finally(() => setDidDrop(false));
        }

        if (monitor.getItemType() === "shift") {
          setDidDrop(true);
          const { day, cuid } = item as Shift;
          const dates = getDayDates(dateRange, day);

          axios
            .post(`/api/admin/project/${project?.cuid}/roster`, {
              candidateCuid,
              newShifts: dates.map((date) => ({
                shiftDate: date.toISOString(),
                shiftCuid: cuid,
              })),
            })
            .then(() => updateProject())
            .finally(() => setDidDrop(false));
        }

        return false;
      },
      canDrop(item, monitor) {
        if (monitor.getItemType() === "shiftTemplate") {
          return (item as Shift[]).every((shift: Shift) =>
            checkCanDrop(dateRange, disabledFrom, disabledTo, shift, data),
          );
        }

        if (monitor.getItemType() === "shift") {
          return checkCanDrop(
            dateRange,
            disabledFrom,
            disabledTo,
            item as Shift,
            data,
          );
        }

        return false;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
        didDrop: !!monitor.didDrop(),
      }),
      hover(item, monitor) {
        if (monitor.getItemType() === "shiftTemplate") {
          const shifts = item as Shift[];
          setIsPotential(dateRange.map(() => false));
          shifts.map((shift) => {
            const { day } = shift;
            const dates = getDayDates(dateRange, day);

            setIsPotential((prev) =>
              prev.map((_, index) => {
                return prev[index] || dates.includes(dateRange[index]);
              }),
            );
          });
        }

        if (monitor.getItemType() === "shift") {
          const { day } = item as Shift;
          const dates = getDayDates(dateRange, day);

          setIsPotential((prev) =>
            prev.map((_, index) => {
              return dates.includes(dateRange[index]);
            }),
          );
        }

        return false;
      },
    }),
    [],
  );

  return (
    <Grid
      container
      ref={drop}
      columns={dateRange.length}
      sx={{
        display: "flex",
        flexGrow: 1,
      }}
    >
      {dateRange.map((date, index) => (
        <Grid xs={1} display="flex" justifyContent="center">
          <Square
            key={date.toString()}
            date={date.toDate()}
            didDrop={didDrop}
            canDrop={canDrop}
            isOver={isOver}
            isDate={isPotential[dateRange.indexOf(date)]}
            shifts={processedData[index]}
            disabled={
              date.isBefore(disabledTo) ||
              date.isSame(disabledFrom) ||
              date.isAfter(disabledFrom)
            }
          />
        </Grid>
      ))}
    </Grid>
  );
}
