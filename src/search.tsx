import {
  Action,
  ActionPanel,
  Color,
  Form,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchResult } from "./api/types";
import { ChartDetailView } from "./chart-detail";
import type { DashboardSet, DashboardSetItem } from "./dashboard-set/types";
import {
  type SortMode,
  DEFAULT_SORT_MODE,
  sortSearchResults,
} from "./helpers/sort";
import { useDashboardSets } from "./hooks/use-dashboard-sets";
import { useDefaultProject } from "./hooks/use-default-project";
import { useFavorites } from "./hooks/use-favorites";
import { useLightdashSearch, useProjects } from "./hooks/use-lightdash";
import { useRecent } from "./hooks/use-recent";

const SORT_OPTIONS: readonly {
  readonly mode: SortMode;
  readonly title: string;
  readonly icon: typeof Icon.TextCursor;
}[] = [
  { mode: "name-asc", title: "Name (A-Z)", icon: Icon.TextCursor },
  { mode: "name-desc", title: "Name (Z-A)", icon: Icon.TextCursor },
  { mode: "updated-desc", title: "Recently Updated", icon: Icon.Clock },
  { mode: "updated-asc", title: "Least Recently Updated", icon: Icon.Clock },
  { mode: "views-desc", title: "Most Viewed", icon: Icon.Eye },
  { mode: "views-asc", title: "Least Viewed", icon: Icon.Eye },
];

function CreateSetForm({
  onCreateAndAdd,
}: {
  readonly onCreateAndAdd: (name: string) => void;
}) {
  const { pop } = useNavigation();
  const [name, setName] = useState("");

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Create Set"
            onSubmit={() => {
              if (name.trim()) {
                onCreateAndAdd(name.trim());
                pop();
              }
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="name"
        title="Set Name"
        placeholder="e.g. Morning Dashboards"
        value={name}
        onChange={setName}
      />
    </Form>
  );
}

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
  sortMode,
  onSortChange,
  dashboardSets,
  onAddToSet,
  onCreateSetAndAdd,
}: {
  readonly result: SearchResult;
  readonly isFavorite: boolean;
  readonly onToggleFavorite: (uuid: string) => void;
  readonly onOpen: (uuid: string) => void;
  readonly sortMode: SortMode;
  readonly onSortChange: (mode: SortMode) => void;
  readonly dashboardSets: readonly DashboardSet[];
  readonly onAddToSet: (setId: string, item: DashboardSetItem) => void;
  readonly onCreateSetAndAdd: (name: string, item: DashboardSetItem) => void;
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
          {result.type === "chart" && (
            <Action.Push
              title="Quick Look"
              icon={Icon.Eye}
              shortcut={{ modifiers: ["cmd"], key: "l" }}
              target={
                <ChartDetailView
                  chartUuid={result.uuid}
                  chartUrl={result.url}
                />
              }
            />
          )}
          <Action.CopyToClipboard title="Copy URL" content={result.url} />
          <Action
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            icon={isFavorite ? Icon.StarDisabled : Icon.Star}
            shortcut={{ modifiers: ["cmd", "shift"], key: "f" }}
            onAction={() => onToggleFavorite(result.uuid)}
          />
          <ActionPanel.Submenu
            title="Add to Set"
            icon={Icon.PlusSquare}
            shortcut={{ modifiers: ["cmd", "shift"], key: "a" }}
          >
            {dashboardSets.map((set) => (
              <Action
                key={set.id}
                title={set.name}
                onAction={() =>
                  onAddToSet(set.id, {
                    uuid: result.uuid,
                    name: result.name,
                    url: result.url,
                    type: result.type,
                  })
                }
              />
            ))}
            <Action.Push
              title="Create New Set…"
              icon={Icon.Plus}
              target={
                <CreateSetForm
                  onCreateAndAdd={(name) =>
                    onCreateSetAndAdd(name, {
                      uuid: result.uuid,
                      name: result.name,
                      url: result.url,
                      type: result.type,
                    })
                  }
                />
              }
            />
          </ActionPanel.Submenu>
          <ActionPanel.Submenu
            title="Sort By"
            icon={Icon.ArrowUp}
            shortcut={{ modifiers: ["cmd", "shift"], key: "s" }}
          >
            {SORT_OPTIONS.map((option) => (
              <Action
                key={option.mode}
                title={option.title}
                icon={sortMode === option.mode ? Icon.Star : option.icon}
                onAction={() => onSortChange(option.mode)}
              />
            ))}
          </ActionPanel.Submenu>
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

  const handleDropdownChange = useCallback(
    (value: string) => {
      if (!initializedRef.current) return;
      if (value.startsWith("space:")) {
        setSelectedSpace(value.slice("space:".length));
      } else {
        setSelectedProject(value);
        setDefaultProject(value);
        setSelectedSpace("");
      }
    },
    [setDefaultProject],
  );

  const [searchText, setSearchText] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>(DEFAULT_SORT_MODE);
  const [selectedSpace, setSelectedSpace] = useState<string>("");

  const { data, isLoading: isLoadingSearch } = useLightdashSearch(
    selectedProject || undefined,
  );

  const spaces = data?.spaces ?? [];
  const {
    isFavorite,
    toggleFavorite,
    isLoading: isLoadingFavorites,
  } = useFavorites();
  const { recentUuids, trackOpen, isLoading: isLoadingRecent } = useRecent();
  const {
    sets: dashboardSets,
    addItem: addItemToDashboardSet,
    createAndAddItem,
    isLoading: isLoadingSets,
  } = useDashboardSets();

  const handleAddToSet = useCallback(
    async (setId: string, item: DashboardSetItem) => {
      await addItemToDashboardSet(setId, item);
      await showToast({ style: Toast.Style.Success, title: "Added to set" });
    },
    [addItemToDashboardSet],
  );

  const handleCreateSetAndAdd = useCallback(
    async (name: string, item: DashboardSetItem) => {
      await createAndAddItem(name, item);
      await showToast({
        style: Toast.Style.Success,
        title: `Created "${name}" and added item`,
      });
    },
    [createAndAddItem],
  );

  const filterResults = useCallback(
    (results: readonly SearchResult[]) => {
      let filtered = results;
      if (selectedSpace) {
        filtered = filtered.filter((r) => r.spaceName === selectedSpace);
      }
      if (searchText) {
        const lower = searchText.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(lower) ||
            r.description?.toLowerCase().includes(lower) ||
            r.spaceName?.toLowerCase().includes(lower),
        );
      }
      return filtered;
    },
    [searchText, selectedSpace],
  );

  const allDashboards = useMemo(
    () =>
      sortSearchResults(filterResults(data?.dashboards ?? []), sortMode),
    [data?.dashboards, filterResults, sortMode],
  );
  const allCharts = useMemo(
    () => sortSearchResults(filterResults(data?.charts ?? []), sortMode),
    [data?.charts, filterResults, sortMode],
  );
  const allExplores = useMemo(
    () => sortSearchResults(filterResults(data?.explores ?? []), sortMode),
    [data?.explores, filterResults, sortMode],
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
    isLoadingRecent ||
    isLoadingSets;

  return (
    <List
      isLoading={isLoading}
      filtering={false}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search dashboards and charts..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Project / Space"
          value={selectedSpace ? `space:${selectedSpace}` : selectedProject}
          onChange={handleDropdownChange}
        >
          <List.Dropdown.Section title="Projects">
            {projects?.map((project) => (
              <List.Dropdown.Item
                key={project.projectUuid}
                title={project.name}
                value={project.projectUuid}
              />
            ))}
          </List.Dropdown.Section>
          {spaces.length > 0 && (
            <List.Dropdown.Section title="Spaces">
              {spaces.map((space) => (
                <List.Dropdown.Item
                  key={space.uuid}
                  title={space.name}
                  value={`space:${space.name}`}
                />
              ))}
            </List.Dropdown.Section>
          )}
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
              sortMode={sortMode}
              onSortChange={setSortMode}
              dashboardSets={dashboardSets}
              onAddToSet={handleAddToSet}
              onCreateSetAndAdd={handleCreateSetAndAdd}
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
              sortMode={sortMode}
              onSortChange={setSortMode}
              dashboardSets={dashboardSets}
              onAddToSet={handleAddToSet}
              onCreateSetAndAdd={handleCreateSetAndAdd}
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
            sortMode={sortMode}
            onSortChange={setSortMode}
            dashboardSets={dashboardSets}
            onAddToSet={handleAddToSet}
            onCreateSetAndAdd={handleCreateSetAndAdd}
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
            sortMode={sortMode}
            onSortChange={setSortMode}
            dashboardSets={dashboardSets}
            onAddToSet={handleAddToSet}
            onCreateSetAndAdd={handleCreateSetAndAdd}
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
            sortMode={sortMode}
            onSortChange={setSortMode}
            dashboardSets={dashboardSets}
            onAddToSet={handleAddToSet}
            onCreateSetAndAdd={handleCreateSetAndAdd}
          />
        ))}
      </List.Section>
    </List>
  );
}
