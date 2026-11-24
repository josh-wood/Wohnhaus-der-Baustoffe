// Content of the confirmation e-mail (pure function, unit-tested).
import { WINDOWS } from "@/config/windows";
import { dayCount, formatRange, type DateRange } from "@/lib/campaign";
import { texts } from "@/content/texts";

export type BookingMail = { email: string; windowId: number } & DateRange;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildConfirmationMail(mail: BookingMail, appUrl: string) {
  const t = texts.mail;
  const label = WINDOWS.find((w) => w.id === mail.windowId)?.label ?? `Fenster ${mail.windowId}`;
  const period = `${formatRange(mail)} (${texts.dates.days(dayCount(mail))})`;
  const base = appUrl.replace(/\/+$/, "");
  const impressum = `${base}/impressum`;

  const text = [
    t.greeting,
    "",
    texts.confirmation.message,
    "",
    `${texts.contact.summaryWindow}: ${label}`,
    `${texts.contact.summaryRange}: ${period}`,
    "",
    t.closing,
    ...t.signature,
    "",
    `${t.impressum}: ${impressum}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="de"><body style="margin:0;padding:24px;background:#faf8f4;font-family:Georgia,serif;color:#1f1d1a;">
  <div style="max-width:520px;margin:0 auto;">
    <p>${escapeHtml(t.greeting)}</p>
    <p style="font-size:18px;"><strong>${escapeHtml(texts.confirmation.message)}</strong></p>
    <table style="border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:2px 16px 2px 0;color:#6b665e;">${escapeHtml(texts.contact.summaryWindow)}</td><td>${escapeHtml(label)}</td></tr>
      <tr><td style="padding:2px 16px 2px 0;color:#6b665e;">${escapeHtml(texts.contact.summaryRange)}</td><td>${escapeHtml(period)}</td></tr>
    </table>
    <p>${escapeHtml(t.closing)}<br>${t.signature.map(escapeHtml).join("<br>")}</p>
    <p style="font-size:12px;color:#6b665e;"><a href="${escapeHtml(impressum)}" style="color:#6b665e;">${escapeHtml(t.impressum)}</a></p>
  </div>
</body></html>`;

  return { subject: t.subject, text, html };
}
