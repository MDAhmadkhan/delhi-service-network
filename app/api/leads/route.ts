import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads } from "../../../db/schema";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table")) {
    return "Database tables are not ready yet. Redeploy after migrations are generated.";
  }
  return message;
}

export async function GET() {
  try {
    const db = getDb();
    const rows = await db.select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id)).limit(50);
    return Response.json({ leads: rows });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = clean(payload.name);
    const phone = clean(payload.phone);
    const service = clean(payload.service);
    const area = clean(payload.area);
    const problem = clean(payload.problem);

    if (!name || !phone || !service || !area) {
      return Response.json({ error: "Name, phone, service, and area are required." }, { status: 400 });
    }

    const db = getDb();
    const [lead] = await db
      .insert(leads)
      .values({
        name,
        phone,
        service,
        area,
        problem,
        createdAt: new Date(),
      })
      .returning();

    return Response.json({ lead }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    const id = Number(payload.id);
    const status = clean(payload.status);
    const assignedVendor = clean(payload.assignedVendor);

    if (!id || (!status && !assignedVendor)) {
      return Response.json({ error: "Lead id and an update are required." }, { status: 400 });
    }

    const db = getDb();
    const [lead] = await db
      .update(leads)
      .set({
        ...(status ? { status } : {}),
        ...(assignedVendor ? { assignedVendor } : {}),
      })
      .where(eq(leads.id, id))
      .returning();

    return Response.json({ lead });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
