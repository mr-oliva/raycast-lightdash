import {
  Action,
  ActionPanel,
  Alert,
  Color,
  Form,
  Icon,
  List,
  confirmAlert,
  open,
  useNavigation,
} from "@raycast/api";
import { useCallback, useState } from "react";
import { AddItemsToSetView } from "./add-items-to-set";
import type { DashboardSet } from "./dashboard-set/types";
import { useDashboardSets } from "./hooks/use-dashboard-sets";

function CreateSetForm({
  onCreate,
}: {
  readonly onCreate: (name: string) => void;
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
                onCreate(name.trim());
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

function RenameSetForm({
  set,
  onRename,
}: {
  readonly set: DashboardSet;
  readonly onRename: (id: string, name: string) => void;
}) {
  const { pop } = useNavigation();
  const [name, setName] = useState(set.name);

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Rename"
            onSubmit={() => {
              if (name.trim()) {
                onRename(set.id, name.trim());
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
        value={name}
        onChange={setName}
      />
    </Form>
  );
}

function SetListItem({
  set,
  onDelete,
  onRemoveItem,
  onRename,
}: {
  readonly set: DashboardSet;
  readonly onDelete: (id: string) => void;
  readonly onRemoveItem: (setId: string, itemUuid: string) => void;
  readonly onRename: (id: string, name: string) => void;
}) {
  const handleOpenAll = useCallback(async () => {
    for (const item of set.items) {
      await open(item.url);
    }
  }, [set.items]);

  const handleDelete = useCallback(async () => {
    const confirmed = await confirmAlert({
      title: "Delete Dashboard Set",
      message: `Are you sure you want to delete "${set.name}"?`,
      primaryAction: {
        title: "Delete",
        style: Alert.ActionStyle.Destructive,
      },
    });
    if (confirmed) {
      onDelete(set.id);
    }
  }, [set, onDelete]);

  const typeIconMap = {
    dashboard: { source: Icon.AppWindowGrid3x3, tintColor: Color.Blue },
    chart: { source: Icon.LineChart, tintColor: Color.Green },
    explore: { source: Icon.MagnifyingGlass, tintColor: Color.Orange },
  };

  return (
    <List.Item
      title={set.name}
      subtitle={`${set.items.length} items`}
      icon={Icon.List}
      actions={
        <ActionPanel>
          <Action title="Open All" icon={Icon.Globe} onAction={handleOpenAll} />
          <Action.Push
            title="Add Items"
            icon={Icon.Plus}
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            target={<AddItemsToSetView set={set} />}
          />
          <Action
            title="Delete Set"
            icon={Icon.Trash}
            style={Action.Style.Destructive}
            shortcut={{ modifiers: ["ctrl"], key: "x" }}
            onAction={handleDelete}
          />
          <Action.Push
            title="Rename Set"
            icon={Icon.Pencil}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
            target={<RenameSetForm set={set} onRename={onRename} />}
          />
          {set.items.length > 0 && (
            <ActionPanel.Submenu title="Manage Items" icon={Icon.List}>
              {set.items.map((item) => (
                <Action
                  key={item.uuid}
                  title={`Remove "${item.name}"`}
                  icon={{
                    source: typeIconMap[item.type].source,
                    tintColor: typeIconMap[item.type].tintColor,
                  }}
                  onAction={() => onRemoveItem(set.id, item.uuid)}
                />
              ))}
            </ActionPanel.Submenu>
          )}
        </ActionPanel>
      }
    />
  );
}

export default function OpenDashboardSetCommand() {
  const { sets, create, remove, rename, removeItem, isLoading } =
    useDashboardSets();

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search dashboard sets..."
      actions={
        <ActionPanel>
          <Action.Push
            title="Create New Set"
            icon={Icon.Plus}
            target={<CreateSetForm onCreate={create} />}
          />
        </ActionPanel>
      }
    >
      {sets.length === 0 ? (
        <List.EmptyView
          title="No Dashboard Sets"
          description="Press Enter to create your first set."
          icon={Icon.List}
          actions={
            <ActionPanel>
              <Action.Push
                title="Create New Set"
                icon={Icon.Plus}
                target={<CreateSetForm onCreate={create} />}
              />
            </ActionPanel>
          }
        />
      ) : (
        sets.map((set) => (
          <SetListItem
            key={set.id}
            set={set}
            onDelete={remove}
            onRemoveItem={removeItem}
            onRename={rename}
          />
        ))
      )}
    </List>
  );
}
