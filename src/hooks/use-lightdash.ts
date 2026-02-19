import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import {
  fetchCharts,
  fetchDashboards,
  fetchExplores,
  fetchProjects,
  fetchSpaces,
} from "../api/client";
import type { Preferences, SearchResult } from "../api/types";
import {
  transformChartToSearchResult,
  transformDashboardToSearchResult,
  transformExploreToSearchResult,
} from "../helpers/transform";

export function useProjects() {
  return useCachedPromise(fetchProjects, [], {
    keepPreviousData: true,
  });
}

export function useLightdashSearch(projectUuid: string | undefined) {
  const { baseUrl } = getPreferenceValues<Preferences>();

  return useCachedPromise(
    async (uuid: string) => {
      const [dashboardsRaw, chartsRaw, spacesRaw, exploresRaw] =
        await Promise.all([
          fetchDashboards(uuid),
          fetchCharts(uuid),
          fetchSpaces(uuid),
          fetchExplores(uuid),
        ]);

      const spaceNameMap = new Map(spacesRaw.map((s) => [s.uuid, s.name]));

      const dashboards: readonly SearchResult[] = dashboardsRaw.map((d) =>
        transformDashboardToSearchResult(
          { ...d, spaceName: d.spaceName ?? spaceNameMap.get(d.spaceUuid) },
          baseUrl,
          uuid,
        ),
      );
      const charts: readonly SearchResult[] = chartsRaw.map((c) =>
        transformChartToSearchResult(
          { ...c, spaceName: c.spaceName ?? spaceNameMap.get(c.spaceUuid) },
          baseUrl,
          uuid,
        ),
      );
      const explores: readonly SearchResult[] = exploresRaw.map((e) =>
        transformExploreToSearchResult(e, baseUrl, uuid),
      );

      return { dashboards, charts, explores };
    },
    [projectUuid ?? "", baseUrl],
    {
      execute: !!projectUuid,
      keepPreviousData: true,
    },
  );
}
