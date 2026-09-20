# Delhi Service Network - Architecture Audit

## Executive summary

Delhi Service Network is a small, production-deployed service lead marketplace built with Vinext, React, Cloudflare Workers, Cloudflare D1, and Drizzle ORM. The current application is usable for service booking and vendor onboarding, but the domain model is service-specific and most catalogue configuration lives in client code. The safest route to a multi-category marketplace is an additive migration: retain the existing lead flow while introducing generic category, listing, workflow, order, identity, and location foundations.

## Current architecture

### Runtime and deployment

- Vinext App Router with React 19 and Tailwind CSS.
- Cloudflare Worker entry point in `worker/index.ts`.
- Cloudflare D1 binding named `DB`.
- Drizzle ORM schema and generated SQL migrations.
- Sites production deployment configured by `.openai/hosting.json`.
- Email notifications use Resend when configured and FormSubmit as fallback.

### Routes and pages

| Route | Responsibility |
| --- | --- |
| `/` | Public service catalogue, booking, customer tracking, vendor lead view, vendor onboarding, support |
| `/admin` | PIN-gated operations dashboard for leads and vendors |
| `/api/leads` | Create/query/update service leads |
| `/api/vendors` | Create/list vendors |
| `/api/admin/session` | Create and clear the admin session cookie |

### Current database

`leads` stores a customer service request, package, address, slot, payment preference, status, assigned vendor, and rating. `vendors` stores one business name, phone number, one service, areas, status, and rating. There are no foreign keys between the tables; matching is performed with service and business-name strings.

### Existing authentication and authorization

- Admin access uses a PIN and an HMAC-signed cookie.
- ChatGPT/Sites identity helpers exist but are not used by current pages or APIs.
- Vendor and customer lookup uses a phone number as the only credential.
- There is no persistent user, role, permission, session, or audit-log model.

### Reusable assets and functionality

- Stable service booking form and lead workflow.
- 60+ service catalogue entries and Delhi/NCR area list.
- Vendor onboarding, service/area matching, tracking, assignment, status, and ratings.
- Admin metrics, search, filtering, CSV export, and communication actions.
- D1/Drizzle deployment pipeline and migration history.
- Responsive visual identity, logo, hero asset, and support content.

## Gaps against the marketplace vision

- Categories and service metadata are duplicated and hard-coded in client files.
- A vendor can represent only one service and has no capability or verification model.
- No product, variant, inventory, business listing, offer, cart, universal order, payment, settlement, wallet, reward, review, or support-ticket model.
- No configurable order workflow or immutable status history.
- No normalized location hierarchy or geospatial fields.
- No customer accounts, vendor accounts, RBAC, or ownership checks.
- Public vendor responses expose contact data, and phone-only lookup can reveal customer lead data.
- Admin credentials have development fallbacks and no attempt throttling.
- API input validation is minimal and UI-only constraints can be bypassed.
- Client page and admin page contain domain data and business logic that should move into shared/server modules.
- Tests cover server rendering only; API authorization and workflow behavior are untested.

## Risks

### Critical before broad public launch

- Customer privacy: vendor-phone lookup and public vendor data require stronger authorization and response shaping.
- Admin security: production must require configured secrets and rate-limited authentication.
- Identity design: public customer/vendor accounts need an approved authentication path before account-owned data is introduced.

### Migration risks

- Existing records reference service and vendor names as strings. Removing them would break live data.
- D1 migrations are append-only after production application; applied files must not be rewritten.
- A large all-at-once schema would create unused tables and unclear ownership boundaries.

## Target architecture

The target is a modular marketplace core with three verticals: `SERVICE`, `PRODUCT`, and `LOCAL`. Categories form an admin-managed tree. Listings represent products, services, and local businesses through a common discoverable surface while vertical-specific tables are introduced only when their workflows need them. A universal order header and item model records all transaction types, while configurable workflows define allowed status transitions.

Business logic should live in small domain modules and API handlers. UI components consume typed APIs and remain responsible for presentation and local interaction state only.

## Migration strategy

1. Add marketplace foundation tables without altering or deleting legacy tables.
2. Add public read/admin write category APIs and admin category management.
3. Introduce optional references from new records to categories/vendors; keep legacy strings during transition.
4. Map existing services into the category engine through an explicit, idempotent admin import in a later phase, not a schema migration.
5. Move service booking to typed service packages/bookings after parity tests pass.
6. Introduce product and local-business flows on the same category/listing/order foundation.
7. Add identity/RBAC before exposing customer or vendor-owned private records.
8. Add payments and ledgers only after order totals and cancellation/refund rules are stable.

## Phase plan

### Phase 1 - marketplace foundation

- Category tree, attributes, locations, users/roles, vendor capabilities, generic listings.
- Configurable workflows and universal order skeleton.
- Admin-managed categories and public category discovery.
- Homepage entry points for Shop, Services, and Local.

### Phase 2 - service migration

- Service packages, availability, normalized bookings, vendor assignments, protected tracking, vendor dashboard.

### Phase 3 onward

- Product variants/inventory/cart/checkout.
- Local businesses, offers, and nearby discovery.
- Payment abstraction, commissions, refunds, settlements, wallet/cashback/rewards.
- Reviews, notifications, support, unified search, caching, and mobile API hardening.

## Phase 1 files

- `PROJECT_AUDIT.md`
- `DATABASE_ARCHITECTURE.md`
- `API_ARCHITECTURE.md`
- `db/schema.ts` and a new generated migration
- `lib/marketplace.ts`
- `app/api/categories/route.ts`
- `app/api/admin/categories/route.ts`
- focused changes to `app/page.tsx`, `app/admin/page.tsx`, and tests

