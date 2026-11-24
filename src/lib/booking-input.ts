// Validation of the booking form (shared by server action and tests).
import { z } from "zod";
import { isValidWindowId } from "@/config/windows";
import { isIsoDate, isRangeBookable } from "@/lib/campaign";

export const bookingInputSchema = z.object({
  windowId: z.coerce.number().int().refine(isValidWindowId),
  from: z.string().refine(isIsoDate),
  to: z.string().refine(isIsoDate),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email(),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export type BookingInputResult =
  | { ok: true; data: BookingInput }
  | { ok: false; field: "email" | "range" };

/** Validates raw form values; `today` = Vienna date (ISO) for the "no past days" rule. */
export function parseBookingInput(raw: Record<string, unknown>, today: string): BookingInputResult {
  const parsed = bookingInputSchema.safeParse(raw);
  if (!parsed.success) {
    const emailOnly = parsed.error.issues.every((i) => i.path[0] === "email");
    return { ok: false, field: emailOnly ? "email" : "range" };
  }
  const { from, to } = parsed.data;
  if (!isRangeBookable({ from, to }, today)) return { ok: false, field: "range" };
  return { ok: true, data: parsed.data };
}
