import { describe, expect, it, vi } from "vitest";
import type { LightdashDashboard } from "../../src/api/types";
import { transformDashboardToSearchResult } from "../../src/helpers/transform";
import { buildDashboardUrl } from "../../src/helpers/url";

const BASE_URL = "https://app.lightdash.cloud";

describe("Project Switching Use Case", () => {
  it("generates URLs for the correct project when default project is used", () => {
    const defaultProjectUuid = "default-project-uuid";
    const dashboard: LightdashDashboard = {
      uuid: "dash-001",
      name: "Dashboard",
      spaceUuid: "s1",
      updatedAt: "2025-01-15T00:00:00Z",
      views: 10,
    };

    const result = transformDashboardToSearchResult(dashboard, BASE_URL, defaultProjectUuid);

    expect(result.url).toBe(
      "https://app.lightdash.cloud/projects/default-project-uuid/dashboards/dash-001",
    );
  });

  it("generates URLs for a different project after switching", () => {
    const switchedProjectUuid = "switched-project-uuid";
    const dashboard: LightdashDashboard = {
      uuid: "dash-001",
      name: "Dashboard",
      spaceUuid: "s1",
      updatedAt: "2025-01-15T00:00:00Z",
      views: 10,
    };

    const result = transformDashboardToSearchResult(dashboard, BASE_URL, switchedProjectUuid);

    expect(result.url).toBe(
      "https://app.lightdash.cloud/projects/switched-project-uuid/dashboards/dash-001",
    );
  });

  it("URL changes when project UUID changes", () => {
    const dashboardUuid = "dash-001";

    const url1 = buildDashboardUrl(BASE_URL, "project-a", dashboardUuid);
    const url2 = buildDashboardUrl(BASE_URL, "project-b", dashboardUuid);

    expect(url1).not.toBe(url2);
    expect(url1).toContain("project-a");
    expect(url2).toContain("project-b");
  });

  it("each project gets independent search results", () => {
    const dashboardA: LightdashDashboard = {
      uuid: "dash-a",
      name: "Project A Dashboard",
      spaceUuid: "s1",
      updatedAt: "2025-01-10T00:00:00Z",
      views: 5,
    };

    const dashboardB: LightdashDashboard = {
      uuid: "dash-b",
      name: "Project B Dashboard",
      spaceUuid: "s2",
      updatedAt: "2025-01-20T00:00:00Z",
      views: 15,
    };

    const resultA = transformDashboardToSearchResult(dashboardA, BASE_URL, "project-a");
    const resultB = transformDashboardToSearchResult(dashboardB, BASE_URL, "project-b");

    expect(resultA.url).toContain("project-a");
    expect(resultB.url).toContain("project-b");
    expect(resultA.uuid).toBe("dash-a");
    expect(resultB.uuid).toBe("dash-b");
  });
});
