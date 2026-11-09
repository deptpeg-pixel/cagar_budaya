import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function padNumber(n: number, width: number = 2): string {
  return String(n).padStart(width, "0");
}

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Nasional":
      return "border-[#c8a24a] bg-[#c8a24a]/15 text-[#e6c875]";
    case "Provinsi":
      return "border-[#5a94d6] bg-[#5a94d6]/15 text-[#8eb8eb]";
    case "Kota":
      return "border-[#52b788] bg-[#52b788]/15 text-[#74c69d]";
    case "Kabupaten":
      return "border-[#d97736] bg-[#d97736]/15 text-[#f4a261]";
    default:
      return "border-amber-600/40 bg-amber-600/15 text-amber-300";
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Nasional":
      return "#c8a24a";
    case "Provinsi":
      return "#5a94d6";
    case "Kota":
      return "#52b788";
    case "Kabupaten":
      return "#d97736";
    default:
      return "#c8a24a";
  }
}
