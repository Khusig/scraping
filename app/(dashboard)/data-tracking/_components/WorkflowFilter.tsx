"use client";

export function WorkflowFilter({
  workflows,
  selected,
}: {
  workflows: { id: string; name: string }[];
  selected?: string;
}) {
  return (
    <select
      defaultValue={selected ?? ""}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) url.searchParams.set("workflowId", e.target.value);
        else url.searchParams.delete("workflowId");
        window.location.href = url.toString();
      }}
      className="text-sm border rounded-md px-3 py-1.5 bg-background"
    >
      <option value="">All workflows</option>
      {workflows.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </select>
  );
}