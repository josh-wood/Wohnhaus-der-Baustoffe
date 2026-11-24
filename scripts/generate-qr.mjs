// Generates the printable QR code pointing to the start page (spec 09).
// Usage: APP_URL=https://example.org npm run qr   → qr/qr-code.png, qr/qr-code.svg, qr/qr-code-a4.pdf
import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const OUT_DIR = resolve(process.env.QR_OUT_DIR ?? "qr");
const A4 = { width: 595.28, height: 841.89 }; // points
const CM = 72 / 2.54;
const QR_OPTIONS = { errorCorrectionLevel: "M", margin: 4 };

function targetUrl() {
  const raw = process.env.APP_URL;
  if (!raw) throw new Error("APP_URL is not set. Example: APP_URL=https://example.org npm run qr");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`APP_URL is not a valid URL: ${raw}`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("APP_URL must start with https://");
  if (url.protocol === "http:" && !["localhost", "127.0.0.1"].includes(url.hostname))
    console.warn("qr: warning – APP_URL uses http://, the printed code should point to https://");
  return url.toString(); // normalised, e.g. "https://example.org/"
}

async function buildPdf(url, png) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("QR-Code Probewohnen");
  const page = pdf.addPage([A4.width, A4.height]);
  const serif = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.12, 0.11, 0.1);
  const center = (text, font, size, y) =>
    page.drawText(text, { x: (A4.width - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color: ink });

  center("Wie willst du wohnen?", serif, 34, A4.height - 5 * CM);
  center("Probewohnen im Wohnhaus der Baustoffe · Aigen im Mühlkreis", serif, 15, A4.height - 6.2 * CM);

  const size = 12 * CM;
  const image = await pdf.embedPng(png);
  page.drawImage(image, { x: (A4.width - size) / 2, y: A4.height - 7.5 * CM - size, width: size, height: size });

  center("Code mit der Handy-Kamera scannen", sans, 13, A4.height - 21 * CM);
  center(url.replace(/\/$/, ""), sans, 12, A4.height - 22 * CM);
  return pdf.save();
}

async function main() {
  const url = targetUrl();
  await mkdir(OUT_DIR, { recursive: true });
  const png = await QRCode.toBuffer(url, { ...QR_OPTIONS, type: "png", width: 2048 });
  const svg = await QRCode.toString(url, { ...QR_OPTIONS, type: "svg" });
  const pdf = await buildPdf(url, png);
  await Promise.all([
    writeFile(join(OUT_DIR, "qr-code.png"), png),
    writeFile(join(OUT_DIR, "qr-code.svg"), svg),
    writeFile(join(OUT_DIR, "qr-code-a4.pdf"), pdf),
  ]);
  console.log(`qr: ${url} → ${OUT_DIR}/qr-code.{png,svg} + qr-code-a4.pdf`);
}

main().catch((err) => {
  console.error(`qr: ${err.message}`);
  process.exit(1);
});
