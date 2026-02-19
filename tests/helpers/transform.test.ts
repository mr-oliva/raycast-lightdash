import { describe, expect, it } from "vitest";
import type { LightdashChart, LightdashDashboard } from "../../src/api/types";
import {
  mergeAndSortResults,
  transformChartToSearchResult,
  transformDashboardToSearchResult,
} from "../../src/helpers/transform";

const BASE_URL = "https://app.lightdash.cloud";
const PROJECT_UUID = "project-123";

describe("transformDashboardToSearchResult", () => {
  it("transforms a dashboard to SearchResult", () => {
    const dashboard: LightdashDashboard = {
      uuid: "dash-001",
      name: "Revenue Dashboard",
      description: "Monthly revenue overview",
      spaceUuid: "space-1",
      spaceName: "Finance",
      updatedAt: "2025-01-15T10:00:00Z",
      views: 42,
    };

    const result = transformDashboardToSearchResult(dashboard, BASE_URL, PROJECT_UUID);

    expect(result).toEqual({
      type: "dashboard",
      uuid: "dash-001",
      name: "Revenue Dashboard",
      description: "Monthly revenue overview",
      spaceName: "Finance",
      updatedAt: "2025-01-15T10:00:00Z",
      views: 42,
      url: "https://app.lightdash.cloud/projects/project-123/dashboards/dash-001",
    });
  });

  it("handles dashboard without description", () => {
    const dashboard: LightdashDashboard = {
      uuid: "dash-002",
      name: "Simple Dashboard",
      spaceUuid: "space-1",
      updatedAt: "2025-01-10T08:00:00Z",
      views: 5,
    };

    const result = transformDashboardToSearchResult(dashboard, BASE_URL, PROJECT_UUID);

    expect(result.description).toBeUndefined();
    expect(result.type).toBe("dashboard");
  });
});

describe("transformChartToSearchResult", () => {
  it("transforms a chart to SearchResult", () => {
    const chart: LightdashChart = {
      uuid: "chart-001",
      name: "Monthly Revenue",
      description: "Revenue trend by month",
      spaceUuid: "space-1",
      spaceName: "Finance",
      chartKind: "line",
      updatedAt: "2025-01-20T14:30:00Z",
      views: 100,
    };

    const result = transformChartToSearchResult(chart, BASE_URL, PROJECT_UUID);

    expect(result).toEqual({
      type: "chart",
      uuid: "chart-001",
      name: "Monthly Revenue",
      description: "Revenue trend by month",
      spaceName: "Finance",
      updatedAt: "2025-01-20T14:30:00Z",
      views: 100,
      url: "https://app.lightdash.cloud/projects/project-123/saved/chart-001",
    });
  });

  it("handles chart without optional fields", () => {
    const chart: LightdashChart = {
      uuid: "chart-002",
      name: "Basic Chart",
      spaceUuid: "space-2",
      updatedAt: "2025-01-05T12:00:00Z",
      views: 0,
    };

    const result = transformChartToSearchResult(chart, BASE_URL, PROJECT_UUID);

    expect(result.description).toBeUndefined();
    expect(result.spaceName).toBeUndefined();
    expect(result.type).toBe("chart");
  });
});

describe("mergeAndSortResults", () => {
  it("merges and sorts by updatedAt descending", () => {
    const dashboards = [
      {
        type: "dashboard" as const,
        uuid: "d1",
        name: "Old Dashboard",
        updatedAt: "2025-01-01T00:00:00Z",
        views: 10,
        url: "url1",
      },
    ];

    const charts = [
      {
        type: "chart" as const,
        uuid: "c1",
        name: "New Chart",
        updatedAt: "2025-01-20T00:00:00Z",
        views: 20,
        url: "url2",
      },
      {
        type: "chart" as const,
        uuid: "c2",
        name: "Mid Chart",
        updatedAt: "2025-01-10T00:00:00Z",
        views: 5,
        url: "url3",
      },
    ];

    const result = mergeAndSortResults(dashboards, charts);

    expect(result).toHaveLength(3);
    expect(result[0].uuid).toBe("c1");
    expect(result[1].uuid).toBe("c2");
    expect(result[2].uuid).toBe("d1");
  });

  it("handles empty dashboards array", () => {
    const charts = [
      {
        type: "chart" as const,
        uuid: "c1",
        name: "Chart",
        updatedAt: "2025-01-01T00:00:00Z",
        views: 1,
        url: "url1",
      },
    ];

    const result = mergeAndSortResults([], charts);

    expect(result).toHaveLength(1);
    expect(result[0].uuid).toBe("c1");
  });

  it("handles empty charts array", () => {
    const dashboards = [
      {
        type: "dashboard" as const,
        uuid: "d1",
        name: "Dashboard",
        updatedAt: "2025-01-01T00:00:00Z",
        views: 1,
        url: "url1",
      },
    ];

    const result = mergeAndSortResults(dashboards, []);

    expect(result).toHaveLength(1);
    expect(result[0].uuid).toBe("d1");
  });

  it("handles both arrays empty", () => {
    const result = mergeAndSortResults([], []);
    expect(result).toHaveLength(0);
  });
});
