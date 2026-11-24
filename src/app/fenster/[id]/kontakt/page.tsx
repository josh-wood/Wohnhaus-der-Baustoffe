import { campaignClosedScreen } from "@/components/EndScreen";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { findWindow } from "@/config/windows";
import { texts } from "@/content/texts";
import { isRangeFree } from "@/lib/bookings";
import { dayCount, formatRange, isRangeBookable, todayInVienna } from "@/lib/campaign";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ von?: string | string[]; bis?: string | string[] }>;
};

export default async function ContactPage({ params, searchParams }: Props) {
  const closed = await campaignClosedScreen();
  if (closed) return closed;
  const { id } = await params;
  const win = findWindow(id);
  if (!win) notFound();

  const { von, bis } = await searchParams;
  const range = { from: typeof von === "string" ? von : "", to: typeof bis === "string" ? bis : "" };
  if (!isRangeBookable(range, todayInVienna())) redirect(`/fenster/${win.id}`);

  const t = texts.contact;
  const free = await isRangeFree(win.id, range);

  return (
    <section className="space-y-6">
      <Link href={`/fenster/${win.id}`} className="text-sm underline underline-offset-4">
        ← {t.change}
      </Link>
      <h1 className="text-center text-3xl italic">{t.title}</h1>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg bg-white/70 p-4 shadow-sm" data-testid="summary">
        <dt className="opacity-70">{t.summaryWindow}</dt>
        <dd>{win.label}</dd>
        <dt className="opacity-70">{t.summaryRange}</dt>
        <dd>
          {formatRange(range)} ({texts.dates.days(dayCount(range))})
        </dd>
      </dl>

      {free ? (
        <BookingForm windowId={win.id} from={range.from} to={range.to} />
      ) : (
        <div role="alert" className="space-y-4 text-center" data-testid="booking-error">
          <p className="text-xl font-semibold text-accent">{t.taken}</p>
          <Link href={`/fenster/${win.id}`} className="btn-primary">
            {t.chooseOther}
          </Link>
        </div>
      )}
    </section>
  );
}
