import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkPassword, createSessionToken, isAdminConfigured, SESSION_TTL_SECONDS, verifySessionToken } from "@/lib/auth";
import { csvCell, toCsv } from "@/lib/csv";

describe("admin auth", () => {
  const env = { ...process.env };
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct horse";
    process.env.SESSION_SECRET = "s".repeat(32);
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it("checks the password", () => {
    expect(checkPassword("correct horse")).toBe(true);
    expect(checkPassword("correct hors")).toBe(false);
    expect(checkPassword("")).toBe(false);
  });

  it("refuses login when not configured or secret too short", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(isAdminConfigured()).toBe(false);
    expect(checkPassword("")).toBe(false);
    process.env.ADMIN_PASSWORD = "x";
    process.env.SESSION_SECRET = "short";
    expect(isAdminConfigured()).toBe(false);
  });

  it("accepts valid session tokens until they expire", () => {
    const now = Date.now();
    const token = createSessionToken(now);
    expect(verifySessionToken(token, now)).toBe(true);
    expect(verifySessionToken(token, now + (SESSION_TTL_SECONDS - 5) * 1000)).toBe(true);
    expect(verifySessionToken(token, now + (SESSION_TTL_SECONDS + 5) * 1000)).toBe(false);
  });

  it("rejects tampered, foreign and malformed tokens", () => {
    const token = createSessionToken();
    const [exp, mac] = token.split(".");
    expect(verifySessionToken(`${Number(exp) + 999999}.${mac}`)).toBe(false); // extended expiry
    expect(verifySessionToken(`${exp}.${mac.slice(0, -1)}x`)).toBe(false);
    expect(verifySessionToken(undefined)).toBe(false);
    expect(verifySessionToken("garbage")).toBe(false);
    process.env.SESSION_SECRET = "o".repeat(32); // rotated secret invalidates sessions
    expect(verifySessionToken(token)).toBe(false);
  });
});

describe("csv", () => {
  it("writes BOM, semicolons, CRLF and quotes", () => {
    const csv = toCsv(["Fenster", "E-Mail"], [["1", 'a"b@x.at']]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toBe('﻿"Fenster";"E-Mail"\r\n"1";"a""b@x.at"\r\n');
  });

  it("neutralises formula injection", () => {
    expect(csvCell("=HYPERLINK(\"x\")")).toBe("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csvCell("+43 1 234")).toBe("\"'+43 1 234\"");
    expect(csvCell("-1")).toBe("\"'-1\"");
    expect(csvCell("@sum")).toBe("\"'@sum\"");
    expect(csvCell("test@example.com")).toBe('"test@example.com"');
  });
});
