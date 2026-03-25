import { ExecutionEnviornment } from "@/lib/types";
import { DetectChangesTask } from "../task/DetectChanges";
import prisma from "@/lib/prisma";

export async function DetectChangesExecutor(
  environment: ExecutionEnviornment<typeof DetectChangesTask>
): Promise<boolean> {
  try {
    const trackingKey = environment.getInput("Tracking key");
    const workflowId  = environment.getInput("Workflow ID");
    const userId      = environment.getInput("User ID");

    if (!trackingKey || !workflowId || !userId) {
      environment.log.error("Missing required inputs.");
      return false;
    }

    // Get all distinct sources for this tracking key
    const sources = await prisma.dataSnapshot.findMany({
      where:    { workflowId, trackingKey },
      distinct: ["sourceLabel"],
      select:   { sourceLabel: true },
    });

    if (sources.length === 0) {
      environment.log.error(`No snapshots found for tracking key "${trackingKey}". Run a Save Data Snapshot task first.`);
      return false;
    }

    type SourceEntry = {
      sourceLabel:   string;
      latestValue:   string;
      previousValue: string | null;
      numericValue:  number | null;
      changed:       boolean;
      changeSummary: string;
      recordedAt:    string;
    };

    const results: SourceEntry[] = [];
    let anyChanged = false;

    for (const { sourceLabel } of sources) {
      const records = await prisma.dataSnapshot.findMany({
        where:   { workflowId, trackingKey, sourceLabel },
        orderBy: { recordedAt: "desc" },
        take: 2,
      });

      const latest   = records[0];
      const previous = records[1] ?? null;
      const changed  = previous !== null && previous.value !== latest.value;

      if (changed) anyChanged = true;

      let changeSummary = "No change.";
      if (previous === null) {
        changeSummary = "First record.";
      } else if (changed) {
        if (latest.numericValue !== null && previous.numericValue !== null) {
          const diff = latest.numericValue - previous.numericValue;
          const pct  = previous.numericValue !== 0
            ? ((diff / previous.numericValue) * 100).toFixed(1)
            : "N/A";
          const sign = diff > 0 ? "+" : "";
          changeSummary = `${sign}${diff.toFixed(2)} (${sign}${pct}%) — was "${previous.value}", now "${latest.value}"`;
        } else {
          changeSummary = `Was "${previous.value}", now "${latest.value}"`;
        }
      }

      results.push({
        sourceLabel,
        latestValue:   latest.value,
        previousValue: previous?.value ?? null,
        numericValue:  latest.numericValue,
        changed,
        changeSummary,
        recordedAt:    latest.recordedAt.toISOString(),
      });
    }

    // For numeric tracking keys, find the "best" source (lowest value — useful for prices)
    const numericResults = results.filter(r => r.numericValue !== null);
    let bestSource = "";
    if (numericResults.length > 0) {
      numericResults.sort((a, b) => (a.numericValue ?? 0) - (b.numericValue ?? 0));
      bestSource = numericResults[0].sourceLabel;
    }

    const changedSources   = results.filter(r => r.changed).map(r => r.sourceLabel);
    const changeSummaryAll = anyChanged
      ? `Changes detected in: ${changedSources.join(", ")}`
      : "No changes detected across all sources.";

    const comparison = {
      trackingKey,
      comparedAt: new Date().toISOString(),
      sources:    results,
      summary: {
        anyChanged,
        changedSources,
        bestSource: bestSource || null,
        totalSources: results.length,
      },
    };

    environment.log.info(`Compared ${results.length} source(s) for "${trackingKey}". ${changeSummaryAll}`);

    environment.setOutput("Comparison JSON", JSON.stringify(comparison, null, 2));
    environment.setOutput("Any changed",     anyChanged ? "true" : "false");
    environment.setOutput("Change summary",  changeSummaryAll);
    environment.setOutput("Best source",     bestSource);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}