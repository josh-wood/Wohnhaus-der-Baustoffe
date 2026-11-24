import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { buildConfirmationMail, type BookingMail } from "@/lib/mail-content";

export type { BookingMail };

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  if (!host) throw new Error("SMTP_HOST is not set");
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587/25 = STARTTLS when offered
    auth: user ? { user, pass: process.env.SMTP_PASS ?? "" } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/** Sends the confirmation e-mail to the guest (optionally BCC to the organiser). */
export async function sendBookingConfirmation(mail: BookingMail): Promise<void> {
  if (process.env.MAIL_FAIL_FOR_TEST === "1") throw new Error("simulated SMTP failure");
  const from = process.env.MAIL_FROM;
  if (!from) throw new Error("MAIL_FROM is not set");

  const content = buildConfirmationMail(mail, process.env.APP_URL ?? "");
  await getTransporter().sendMail({
    from,
    to: mail.email,
    bcc: process.env.MAIL_BCC || undefined,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });
}
