export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function buildDashboardUrl(
  baseUrl: string,
  projectUuid: string,
  dashboardUuid: string,
): string {
  const normalized = normalizeBaseUrl(baseUrl);
  return `${normalized}/projects/${projectUuid}/dashboards/${dashboardUuid}`;
}

export function buildChartUrl(
  baseUrl: string,
  projectUuid: string,
  chartUuid: string,
): string {
  const normalized = normalizeBaseUrl(baseUrl);
  return `${normalized}/projects/${projectUuid}/saved/${chartUuid}`;
}

export function buildExploreUrl(
  baseUrl: string,
  projectUuid: string,
  exploreName: string,
): string {
  const normalized = normalizeBaseUrl(baseUrl);
  return `${normalized}/projects/${projectUuid}/tables/${encodeURIComponent(exploreName)}`;
}
