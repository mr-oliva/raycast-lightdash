import { describe, expect, it } from "vitest";
import { buildChartUrl, buildDashboardUrl, normalizeBaseUrl } from "../../src/helpers/url";

describe("normalizeBaseUrl", () => {
  it("removes trailing slash", () => {
    expect(normalizeBaseUrl("https://app.lightdash.cloud/")).toBe("https://app.lightdash.cloud");
  });

  it("removes multiple trailing slashes", () => {
    expect(normalizeBaseUrl("https://app.lightdash.cloud///")).toBe("https://app.lightdash.cloud");
  });

  it("returns unchanged URL when no trailing slash", () => {
    expect(normalizeBaseUrl("https://app.lightdash.cloud")).toBe("https://app.lightdash.cloud");
  });
});

describe("buildDashboardUrl", () => {
  it("builds correct dashboard URL", () => {
    const url = buildDashboardUrl("https://app.lightdash.cloud", "project-123", "dash-456");
    expect(url).toBe("https://app.lightdash.cloud/projects/project-123/dashboards/dash-456");
  });

  it("normalizes base URL with trailing slash", () => {
    const url = buildDashboardUrl("https://app.lightdash.cloud/", "project-123", "dash-456");
    expect(url).toBe("https://app.lightdash.cloud/projects/project-123/dashboards/dash-456");
  });
});

describe("buildChartUrl", () => {
  it("builds correct chart URL", () => {
    const url = buildChartUrl("https://app.lightdash.cloud", "project-123", "chart-789");
    expect(url).toBe("https://app.lightdash.cloud/projects/project-123/saved/chart-789");
  });

  it("normalizes base URL with trailing slash", () => {
    const url = buildChartUrl("https://app.lightdash.cloud/", "project-123", "chart-789");
    expect(url).toBe("https://app.lightdash.cloud/projects/project-123/saved/chart-789");
  });
});
