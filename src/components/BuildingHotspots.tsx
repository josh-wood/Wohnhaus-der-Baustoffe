"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { BUILDING_IMAGE, WINDOWS, boundingBox, hitArea } from "@/config/windows";
import { texts } from "@/content/texts";

type Props = { debug?: boolean };

/**
 * Building photo with an SVG overlay. The SVG uses the photo's pixel size as viewBox,
 * so hotspots scale exactly with the image at every screen width – no JS layout math.
 */
export function BuildingHotspots({ debug = false }: Props) {
  const { src, width, height, alt } = BUILDING_IMAGE;
  const [clicks, setClicks] = useState<[number, number][]>([]);

  function recordClick(e: MouseEvent<SVGSVGElement>) {
    if (!debug) return;
    e.preventDefault();
    const svg = e.currentTarget;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    setClicks((prev) => [...prev, [Math.round(p.x), Math.round(p.y)]]);
  }

  return (
    <div>
      <div className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-sm">
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          priority
          sizes="(max-width: 640px) 100vw, 576px"
          className="block w-full h-auto select-none"
          unoptimized={src.endsWith(".svg")}
          draggable={false}
        />
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className={`absolute inset-0 h-full w-full ${debug ? "hotspots-debug" : ""}`}
          onClickCapture={recordClick}
          data-testid="hotspots"
        >
          {WINDOWS.map((w) => {
            const hit = hitArea(w);
            const box = boundingBox(w.points);
            const badgeR = Math.max(22, Math.min(box.width, box.height) * 0.16);
            return (
              <Link
                key={w.id}
                href={`/fenster/${w.id}`}
                aria-label={texts.home.selectWindow(w.label)}
                className="hotspot"
                data-window={w.id}
              >
                <title>{w.label}</title>
                <rect className="hotspot-hit" x={hit.x} y={hit.y} width={hit.width} height={hit.height} />
                <polygon className="hotspot-shape" points={w.points} />
                <g className="hotspot-badge" aria-hidden="true">
                  <circle cx={box.x + box.width / 2} cy={box.y + box.height / 2} r={badgeR} />
                  <text
                    x={box.x + box.width / 2}
                    y={box.y + box.height / 2}
                    fontSize={badgeR * 1.2}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {w.id}
                  </text>
                </g>
              </Link>
            );
          })}
          {debug &&
            clicks.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} className="fill-yellow-300 stroke-black" />)}
        </svg>
      </div>

      {debug && (
        <div className="mt-4 rounded border border-dashed border-ink/40 p-3 font-mono text-xs space-y-2">
          <p>
            Debug: Bildgröße {width}×{height}. Ecken eines Fensters antippen, dann „points“ in
            src/config/windows.ts einfügen.
          </p>
          <p data-testid="debug-points" className="break-all">
            points: &quot;{clicks.map(([x, y]) => `${x},${y}`).join(" ")}&quot;
          </p>
          <button type="button" className="underline" onClick={() => setClicks([])}>
            Zurücksetzen
          </button>
        </div>
      )}
    </div>
  );
}
