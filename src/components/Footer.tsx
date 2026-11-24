import Link from "next/link";
import { texts } from "@/content/texts";

export function Footer() {
  return (
    <footer className="w-full border-t border-ink/10 py-6 text-center text-xs">
      <nav aria-label="Rechtliches" className="flex justify-center gap-6">
        <Link href="/impressum" className="underline-offset-4 hover:underline" data-testid="footer-impressum">
          {texts.footer.impressum}
        </Link>
        <Link href="/datenschutz" className="underline-offset-4 hover:underline" data-testid="footer-datenschutz">
          {texts.footer.datenschutz}
        </Link>
      </nav>
    </footer>
  );
}
