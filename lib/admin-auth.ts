import { env } from "cloudflare:workers";

export const ADMIN_SESSION_COOKIE = "dsn_admin_session";

function getAdminPin() {
  return typeof env.ADMIN_PIN === "string" ? env.ADMIN_PIN : "";
}

function getSessionSecret() {
  const secret = typeof env.ADMIN_SESSION_SECRET === "string" ? env.ADMIN_SESSION_SECRET : "";
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured.");
  return secret;
}

async function importSessionKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signSessionToken(payload: string) {
  const key = await importSessionKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function verifySessionToken(payload: string, signatureHex: string) {
  if (!/^[a-f0-9]{64}$/.test(signatureHex)) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const bytes = new Uint8Array(signatureHex.match(/.{2}/g)!.map((value) => Number.parseInt(value, 16)));
  return crypto.subtle.verify("HMAC", key, bytes, new TextEncoder().encode(payload));
}

export function verifyPin(pin: string) {
  const configuredPin = getAdminPin();
  return configuredPin.length >= 6 && pin === configuredPin;
}

export async function createAdminSessionCookie() {
  const expiresAt = Date.now() + 43_200_000;
  const payload = `admin-session:${expiresAt}`;
  const token = `${expiresAt}.${await signSessionToken(payload)}`;
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}

export function clearAdminSessionCookie() {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expiresAtText, signature] = match[1].split(".");
  const expiresAt = Number(expiresAtText);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() || !signature) return false;
  return verifySessionToken(`admin-session:${expiresAt}`, signature);
}
