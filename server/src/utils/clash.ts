import dayjs, { Dayjs } from "dayjs";

function correctTimes(
  date: Date,
  startTime: Date,
  endTime: Date
): { correctStartTime: Dayjs; correctEndTime: Dayjs } {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  const correctStart = dayjs(date)
    .set("hour", start.hour())
    .set("minute", start.minute());
  const correctEnd = dayjs(date)
    .set("hour", end.hour())
    .set("minute", end.minute());

  if (correctEnd.isBefore(correctStart)) {
    return {
      correctStartTime: correctStart,
      correctEndTime: correctEnd.add(1, "day"),
    };
  }

  return {
    correctStartTime: correctStart,
    correctEndTime: correctEnd,
  };
}

export function doesClash(
  newAttendanceDate: Date,
  newAttendanceStartTime: Date,
  newAttendanceEndTime: Date,
  existingAttendanceDate: Date,
  existingAttendanceStartTime: Date,
  existingAttendanceEndTime: Date
) {
  const { correctStartTime, correctEndTime } = correctTimes(
    newAttendanceDate,
    newAttendanceStartTime,
    newAttendanceEndTime
  );
  const newAttendanceStart = correctStartTime.add(1, "week");
  const newAttendanceEnd = correctEndTime.add(1, "week");

  const {
    correctStartTime: existingAttendanceStart,
    correctEndTime: existingAttendanceEnd,
  } = correctTimes(
    existingAttendanceDate,
    existingAttendanceStartTime,
    existingAttendanceEndTime
  );

  // Check if the new attendance starts before the existing attendance ends
  if (newAttendanceStart.isBefore(existingAttendanceStart)) {
    // Return true if the new attendance ends after the existing attendance starts
    return newAttendanceEnd.isAfter(existingAttendanceStart);
  } else {
    // The new attendance starts after the existing attendance starts
    // Return true if the new attendance starts before the existing attendance ends
    return newAttendanceStart.isBefore(existingAttendanceEnd);
  }
}
