# Stack Auth Commands Guide

This guide contains the essential commands for building and running Stack Auth in different environments on Windows.

---

## 1. Prerequisites (Run Once)
Always start with these commands after cloning or pulling new changes.

```powershell
# Install dependencies
pnpm install

# Build shared packages
pnpm run build:packages

# Generate Prisma client and SDKs
pnpm run codegen
```

---

## 2. Local Development Environment
The standard way to work on the codebase with hot-reloading.

### Start Dependencies (Docker)
Starts PostgreSQL, ClickHouse, S3Mock, and Inbucket.
```powershell
pnpm run restart-deps
```

### Run Dev Server
```powershell
# Full dev (All apps and docs)
pnpm run dev

# Basic dev (Only Backend and Dashboard - faster)
pnpm run dev:basic
```

---

## 3. Local Production Environment
For testing "production" behavior on your local machine. Ensure your `.env.production` files are configured.

### Build Applications
```powershell
# Build Backend
pnpm run build:backend

# Build Dashboard
pnpm run build:dashboard
```

### Initialize Database (Seed)
Run this to create the `admin@example.com` user in your production database.
```powershell
pnpm --filter @stackframe/backend run with-env:prod tsx scripts/db-migrations.ts seed
```

### Start Services
Run these in separate terminals:

```powershell
# Start Backend (Port 8102)
pnpm --filter @stackframe/backend exec next start --port 8102

# Start Dashboard (Port 8101)
pnpm --filter @stackframe/dashboard exec next start --port 8101
```

---

## 4. Database Management

| Action | Command |
| :--- | :--- |
| **Reset DB** | `pnpm run db:reset` |
| **Run Migrations** | `pnpm run db:migrate` |
| **Seed Dev DB** | `pnpm run db:seed` |
| **Open DB Shell** | `pnpm run psql` |

---

## 5. Troubleshooting Windows Issues

### Killing Stuck Ports
If port 8101 or 8102 is already in use:
```powershell
Get-NetTCPConnection -LocalPort (8101, 8102) -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Variable Expansion Error
If you see an error like `invalid port ${...}`, always use the `exec next start --port XXXX` method shown in the Production section above.
