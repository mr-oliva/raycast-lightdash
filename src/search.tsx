import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
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
        ...(result.type !== "explore"
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
          <Action.CopyToClipboard
            title="Copy as Markdown Link"
            content={`[${result.name}](${result.url})`}
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
          />
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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || isLoadingDefault || isLoadingProjects) return;
    if (defaultProjectUuid) {
      setSelectedProject(defaultProjectUuid);
    } else if (projects && projects.length > 0) {
      setSelectedProject(projects[0].projectUuid);
    }
    setInitialized(true);
  }, [
    defaultProjectUuid,
    projects,
    isLoadingDefault,
    isLoadingProjects,
    initialized,
  ]);

  const handleProjectChange = (projectUuid: string) => {
    setSelectedProject(projectUuid);
    setDefaultProject(projectUuid);
  };

  const { data, isLoading: isLoadingSearch } = useLightdashSearch(
    selectedProject || undefined,
  );
  const {
    isFavorite,
    toggleFavorite,
    isLoading: isLoadingFavorites,
  } = useFavorites();
  const { recentUuids, trackOpen, isLoading: isLoadingRecent } = useRecent();

  const dashboards = data?.dashboards ?? [];
  const charts = data?.charts ?? [];
  const explores = data?.explores ?? [];
  const allResults = [...dashboards, ...charts, ...explores];
  const favorites = allResults.filter((r) => isFavorite(r.uuid));
  const recentItems = recentUuids
    .map((uuid) => allResults.find((r) => r.uuid === uuid))
    .filter((r): r is SearchResult => r !== undefined);
  const isLoading =
    isLoadingProjects ||
    isLoadingDefault ||
    isLoadingSearch ||
    isLoadingFavorites ||
    isLoadingRecent;

  return (
    <List
      isLoading={isLoading}
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
        <List.Section title="Favorites" subtitle={`${favorites.length}`}>
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
      <List.Section title="Dashboards" subtitle={`${dashboards.length}`}>
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
      <List.Section title="Charts" subtitle={`${charts.length}`}>
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
      <List.Section title="Explores" subtitle={`${explores.length}`}>
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
