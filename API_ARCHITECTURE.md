# Delhi Service Network - API Architecture

## Conventions

- REST-style JSON APIs under `/api`.
- Public list endpoints return only public fields.
- Admin/vendor/customer writes require server-side authentication and authorization.
- Validation occurs at the route boundary; UI validation is supplementary.
- Pagination uses `page` and `limit`, with bounded limits.
- Errors use `{ "error": "message", "code": "STABLE_CODE" }` where new APIs are introduced.
- Monetary values are integer minor units with an explicit currency.
- Status changes use domain services that validate workflow transitions and append history.

## Phase 1 implemented endpoints

### Categories

- `GET /api/categories?vertical=SERVICES&parentId=...`
  - Public active category tree/list.
  - Supports vertical and parent filters.
- `GET /api/admin/categories`
  - Admin list including inactive categories.
- `POST /api/admin/categories`
  - Admin creates a category or subcategory.
- `PATCH /api/admin/categories`
  - Admin updates category metadata and activation state.

Existing `/api/leads`, `/api/vendors`, and `/api/admin/session` remain compatible during Phase 1.

## Planned endpoint families

### Auth and users

- `GET /api/me`
- `PATCH /api/me`
- `GET|POST /api/admin/users`
- `PATCH /api/admin/users/:id/roles`

### Catalogue

- `/api/categories`
- `/api/products`, `/api/products/:slug`, `/api/product-variants`
- `/api/services`, `/api/services/:slug`, `/api/service-packages`
- `/api/businesses`, `/api/businesses/:slug`
- `/api/listings` for unified discovery

### Vendors

- `/api/vendor/profile`
- `/api/vendor/capabilities`
- `/api/vendor/listings`
- `/api/vendor/orders`
- `/api/vendor/bookings`
- `/api/vendor/documents`
- `/api/admin/vendors`, `/api/admin/vendor-verification`

### Cart and transactions

- `/api/cart`, `/api/cart/items`
- `/api/orders`, `/api/orders/:id`, `/api/orders/:id/status`
- `/api/bookings`, `/api/bookings/:id`
- `/api/payments`, `/api/refunds`

### Promotions and finance

- `/api/coupons/validate`, `/api/offers`
- `/api/wallet`, `/api/wallet/transactions`
- `/api/rewards`, `/api/rewards/transactions`
- `/api/vendor/earnings`, `/api/vendor/settlements`
- `/api/admin/commissions`

### Trust and support

- `/api/reviews`
- `/api/support/tickets`
- `/api/notifications`
- `/api/wishlist`

### Location and search

- `/api/locations`
- `/api/search?q=...&type=...&category=...&location=...`

## Authorization matrix

| Capability | Public | Customer | Vendor | Admin |
| --- | --- | --- | --- | --- |
| Browse active categories/listings | Yes | Yes | Yes | Yes |
| Create orders/bookings | No | Own | No | Yes |
| Read customer details | No | Own | Assigned only | Yes |
| Manage vendor listings | No | No | Own | Yes |
| Configure categories/workflows | No | No | No | Yes |
| Moderate vendors/reviews | No | No | No | Yes |

## Compatibility and deprecation

Legacy lead and vendor endpoints remain until normalized booking/vendor APIs reach feature parity. Deprecation will be announced through response headers and documentation before routes are removed. Existing clients will not be silently redirected to incompatible payloads.

