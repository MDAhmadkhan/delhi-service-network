import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { leads, vendors } from "../../../db/schema";
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
    const url = new URL(request.url);
    const phone = clean(url.searchParams.get("phone"));
    const vendorPhone = clean(url.searchParams.get("vendorPhone"));

    if (await isAdminRequest(request)) {
      const rows = await db.select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id)).limit(50);
      return Response.json({ leads: rows });
    }

    if (phone) {
      if (!/^\d{10}$/.test(phone)) {
        return Response.json({ error: "Enter a valid 10 digit mobile number." }, { status: 400 });
      }
      const rows = await db.select({
        id: leads.id,
        service: leads.service,
        packageName: leads.packageName,
        area: leads.area,
        timeSlot: leads.timeSlot,
        paymentMode: leads.paymentMode,
        status: leads.status,
        assignedVendor: leads.assignedVendor,
        customerRating: leads.customerRating,
        createdAt: leads.createdAt,
      }).from(leads).where(eq(leads.phone, phone)).orderBy(desc(leads.createdAt), desc(leads.id)).limit(20);
      return Response.json({ leads: rows });
    }

    if (vendorPhone) {
      if (!/^\d{10}$/.test(vendorPhone)) {
        return Response.json({ error: "Enter a valid 10 digit mobile number." }, { status: 400 });
      }
      const [vendor] = await db.select().from(vendors).where(eq(vendors.phone, vendorPhone)).limit(1);
      if (!vendor) return Response.json({ leads: [], vendor: null });
      const rows = await db.select().from(leads).where(eq(leads.service, vendor.service)).orderBy(desc(leads.createdAt), desc(leads.id)).limit(50);
      const matched = rows
        .filter((lead) => lead.assignedVendor === vendor.businessName || lead.assignedVendor === "Auto match ready")
        .map((lead) => lead.assignedVendor === vendor.businessName ? lead : {
          id: lead.id,
          service: lead.service,
          packageName: lead.packageName,
          area: lead.area,
          timeSlot: lead.timeSlot,
          paymentMode: lead.paymentMode,
          problem: "Customer details become available after accepting the lead.",
          status: lead.status,
          assignedVendor: lead.assignedVendor,
          customerRating: 0,
          createdAt: lead.createdAt,
        });
      return Response.json({
        leads: matched,
        vendor: { id: vendor.id, businessName: vendor.businessName, service: vendor.service, areas: vendor.areas, status: vendor.status, rating: vendor.rating },
      });
    }

    return Response.json({ leads: [] });
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
    const packageName = clean(payload.packageName) || "Basic Visit";
    const area = clean(payload.area);
    const address = clean(payload.address);
    const timeSlot = clean(payload.timeSlot) || "Anytime today";
    const paymentMode = clean(payload.paymentMode) || "Cash after service";
    const problem = clean(payload.problem);

    if (!name || !phone || !service || !area || !address) {
      return Response.json({ error: "Name, phone, service, area, and address are required." }, { status: 400 });
    }
    if (!/^\d{10}$/.test(phone)) {
      return Response.json({ error: "Enter a valid 10 digit mobile number." }, { status: 400 });
    }

    const db = getDb();
    const [lead] = await db
      .insert(leads)
      .values({
        name,
        phone,
        service,
        packageName,
        area,
        address,
        timeSlot,
        paymentMode,
        problem,
        createdAt: new Date(),
      })
      .returning();

    const email = await sendNotificationEmail({
      subject: `New customer query: ${service} in ${area}`,
      lines: [
        "New customer query received on Delhi Service Network.",
        "",
        `Name: ${name}`,
        `Phone: ${phone}`,
        `Service: ${service}`,
        `Package: ${packageName}`,
        `Area: ${area}`,
        `Address: ${address}`,
        `Time slot: ${timeSlot}`,
        `Payment mode: ${paymentMode}`,
        `Problem: ${problem || "Not provided"}`,
      ],
    });

    return Response.json({ lead, email }, { status: 201 });
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
    const customerRating = Number(payload.customerRating) || 0;
    const vendorPhone = clean(payload.vendorPhone);

    if (!id || (!status && !assignedVendor && !customerRating)) {
      return Response.json({ error: "Lead id and an update are required." }, { status: 400 });
    }

    const db = getDb();
    const isAdmin = await isAdminRequest(request);

    if (!isAdmin) {
      const vendorAllowedStatuses = ["Accepted", "On the way", "Cancelled"];
      if (!vendorPhone) {
        return Response.json({ error: "Admin login or vendor phone is required." }, { status: 401 });
      }
      if (customerRating || (status && !vendorAllowedStatuses.includes(status))) {
        return Response.json({ error: "This update is only allowed from the admin panel." }, { status: 403 });
      }

      const [vendor] = await db.select().from(vendors).where(eq(vendors.phone, vendorPhone)).limit(1);
      if (!vendor) return Response.json({ error: "Vendor not found." }, { status: 404 });

      const [existingLead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
      if (!existingLead) return Response.json({ error: "Lead not found." }, { status: 404 });

      const ownsLead =
        existingLead.assignedVendor === vendor.businessName ||
        (existingLead.assignedVendor === "Auto match ready" && existingLead.service === vendor.service);
      if (!ownsLead) {
        return Response.json({ error: "This lead is not assigned to you." }, { status: 403 });
      }
      if (assignedVendor && assignedVendor !== vendor.businessName) {
        return Response.json({ error: "Vendors can only assign leads to themselves." }, { status: 403 });
      }
    }

    const [lead] = await db
      .update(leads)
      .set({
        ...(status ? { status } : {}),
        ...(assignedVendor ? { assignedVendor } : {}),
        ...(customerRating ? { customerRating } : {}),
      })
      .where(eq(leads.id, id))
      .returning();

    return Response.json({ lead });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
