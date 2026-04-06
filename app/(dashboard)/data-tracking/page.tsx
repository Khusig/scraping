 import { getTrackingComparisons, getWorkflowsWithSnapshots } from "@/actions/dataTracking";
import { DataTrackingGrid } from "./_components/DataTrackingGrid";
import { WorkflowFilter } from "./_components/WorkflowFilter";
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
          <WorkflowFilter
            workflows={workflows}
            selected={searchParams.workflowId}
          />
        )}
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <DataTrackingGrid comparisons={comparisons} />
      </div>
    </div>
  );
}