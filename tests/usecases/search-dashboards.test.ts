import { describe, expect, it } from "vitest";
import type { LightdashDashboard } from "../../src/api/types";
import { transformDashboardToSearchResult } from "../../src/helpers/transform";

const BASE_URL = "https://app.lightdash.cloud";
const PROJECT_UUID = "project-uuid-123";

describe("Search Dashboards Use Case", () => {
  it("transforms API dashboards to search results with correct browser URLs", () => {
    const apiDashboards: readonly LightdashDashboard[] = [
      {
        uuid: "dash-001",
        name: "Revenue Overview",
        description: "Company-wide revenue metrics",
        spaceUuid: "space-finance",
        spaceName: "Finance",
        updatedAt: "2025-01-20T10:00:00Z",
        views: 150,
      },
      {
        uuid: "dash-002",
        name: "User Engagement",
        description: "Daily active users and retention",
        spaceUuid: "space-product",
        spaceName: "Product",
        updatedAt: "2025-01-18T08:30:00Z",
        views: 75,
      },
    ];

    const results = apiDashboards.map((d) => transformDashboardToSearchResult(d, BASE_URL, PROJECT_UUID));

    expect(results).toHaveLength(2);

    expect(results[0].type).toBe("dashboard");
    expect(results[0].name).toBe("Revenue Overview");
    expect(results[0].url).toBe(
      "https://app.lightdash.cloud/projects/project-uuid-123/dashboards/dash-001",
    );

    expect(results[1].type).toBe("dashboard");
    expect(results[1].name).toBe("User Engagement");
    expect(results[1].url).toBe(
      "https://app.lightdash.cloud/projects/project-uuid-123/dashboards/dash-002",
    );
  });

  it("handles empty dashboard list", () => {
    const apiDashboards: readonly LightdashDashboard[] = [];
    const results = apiDashboards.map((d) => transformDashboardToSearchResult(d, BASE_URL, PROJECT_UUID));
    expect(results).toHaveLength(0);
  });

  it("preserves space name for display", () => {
    const dashboard: LightdashDashboard = {
      uuid: "dash-003",
      name: "Marketing KPIs",
      spaceUuid: "space-marketing",
      spaceName: "Marketing",
      updatedAt: "2025-01-15T12:00:00Z",
      views: 30,
    };

    const result = transformDashboardToSearchResult(dashboard, BASE_URL, PROJECT_UUID);
    expect(result.spaceName).toBe("Marketing");
  });
});
