import dayjs, { Dayjs } from "dayjs";

export function getExactAge(dateOfBirth: Date) {
  const dob = new Date(dateOfBirth);
  const currentDate = new Date();

  const age = currentDate.getFullYear() - dob.getFullYear();
  const hasBirthdayOccurred =
    currentDate.getMonth() > dob.getMonth() ||
    (currentDate.getMonth() === dob.getMonth() &&
      currentDate.getDate() >= dob.getDate());

  if (!hasBirthdayOccurred) {
    return age - 1;
  }

  return age;
}

export function formatDate(date: Date) {
  date = new Date(date);

  return date.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export function correctTimes(
  mainDate: Dayjs,
  startTime: Dayjs,
  endTime: Dayjs
): { correctStart: Dayjs; correctEnd: Dayjs } {
  // Replace the date part of the start and end times with the main date
  const correctStart = dayjs(mainDate)
    .hour(dayjs(startTime).hour())
    .minute(dayjs(startTime).minute())
    .second(dayjs(startTime).second())
    .millisecond(dayjs(startTime).millisecond());

  let correctEnd = dayjs(mainDate)
    .hour(dayjs(endTime).hour())
    .minute(dayjs(endTime).minute())
    .second(dayjs(endTime).second())
    .millisecond(dayjs(endTime).millisecond());

  if (correctEnd.isBefore(correctStart)) {
    correctEnd = correctEnd.add(1, "day");
  }

  return { correctStart, correctEnd };
}
