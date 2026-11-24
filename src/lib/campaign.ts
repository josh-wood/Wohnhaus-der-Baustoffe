// Campaign period and date helpers. Shared by server and client code.
// Dates are handled as ISO strings "YYYY-MM-DD" (calendar days, no time zone).
import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export const CAMPAIGN_START = "2026-12-01";
export const CAMPAIGN_END = "2027-07-31";
export const TIME_ZONE = "Europe/Vienna";

export type DateRange = { from: string; to: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Strict check: "YYYY-MM-DD" and a real calendar date (rejects 2027-02-30). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = parseISO(value);
  return isValid(d) && toIsoDate(d) === value;
}

export function toIsoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function fromIsoDate(value: string): Date {
  return parseISO(value); // local midnight
}

/** Today's date in Vienna as ISO string (server clock independent of host TZ). */
export function todayInVienna(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

/** First day that can still be booked: campaign start or today, whichever is later. */
export function firstBookableDay(today: string): string {
  return today > CAMPAIGN_START ? today : CAMPAIGN_START;
}

/** ISO strings compare correctly as plain strings. */
export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.from <= b.to && b.from <= a.to;
}

export function isRangeBookable(range: DateRange, today: string): boolean {
  return (
    isIsoDate(range.from) &&
    isIsoDate(range.to) &&
    range.from <= range.to &&
    range.from >= firstBookableDay(today) &&
    range.to <= CAMPAIGN_END
  );
}

export function rangeHitsBooked(range: DateRange, booked: DateRange[]): boolean {
  return booked.some((b) => rangesOverlap(range, b));
}

/** Number of bookable days left for a window (0 = fully booked). */
export function countFreeDays(booked: DateRange[], today: string): number {
  const start = firstBookableDay(today);
  if (start > CAMPAIGN_END) return 0;
  let free = 0;
  for (let d = fromIsoDate(start); toIsoDate(d) <= CAMPAIGN_END; d = addDays(d, 1)) {
    const iso = toIsoDate(d);
    if (!booked.some((b) => b.from <= iso && iso <= b.to)) free++;
  }
  return free;
}

export function dayCount(range: DateRange): number {
  return differenceInCalendarDays(fromIsoDate(range.to), fromIsoDate(range.from)) + 1;
}

/** "12.12.2026" */
export function formatDate(value: string): string {
  return format(fromIsoDate(value), "dd.MM.yyyy", { locale: de });
}

/** "12.12.2026 – 18.12.2026" or "12.12.2026" for a single day */
export function formatRange(range: DateRange): string {
  return range.from === range.to ? formatDate(range.from) : `${formatDate(range.from)} – ${formatDate(range.to)}`;
}

/** "19.11.2026 15:58" in Vienna time */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("de-AT", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(",", "");
}
