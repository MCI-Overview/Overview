import { sha256 } from "js-sha256";

export function cuidToColor(cuid: string): string {
  // Use SHA-256 to hash the CUID
  const hash = sha256(cuid);

  // Convert the first 6 characters of the hash to a hexadecimal color code
  let color = `#${hash.slice(0, 6)}`;

  // Adjust color to ensure it is dark enough for light text
  color = adjustColorBrightness(color, -15);

  return color;
}

const adjustColorBrightness = (hex: string, percent: number): string => {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(Math.min(Math.floor((r * (100 + percent)) / 100), 255), 0);
  g = Math.max(Math.min(Math.floor((g * (100 + percent)) / 100), 255), 0);
  b = Math.max(Math.min(Math.floor((b * (100 + percent)) / 100), 255), 0);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};
