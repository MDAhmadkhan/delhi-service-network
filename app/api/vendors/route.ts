import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { vendors } from "../../../db/schema";
import { isAdminRequest } from "../../../lib/admin-auth";
import { sendNotificationEmail } from "../notify";

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

export async function GET(request: Request) {
  try {
    const db = getDb();
    const rows = await (await isAdminRequest(request)
      ? db.select().from(vendors)
      : db.select({
          id: vendors.id,
          businessName: vendors.businessName,
          service: vendors.service,
          areas: vendors.areas,
          status: vendors.status,
          rating: vendors.rating,
        }).from(vendors))
      .orderBy(desc(vendors.createdAt), desc(vendors.id))
      .limit(50);
    return Response.json({ vendors: rows });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const businessName = clean(payload.businessName);
    const phone = clean(payload.phone);
    const service = clean(payload.service);
    const areas = clean(payload.areas);

    if (!businessName || !phone || !service || !areas) {
      return Response.json({ error: "Business name, phone, service, and areas are required." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone)) {
      return Response.json({ error: "Enter a valid 10 digit mobile number." }, { status: 400 });
    }

    const db = getDb();
    const [vendor] = await db
      .insert(vendors)
      .values({
        businessName,
        phone,
        service,
        areas,
        createdAt: new Date(),
      })
      .returning();

    const email = await sendNotificationEmail({
      subject: `New vendor signup: ${businessName}`,
      lines: [
        "New vendor signup received on Delhi Service Network.",
        "",
        `Business name: ${businessName}`,
        `Phone: ${phone}`,
        `Service: ${service}`,
        `Areas served: ${areas}`,
      ],
    });

    return Response.json({ vendor, email }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
