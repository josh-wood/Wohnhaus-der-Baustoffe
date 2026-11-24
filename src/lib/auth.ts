import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;
const MIN_SECRET_LENGTH = 16;

function secret(): string | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= MIN_SECRET_LENGTH ? s : null;
}

/** Login is only possible when both env vars are configured. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) && secret() !== null;
}

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time comparison (hashing first makes lengths equal). */
export function checkPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !isAdminConfigured()) return false;
  return timingSafeEqual(sha256(candidate), sha256(expected));
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Token format: "<expiresAtUnixSeconds>.<hmac>" */
export function createSessionToken(now = Date.now()): string {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET missing or too short");
  const expires = String(Math.floor(now / 1000) + SESSION_TTL_SECONDS);
  return `${expires}.${sign(expires, key)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  const key = secret();
  if (!token || !key) return false;
  const [expires, mac] = token.split(".");
  if (!expires || !mac || !/^\d+$/.test(expires)) return false;
  const expected = Buffer.from(sign(expires, key));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(expires) * 1000 > now;
}

export async function isAdmin(): Promise<boolean> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function startSession(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: (process.env.APP_URL ?? "").startsWith("https://"),
    path: "/admin",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: "/admin" });
}
