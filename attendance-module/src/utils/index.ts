export default function isEqual(obj1: unknown, obj2: unknown) {
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 === null ||
    obj2 === null
  ) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
      return false;
    }

    if (
      !isEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
}
