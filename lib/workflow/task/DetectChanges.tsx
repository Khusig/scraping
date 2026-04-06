import { TaskParamType, TaskType, WorkflowTask } from "@/lib/types";
import { GitCompareIcon, LucideProps } from "lucide-react";

export const DetectChangesTask = {
  type: TaskType.DETECT_CHANGES,
  label: "Detect changes",
  icon: (props: LucideProps) => (
    <GitCompareIcon className="stroke-emerald-400" {...props} />
  ),
  isEntryPoint: false,
  inputs: [
    {
      name: "Trigger",
      type: TaskParamType.STRING,
      required: false,
      helperText: "Connect from Save Data Snapshot to ensure correct execution order.",
    },
    {
      name: "Tracking key",
      type: TaskParamType.STRING,
      required: true,
      helperText:
        "The tracking key to compare across all sources. Fetches latest value from every source saved under this key.",
    },
    {
      name: "Workflow ID",
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true,
    },
    {
      name: "User ID",
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true,
    },
  ] as const,
  outputs: [
    { name: "Comparison JSON",  type: TaskParamType.STRING },
    { name: "Any changed",      type: TaskParamType.STRING },
    { name: "Change summary",   type: TaskParamType.STRING },
    { name: "Best source",      type: TaskParamType.STRING },
  ] as const,
  credits: 1,
} satisfies WorkflowTask;