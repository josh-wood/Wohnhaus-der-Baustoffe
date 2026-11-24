// Runs the real script and decodes the generated QR code.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { PDFDocument } from "pdf-lib";

function run(env: Record<string, string>) {
  const out = mkdtempSync(join(tmpdir(), "qr-"));
  const { APP_URL: _ignored, ...base } = process.env;
  void _ignored;
  try {
    const stdout = execFileSync("node", ["scripts/generate-qr.mjs"], { env: { ...base, QR_OUT_DIR: out, ...env }, encoding: "utf8", stdio: "pipe" });
    return { ok: true as const, out, stdout };
  } catch (err) {
    return { ok: false as const, out, stderr: String((err as { stderr?: string }).stderr) };
  }
}

describe("QR code generator", () => {
  it("writes PNG, SVG and an A4 PDF whose code decodes to the URL", async () => {
    const r = run({ APP_URL: "https://probewohnen.example.org" });
    expect(r.ok).toBe(true);

    const png = PNG.sync.read(readFileSync(join(r.out, "qr-code.png")));
    expect(png.width).toBe(2048);
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    expect(decoded?.data).toBe("https://probewohnen.example.org/");

    expect(readFileSync(join(r.out, "qr-code.svg"), "utf8")).toMatch(/^<svg[^>]*viewBox/);

    const pdf = await PDFDocument.load(readFileSync(join(r.out, "qr-code-a4.pdf")));
    expect(pdf.getPageCount()).toBe(1);
    const { width, height } = pdf.getPage(0).getSize();
    expect([Math.round(width), Math.round(height)]).toEqual([595, 842]);
  });

  it("fails with a clear message when APP_URL is missing or invalid", () => {
    const missing = run({});
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.stderr).toContain("APP_URL is not set");
    const invalid = run({ APP_URL: "probewohnen.at" });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.stderr).toContain("not a valid URL");
    const ftp = run({ APP_URL: "ftp://example.org" });
    expect(ftp.ok).toBe(false);
  });
});
