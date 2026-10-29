ALTER TABLE "workspaces" ADD COLUMN "seatLimit" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "workspaces" ADD COLUMN "hostingProvider" TEXT;
ALTER TABLE "workspaces" ADD COLUMN "neonProjectId" TEXT;

CREATE TABLE "tuning_jobs" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerJobId" TEXT,
    "model" TEXT,
    "trainingFileId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tuning_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scim_groups" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "externalId" TEXT,
    "members" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_groups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scim_groups_workspaceId_displayName_key" ON "scim_groups"("workspaceId", "displayName");

ALTER TABLE "tuning_jobs" ADD CONSTRAINT "tuning_jobs_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "scim_groups" ADD CONSTRAINT "scim_groups_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
