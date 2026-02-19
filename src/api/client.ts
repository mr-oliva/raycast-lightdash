import { getPreferenceValues } from "@raycast/api";
import type {
  LightdashApiResponse,
  LightdashChart,
  LightdashDashboard,
  LightdashProject,
} from "./types";

interface Preferences {
  readonly baseUrl: string;
  readonly apiKey: string;
}

function getPreferences(): Preferences {
  return getPreferenceValues<Preferences>();
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

async function fetchApi<T>(path: string): Promise<T> {
  const { baseUrl, apiKey } = getPreferences();
  const normalizedUrl = normalizeBaseUrl(baseUrl);
  const url = `${normalizedUrl}${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `ApiKey ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Lightdash API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as LightdashApiResponse<T>;
  return data.results;
}

export async function fetchProjects(): Promise<readonly LightdashProject[]> {
  return fetchApi<readonly LightdashProject[]>("/api/v1/org/projects");
}

export async function fetchDashboards(
  projectUuid: string,
): Promise<readonly LightdashDashboard[]> {
  return fetchApi<readonly LightdashDashboard[]>(
    `/api/v1/projects/${projectUuid}/dashboards`,
  );
}

export async function fetchCharts(
  projectUuid: string,
): Promise<readonly LightdashChart[]> {
  return fetchApi<readonly LightdashChart[]>(
    `/api/v1/projects/${projectUuid}/charts`,
  );
}
