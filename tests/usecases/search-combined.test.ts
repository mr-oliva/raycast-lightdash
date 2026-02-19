import { describe, expect, it } from "vitest";
import type { LightdashChart, LightdashDashboard } from "../../src/api/types";
import {
  mergeAndSortResults,
  transformChartToSearchResult,
  transformDashboardToSearchResult,
} from "../../src/helpers/transform";

const BASE_URL = "https://app.lightdash.cloud";
const PROJECT_UUID = "project-uuid-123";

describe("Combined Search Use Case", () => {
  it("merges dashboards and charts sorted by updatedAt descending", () => {
    const dashboards: readonly LightdashDashboard[] = [
      {
        uuid: "dash-001",
        name: "Old Dashboard",
        spaceUuid: "s1",
        spaceName: "Space 1",
        updatedAt: "2025-01-01T00:00:00Z",
        views: 10,
      },
      {
        uuid: "dash-002",
        name: "Recent Dashboard",
        spaceUuid: "s1",
        spaceName: "Space 1",
        updatedAt: "2025-01-25T00:00:00Z",
        views: 50,
      },
    ];

    const charts: readonly LightdashChart[] = [
      {
        uuid: "chart-001",
        name: "Mid Chart",
        spaceUuid: "s2",
        spaceName: "Space 2",
        updatedAt: "2025-01-15T00:00:00Z",
        views: 20,
      },
    ];

    const dashboardResults = dashboards.map((d) => transformDashboardToSearchResult(d, BASE_URL, PROJECT_UUID));
    const chartResults = charts.map((c) => transformChartToSearchResult(c, BASE_URL, PROJECT_UUID));
    const merged = mergeAndSortResults(dashboardResults, chartResults);

    expect(merged).toHaveLength(3);
    expect(merged[0].uuid).toBe("dash-002");
    expect(merged[0].type).toBe("dashboard");
    expect(merged[1].uuid).toBe("chart-001");
    expect(merged[1].type).toBe("chart");
    expect(merged[2].uuid).toBe("dash-001");
    expect(merged[2].type).toBe("dashboard");
  });

  it("works when dashboards are empty", () => {
    const charts: readonly LightdashChart[] = [
      {
        uuid: "chart-001",
        name: "Only Chart",
        spaceUuid: "s1",
        updatedAt: "2025-01-10T00:00:00Z",
        views: 5,
      },
    ];

    const chartResults = charts.map((c) => transformChartToSearchResult(c, BASE_URL, PROJECT_UUID));
    const merged = mergeAndSortResults([], chartResults);

    expect(merged).toHaveLength(1);
    expect(merged[0].type).toBe("chart");
  });

  it("works when charts are empty", () => {
    const dashboards: readonly LightdashDashboard[] = [
      {
        uuid: "dash-001",
        name: "Only Dashboard",
        spaceUuid: "s1",
        updatedAt: "2025-01-10T00:00:00Z",
        views: 5,
      },
    ];

    const dashboardResults = dashboards.map((d) => transformDashboardToSearchResult(d, BASE_URL, PROJECT_UUID));
    const merged = mergeAndSortResults(dashboardResults, []);

    expect(merged).toHaveLength(1);
    expect(merged[0].type).toBe("dashboard");
  });

  it("handles both empty arrays", () => {
    const merged = mergeAndSortResults([], []);
    expect(merged).toHaveLength(0);
  });

  it("maintains correct URLs for each type", () => {
    const dashboards: readonly LightdashDashboard[] = [
      {
        uuid: "dash-001",
        name: "Dashboard",
        spaceUuid: "s1",
        updatedAt: "2025-01-15T00:00:00Z",
        views: 10,
      },
    ];

    const charts: readonly LightdashChart[] = [
      {
        uuid: "chart-001",
        name: "Chart",
        spaceUuid: "s1",
        updatedAt: "2025-01-15T00:00:00Z",
        views: 10,
      },
    ];

    const dashboardResults = dashboards.map((d) => transformDashboardToSearchResult(d, BASE_URL, PROJECT_UUID));
    const chartResults = charts.map((c) => transformChartToSearchResult(c, BASE_URL, PROJECT_UUID));
    const merged = mergeAndSortResults(dashboardResults, chartResults);

    const dashResult = merged.find((r) => r.type === "dashboard");
    const chartResult = merged.find((r) => r.type === "chart");

    expect(dashResult?.url).toContain("/dashboards/dash-001");
    expect(chartResult?.url).toContain("/saved/chart-001");
  });
});
