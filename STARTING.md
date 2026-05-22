# Starting the Development Environment on Windows

This guide explains how to set up and run the Stack Auth development environment on a Windows machine.

## Prerequisites

1.  **Node.js**: Version 18+ (v22 recommended).
2.  **pnpm**: Version 9+.
3.  **Docker Desktop**: Required to run database and other dependencies.
4.  **bash/git-bash**: Some scripts still rely on bash syntax, but we have migrated core dev scripts to be cross-platform.

## Initial Setup

1.  **Install Dependencies**:
    ```powershell
    pnpm install
    ```

2.  **Configuration**:
    Ensure `.env.development` files in the root and `/apps/backend` are correctly configured.

## Running the Project

### 1. Start Docker Dependencies
This command initializes the database, Clickhouse, Redis, and other required services.
```powershell
pnpm run restart-deps
```

### 2. Run Codegen
Generate the necessary SDKs and Prisma client files.
```powershell
pnpm run codegen
```

### 3. Start Development Server
Launch the backend and dashboard in development mode.
```powershell
pnpm run dev:basic
```

The services will be available at:
- **Dashboard**: [http://localhost:8101](http://localhost:8101)
- **Backend API**: [http://localhost:8102](http://localhost:8102)
- **Prisma Studio**: [http://localhost:8106](http://localhost:8106)
- **Dev Launchpad**: [http://localhost:8100](http://localhost:8100) (if running `pnpm run dev`)

## Troubleshooting

### Port Already In Use
If you see `EADDRINUSE` errors, you can kill existing Stack Auth processes with this PowerShell command:
```powershell
Get-NetTCPConnection -LocalPort (8100..8114) -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

### Script Errors
We have introduced `cross-env` and Node.js helpers to resolve Windows-specific syntax issues. If you encounter errors in `package.json` scripts, ensure they are prefixed with `cross-env` or use the following Node helpers:
- `node scripts/deps-compose.js`: Portable wrapper for `docker compose`.
- `node scripts/wait-until-ready.js`: Portable port-waiting utility.
