import { TaskParamType, TaskType, WorkflowTask } from "@/lib/types";
import { DatabaseIcon, LucideProps } from "lucide-react";

export const SaveDataSnapshotTask = {
  type: TaskType.SAVE_DATA_SNAPSHOT,
  label: "Save data snapshot",
  icon: (props: LucideProps) => (
    <DatabaseIcon className="stroke-violet-400" {...props} />
  ),
  isEntryPoint: false,
  inputs: [
    {
      name: "Value",
      type: TaskParamType.STRING,
      required: true,
      helperText:
        "The extracted value to track. Can be anything: a price, article headline, job title, stock value, any text.",
    },
    {
      name: "Tracking key",
      type: TaskParamType.STRING,
      required: true,
      helperText:
        "A stable identifier for what you are tracking, e.g. 'iphone-15-price', 'techcrunch-headline', 'bitcoin-usd'. Must be consistent across runs.",
    },
    {
      name: "Source label",
      type: TaskParamType.STRING,
      required: true,
      helperText:
        "Human-readable label for where this value came from, e.g. 'Amazon', 'TechCrunch', 'CoinGecko'.",
    },
    {
      name: "Numeric value",
      type: TaskParamType.STRING,
      required: false,
      helperText:
        "Optional. If the value is a number (price, count, score), enter it here as a plain number e.g. '1999.00'. Enables numeric comparison and change percentage.",
    },
    {
      name: "Workflow ID",
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true,
      helperText: "Auto-injected.",
    },
    {
      name: "User ID",
      type: TaskParamType.STRING,
      required: true,
      hideHandle: true,
      helperText: "Auto-injected.",
    },
  ] as const,
  outputs: [
    { name: "Saved value",    type: TaskParamType.STRING },
    { name: "Previous value", type: TaskParamType.STRING },
    { name: "Value changed",  type: TaskParamType.STRING },
    { name: "Change summary", type: TaskParamType.STRING },
  ] as const,
  credits: 1,
} satisfies WorkflowTask;