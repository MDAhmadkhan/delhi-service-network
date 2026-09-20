import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { categories } from "../../../../db/schema";
import { isAdminRequest } from "../../../../lib/admin-auth";
import {
  cleanText,
  isCategoryKind,
  isMarketplaceVertical,
  normalizeSlug,
  parseBoolean,
  parseOptionalId,
} from "../../../../lib/marketplace";

async function requireAdmin(request: Request) {
  if (await isAdminRequest(request)) return null;
  return Response.json({ error: "Admin access required.", code: "ADMIN_REQUIRED" }, { status: 401 });
}

function categoryInput(payload: Record<string, unknown>) {
  const name = cleanText(payload.name, 80);
  const slug = normalizeSlug(payload.slug || name);
  const vertical = cleanText(payload.vertical, 20).toUpperCase();
  const kind = cleanText(payload.kind || "CATEGORY", 20).toUpperCase();
  const parentId = parseOptionalId(payload.parentId);
  const description = cleanText(payload.description, 400);
  const icon = cleanText(payload.icon, 40);
  const displayOrder = Number.isInteger(Number(payload.displayOrder)) ? Number(payload.displayOrder) : 0;

  if (!name || !slug) return { error: "Name and valid slug are required." } as const;
  if (!isMarketplaceVertical(vertical)) return { error: "Vertical must be SHOP, SERVICES, or LOCAL." } as const;
  if (!isCategoryKind(kind)) return { error: "Kind must be CATEGORY or SUBCATEGORY." } as const;

  return {
    value: {
      name,
      slug,
      vertical,
      kind,
      parentId,
      description,
      icon,
      displayOrder,
      isActive: parseBoolean(payload.isActive, true),
      isFeatured: parseBoolean(payload.isFeatured, false),
    },
  } as const;
}

async function validateParent(parentId: number | null, vertical: string, ownId?: number) {
  if (!parentId) return null;
  if (ownId === parentId) return "A category cannot be its own parent.";
  const [parent] = await getDb().select().from(categories).where(eq(categories.id, parentId)).limit(1);
  if (!parent) return "Parent category was not found.";
  if (parent.vertical !== vertical) return "Parent and child must use the same vertical.";
  return null;
}

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const rows = await getDb().select().from(categories).orderBy(asc(categories.vertical), asc(categories.displayOrder), asc(categories.name));
  return Response.json({ categories: rows });
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const parsed = categoryInput(await request.json());
    if ("error" in parsed) return Response.json({ error: parsed.error, code: "INVALID_CATEGORY" }, { status: 400 });
    const parentError = await validateParent(parsed.value.parentId, parsed.value.vertical);
    if (parentError) return Response.json({ error: parentError, code: "INVALID_PARENT" }, { status: 400 });

    const now = new Date();
    const [category] = await getDb().insert(categories).values({ ...parsed.value, createdAt: now, updatedAt: now }).returning();
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE") ? "Category slug already exists." : "Category could not be created.";
    return Response.json({ error: message, code: "CATEGORY_CREATE_FAILED" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const payload = await request.json() as Record<string, unknown>;
    const id = parseOptionalId(payload.id);
    if (!id) return Response.json({ error: "Category id is required.", code: "INVALID_CATEGORY_ID" }, { status: 400 });
    const parsed = categoryInput(payload);
    if ("error" in parsed) return Response.json({ error: parsed.error, code: "INVALID_CATEGORY" }, { status: 400 });
    const parentError = await validateParent(parsed.value.parentId, parsed.value.vertical, id);
    if (parentError) return Response.json({ error: parentError, code: "INVALID_PARENT" }, { status: 400 });

    const [category] = await getDb().update(categories).set({ ...parsed.value, updatedAt: new Date() }).where(eq(categories.id, id)).returning();
    if (!category) return Response.json({ error: "Category not found.", code: "CATEGORY_NOT_FOUND" }, { status: 404 });
    return Response.json({ category });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("UNIQUE") ? "Category slug already exists." : "Category could not be updated.";
    return Response.json({ error: message, code: "CATEGORY_UPDATE_FAILED" }, { status: 400 });
  }
}

