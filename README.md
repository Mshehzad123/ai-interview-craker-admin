# ParakeetAI — Admin console

Read-only operational dashboard (customers, sessions, purchases) against the **same** `DATABASE_URL` as the main app.

## Security

- Set **`ADMIN_PASSWORD`** and a long **`ADMIN_JWT_SECRET`** (32+ chars).
- Run on a **private network** or behind VPN / IP allowlist; do not expose port 3002 to the public internet without a reverse proxy and TLS.
- This is **not** multi-tenant RBAC — single shared admin password.

## Setup

```bash
npm install
cp env.example .env.local
# DATABASE_URL = same as ../parakeetai
# ADMIN_PASSWORD + ADMIN_JWT_SECRET
npx prisma generate
npm run dev
```

Opens on **http://localhost:3002** — sign in at `/login`.

## Schema sync

`prisma/schema.prisma` is a copy of the main app. When you change models in `parakeetai`, update this copy and run `npx prisma generate` again.
