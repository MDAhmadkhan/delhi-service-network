import { clearAdminSessionCookie, createAdminSessionCookie, verifyPin } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}) as Record<string, unknown>);
  const pin = typeof payload.pin === "string" ? payload.pin : "";

  if (!verifyPin(pin)) {
    return Response.json({ ok: false, error: "Wrong PIN. Access denied." }, { status: 401 });
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append("Set-Cookie", await createAdminSessionCookie());
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

export async function DELETE() {
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append("Set-Cookie", clearAdminSessionCookie());
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}
