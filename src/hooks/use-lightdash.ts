import { getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import {
  fetchCharts,
  fetchDashboards,
  fetchProjects,
  fetchSpaces,
} from "../api/client";
import type { SearchResult } from "../api/types";
import {
  transformChartToSearchResult,
  transformDashboardToSearchResult,
} from "../helpers/transform";

interface Preferences {
  readonly baseUrl: string;
}

export function useProjects() {
  return useCachedPromise(fetchProjects, [], {
    keepPreviousData: true,
  });
}

export function useLightdashSearch(projectUuid: string | undefined) {
  const { baseUrl } = getPreferenceValues<Preferences>();

  return useCachedPromise(
    async (uuid: string) => {
      const [dashboardsRaw, chartsRaw, spacesRaw] = await Promise.all([
        fetchDashboards(uuid),
        fetchCharts(uuid),
        fetchSpaces(uuid),
      ]);

      const spaceNameMap = new Map(
        spacesRaw.map((s) => [s.uuid, s.name]),
      );

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

      return { dashboards, charts };
    },
    [projectUuid ?? ""],
    {
      execute: !!projectUuid,
      keepPreviousData: true,
    },
  );
}
