import { texts } from "@/content/texts";
import { getSettings } from "@/lib/settings";

/** Shown on all public pages once the campaign has been ended in the admin area. */
export function EndScreen({ text }: { text: string }) {
  return (
    <section className="flex flex-col items-center gap-6 pt-12 text-center" data-testid="end-screen">
      <h1 className="text-3xl italic">{texts.end.title}</h1>
      <p className="whitespace-pre-line text-xl leading-relaxed">{text.trim() || texts.end.defaultText}</p>
      <div className="space-y-1 italic opacity-80">
        {texts.home.below.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}

/** Returns the end screen if the campaign is closed, otherwise null. */
export async function campaignClosedScreen() {
  const settings = await getSettings();
  return settings.campaignClosed ? <EndScreen text={settings.endText} /> : null;
}
