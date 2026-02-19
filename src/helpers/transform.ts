import type {
  LightdashChart,
  LightdashDashboard,
  LightdashExplore,
  SearchResult,
} from "../api/types";
import { buildChartUrl, buildDashboardUrl, buildExploreUrl } from "./url";

export function transformDashboardToSearchResult(
  dashboard: LightdashDashboard,
  baseUrl: string,
  projectUuid: string,
): SearchResult {
  return {
    type: "dashboard",
    uuid: dashboard.uuid,
    name: dashboard.name,
    description: dashboard.description,
    spaceName: dashboard.spaceName,
    updatedAt: dashboard.updatedAt,
    views: dashboard.views,
    url: buildDashboardUrl(baseUrl, projectUuid, dashboard.uuid),
  };
}

export function transformChartToSearchResult(
  chart: LightdashChart,
  baseUrl: string,
  projectUuid: string,
): SearchResult {
  return {
    type: "chart",
    uuid: chart.uuid,
    name: chart.name,
    description: chart.description,
    spaceName: chart.spaceName,
    updatedAt: chart.updatedAt,
    views: chart.views,
    url: buildChartUrl(baseUrl, projectUuid, chart.uuid),
  };
}

export function transformExploreToSearchResult(
  explore: LightdashExplore,
  baseUrl: string,
  projectUuid: string,
): SearchResult {
  return {
    type: "explore",
    uuid: explore.name,
    name: explore.label,
    description: explore.description,
    spaceName: explore.groupLabel,
    updatedAt: new Date(0).toISOString(),
    views: 0,
    url: buildExploreUrl(baseUrl, projectUuid, explore.name),
  };
}

export function mergeAndSortResults(
  dashboards: readonly SearchResult[],
  charts: readonly SearchResult[],
): readonly SearchResult[] {
  return [...dashboards, ...charts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
