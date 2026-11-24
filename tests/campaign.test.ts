import { describe, expect, it } from "vitest";
import {
  countFreeDays,
  dayCount,
  firstBookableDay,
  formatRange,
  isIsoDate,
  isRangeBookable,
  rangeHitsBooked,
  todayInVienna,
} from "@/lib/campaign";
import { findWindow } from "@/config/windows";

const BEFORE = "2026-11-19"; // today (before campaign start)

describe("campaign date helpers", () => {
  it("validates ISO dates strictly", () => {
    expect(isIsoDate("2027-02-28")).toBe(true);
    expect(isIsoDate("2027-02-30")).toBe(false);
    expect(isIsoDate("2027-2-3")).toBe(false);
    expect(isIsoDate("12.12.2026")).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });

  it("limits bookable ranges to the campaign and future days", () => {
    expect(isRangeBookable({ from: "2026-12-01", to: "2027-07-31" }, BEFORE)).toBe(true);
    expect(isRangeBookable({ from: "2026-11-30", to: "2026-12-05" }, BEFORE)).toBe(false);
    expect(isRangeBookable({ from: "2027-07-30", to: "2027-08-01" }, BEFORE)).toBe(false);
    expect(isRangeBookable({ from: "2027-01-10", to: "2027-01-05" }, BEFORE)).toBe(false);
    // once the campaign runs, past days are no longer bookable
    expect(firstBookableDay("2027-03-15")).toBe("2027-03-15");
    expect(isRangeBookable({ from: "2027-03-14", to: "2027-03-20" }, "2027-03-15")).toBe(false);
    expect(isRangeBookable({ from: "2027-03-15", to: "2027-03-15" }, "2027-03-15")).toBe(true);
  });

  it("detects overlaps with booked ranges (inclusive)", () => {
    const booked = [{ from: "2027-01-10", to: "2027-01-15" }];
    expect(rangeHitsBooked({ from: "2027-01-15", to: "2027-01-20" }, booked)).toBe(true);
    expect(rangeHitsBooked({ from: "2027-01-01", to: "2027-01-31" }, booked)).toBe(true);
    expect(rangeHitsBooked({ from: "2027-01-16", to: "2027-01-20" }, booked)).toBe(false);
    expect(rangeHitsBooked({ from: "2027-01-01", to: "2027-01-09" }, booked)).toBe(false);
  });

  it("counts free days and detects a fully booked window", () => {
    expect(countFreeDays([], BEFORE)).toBe(243); // 01.12.2026 – 31.07.2027
    expect(countFreeDays([{ from: "2026-12-01", to: "2026-12-10" }], BEFORE)).toBe(233);
    expect(countFreeDays([{ from: "2026-12-01", to: "2027-07-31" }], BEFORE)).toBe(0);
    expect(countFreeDays([], "2027-08-01")).toBe(0);
  });

  it("formats German dates", () => {
    expect(formatRange({ from: "2026-12-12", to: "2026-12-18" })).toBe("12.12.2026 – 18.12.2026");
    expect(formatRange({ from: "2026-12-12", to: "2026-12-12" })).toBe("12.12.2026");
    expect(dayCount({ from: "2026-12-12", to: "2026-12-18" })).toBe(7);
  });

  it("computes today in Vienna regardless of host time zone", () => {
    // 23:30 UTC on 31.12.2026 is already 01.01.2027 in Vienna
    expect(todayInVienna(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
  });

  it("resolves window route params strictly", () => {
    expect(findWindow("3")?.id).toBe(3);
    for (const bad of ["0", "7", "03", "3a", "-1", ""]) expect(findWindow(bad)).toBeUndefined();
  });
});
