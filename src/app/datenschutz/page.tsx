import type { Metadata } from "next";
import { LegalContact } from "@/components/LegalContact";
import { texts } from "@/content/texts";

export const metadata: Metadata = { title: "Datenschutz · Probewohnen" };

export default function DatenschutzPage() {
  const t = texts.legal.privacy;
  return (
    <article className="legal space-y-6">
      <h1 className="text-3xl italic">{t.title}</h1>
      {t.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          <p>{s.body}</p>
        </section>
      ))}
      <section>
        <h2>{t.contactHeading}</h2>
        <LegalContact />
      </section>
    </article>
  );
}
