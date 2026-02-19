import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useEffect, useState } from "react";
import type { SearchResult } from "./api/types";
import { useDefaultProject } from "./hooks/use-default-project";
import { useFavorites } from "./hooks/use-favorites";
import { useLightdashSearch, useProjects } from "./hooks/use-lightdash";

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
}: {
  readonly result: SearchResult;
  readonly isFavorite: boolean;
  readonly onToggleFavorite: (uuid: string) => void;
}) {
  const icon =
    result.type === "dashboard" ? Icon.AppWindowGrid3x3 : Icon.LineChart;
  const iconColor = result.type === "dashboard" ? Color.Blue : Color.Green;

  return (
    <List.Item
      title={result.name}
      subtitle={result.description}
      icon={{ source: icon, tintColor: iconColor }}
      accessories={[
        ...(isFavorite ? [{ icon: Icon.Star, tooltip: "Favorite" }] : []),
        ...(result.spaceName ? [{ tag: result.spaceName }] : []),
        { text: `${result.views} views` },
        {
          date: new Date(result.updatedAt),
          tooltip: `Updated: ${formatDate(result.updatedAt)}`,
        },
      ]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={result.url} />
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

  const dashboards = data?.dashboards ?? [];
  const charts = data?.charts ?? [];
  const allResults = [...dashboards, ...charts];
  const favorites = allResults.filter((r) => isFavorite(r.uuid));
  const isLoading =
    isLoadingProjects ||
    isLoadingDefault ||
    isLoadingSearch ||
    isLoadingFavorites;

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
      {favorites.length > 0 && (
        <List.Section title="Favorites" subtitle={`${favorites.length}`}>
          {favorites.map((result) => (
            <SearchResultItem
              key={`fav-${result.uuid}`}
              result={result}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
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
          />
        ))}
      </List.Section>
    </List>
  );
}
