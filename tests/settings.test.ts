import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getPool } from "@/lib/db";
import { END_TEXT_MAX_LENGTH, getSettings, setCampaignClosed, setEndText } from "@/lib/settings";

describe.skipIf(!process.env.DATABASE_URL)("settings", () => {
  beforeEach(async () => {
    await setCampaignClosed(false);
    await setEndText("");
  });
  afterAll(async () => {
    await setCampaignClosed(false);
    await setEndText("");
    await getPool().end();
  });

  it("defaults to an open campaign with empty end text", async () => {
    expect(await getSettings()).toEqual({ campaignClosed: false, endText: "" });
  });

  it("closes and reopens the campaign", async () => {
    await setCampaignClosed(true);
    expect((await getSettings()).campaignClosed).toBe(true);
    await setCampaignClosed(false);
    expect((await getSettings()).campaignClosed).toBe(false);
  });

  it("stores the end text trimmed and capped", async () => {
    await setEndText("  Danke!\nBis bald.  ");
    expect((await getSettings()).endText).toBe("Danke!\nBis bald.");
    await setEndText("x".repeat(END_TEXT_MAX_LENGTH + 50));
    expect((await getSettings()).endText).toHaveLength(END_TEXT_MAX_LENGTH);
  });

  it("recreates missing rows (upsert)", async () => {
    await getPool().query("DELETE FROM settings WHERE key = 'campaign_closed'");
    expect((await getSettings()).campaignClosed).toBe(false);
    await setCampaignClosed(true);
    expect((await getSettings()).campaignClosed).toBe(true);
  });
});
