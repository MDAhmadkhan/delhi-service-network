import { and, asc, eq, isNull } from "drizzle-orm";
import { getDb } from "../../../db";
import { categories } from "../../../db/schema";
import { cleanText, isMarketplaceVertical, parseOptionalId } from "../../../lib/marketplace";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const vertical = cleanText(url.searchParams.get("vertical"), 20).toUpperCase();
    const parentParam = url.searchParams.get("parentId");
    const parentId = parseOptionalId(parentParam);

    if (vertical && !isMarketplaceVertical(vertical)) {
      return Response.json({ error: "Invalid marketplace vertical.", code: "INVALID_VERTICAL" }, { status: 400 });
    }
    if (parentParam && parentParam !== "root" && parentId === null) {
      return Response.json({ error: "Invalid parent category.", code: "INVALID_PARENT" }, { status: 400 });
    }

    const conditions = [eq(categories.isActive, true)];
    if (vertical) conditions.push(eq(categories.vertical, vertical));
    if (parentParam === "root") conditions.push(isNull(categories.parentId));
    else if (parentId) conditions.push(eq(categories.parentId, parentId));

    const rows = await getDb()
      .select({
        id: categories.id,
        parentId: categories.parentId,
        vertical: categories.vertical,
        kind: categories.kind,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        icon: categories.icon,
        displayOrder: categories.displayOrder,
        isFeatured: categories.isFeatured,
      })
      .from(categories)
      .where(and(...conditions))
      .orderBy(asc(categories.displayOrder), asc(categories.name));

    return Response.json({ categories: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load categories.";
    return Response.json({ error: message, code: "CATEGORY_READ_FAILED" }, { status: 500 });
  }
}
