# Nirmio — Data States & Lifecycles

## Supplier onboarding
States:
- `started`
- `fee_pending`
- `fee_paid`
- `verified` (optional manual or automated checks)
- `active`
- `rejected` / `suspended`

Transitions:
- `started → fee_pending` when payment intent created
- `fee_pending → fee_paid` only via payment webhook
- `fee_paid → active` after minimal checks (v1 can auto-activate)

## Project / Quote / Booking
Project:
- `draft` → `published` → `in_progress` → `completed` | `cancelled`

Quote:
- `submitted` → `accepted` | `rejected` | `expired`

Booking:
- `created` → `scheduled` → `in_progress` → `completion_payment_pending` → `completed` | `cancelled`

Notes:
- UI should expose a single "Pay & Complete" action.
- `completed` should be set only after a verified payment webhook.

## Orders (materials)
- `draft` → `checkout_pending` → `paid` → `fulfilled` → `delivered` → `closed`
- Dispute path: `paid/fulfilled/delivered → disputed → resolved → closed`

## Escrow
- `created` → `in_escrow` → `released` | `refunded` | `disputed`

v1 defaults (near-instant release):
- Transition to `released` happens ~2–5 minutes after a verified payment webhook.
- Disputes usually occur after `released` and are resolved through refund/chargeback flows.

Rules of thumb:
- Only webhooks can move money-related records into “paid/confirmed”.
- Release should be policy-driven and auditable.
