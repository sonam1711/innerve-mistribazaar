# Nirmio — API Surface Overview (v1)

This is a product-driven API outline for the backend. It is intentionally high-level and language/framework-agnostic.

## Conventions
- All write endpoints support `Idempotency-Key`.
- Auth via session cookie or bearer token.
- All money endpoints are webhook-driven; client never finalizes payment states.

## Auth
- `POST /auth/otp/start` (phone)
- `POST /auth/otp/verify`
- `POST /auth/logout`
- `GET /me`

## Profiles
- `GET /profiles/:id`
- `PATCH /profiles/me`
- `POST /providers/services`
- `PATCH /providers/services/:id`

## Supplier onboarding (₹1600)
- `POST /suppliers/onboarding/start`
- `POST /billing/supplier-fee/payment-intent`
- `GET /suppliers/onboarding/status`

## Catalog
- Services
  - `GET /services/search`
  - `GET /services/:id`
- Products
  - `GET /products/search`
  - `GET /products/:id`
  - `POST /suppliers/products`
  - `PATCH /suppliers/products/:id`

## Projects & Quotes
- `POST /projects`
- `GET /projects/:id`
- `POST /projects/:id/quotes`
- `GET /projects/:id/quotes`
- `POST /quotes/:id/accept`

## Booking
- `POST /bookings` (from accepted quote)
- `PATCH /bookings/:id/reschedule`
- `POST /bookings/:id/complete/payment-intent` (starts "Pay & Complete" by creating a payment intent)

Notes:
- The booking is marked `completed` only after a verified payment webhook confirms success.

## Orders (materials)
- `POST /orders` (create draft)
- `POST /orders/:id/checkout` (creates payment intent)
- `GET /orders/:id`
- `POST /orders/:id/confirm-delivery`

## Payments (internal + webhooks)
- `POST /payments/intents`
- `GET /payments/:id`
- `POST /webhooks/payments/provider-x` (signature-verified)

## Messaging
- `POST /conversations`
- `GET /conversations`
- `POST /conversations/:id/messages`

## Reviews
- `POST /reviews`
- `GET /profiles/:id/reviews`

## Admin
- `GET /admin/reports`
- `POST /admin/listings/:id/approve`
- `POST /admin/disputes/:id/resolve`
