import {
  Action,
  ActionPanel,
  Color,
  Icon,
  List,
  showToast,
  Toast,
} from "@raycast/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SearchResult } from "./api/types";
import type { DashboardSet, DashboardSetItem } from "./dashboard-set/types";
import { useDashboardSets } from "./hooks/use-dashboard-sets";
import { useDefaultProject } from "./hooks/use-default-project";
import { useLightdashSearch, useProjects } from "./hooks/use-lightdash";

const TYPE_ICONS = {
  dashboard: { source: Icon.AppWindowGrid3x3, tintColor: Color.Blue },
  chart: { source: Icon.LineChart, tintColor: Color.Green },
  explore: { source: Icon.MagnifyingGlass, tintColor: Color.Orange },
};

function toSetItem(result: SearchResult): DashboardSetItem {
  return {
    uuid: result.uuid,
    name: result.name,
    url: result.url,
    type: result.type,
  };
}

export function AddItemsToSetView({
  set,
}: {
  readonly set: DashboardSet;
}) {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { defaultProjectUuid, isLoading: isLoadingDefault } =
    useDefaultProject();
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
  }, [defaultProjectUuid, projects, isLoadingDefault, isLoadingProjects]);

  const handleProjectChange = useCallback(
    (value: string) => {
      if (!initializedRef.current) return;
      setSelectedProject(value);
    },
    [],
  );

  const { data, isLoading: isLoadingSearch } = useLightdashSearch(
    selectedProject || undefined,
  );

  const { sets, addItem, removeItem } = useDashboardSets();
  const currentSet = sets.find((s) => s.id === set.id);
  const addedUuids = useMemo(
    () => new Set((currentSet ?? set).items.map((i) => i.uuid)),
    [currentSet, set],
  );

  const handleToggle = useCallback(
    async (result: SearchResult) => {
      if (addedUuids.has(result.uuid)) {
        await removeItem(set.id, result.uuid);
        await showToast({
          style: Toast.Style.Success,
          title: `Removed "${result.name}"`,
        });
      } else {
        await addItem(set.id, toSetItem(result));
        await showToast({
          style: Toast.Style.Success,
          title: `Added "${result.name}"`,
        });
      }
    },
    [set.id, addedUuids, addItem, removeItem],
  );

  const allResults = useMemo(() => {
    const dashboards = data?.dashboards ?? [];
    const charts = data?.charts ?? [];
    return [...dashboards, ...charts];
  }, [data]);

  const isLoading = isLoadingProjects || isLoadingDefault || isLoadingSearch;

  return (
    <List
      isLoading={isLoading}
      navigationTitle={`Add Items to "${set.name}"`}
      searchBarPlaceholder="Search dashboards and charts to add..."
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
      {allResults.map((result) => {
        const isAdded = addedUuids.has(result.uuid);
        const { source, tintColor } = TYPE_ICONS[result.type];
        return (
          <List.Item
            key={result.uuid}
            title={result.name}
            subtitle={result.description}
            icon={{ source, tintColor }}
            accessories={[
              ...(result.spaceName ? [{ tag: result.spaceName }] : []),
              ...(isAdded
                ? [{ icon: { source: Icon.Checkmark, tintColor: Color.Green }, tooltip: "In set" }]
                : []),
            ]}
            actions={
              <ActionPanel>
                <Action
                  title={isAdded ? "Remove from Set" : "Add to Set"}
                  icon={isAdded ? Icon.Minus : Icon.Plus}
                  onAction={() => handleToggle(result)}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
