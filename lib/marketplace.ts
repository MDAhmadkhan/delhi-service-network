export const MARKETPLACE_VERTICALS = ["SHOP", "SERVICES", "LOCAL"] as const;
export const CATEGORY_KINDS = ["CATEGORY", "SUBCATEGORY"] as const;
export const LISTING_TYPES = ["PRODUCT", "SERVICE", "BUSINESS", "OFFER"] as const;
export const ORDER_TYPES = [
  "PRODUCT_ORDER",
  "SERVICE_BOOKING",
  "LOCAL_ORDER",
  "APPOINTMENT",
  "QUOTE_REQUEST",
  "LEAD_REQUEST",
] as const;

export type MarketplaceVertical = (typeof MARKETPLACE_VERTICALS)[number];
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

export function cleanText(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function normalizeSlug(value: unknown) {
  return cleanText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isMarketplaceVertical(value: string): value is MarketplaceVertical {
  return MARKETPLACE_VERTICALS.includes(value as MarketplaceVertical);
}

export function isCategoryKind(value: string): value is CategoryKind {
  return CATEGORY_KINDS.includes(value as CategoryKind);
}

export function parseBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function parseOptionalId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

