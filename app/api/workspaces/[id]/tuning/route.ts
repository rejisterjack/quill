import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refreshTuningJob, startTuningJob } from "@/lib/tuning";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const jobs = await prisma.tuningJob.findMany({ where: { workspaceId: id }, orderBy: { createdAt: "desc" }, take: 10 });
  const refreshed = await Promise.all(jobs.map((job) => refreshTuningJob(job.id)));
  return NextResponse.json({ jobs: refreshed });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  try {
    const job = await startTuningJob(id, user.id);
    return NextResponse.json({ job }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Tuning failed" }, { status: 400 });
  }
}
