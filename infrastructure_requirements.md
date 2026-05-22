# Stack Auth Infrastructure Requirements

When deploying or working with Stack Auth, the local `docker-compose.yaml` includes a wide array of services. This document clarifies which services are actually strictly necessary for a production deployment, which are conditionally required based on feature usage, and which are completely restricted to local development environments.

## 🔴 Strictly Required (Production & Dev)

These are the core pieces needed to make Stack Auth function:

1. **PostgreSQL** (`db`)
   - The central database where all projects, users, tenancies, and sessions are stored. 
   - *Production Setup*: You must host Postgres (e.g., AWS RDS, Neon, Supabase Postgres).
2. **Node.js Environment**
   - A Node.js runtime is strictly required to host the API Backend, the Admin Dashboard, and the SDK generation logic.

## 🟡 Required Only for Specific Features

If you do not intend to use the features associated with these services, you do not need to deploy them to production.

1. **ClickHouse** (`clickhouse`)
   - An OLAP database used for high-volume analytics workloads.
   - *Requirement*: **Only** required if you plan to self-host the advanced dashboard analytics and session replay telemetry features.
2. **Svix** (`svix-server`, `svix-db`, `svix-redis`)
   - A webhook delivery and scheduling service.
   - *Requirement*: **Only** required if you want Stack Auth to fire webhooks to external services (e.g., when users sign up, log in, or get updated).

## 🟢 Local Development Only (NOT needed in Prod)

Almost everything else in the `docker-compose.yaml` is specifically designed to emulate production environments or make local development easier. You will **never** host these yourself in production—you will either remove them or use their real SaaS equivalents.

### Service Emulators
1. **Inbucket** (`inbucket`)
   - A fake SMTP server that intercepts all emails so you can test email logins locally without actually spamming real inboxes. 
   - *Production*: Plug in a real email provider like Resend, Mailgun, or AWS SES.
2. **LocalStack & S3 Mock** (`localstack`, `s3mock`)
   - These pretend to be AWS S3 locally so you can test uploading User Profile Pictures or Workspace Logos. 
   - *Production*: Use a real S3-compatible cloud storage bucket.
3. **Mocks for External APIs** (`stripe-mock`, `qstash`)
   - These mock the APIs for Stripe (billing) and Upstash (rate-limiting) locally. 
   - *Production*: Connect directly to the production Stripe and Upstash SaaS APIs.

### Developer Tooling & UIs
These are graphical interfaces built purely to give developers visibility into the local state. In production, you would connect to your production instances using standard secure desktop clients or cloud-hosted monitoring.

1. **Database UIs** (`supabase-studio`, `supabase-meta`, `pgadmin`, `pghero`, `pghero-replica`)
   - Various visualizers for the Postgres database. The inclusion of Supabase Studio is merely as an open-source database UI option; Stack Auth does **not** rely on Supabase Auth or Realtime natively.
2. **Observability UI** (`jaeger`)
   - Provides an OpenTelemetry trace UI to see exactly where slow API loops are happening locally.
3. **WAL Visualizers** (`wal-info`)
   - Checks the size of Write-Ahead Logs (WAL) during local testing for replication delays.

## 📡 External Analytics & Telemetry Hooks (Hosted APIs)

Stack Auth previously relied on multiple external SaaS services for monitoring and product analytics. We have since moved to prioritize privacy and reduced dependency on external product tracking.

### 1. PostHog (REMOVED)
- **Status:** COMPLETED. All PostHog telemetry hooks have been systematically removed from the Dashboard, Backend, CLI, and Documentation.
- **Privacy:** No product usage data is sent to PostHog servers.

### 2. Vercel Web Analytics & Speed Insights (REMOVED)
- **Status:** COMPLETED. Vercel Analytics and Speed Insights have been removed from the root layout and dependencies.
- **Privacy:** Page load data and web vitals are no longer sent to Vercel.

### 3. Sentry (REMOVED)
- **Status:** COMPLETED. All Sentry error tracking and instrumentation has been removed from the monorepo.
- **Privacy:** Crash reports and traces are no longer sent to Sentry.

## 🛠️ Running Locally (Development)

To verify changes or contribute to Stack Auth, you can run a "basic" development environment.

### 1. Prerequisites
- **Docker**: Required for databases and service emulators.
- **Node.js**: Version 20 or higher.
- **pnpm**: Version 10 or higher.

### 2. Basic Startup Steps
1. **Initialize Dependencies**:
   ```powershell
   # Start Docker services (Postgres, ClickHouse, etc.)
   pnpm restart-deps
   ```
2. **Initialize Database**:
   ```powershell
   # Create schema and seed dummy data
   pnpm run db:init
   ```
3. **Start Core Services**:
   ```powershell
   # Starts Backend (8102) and Dashboard (8101)
   pnpm dev:basic
   ```

> [!TIP]
> On Windows, if you encounter `ELIFECYCLE` errors during startup, ensure Docker Desktop is running and your PowerShell session has the necessary environment variables (defined in `.env.development`).

### 3. Verification
- **Dashboard**: [http://localhost:8101](http://localhost:8101)
- **Backend API**: [http://localhost:8102/api/latest/check-version](http://localhost:8102/api/latest/check-version) (POST)
- **Postgres UI**: [http://localhost:8106](http://localhost:8106) (Prisma Studio)

