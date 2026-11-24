// CSV for German Excel: ";" separator, CRLF, UTF-8 BOM, quoted fields.

const FORMULA_START = /^[=+\-@\t\r]/;

/** Quotes a cell and neutralises spreadsheet formulas (CSV injection). */
export function csvCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(header: string[], rows: string[][]): string {
  const lines = [header, ...rows].map((r) => r.map(csvCell).join(";"));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
