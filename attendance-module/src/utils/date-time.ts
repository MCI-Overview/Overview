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
