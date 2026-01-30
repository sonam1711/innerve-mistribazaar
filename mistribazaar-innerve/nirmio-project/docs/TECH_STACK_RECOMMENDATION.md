# Nirmio — Tech Stack Recommendation (Web-first)

## Goal
Ship an MVP quickly while keeping a clean path to scale.

## Suggested stack (practical, common)
- Web: React + Vite (JavaScript)
- Backend: Node.js (Express/Fastify) (JavaScript)
- DB: PostgreSQL + PostGIS
- Cache/queues: Redis
- Search: Postgres FTS for MVP; OpenSearch when needed
- Storage: S3-compatible (images/docs)
- Payments (India): Razorpay/Cashfree/PayU with marketplace capabilities
- Observability: OpenTelemetry + Grafana/Prometheus + centralized logs

## Why Postgres + PostGIS
- One DB handles transactional integrity + geo queries for “near me” matching.

## MVP vs Scale
- MVP: modular monolith + background workers
- Scale: extract payments/messaging/notifications/search into services as needed
