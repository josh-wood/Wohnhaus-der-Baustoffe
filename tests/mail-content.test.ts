import { describe, expect, it } from "vitest";
import { buildConfirmationMail } from "@/lib/mail-content";

const mail = { email: "test1@example.com", windowId: 2, from: "2026-12-10", to: "2026-12-12" };

describe("confirmation mail content", () => {
  const c = buildConfirmationMail(mail, "https://example.org/");

  it("uses the wording from the brief", () => {
    expect(c.subject).toBe("Probewohnen – Dein Eintrag ist gespeichert");
    expect(c.text).toContain("Der Eintrag wurde gespeichert – wir melden uns in Kürze bei Euch.");
    expect(c.html).toContain("Der Eintrag wurde gespeichert – wir melden uns in Kürze bei Euch.");
  });

  it("contains window, period and Impressum link", () => {
    expect(c.text).toContain("Fenster: Fenster 2");
    expect(c.text).toContain("Zeitraum: 10.12.2026 – 12.12.2026 (3 Tage)");
    expect(c.text).toContain("Impressum: https://example.org/impressum");
    expect(c.html).toContain('href="https://example.org/impressum"');
  });

  it("does not contain the guest's address in the body", () => {
    expect(c.text).not.toContain(mail.email);
    expect(c.html).not.toContain(mail.email);
  });

  it("escapes HTML in dynamic values", () => {
    const evil = buildConfirmationMail(mail, 'https://x.org/"><script>');
    expect(evil.html).not.toContain("<script>");
    expect(evil.html).toContain("&lt;script&gt;");
  });
});
