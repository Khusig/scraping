"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export type SourceEntry = {
  sourceLabel:   string;
  latestValue:   string;
  previousValue: string | null;
  numericValue:  number | null;
  changed:       boolean;
  recordedAt:    Date;
};

export type TrackingKeyComparison = {
  trackingKey:  string;
  sources:      SourceEntry[];
  anyChanged:   boolean;
  bestSource:   string | null;
};

export async function getTrackingComparisons(workflowId?: string): Promise<TrackingKeyComparison[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const where = { userId, ...(workflowId ? { workflowId } : {}) };

  const keys = await prisma.dataSnapshot.findMany({
    where,
    distinct: ["trackingKey"],
    select:   { trackingKey: true },
  });

  const comparisons: TrackingKeyComparison[] = [];

  for (const { trackingKey } of keys) {
    const sources = await prisma.dataSnapshot.findMany({
      where:    { ...where, trackingKey },
      distinct: ["sourceLabel"],
      select:   { sourceLabel: true },
    });

    const sourceData: SourceEntry[] = [];
    let anyChanged = false;

    for (const { sourceLabel } of sources) {
      const records = await prisma.dataSnapshot.findMany({
        where:   { ...where, trackingKey, sourceLabel },
        orderBy: { recordedAt: "desc" },
        take: 2,
      });

      const latest   = records[0];
      const previous = records[1] ?? null;
      const changed  = previous !== null && previous.value !== latest.value;
      if (changed) anyChanged = true;

      sourceData.push({
        sourceLabel,
        latestValue:   latest.value,
        previousValue: previous?.value ?? null,
        numericValue:  latest.numericValue,
        changed,
        recordedAt:    latest.recordedAt,
      });
    }

    const numericSources = sourceData.filter(s => s.numericValue !== null);
    numericSources.sort((a, b) => (a.numericValue ?? 0) - (b.numericValue ?? 0));
    const bestSource = numericSources[0]?.sourceLabel ?? null;

    comparisons.push({ trackingKey, sources: sourceData, anyChanged, bestSource });
  }

  return comparisons;
}

export async function getWorkflowsWithSnapshots() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const records = await prisma.dataSnapshot.findMany({
    where:    { userId },
    distinct: ["workflowId"],
    select:   { workflowId: true, workflow: { select: { name: true } } },
  });

  return records.map(r => ({ id: r.workflowId, name: r.workflow.name }));
}