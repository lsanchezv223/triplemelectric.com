import { db } from "@/lib/db";

export function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

export function parseTimeForDate(dateInput: string, timeInput: string) {
  const [year, month, day] = dateInput.split("-").map(Number);
  const [hour, minute] = timeInput.split(":").map(Number);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute));
}

export function calculateHours(startTime: Date, endTime: Date, breakMinutes: number) {
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffHours = diffMs / (1000 * 60 * 60) - breakMinutes / 60;
  const rounded = Math.round(diffHours * 100) / 100;

  return rounded > 0 ? rounded : 0;
}

export function formatDecimalHours(value: number) {
  return value.toFixed(2).replace(/\.00$/, "");
}

export async function getEntriesForUser(userId: string) {
  return db.workEntry.findMany({
    where: { userId },
    orderBy: [{ workDate: "desc" }, { startTime: "asc" }]
  });
}
