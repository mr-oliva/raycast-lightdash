import { Action, ActionPanel, Detail } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { fetchChartDetail } from "./api/client";

function formatChartType(type: string): string {
  const typeMap: Record<string, string> = {
    cartesian: "Cartesian (Bar/Line/Area)",
    big_number: "Big Number",
    table: "Table",
    pie: "Pie",
    funnel: "Funnel",
    treemap: "Treemap",
    gauge: "Gauge",
    map: "Map",
    scatter: "Scatter",
    mixed: "Mixed",
  };
  return typeMap[type] ?? type;
}

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildMarkdown(
  name: string,
  tableName: string,
  chartType: string,
  dimensions: readonly string[],
  metrics: readonly string[],
  description?: string,
): string {
  const parts: string[] = [];

  parts.push(`# ${name}`);

  if (description) {
    parts.push(description);
  }

  parts.push("## Overview");
  parts.push(`| Property | Value |`);
  parts.push(`|----------|-------|`);
  parts.push(`| **Table** | \`${tableName}\` |`);
  parts.push(`| **Chart Type** | ${formatChartType(chartType)} |`);

  if (dimensions.length > 0) {
    parts.push("## Dimensions");
    parts.push(dimensions.map((d) => `- \`${d}\` - ${formatFieldName(d)}`).join("\n"));
  }

  if (metrics.length > 0) {
    parts.push("## Metrics");
    parts.push(metrics.map((m) => `- \`${m}\` - ${formatFieldName(m)}`).join("\n"));
  }

  return parts.join("\n\n");
}

export function ChartDetailView({
  chartUuid,
  chartUrl,
}: {
  readonly chartUuid: string;
  readonly chartUrl: string;
}) {
  const { data, isLoading } = useCachedPromise(fetchChartDetail, [chartUuid]);

  const markdown = data
    ? buildMarkdown(
        data.name,
        data.tableName,
        data.chartConfig.type,
        data.metricQuery.dimensions,
        data.metricQuery.metrics,
        data.description,
      )
    : "Loading chart details...";

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={chartUrl} />
          <Action.CopyToClipboard title="Copy URL" content={chartUrl} />
        </ActionPanel>
      }
    />
  );
}
