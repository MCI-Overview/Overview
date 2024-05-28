export function getExactAge(dateOfBirth: string) {
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

export function formatDate(date: string) {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("en-SG", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}
