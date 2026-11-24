import { getPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return Response.json({ ok: true });
  } catch (err) {
    console.error("health: database check failed", err instanceof Error ? err.message : err);
    return Response.json({ ok: false }, { status: 503 });
  }
}
