import { env } from "cloudflare:workers";

export const ADMIN_SESSION_COOKIE = "dsn_admin_session";

function getAdminPin() {
  return typeof env.ADMIN_PIN === "string" && env.ADMIN_PIN ? env.ADMIN_PIN : "7860";
}

function getSessionSecret() {
  return typeof env.ADMIN_SESSION_SECRET === "string" && env.ADMIN_SESSION_SECRET
    ? env.ADMIN_SESSION_SECRET
    : "delhi-service-network-pilot-secret";
}

async function signSessionToken() {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("admin-session"));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function verifyPin(pin: string) {
  return pin === getAdminPin();
}

export async function createAdminSessionCookie() {
  const token = await signSessionToken();
  return `${ADMIN_SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`;
}

export function clearAdminSessionCookie() {
  return `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  const expected = await signSessionToken();
  return match[1] === expected;
}
