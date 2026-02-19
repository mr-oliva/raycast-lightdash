import {
  Action,
  ActionPanel,
  Color,
  getPreferenceValues,
  Icon,
  List,
} from "@raycast/api";
import { useState } from "react";
import type { SearchResult } from "./api/types";
import { useLightdashSearch, useProjects } from "./hooks/use-lightdash";

interface Preferences {
  readonly defaultProjectUuid?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SearchResultItem({ result }: { readonly result: SearchResult }) {
  const icon =
    result.type === "dashboard" ? Icon.AppWindowGrid3x3 : Icon.LineChart;
  const iconColor = result.type === "dashboard" ? Color.Blue : Color.Green;

  return (
    <List.Item
      title={result.name}
      subtitle={result.description}
      icon={{ source: icon, tintColor: iconColor }}
      accessories={[
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
        </ActionPanel>
      }
    />
  );
}

export default function SearchCommand() {
  const { defaultProjectUuid } = getPreferenceValues<Preferences>();
  const [selectedProject, setSelectedProject] = useState<string>(
    defaultProjectUuid ?? "",
  );
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data, isLoading: isLoadingSearch } = useLightdashSearch(
    selectedProject || undefined,
  );

  const dashboards = data?.dashboards ?? [];
  const charts = data?.charts ?? [];
  const isLoading = isLoadingProjects || isLoadingSearch;

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search dashboards and charts..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Select Project"
          value={selectedProject}
          onChange={setSelectedProject}
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
      <List.Section title="Dashboards" subtitle={`${dashboards.length}`}>
        {dashboards.map((result) => (
          <SearchResultItem key={result.uuid} result={result} />
        ))}
      </List.Section>
      <List.Section title="Charts" subtitle={`${charts.length}`}>
        {charts.map((result) => (
          <SearchResultItem key={result.uuid} result={result} />
        ))}
      </List.Section>
    </List>
  );
}
