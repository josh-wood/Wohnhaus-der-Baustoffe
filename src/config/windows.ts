// Building photo + window hotspots for the start page (spec 02).
// All coordinates are in image pixels of BUILDING_IMAGE (origin top-left).
// To calibrate with a new photo: open /?debug=1, tap the corners of each window
// and paste the generated "points" here.

export type Rect = { x: number; y: number; width: number; height: number };

export type WindowHotspot = {
  id: number;
  label: string;
  /** Visible outline of the window: "x1,y1 x2,y2 …" */
  points: string;
  /** Optional explicit tap area; defaults to the outline's bounding box + HIT_PADDING. */
  hit?: Rect;
};

export const BUILDING_IMAGE = {
  src: "/haus_der_baustoffe.png",
  width: 1600,
  height: 800,
  alt: "Fassade des Hauses der Baustoffe mit sechs Fenstern",
} as const;

/** Extra tap area around each window in image pixels (fat-finger tolerance). */
export const HIT_PADDING = 30;

export const WINDOWS: WindowHotspot[] = [
  { id: 1, label: "Fenster 1", points: "230,551 230,367 90,359 90,542" },
  { id: 2, label: "Fenster 2", points: "410,350 410,551 270,542 270,359" },
  { id: 3, label: "Fenster 3", points: "599,367 455,367 455,542 590,542" },
  { id: 4, label: "Fenster 4", points: "1018,359 1013,560 865,542 865,359" },
  { id: 5, label: "Fenster 5", points: "1212,350 1207,551 1058,551 1058,350" },
  { id: 6, label: "Fenster 6", points: "1410,359 1410,551 1261,542 1261,367" },
];

export function parsePoints(points: string): [number, number][] {
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map(Number) as [number, number]);
}

export function boundingBox(points: string): Rect {
  const pts = parsePoints(points);
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

/** Tap area of a window, clamped to the image bounds. */
export function hitArea(w: WindowHotspot): Rect {
  if (w.hit) return w.hit;
  const b = boundingBox(w.points);
  const x = Math.max(0, b.x - HIT_PADDING);
  const y = Math.max(0, b.y - HIT_PADDING);
  const right = Math.min(BUILDING_IMAGE.width, b.x + b.width + HIT_PADDING);
  const bottom = Math.min(BUILDING_IMAGE.height, b.y + b.height + HIT_PADDING);
  return { x, y, width: right - x, height: bottom - y };
}

export function isValidWindowId(id: number): boolean {
  return WINDOWS.some((w) => w.id === id);
}

/** Resolves a route param like "3" to its window; rejects "03", "3a", "7". */
export function findWindow(param: string): WindowHotspot | undefined {
  return /^[1-9]\d*$/.test(param) ? WINDOWS.find((w) => w.id === Number(param)) : undefined;
}
