 import { getTrackingComparisons, getWorkflowsWithSnapshots } from "@/actions/dataTracking";
import { DataTrackingGrid } from "./_components/DataTrackingGrid";
import { ActivityIcon } from "lucide-react";

export default async function DataTrackingPage({
  searchParams,
}: {
  searchParams: { workflowId?: string };
}) {
  const [comparisons, workflows] = await Promise.all([
    getTrackingComparisons(searchParams.workflowId),
    getWorkflowsWithSnapshots(),
  ]);

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-6 w-6 text-violet-500" />
          <div>
            <h1 className="text-2xl font-bold">Data tracking</h1>
            <p className="text-sm text-muted-foreground">
              Monitor any extracted value — prices, articles, job posts, scores — across runs
            </p>
          </div>
        </div>
        {workflows.length > 0 && (
          <select
            defaultValue={searchParams.workflowId ?? ""}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value) url.searchParams.set("workflowId", e.target.value);
              else url.searchParams.delete("workflowId");
              window.location.href = url.toString();
            }}
            className="text-sm border rounded-md px-3 py-1.5 bg-background"
          >
            <option value="">All workflows</option>
            {workflows.map((w: { id: string; name: string}) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <DataTrackingGrid comparisons={comparisons} />
      </div>
    </div>
  );
}