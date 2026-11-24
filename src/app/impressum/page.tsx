import type { Metadata } from "next";
import { LegalContact } from "@/components/LegalContact";
import { texts } from "@/content/texts";

export const metadata: Metadata = { title: "Impressum · Probewohnen" };

export default function ImpressumPage() {
  const t = texts.legal.impressum;
  const org = texts.legal.organisation;
  return (
    <article className="legal space-y-6">
      <h1 className="text-3xl italic">{t.title}</h1>
      <section>
        <h2>{t.ownerHeading}</h2>
        <LegalContact />
      </section>
      {org.name && (
        <section data-testid="organisation">
          <h2>{t.organisationHeading}</h2>
          <p>
            {org.name}
            {org.zvr && (
              <>
                <br />
                {org.zvr}
              </>
            )}
            {org.address && (
              <>
                <br />
                {org.address}
              </>
            )}
          </p>
        </section>
      )}
      <section>
        <h2>{t.purposeHeading}</h2>
        <p>{t.purpose}</p>
      </section>
      <section>
        <h2>{t.projectHeading}</h2>
        <p>{texts.legal.projectNote}</p>
      </section>
    </article>
  );
}
