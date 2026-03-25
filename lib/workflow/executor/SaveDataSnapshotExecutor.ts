import { ExecutionEnviornment } from "@/lib/types";
import { SaveDataSnapshotTask } from "../task/SaveDataSnapshot";
import prisma from "@/lib/prisma";

export async function SaveDataSnapshotExecutor(
  environment: ExecutionEnviornment<typeof SaveDataSnapshotTask>
): Promise<boolean> {
  try {
    const value        = environment.getInput("Value");
    const trackingKey  = environment.getInput("Tracking key");
    const sourceLabel  = environment.getInput("Source label");
    const numericRaw   = environment.getInput("Numeric value");
    const workflowId   = environment.getInput("Workflow ID");
    const userId       = environment.getInput("User ID");

    if (!value || !trackingKey || !sourceLabel || !workflowId || !userId) {
      environment.log.error("Missing required inputs: Value, Tracking key, Source label, Workflow ID, or User ID.");
      return false;
    }

    // Parse optional numeric value
    let numericValue: number | null = null;
    if (numericRaw) {
      // Strip currency symbols and thousand-separators: "₹1,09,900" → 109900
      const cleaned = numericRaw.replace(/[^\d.,]/g, "");
      const lastComma = cleaned.lastIndexOf(",");
      const lastDot   = cleaned.lastIndexOf(".");
      const normalized = lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")  // European: 1.999,00
        : cleaned.replace(/,/g, "");                     // US/Indian: 1,09,900
      const parsed = parseFloat(normalized);
      if (!isNaN(parsed)) numericValue = parsed;
    }

    // Fetch the most recent snapshot for this key+source to detect changes
    const previous = await prisma.dataSnapshot.findFirst({
      where:   { workflowId, trackingKey, sourceLabel },
      orderBy: { recordedAt: "desc" },
    });

    const previousValue   = previous?.value ?? null;
    const valueChanged    = previousValue !== null && previousValue !== value ? "true" : "false";

    // Build a human-readable change summary
    let changeSummary = "No previous record.";
    if (previousValue !== null) {
      if (valueChanged === "false") {
        changeSummary = "No change.";
      } else if (numericValue !== null && previous?.numericValue !== null && previous?.numericValue !== undefined) {
        const diff    = numericValue - previous.numericValue;
        const pct     = previous.numericValue !== 0
          ? ((diff / previous.numericValue) * 100).toFixed(1)
          : "N/A";
        const sign    = diff > 0 ? "+" : "";
        changeSummary = `Changed from "${previousValue}" to "${value}" (${sign}${diff.toFixed(2)}, ${sign}${pct}%)`;
      } else {
        changeSummary = `Changed from "${previousValue}" to "${value}"`;
      }
    }

    // Save the new snapshot
    await prisma.dataSnapshot.create({
      data: { userId, workflowId, trackingKey, sourceLabel, value, numericValue },
    });

    environment.log.info(`Snapshot saved for "${trackingKey}" from "${sourceLabel}": ${value}`);
    environment.log.info(changeSummary);

    environment.setOutput("Saved value",    value);
    environment.setOutput("Previous value", previousValue ?? "");
    environment.setOutput("Value changed",  valueChanged);
    environment.setOutput("Change summary", changeSummary);

    return true;
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}