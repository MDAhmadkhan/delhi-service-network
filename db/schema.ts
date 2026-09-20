import { AnySQLiteColumn, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  packageName: text("package_name").notNull().default("Basic Visit"),
  area: text("area").notNull(),
  address: text("address").notNull().default(""),
  timeSlot: text("time_slot").notNull().default("Anytime today"),
  paymentMode: text("payment_mode").notNull().default("Cash after service"),
  problem: text("problem").notNull().default(""),
  status: text("status").notNull().default("New"),
  assignedVendor: text("assigned_vendor").notNull().default("Auto match ready"),
  customerRating: integer("customer_rating").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const vendors = sqliteTable("vendors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  businessName: text("business_name").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  areas: text("areas").notNull(),
  status: text("status").notNull().default("New"),
  rating: integer("rating").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  externalUserId: text("external_user_id").unique(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  displayName: text("display_name").notNull().default(""),
  status: text("status").notNull().default("ACTIVE"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const userRoles = sqliteTable("user_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("uq_user_roles_user_role").on(table.userId, table.roleId),
  index("idx_user_roles_role_id").on(table.roleId),
]);

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parent_id").references((): AnySQLiteColumn => categories.id, { onDelete: "restrict" }),
  vertical: text("vertical").notNull(),
  kind: text("kind").notNull().default("CATEGORY"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("idx_categories_vertical_active_order").on(table.vertical, table.isActive, table.displayOrder),
  index("idx_categories_parent_active_order").on(table.parentId, table.isActive, table.displayOrder),
]);

export const categoryAttributes = sqliteTable("category_attributes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  label: text("label").notNull(),
  inputType: text("input_type").notNull().default("TEXT"),
  isRequired: integer("is_required", { mode: "boolean" }).notNull().default(false),
  isFilterable: integer("is_filterable", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("uq_category_attributes_category_key").on(table.categoryId, table.key),
  index("idx_category_attributes_category_order").on(table.categoryId, table.displayOrder),
]);

export const categoryAttributeOptions = sqliteTable("category_attribute_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attributeId: integer("attribute_id").notNull().references(() => categoryAttributes.id, { onDelete: "cascade" }),
  value: text("value").notNull(),
  label: text("label").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  uniqueIndex("uq_category_attribute_options_value").on(table.attributeId, table.value),
]);

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  parentId: integer("parent_id").references((): AnySQLiteColumn => locations.id, { onDelete: "restrict" }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  pincode: text("pincode"),
  latitudeE6: integer("latitude_e6"),
  longitudeE6: integer("longitude_e6"),
  serviceRadiusMeters: integer("service_radius_meters"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("uq_locations_parent_slug").on(table.parentId, table.slug),
  index("idx_locations_type_active").on(table.type, table.isActive),
  index("idx_locations_pincode").on(table.pincode),
]);

export const vendorCapabilities = sqliteTable("vendor_capabilities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendorId: integer("vendor_id").notNull().references(() => vendors.id, { onDelete: "cascade" }),
  capabilityType: text("capability_type").notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  verificationStatus: text("verification_status").notNull().default("PENDING"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("uq_vendor_capabilities_vendor_type_category").on(table.vendorId, table.capabilityType, table.categoryId),
  index("idx_vendor_capabilities_category_active").on(table.categoryId, table.isActive),
]);

export const marketplaceListings = sqliteTable("marketplace_listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  listingType: text("listing_type").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull().default(""),
  priceAmount: integer("price_amount"),
  compareAtAmount: integer("compare_at_amount"),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("DRAFT"),
  ratingTotal: integer("rating_total").notNull().default(0),
  ratingCount: integer("rating_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("idx_marketplace_listings_category_status").on(table.categoryId, table.status),
  index("idx_marketplace_listings_vendor_type").on(table.vendorId, table.listingType),
  index("idx_marketplace_listings_type_status").on(table.listingType, table.status),
]);

export const workflows = sqliteTable("workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderType: text("order_type").notNull(),
  name: text("name").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  uniqueIndex("uq_workflows_order_type_name").on(table.orderType, table.name),
  index("idx_workflows_order_type_active").on(table.orderType, table.isActive),
]);

export const workflowSteps = sqliteTable("workflow_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  statusKey: text("status_key").notNull(),
  label: text("label").notNull(),
  displayOrder: integer("display_order").notNull(),
  isInitial: integer("is_initial", { mode: "boolean" }).notNull().default(false),
  isTerminal: integer("is_terminal", { mode: "boolean" }).notNull().default(false),
  isCancellable: integer("is_cancellable", { mode: "boolean" }).notNull().default(false),
  isRefundable: integer("is_refundable", { mode: "boolean" }).notNull().default(false),
}, (table) => [
  uniqueIndex("uq_workflow_steps_workflow_status").on(table.workflowId, table.statusKey),
  index("idx_workflow_steps_workflow_order").on(table.workflowId, table.displayOrder),
]);

export const workflowTransitions = sqliteTable("workflow_transitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: "cascade" }),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  actorRole: text("actor_role").notNull().default("SYSTEM"),
}, (table) => [
  uniqueIndex("uq_workflow_transitions_path_role").on(table.workflowId, table.fromStatus, table.toStatus, table.actorRole),
]);

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  publicId: text("public_id").notNull().unique(),
  orderType: text("order_type").notNull(),
  customerId: integer("customer_id").references(() => users.id, { onDelete: "set null" }),
  vendorId: integer("vendor_id").references(() => vendors.id, { onDelete: "set null" }),
  workflowId: integer("workflow_id").references(() => workflows.id, { onDelete: "set null" }),
  currentStatus: text("current_status").notNull(),
  currency: text("currency").notNull().default("INR"),
  subtotalAmount: integer("subtotal_amount").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0),
  taxAmount: integer("tax_amount").notNull().default(0),
  deliveryAmount: integer("delivery_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  addressSnapshot: text("address_snapshot").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("idx_orders_customer_created").on(table.customerId, table.createdAt),
  index("idx_orders_vendor_status").on(table.vendorId, table.currentStatus),
  index("idx_orders_type_status_created").on(table.orderType, table.currentStatus, table.createdAt),
]);

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  listingId: integer("listing_id").references(() => marketplaceListings.id, { onDelete: "set null" }),
  itemType: text("item_type").notNull(),
  titleSnapshot: text("title_snapshot").notNull(),
  skuSnapshot: text("sku_snapshot").notNull().default(""),
  quantity: integer("quantity").notNull().default(1),
  unitAmount: integer("unit_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
  metadataJson: text("metadata_json").notNull().default("{}"),
}, (table) => [
  index("idx_order_items_order_id").on(table.orderId),
  index("idx_order_items_listing_id").on(table.listingId),
]);

export const orderStatusHistory = sqliteTable("order_status_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  actorUserId: integer("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  actorRole: text("actor_role").notNull().default("SYSTEM"),
  note: text("note").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("idx_order_status_history_order_created").on(table.orderId, table.createdAt),
]);
