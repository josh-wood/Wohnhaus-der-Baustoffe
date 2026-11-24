import { campaignClosedScreen } from "@/components/EndScreen";
import Link from "next/link";
import { texts } from "@/content/texts";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage() {
  const closed = await campaignClosedScreen();
  if (closed) return closed;
  const t = texts.confirmation;
  return (
    <section className="flex flex-col items-center gap-6 pt-12 text-center">
      <h1 className="text-4xl italic">{t.title}</h1>
      <p className="text-xl leading-relaxed" data-testid="confirmation">
        {t.message}
      </p>
      <p className="opacity-70">{t.mailHint}</p>
      <Link href="/" className="btn-primary mt-4">
        {t.backHome}
      </Link>
    </section>
  );
}
