import { getPreferenceValues } from "@raycast/api";
import type {
  LightdashApiResponse,
  LightdashChart,
  LightdashDashboard,
  LightdashExplore,
  LightdashProject,
  LightdashSavedChart,
  LightdashSpace,
  Preferences,
} from "./types";
import { normalizeBaseUrl } from "../helpers/url";

function getPreferences(): Preferences {
  return getPreferenceValues<Preferences>();
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

export async function fetchExplores(
  projectUuid: string,
): Promise<readonly LightdashExplore[]> {
  return fetchApi<readonly LightdashExplore[]>(
    `/api/v1/projects/${projectUuid}/explores`,
  );
}

export async function fetchChartDetail(
  chartUuid: string,
): Promise<LightdashSavedChart> {
  return fetchApi<LightdashSavedChart>(`/api/v1/saved/${chartUuid}`);
}

export async function fetchSpaces(
  projectUuid: string,
): Promise<readonly LightdashSpace[]> {
  return fetchApi<readonly LightdashSpace[]>(
    `/api/v1/projects/${projectUuid}/spaces`,
  );
}
