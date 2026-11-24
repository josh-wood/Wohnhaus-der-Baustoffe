import { texts } from "@/content/texts";

export function LegalContact() {
  const o = texts.legal.owner;
  return (
    <address className="not-italic leading-relaxed">
      {o.name}
      <br />
      {o.street}
      <br />
      {o.city}
      <br />
      {o.country}
      <br />
      E-Mail:{" "}
      <a href={`mailto:${o.email}`} className="underline underline-offset-2 break-all">
        {o.email}
      </a>
    </address>
  );
}
