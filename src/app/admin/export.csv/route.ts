import { isAdmin } from "@/lib/auth";
import { listBookings } from "@/lib/bookings";
import { formatDate, formatDateTime, todayInVienna } from "@/lib/campaign";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const bookings = await listBookings();
  const csv = toCsv(
    ["Fenster", "Von", "Bis", "E-Mail", "Gebucht am"],
    bookings.map((b) => [String(b.windowId), formatDate(b.from), formatDate(b.to), b.email, formatDateTime(b.createdAt)]),
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="buchungen-${todayInVienna()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
