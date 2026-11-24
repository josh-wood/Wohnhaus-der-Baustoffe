"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { createBooking } from "@/lib/bookings";
import { parseBookingInput } from "@/lib/booking-input";
import { todayInVienna } from "@/lib/campaign";
import { sendBookingConfirmation } from "@/lib/mail";
import { getSettings } from "@/lib/settings";

export type BookingFormState = {
  error?: "email" | "range" | "taken" | "generic";
  email?: string;
};

export async function submitBooking(_prev: BookingFormState, formData: FormData): Promise<BookingFormState> {
  const email = String(formData.get("email") ?? "");

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (String(formData.get("website") ?? "") !== "") redirect("/bestaetigung");

  // Campaign ended: accept nothing; the start page shows the end text.
  if ((await getSettings()).campaignClosed) redirect("/");

  const input = parseBookingInput(
    {
      windowId: formData.get("windowId"),
      from: formData.get("from"),
      to: formData.get("to"),
      email,
    },
    todayInVienna(),
  );
  if (!input.ok) return { error: input.field, email };

  let result;
  try {
    result = await createBooking(input.data);
  } catch (err) {
    console.error("booking: insert failed", err instanceof Error ? err.message : err);
    return { error: "generic", email };
  }
  if (!result.ok) return { error: result.reason === "taken" ? "taken" : "range", email };

  // The booking is stored. The mail is sent after the response (fast redirect);
  // a failing e-mail must never turn this into an error for the guest.
  const { windowId, from, to } = input.data;
  const bookingId = result.id;
  after(async () => {
    try {
      await sendBookingConfirmation({ email: input.data.email, windowId, from, to });
      console.info(`mail: confirmation for booking ${bookingId} sent`);
    } catch (err) {
      console.error(`mail: confirmation for booking ${bookingId} failed`, err instanceof Error ? err.message : err);
    }
  });

  redirect("/bestaetigung");
}
