import { describe, expect, it } from "vitest";
import type { LightdashChart, LightdashDashboard, LightdashExplore } from "../../src/api/types";
import {
  transformChartToSearchResult,
  transformDashboardToSearchResult,
  transformExploreToSearchResult,
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

describe("transformExploreToSearchResult", () => {
  it("transforms an explore to SearchResult with prefixed id", () => {
    const explore: LightdashExplore = {
      name: "orders",
      label: "Orders",
      description: "Order data",
      groupLabel: "Sales",
      tags: ["finance"],
    };

    const result = transformExploreToSearchResult(explore, BASE_URL, PROJECT_UUID);

    expect(result).toEqual({
      type: "explore",
      uuid: "explore:orders",
      name: "Orders",
      description: "Order data",
      spaceName: "Sales",
      url: "https://app.lightdash.cloud/projects/project-123/tables/orders",
    });
  });

  it("handles explore without optional fields", () => {
    const explore: LightdashExplore = {
      name: "users",
      label: "Users",
    };

    const result = transformExploreToSearchResult(explore, BASE_URL, PROJECT_UUID);

    expect(result.uuid).toBe("explore:users");
    expect(result.description).toBeUndefined();
    expect(result.spaceName).toBeUndefined();
    expect(result.type).toBe("explore");
    expect(result.updatedAt).toBeUndefined();
    expect(result.views).toBeUndefined();
  });

  it("encodes special characters in explore name for URL", () => {
    const explore: LightdashExplore = {
      name: "my table/test",
      label: "My Table Test",
    };

    const result = transformExploreToSearchResult(explore, BASE_URL, PROJECT_UUID);

    expect(result.url).toBe(
      "https://app.lightdash.cloud/projects/project-123/tables/my%20table%2Ftest",
    );
    expect(result.uuid).toBe("explore:my table/test");
  });
});
