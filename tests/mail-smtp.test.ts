// Integration: sends through the local Mailpit SMTP catcher (docker compose) and reads it back via its API.
import { beforeAll, describe, expect, it, vi } from "vitest";
import { sendBookingConfirmation } from "@/lib/mail";

const MAILPIT = "http://localhost:8025/api/v1";
const available = await fetch(`${MAILPIT}/info`).then((r) => r.ok).catch(() => false);

describe.skipIf(!available || process.env.SMTP_PORT !== "1025")("SMTP delivery (Mailpit)", () => {
  beforeAll(async () => {
    await fetch(`${MAILPIT}/messages`, { method: "DELETE" });
  });

  it("delivers the confirmation with correct headers and umlauts", async () => {
    process.env.MAIL_BCC = "organiser@example.org";
    await sendBookingConfirmation({ email: "test1@example.com", windowId: 5, from: "2027-03-01", to: "2027-03-02" });
    delete process.env.MAIL_BCC;

    const list = await (await fetch(`${MAILPIT}/messages`)).json();
    expect(list.messages).toHaveLength(1);
    const summary = list.messages[0];
    expect(summary.Subject).toBe("Probewohnen – Dein Eintrag ist gespeichert");
    expect(summary.To.map((t: { Address: string }) => t.Address)).toEqual(["test1@example.com"]);
    expect(summary.Bcc.map((t: { Address: string }) => t.Address)).toEqual(["organiser@example.org"]);
    expect(summary.From.Address).toBe("noreply@example.org");

    const full = await (await fetch(`${MAILPIT}/message/${summary.ID}`)).json();
    expect(full.Text).toContain("wir melden uns in Kürze bei Euch.");
    expect(full.Text).toContain("01.03.2027 – 02.03.2027 (2 Tage)");
    expect(full.HTML).toContain("Aigen im Mühlkreis");
  });

  it("rejects (does not hang) when the SMTP server is unreachable", async () => {
    vi.resetModules(); // fresh transporter with the new port
    const port = process.env.SMTP_PORT;
    process.env.SMTP_PORT = "1"; // nothing listens here
    const mod = await import("@/lib/mail");
    await expect(
      mod.sendBookingConfirmation({ email: "a@example.com", windowId: 1, from: "2026-12-01", to: "2026-12-01" }),
    ).rejects.toThrow();
    process.env.SMTP_PORT = port;
  });
});
