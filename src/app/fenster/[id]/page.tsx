import { campaignClosedScreen } from "@/components/EndScreen";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RangeCalendar } from "@/components/RangeCalendar";
import { findWindow } from "@/config/windows";
import { texts } from "@/content/texts";
import { getBookedRanges } from "@/lib/bookings";
import { countFreeDays, todayInVienna } from "@/lib/campaign";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function WindowDatesPage({ params }: Props) {
  const closed = await campaignClosedScreen();
  if (closed) return closed;
  const { id } = await params;
  const win = findWindow(id);
  if (!win) notFound();

  const today = todayInVienna();
  const booked = await getBookedRanges(win.id);
  const fullyBooked = countFreeDays(booked, today) === 0;

  return (
    <section className="space-y-5">
      <Link href="/" className="text-sm underline underline-offset-4">
        ← {texts.dates.back}
      </Link>
      <h1 className="text-3xl italic text-center">{win.label}</h1>

      {fullyBooked ? (
        <p role="alert" className="text-center font-semibold text-accent" data-testid="fully-booked">
          {texts.dates.fullyBooked}
        </p>
      ) : (
        <>
          <p className="text-center">{texts.dates.intro}</p>
          <p className="text-center text-sm opacity-70">{texts.dates.howTo}</p>
          <RangeCalendar windowId={win.id} booked={booked} today={today} />
        </>
      )}
    </section>
  );
}
