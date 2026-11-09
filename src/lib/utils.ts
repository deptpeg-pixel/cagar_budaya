import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { colors, getStatusToken } from "./design-tokens/colors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function padNumber(n: number, width: number = 2): string {
  return String(n).padStart(width, "0");
}

/**
 * Mendapatkan class Tailwind badge dari Token Warna Modular
 */
export function getStatusBadgeClass(status: string): string {
  return getStatusToken(status).badgeClass;
}

/**
 * Mendapatkan nilai hex warna status untuk Leaflet marker & SVG
 */
export function getStatusColor(status: string): string {
  return getStatusToken(status).color;
}

export { colors };
