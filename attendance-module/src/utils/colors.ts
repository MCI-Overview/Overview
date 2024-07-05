import { sha256 } from "js-sha256";

export const MEDICAL_COLOR = "rgba(54, 162, 235, 0.8 )";
export const LATE_COLOR = "rgba(255, 99, 132, 0.8)";
export const LEAVE_COLOR = "rgba(75, 90, 192, 0.8)";
export const ON_TIME_COLOR = "rgba(75, 192, 192)";
export const NO_SHOW_COLOR = "rgba(255, 150, 120, 0.8)";

export function seedToColor(seed: string): string {
  // Use SHA-256 to hash the CUID
  const hash = sha256(seed);

  // Convert the first 6 characters of the hash to a hexadecimal color code
  let color = `#${hash.slice(0, 6)}`;

  // Adjust color to ensure it has a luminance around 0.5
  color = adjustToLuminance(color, 0.5);

  return color;
}

export const adjustColorBrightness = (hex: string, percent: number): string => {
  hex = hex.replace("#", "");
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  r = Math.max(Math.min(Math.floor((r * (100 + percent)) / 100), 255), 0);
  g = Math.max(Math.min(Math.floor((g * (100 + percent)) / 100), 255), 0);
  b = Math.max(Math.min(Math.floor((b * (100 + percent)) / 100), 255), 0);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
};

// Calculate the luminance of a color
const getLuminance = (hex: string): number => {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const [R, G, B] = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

// Adjust color to target luminance
export const adjustToLuminance = (
  hex: string,
  targetLuminance: number
): string => {
  let color = hex;
  let luminance = getLuminance(color);
  let adjustment = 10;
  let iterations = 0;
  const maxIterations = 20;

  while (
    Math.abs(luminance - targetLuminance) > 0.01 &&
    iterations < maxIterations
  ) {
    color = adjustColorBrightness(
      color,
      luminance > targetLuminance ? -adjustment : adjustment
    );
    luminance = getLuminance(color);
    adjustment = adjustment > 1 ? adjustment / 2 : adjustment;
    iterations++;
  }

  return color;
};
