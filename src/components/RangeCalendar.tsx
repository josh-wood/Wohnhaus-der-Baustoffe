"use client";

import Link from "next/link";
import { useState } from "react";
import { DayPicker, type DateRange as PickerRange, type Matcher } from "react-day-picker";
import { de } from "react-day-picker/locale";
import "react-day-picker/style.css";
import {
  CAMPAIGN_END,
  dayCount,
  firstBookableDay,
  formatRange,
  fromIsoDate,
  rangeHitsBooked,
  toIsoDate,
  type DateRange,
} from "@/lib/campaign";
import { texts } from "@/content/texts";

type Props = {
  windowId: number;
  booked: DateRange[];
  today: string;
};

export function RangeCalendar({ windowId, booked, today }: Props) {
  const first = firstBookableDay(today);
  const [range, setRange] = useState<DateRange | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bookedMatchers: Matcher[] = booked.map((b) => ({ from: fromIsoDate(b.from), to: fromIsoDate(b.to) }));
  const disabled: Matcher[] = [{ before: fromIsoDate(first) }, { after: fromIsoDate(CAMPAIGN_END) }, ...bookedMatchers];

  /**
   * Hotel-style selection:
   * - first tap selects a single day (already a valid booking),
   * - a later day extends it to a range (unless a booked day lies in between),
   * - any tap after a complete range (or on an earlier day) starts over.
   */
  function handleSelect(_next: PickerRange | undefined, clicked: Date) {
    const day = toIsoDate(clicked);
    setError(null);
    if (range && range.from === range.to && day > range.from) {
      const candidate = { from: range.from, to: day };
      if (rangeHitsBooked(candidate, booked)) {
        setError(texts.dates.alreadyBookedRange);
        setRange({ from: day, to: day });
        return;
      }
      setRange(candidate);
      return;
    }
    setRange({ from: day, to: day });
  }

  const selected: PickerRange | undefined = range
    ? { from: fromIsoDate(range.from), to: fromIsoDate(range.to) }
    : undefined;

  const nextHref = range ? `/fenster/${windowId}/kontakt?von=${range.from}&bis=${range.to}` : null;

  return (
    <div className="space-y-4">
      <div className="calendar-wrap flex justify-center">
        <DayPicker
          mode="range"
          locale={de}
          weekStartsOn={1}
          selected={selected}
          onSelect={handleSelect}
          disabled={disabled}
          modifiers={{ booked: bookedMatchers }}
          modifiersClassNames={{ booked: "day-booked" }}
          startMonth={fromIsoDate(first)}
          endMonth={fromIsoDate(CAMPAIGN_END)}
          defaultMonth={fromIsoDate(first)}
          showOutsideDays={false}
          fixedWeeks
        />
      </div>

      <p className="flex items-center justify-center gap-2 text-sm opacity-80">
        <span className="legend-booked inline-block h-3 w-3 rounded-sm" aria-hidden="true" />
        {texts.dates.legendBooked}
      </p>

      <div aria-live="polite" className="min-h-6 text-center">
        {error ? (
          <p role="alert" className="font-semibold text-accent" data-testid="range-error">
            {error}
          </p>
        ) : range ? (
          <p data-testid="range-summary">
            {texts.dates.selected}: <strong>{formatRange(range)}</strong> ({texts.dates.days(dayCount(range))})
          </p>
        ) : (
          <p className="opacity-70">{texts.dates.noSelection}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        {nextHref ? (
          <Link href={nextHref} className="btn-primary" data-testid="next">
            {texts.dates.next}
          </Link>
        ) : (
          <span className="btn-primary is-disabled" aria-disabled="true" data-testid="next">
            {texts.dates.next}
          </span>
        )}
      </div>
    </div>
  );
}
