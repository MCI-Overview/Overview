export function capitalizeWords(str: string) {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  return str
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

function capitalize(str: string) {
  if (typeof str !== "string" || str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function generateCapitalizations(arr: string[]) {
  function getAllCapitalizations(word: string) {
    const lower = word.toLowerCase();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
    const upper = lower.toUpperCase();
    return [lower, capitalized, upper];
  }

  let result: string[] = [];

  arr.forEach((item) => {
    result = result.concat(getAllCapitalizations(item));
  });

  return result;
}

export function readableEnum(enumValue: string) {
  if (!enumValue) return "-";

  return capitalizeWords(enumValue.replace(/_/g, " "));
}

export function removeSpaces(str: string) {
  return str.replace(/\s/g, "");
}
