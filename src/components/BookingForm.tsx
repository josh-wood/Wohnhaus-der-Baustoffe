"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitBooking, type BookingFormState } from "@/app/fenster/[id]/kontakt/actions";
import { texts } from "@/content/texts";

type Props = { windowId: number; from: string; to: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary disabled:opacity-50" disabled={pending} data-testid="submit">
      {pending ? texts.contact.submitting : texts.contact.submit}
    </button>
  );
}

export function BookingForm({ windowId, from, to }: Props) {
  const [state, formAction] = useActionState<BookingFormState, FormData>(submitBooking, {});
  const t = texts.contact;

  if (state.error === "taken" || state.error === "range") {
    return (
      <div role="alert" className="space-y-4 text-center" data-testid="booking-error">
        <p className="text-xl font-semibold text-accent">{state.error === "taken" ? t.taken : t.invalidRange}</p>
        {state.error === "taken" && <p>{t.takenHint}</p>}
        <Link href={`/fenster/${windowId}`} className="btn-primary">
          {t.chooseOther}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="windowId" value={windowId} />
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="to" value={to} />
      {/* Honeypot – invisible for people, attractive for bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-lg">
          {t.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={t.emailPlaceholder}
          defaultValue={state.email}
          aria-invalid={state.error === "email" || undefined}
          aria-describedby={state.error ? "email-error" : undefined}
          className="w-full rounded-lg border border-ink/30 bg-white px-4 py-3 text-lg focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
        {state.error && (
          <p id="email-error" role="alert" className="text-accent" data-testid="form-error">
            {state.error === "email" ? t.invalidEmail : t.genericError}
          </p>
        )}
      </div>

      <p className="text-sm opacity-75">
        {t.privacy}{" "}
        <Link href="/datenschutz" className="underline underline-offset-2">
          {t.privacyLink}
        </Link>
        .
      </p>

      <div className="flex justify-center">
        <SubmitButton />
      </div>
    </form>
  );
}
