import { describe, expect, it } from "vitest";
import type { LightdashChart } from "../../src/api/types";
import { transformChartToSearchResult } from "../../src/helpers/transform";

const BASE_URL = "https://app.lightdash.cloud";
const PROJECT_UUID = "project-uuid-123";

describe("Search Charts Use Case", () => {
  it("transforms API charts to search results with correct browser URLs", () => {
    const apiCharts: readonly LightdashChart[] = [
      {
        uuid: "chart-001",
        name: "Monthly Revenue Trend",
        description: "Revenue by month over time",
        spaceUuid: "space-finance",
        spaceName: "Finance",
        chartKind: "line",
        updatedAt: "2025-01-22T09:00:00Z",
        views: 200,
      },
      {
        uuid: "chart-002",
        name: "User Distribution",
        description: "Users by region",
        spaceUuid: "space-product",
        spaceName: "Product",
        chartKind: "bar",
        updatedAt: "2025-01-19T14:00:00Z",
        views: 50,
      },
    ];

    const results = apiCharts.map((c) => transformChartToSearchResult(c, BASE_URL, PROJECT_UUID));

    expect(results).toHaveLength(2);

    expect(results[0].type).toBe("chart");
    expect(results[0].name).toBe("Monthly Revenue Trend");
    expect(results[0].url).toBe(
      "https://app.lightdash.cloud/projects/project-uuid-123/saved/chart-001",
    );

    expect(results[1].type).toBe("chart");
    expect(results[1].name).toBe("User Distribution");
    expect(results[1].url).toBe(
      "https://app.lightdash.cloud/projects/project-uuid-123/saved/chart-002",
    );
  });

  it("handles charts without chartKind", () => {
    const chart: LightdashChart = {
      uuid: "chart-003",
      name: "Simple Table",
      spaceUuid: "space-1",
      updatedAt: "2025-01-10T00:00:00Z",
      views: 5,
    };

    const result = transformChartToSearchResult(chart, BASE_URL, PROJECT_UUID);
    expect(result.type).toBe("chart");
    expect(result.url).toContain("/saved/chart-003");
  });

  it("handles empty chart list", () => {
    const apiCharts: readonly LightdashChart[] = [];
    const results = apiCharts.map((c) => transformChartToSearchResult(c, BASE_URL, PROJECT_UUID));
    expect(results).toHaveLength(0);
  });
});
