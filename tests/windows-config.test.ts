import { describe, expect, it } from "vitest";
import { BUILDING_IMAGE, WINDOWS, hitArea, isValidWindowId, parsePoints, type Rect } from "@/config/windows";

const overlaps = (a: Rect, b: Rect) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

describe("window hotspot config", () => {
  it("defines exactly 6 windows with ids 1–6", () => {
    expect(WINDOWS.map((w) => w.id)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("has valid outlines inside the image", () => {
    for (const w of WINDOWS) {
      const pts = parsePoints(w.points);
      expect(pts.length).toBeGreaterThanOrEqual(3);
      for (const [x, y] of pts) {
        expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(BUILDING_IMAGE.width);
        expect(y).toBeLessThanOrEqual(BUILDING_IMAGE.height);
      }
    }
  });

  it("has non-overlapping tap areas", () => {
    for (let i = 0; i < WINDOWS.length; i++)
      for (let j = i + 1; j < WINDOWS.length; j++)
        expect(overlaps(hitArea(WINDOWS[i]), hitArea(WINDOWS[j])), `${i + 1}/${j + 1}`).toBe(false);
  });

  it("validates window ids", () => {
    expect(isValidWindowId(1)).toBe(true);
    expect(isValidWindowId(6)).toBe(true);
    expect(isValidWindowId(0)).toBe(false);
    expect(isValidWindowId(7)).toBe(false);
  });
});
