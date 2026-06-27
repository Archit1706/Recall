import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeShort(date: Date, now: Date = new Date()): string {
  const diffMs = date.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const past = diffMs < 0;

  let value: number;
  let unit: string;
  if (abs < hour) {
    value = Math.max(1, Math.round(abs / minute));
    unit = "m";
  } else if (abs < day) {
    value = Math.round(abs / hour);
    unit = "h";
  } else if (abs < 30 * day) {
    value = Math.round(abs / day);
    unit = "d";
  } else if (abs < 365 * day) {
    value = Math.round(abs / (30 * day));
    unit = "mo";
  } else {
    value = Math.round(abs / (365 * day));
    unit = "y";
  }

  return past ? `${value}${unit} ago` : `in ${value}${unit}`;
}
