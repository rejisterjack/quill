-- Per-workspace Neon/target Postgres URI (AES-GCM encrypted at rest via lib/crypto).
-- Live app traffic still uses DATABASE_URL; use targetDatabaseUrl for migrate-to-cloud
-- (TARGET_DATABASE_URL) and future per-tenant routing via resolveWorkspaceDatabaseUrl().
ALTER TABLE "workspaces" ADD COLUMN "targetDatabaseUrl" TEXT;
