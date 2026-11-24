import { campaignClosedScreen } from "@/components/EndScreen";
import { BuildingHotspots } from "@/components/BuildingHotspots";
import { texts } from "@/content/texts";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ debug?: string }> };

export default async function HomePage({ searchParams }: Props) {
  const closed = await campaignClosedScreen();
  if (closed) return closed;
  const { debug } = await searchParams;

  return (
    <section className="flex flex-col items-center gap-5 pt-30 text-center">
      <h1 className="text-xl italic font-light tracking-wide">{texts.home.above}</h1>

      <div className="w-full">
        <BuildingHotspots debug={debug === "1"} />
        <p className=" text-xs opacity-50 text-accent">{texts.home.hint}</p>
      </div>

      <div className="space-y-0 italic">
        <p className="text-xs font-light">{texts.home.below[0]}</p>
        {texts.home.below.slice(1).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}
