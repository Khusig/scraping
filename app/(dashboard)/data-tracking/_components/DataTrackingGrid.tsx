"use client";

import { TrackingKeyComparison } from "@/actions/dataTracking";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRightLeftIcon, TrophyIcon } from "lucide-react";

function ChangeBadge({ changed, previous, current }: { changed: boolean; previous: string | null; current: string }) {
  if (previous === null) return <span className="text-muted-foreground text-xs">First record</span>;
  if (!changed)          return <span className="text-muted-foreground text-xs">No change</span>;
  return (
    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
      <ArrowRightLeftIcon className="h-3 w-3" />
      Changed
    </span>
  );
}

export function DataTrackingCard({ comparison }: { comparison: TrackingKeyComparison }) {
  return (
    <Card className={comparison.anyChanged ? "border-amber-300 dark:border-amber-700" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="font-mono text-sm">{comparison.trackingKey}</span>
          <div className="flex items-center gap-2">
            {comparison.anyChanged && (
              <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400">
                Updated
              </Badge>
            )}
            {comparison.bestSource && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrophyIcon className="h-3 w-3 text-amber-500" />
                Best: {comparison.bestSource}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Latest value</TableHead>
              <TableHead>Previous value</TableHead>
              <TableHead>Change</TableHead>
              <TableHead className="text-right">Recorded at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparison.sources.map(source => (
              <TableRow
                key={source.sourceLabel}
                className={source.changed ? "bg-amber-50 dark:bg-amber-950/20" : ""}
              >
                <TableCell className="font-medium">{source.sourceLabel}</TableCell>
                <TableCell className="font-mono text-sm max-w-xs truncate" title={source.latestValue}>
                  {source.latestValue}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground max-w-xs truncate"
                  title={source.previousValue ?? ""}>
                  {source.previousValue ?? "—"}
                </TableCell>
                <TableCell>
                  <ChangeBadge
                    changed={source.changed}
                    previous={source.previousValue}
                    current={source.latestValue}
                  />
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">
                  {new Date(source.recordedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function DataTrackingGrid({ comparisons }: { comparisons: TrackingKeyComparison[] }) {
  if (comparisons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <p className="text-lg font-medium">Nothing tracked yet</p>
        <p className="text-sm text-center max-w-md">
          Add a "Save data snapshot" task to any workflow. It works for prices, article headlines,
          job listings, stock values — any text you extract.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {comparisons.map(c => (
        <DataTrackingCard key={c.trackingKey} comparison={c} />
      ))}
    </div>
  );
}