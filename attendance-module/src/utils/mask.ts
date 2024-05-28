export function mask(nric: string) {
  // verify nric with regex before formatting
  const nricRegex = /^[STFG]\d{7}[A-Z]$/;
  if (nricRegex.test(nric)) {
    // last 4 digits of nric are shown
    return "*****" + nric.slice(5);
  }

  // TODO: accommodate workpass number
  return nric;
}
