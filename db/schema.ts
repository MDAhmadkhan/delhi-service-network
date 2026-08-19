import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
