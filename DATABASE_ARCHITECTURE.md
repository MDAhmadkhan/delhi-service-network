# Delhi Service Network - Database Architecture

## Design principles

- Keep existing `leads` and `vendors` data operational.
- Use generic categories and listings instead of category-specific tables.
- Store money as integer minor units (`*_amount`) with an ISO currency code.
- Record workflow changes in append-only history.
- Add indexes only for real lookup and sorting paths.
- Keep migration files schema-only; seed/import operations are separate and idempotent.

## Existing tables

### `leads`

Legacy service request and booking-tracking record. It remains the source of truth for the current public booking flow during Phase 1.

### `vendors`

Legacy vendor profile with one service and a comma-separated service area. It remains compatible while vendor capabilities are normalized.

## Phase 1 tables

### Identity and authorization

#### `users`

`id`, `external_user_id`, `email`, `phone`, `display_name`, `status`, timestamps. `external_user_id` is the stable authenticated identity when available. Email and phone are unique when present.

#### `roles` and `user_roles`

Admin-managed role catalogue and many-to-many user assignment. Initial role keys are expected to include `CUSTOMER`, `VENDOR`, and `ADMIN`, but data is not embedded in migrations.

### Category engine

#### `categories`

Adjacency-list tree with `parent_id`, `vertical`, `kind`, `name`, `slug`, description, icon, display order, active/featured flags, and timestamps. `slug` is unique. `vertical` supports `SHOP`, `SERVICES`, and `LOCAL`; `kind` supports `CATEGORY` and `SUBCATEGORY` without preventing future values.

Indexes:

- unique slug
- `(vertical, is_active, display_order)` for public navigation
- `(parent_id, is_active, display_order)` for child lookup

#### `category_attributes`

Reusable category filters and data-entry definitions: key, label, input type, required/filterable flags, display order.

#### `category_attribute_options`

Allowed values for select-like attributes, unique within an attribute.

### Locations

#### `locations`

Hierarchical country/state/city/area/pincode structure with optional latitude, longitude, and service radius. Slug is unique within a parent.

### Vendors and listings

#### `vendor_capabilities`

Normalizes a vendor's supported business types (`SERVICE_PROVIDER`, `PRODUCT_SELLER`, `LOCAL_BUSINESS`, and future types), category, verification status, and active state. Private verification documents are intentionally deferred to an R2-backed phase.

#### `marketplace_listings`

Common discoverable entity for `PRODUCT`, `SERVICE`, `BUSINESS`, and `OFFER`. It references a vendor and category, stores title/slug/summary, pricing hints, currency, status, rating aggregates, and timestamps. Vertical-specific detail tables will reference this ID in later phases.

Indexes support category browsing, vendor dashboards, status/type filtering, and slug lookup.

### Workflow and order engine

#### `workflows`

Named workflow per order type with an active flag.

#### `workflow_steps`

Ordered status definitions with terminal/cancellable/refundable metadata. Unique `(workflow_id, status_key)` prevents duplicate states.

#### `workflow_transitions`

Allowed transitions between workflow steps. This keeps controllers from hard-coding every vertical's lifecycle.

#### `orders`

Universal transaction header with `order_type`, customer/vendor references, workflow/current status, currency totals, address snapshot, notes, and timestamps. Phase 1 establishes the schema; checkout writes arrive in later phases.

#### `order_items`

Line items that can reference a listing while preserving a title and price snapshot.

#### `order_status_history`

Append-only status audit containing from/to status, actor, note, and timestamp.

## Deferred tables

Products/variants/inventory, service packages/availability, business offers, cart, payments/refunds, commissions/settlements, wallets/rewards, reviews, support, notifications, and audit logs are intentionally deferred until their owning workflow is implemented. Their endpoint contracts are reserved in `API_ARCHITECTURE.md`.

## Legacy compatibility

- `leads.service` and `vendors.service` remain strings in Phase 1.
- New category IDs are not forced onto existing rows.
- Later migrations may add nullable `category_id`, `vendor_id`, or `order_id` references. Nullable references allow safe backfill before constraints are tightened.

## Constraints and data handling

- Timestamps use integer milliseconds for consistency with existing tables.
- Booleans use integer mode.
- Monetary values use integers and never floating point.
- Raw card details must never be stored.
- Private documents belong in R2 with ownership metadata in D1.
- Every balance-changing financial operation must create an immutable ledger row in its future module.

