import { describe, expect, it } from "vitest";
import { parseBookingInput } from "@/lib/booking-input";

const TODAY = "2026-11-19";
const valid = { windowId: "3", from: "2026-12-10", to: "2026-12-12", email: "  Test1@Example.COM " };

describe("booking input validation", () => {
  it("accepts valid input and normalises the e-mail", () => {
    const r = parseBookingInput(valid, TODAY);
    expect(r).toEqual({ ok: true, data: { windowId: 3, from: "2026-12-10", to: "2026-12-12", email: "test1@example.com" } });
  });

  it("accepts a single day", () => {
    expect(parseBookingInput({ ...valid, to: valid.from }, TODAY).ok).toBe(true);
  });

  it("rejects invalid e-mails as an e-mail error", () => {
    for (const email of ["", "foo", "foo@", "@bar.at", "a b@c.at", `${"x".repeat(250)}@a.at`])
      expect(parseBookingInput({ ...valid, email }, TODAY)).toEqual({ ok: false, field: "email" });
  });

  it("rejects manipulated windows and ranges as a range error", () => {
    const cases = [
      { windowId: "7" }, { windowId: "0" }, { windowId: "abc" }, { windowId: "2.5" },
      { from: "2026-11-30" },                          // before campaign
      { to: "2027-08-01" },                            // after campaign
      { from: "2026-12-12", to: "2026-12-10" },        // reversed
      { from: "2027-02-30", to: "2027-03-01" },        // impossible date
      { from: "10.12.2026" },                          // wrong format
    ];
    for (const c of cases) expect(parseBookingInput({ ...valid, ...c }, TODAY), JSON.stringify(c)).toEqual({ ok: false, field: "range" });
  });

  it("rejects days in the past once the campaign runs", () => {
    expect(parseBookingInput({ ...valid, from: "2027-01-09", to: "2027-01-12" }, "2027-01-10").ok).toBe(false);
    expect(parseBookingInput({ ...valid, from: "2027-01-10", to: "2027-01-12" }, "2027-01-10").ok).toBe(true);
  });
});
