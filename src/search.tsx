import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchResult } from "./api/types";
import { useDefaultProject } from "./hooks/use-default-project";
import { useFavorites } from "./hooks/use-favorites";
import { useLightdashSearch, useProjects } from "./hooks/use-lightdash";
import { useRecent } from "./hooks/use-recent";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SearchResultItem({
  result,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: {
  readonly result: SearchResult;
  readonly isFavorite: boolean;
  readonly onToggleFavorite: (uuid: string) => void;
  readonly onOpen: (uuid: string) => void;
}) {
  const iconMap = {
    dashboard: { source: Icon.AppWindowGrid3x3, tintColor: Color.Blue },
    chart: { source: Icon.LineChart, tintColor: Color.Green },
    explore: { source: Icon.MagnifyingGlass, tintColor: Color.Orange },
  };
  const { source: iconSource, tintColor: iconColor } = iconMap[result.type];

  return (
    <List.Item
      title={result.name}
      subtitle={result.description}
      icon={{ source: iconSource, tintColor: iconColor }}
      accessories={[
        ...(isFavorite ? [{ icon: Icon.Star, tooltip: "Favorite" }] : []),
        ...(result.spaceName ? [{ tag: result.spaceName }] : []),
        ...(result.updatedAt !== undefined && result.views !== undefined
          ? [
              { text: `${result.views} views` },
              {
                date: new Date(result.updatedAt),
                tooltip: `Updated: ${formatDate(result.updatedAt)}`,
              },
            ]
          : []),
      ]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser
            url={result.url}
            onOpen={() => onOpen(result.uuid)}
          />
          <Action.CopyToClipboard title="Copy URL" content={result.url} />
          <Action
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            icon={isFavorite ? Icon.StarDisabled : Icon.Star}
            shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
            onAction={() => onToggleFavorite(result.uuid)}
          />
        </ActionPanel>
      }
    />
  );
}

export default function SearchCommand() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const {
    defaultProjectUuid,
    setDefaultProject,
    isLoading: isLoadingDefault,
  } = useDefaultProject();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || isLoadingDefault || isLoadingProjects) return;
    initializedRef.current = true;
    if (defaultProjectUuid) {
      setSelectedProject(defaultProjectUuid);
    } else if (projects && projects.length > 0) {
      setSelectedProject(projects[0].projectUuid);
    }
  }, [
    defaultProjectUuid,
    projects,
    isLoadingDefault,
    isLoadingProjects,
    setSelectedProject,
  ]);

  const handleProjectChange = useCallback(
    (projectUuid: string) => {
      if (!initializedRef.current) return;
      setSelectedProject(projectUuid);
      setDefaultProject(projectUuid);
    },
    [setDefaultProject],
  );

  const [searchText, setSearchText] = useState("");

  const { data, isLoading: isLoadingSearch } = useLightdashSearch(
    selectedProject || undefined,
  );
  const {
    isFavorite,
    toggleFavorite,
    isLoading: isLoadingFavorites,
  } = useFavorites();
  const { recentUuids, trackOpen, isLoading: isLoadingRecent } = useRecent();

  const filterBySearchText = useCallback(
    (results: readonly SearchResult[]) => {
      if (!searchText) return results;
      const lower = searchText.toLowerCase();
      return results.filter(
        (r) =>
          r.name.toLowerCase().includes(lower) ||
          r.description?.toLowerCase().includes(lower) ||
          r.spaceName?.toLowerCase().includes(lower),
      );
    },
    [searchText],
  );

  const allDashboards = useMemo(
    () => filterBySearchText(data?.dashboards ?? []),
    [data?.dashboards, filterBySearchText],
  );
  const allCharts = useMemo(
    () => filterBySearchText(data?.charts ?? []),
    [data?.charts, filterBySearchText],
  );
  const allExplores = useMemo(
    () => filterBySearchText(data?.explores ?? []),
    [data?.explores, filterBySearchText],
  );
  const allResults = [...allDashboards, ...allCharts, ...allExplores];
  const favorites = allResults.filter((r) => isFavorite(r.uuid));
  const recentItems = recentUuids
    .map((uuid) => allResults.find((r) => r.uuid === uuid))
    .filter((r): r is SearchResult => r !== undefined);
  const pinnedUuids = new Set([
    ...favorites.map((r) => r.uuid),
    ...recentItems.map((r) => r.uuid),
  ]);
  const dashboards = allDashboards.filter((r) => !pinnedUuids.has(r.uuid));
  const charts = allCharts.filter((r) => !pinnedUuids.has(r.uuid));
  const explores = allExplores.filter((r) => !pinnedUuids.has(r.uuid));
  const isLoading =
    isLoadingProjects ||
    isLoadingDefault ||
    isLoadingSearch ||
    isLoadingFavorites ||
    isLoadingRecent;

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search dashboards and charts..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Project"
          value={selectedProject}
          onChange={handleProjectChange}
        >
          {projects?.map((project) => (
            <List.Dropdown.Item
              key={project.projectUuid}
              title={project.name}
              value={project.projectUuid}
            />
          ))}
        </List.Dropdown>
      }
    >
      {recentItems.length > 0 && (
        <List.Section
          key="recent"
          title="Recently Opened"
          subtitle={`${recentItems.length}`}
        >
          {recentItems.map((result) => (
            <SearchResultItem
              key={`recent-${result.uuid}`}
              result={result}
              isFavorite={isFavorite(result.uuid)}
              onToggleFavorite={toggleFavorite}
              onOpen={trackOpen}
            />
          ))}
        </List.Section>
      )}
      {favorites.length > 0 && (
        <List.Section
          key="favorites"
          title="Favorites"
          subtitle={`${favorites.length}`}
        >
          {favorites.map((result) => (
            <SearchResultItem
              key={`fav-${result.uuid}`}
              result={result}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              onOpen={trackOpen}
            />
          ))}
        </List.Section>
      )}
      <List.Section
        key="dashboards"
        title="Dashboards"
        subtitle={`${dashboards.length}`}
      >
        {dashboards.map((result) => (
          <SearchResultItem
            key={result.uuid}
            result={result}
            isFavorite={isFavorite(result.uuid)}
            onToggleFavorite={toggleFavorite}
            onOpen={trackOpen}
          />
        ))}
      </List.Section>
      <List.Section key="charts" title="Charts" subtitle={`${charts.length}`}>
        {charts.map((result) => (
          <SearchResultItem
            key={result.uuid}
            result={result}
            isFavorite={isFavorite(result.uuid)}
            onToggleFavorite={toggleFavorite}
            onOpen={trackOpen}
          />
        ))}
      </List.Section>
      <List.Section
        key="explores"
        title="Explores"
        subtitle={`${explores.length}`}
      >
        {explores.map((result) => (
          <SearchResultItem
            key={result.uuid}
            result={result}
            isFavorite={isFavorite(result.uuid)}
            onToggleFavorite={toggleFavorite}
            onOpen={trackOpen}
          />
        ))}
      </List.Section>
    </List>
  );
}
