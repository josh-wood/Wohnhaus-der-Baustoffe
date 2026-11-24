import "server-only";
import { getPool } from "@/lib/db";

export type Settings = { campaignClosed: boolean; endText: string };

import { END_TEXT_MAX_LENGTH } from "@/lib/limits";

export { END_TEXT_MAX_LENGTH };

/** Read on every request (pages are dynamic) – a switch in admin takes effect immediately. */
export async function getSettings(): Promise<Settings> {
  const { rows } = await getPool().query<{ key: string; value: string }>(
    "SELECT key, value FROM settings WHERE key IN ('campaign_closed', 'end_text')",
  );
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    campaignClosed: map.get("campaign_closed") === "true",
    endText: map.get("end_text") ?? "",
  };
}

async function setValue(key: string, value: string): Promise<void> {
  await getPool().query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value],
  );
}

export async function setCampaignClosed(closed: boolean): Promise<void> {
  await setValue("campaign_closed", closed ? "true" : "false");
}

export async function setEndText(text: string): Promise<void> {
  await setValue("end_text", text.trim().slice(0, END_TEXT_MAX_LENGTH));
}
