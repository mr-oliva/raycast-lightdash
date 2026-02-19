import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPreferenceValues } from "@raycast/api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("API Client", () => {
  beforeEach(() => {
    vi.resetModules();
    mockFetch.mockReset();
    vi.mocked(getPreferenceValues).mockReturnValue({
      baseUrl: "https://app.lightdash.cloud",
      apiKey: "ldt_test_token_123",
      defaultProjectUuid: "project-uuid-123",
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchProjects", () => {
    it("fetches projects with correct URL and headers", async () => {
      const projects = [
        { projectUuid: "p1", name: "Project 1" },
        { projectUuid: "p2", name: "Project 2" },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", results: projects }),
      });

      const { fetchProjects } = await import("../../src/api/client");
      const result = await fetchProjects();

      expect(mockFetch).toHaveBeenCalledWith("https://app.lightdash.cloud/api/v1/org/projects", {
        headers: {
          Authorization: "ApiKey ldt_test_token_123",
          "Content-Type": "application/json",
        },
      });
      expect(result).toEqual(projects);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
      });

      const { fetchProjects } = await import("../../src/api/client");

      await expect(fetchProjects()).rejects.toThrow("Lightdash API error: 401 Unauthorized");
    });
  });

  describe("fetchDashboards", () => {
    it("fetches dashboards for a project", async () => {
      const dashboards = [
        {
          uuid: "d1",
          name: "Dashboard 1",
          description: "Test",
          spaceUuid: "s1",
          updatedAt: "2025-01-01T00:00:00Z",
          views: 10,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", results: dashboards }),
      });

      const { fetchDashboards } = await import("../../src/api/client");
      const result = await fetchDashboards("project-uuid-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://app.lightdash.cloud/api/v1/projects/project-uuid-123/dashboards",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "ApiKey ldt_test_token_123",
          }),
        }),
      );
      expect(result).toEqual(dashboards);
    });

    it("throws on 404 response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      });

      const { fetchDashboards } = await import("../../src/api/client");

      await expect(fetchDashboards("nonexistent")).rejects.toThrow("Lightdash API error: 404 Not Found");
    });

    it("throws on 500 response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const { fetchDashboards } = await import("../../src/api/client");

      await expect(fetchDashboards("project-uuid-123")).rejects.toThrow(
        "Lightdash API error: 500 Internal Server Error",
      );
    });
  });

  describe("fetchCharts", () => {
    it("fetches charts for a project", async () => {
      const charts = [
        {
          uuid: "c1",
          name: "Chart 1",
          description: "Test chart",
          spaceUuid: "s1",
          spaceName: "Space 1",
          chartKind: "line",
          updatedAt: "2025-01-15T00:00:00Z",
          views: 25,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: "ok", results: charts }),
      });

      const { fetchCharts } = await import("../../src/api/client");
      const result = await fetchCharts("project-uuid-123");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://app.lightdash.cloud/api/v1/projects/project-uuid-123/charts",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "ApiKey ldt_test_token_123",
          }),
        }),
      );
      expect(result).toEqual(charts);
    });

    it("throws on network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { fetchCharts } = await import("../../src/api/client");

      await expect(fetchCharts("project-uuid-123")).rejects.toThrow("Network error");
    });
  });
});
