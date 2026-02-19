import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useCallback } from "react";

const RECENT_KEY = "recentlyOpened";
const MAX_RECENT = 10;

interface RecentEntry {
  readonly uuid: string;
  readonly openedAt: string;
}

async function getRecentEntries(): Promise<readonly RecentEntry[]> {
  const raw = await LocalStorage.getItem<string>(RECENT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as readonly RecentEntry[];
  } catch {
    await LocalStorage.removeItem(RECENT_KEY);
    return [];
  }
}

async function saveRecentEntries(
  entries: readonly RecentEntry[],
): Promise<void> {
  await LocalStorage.setItem(RECENT_KEY, JSON.stringify(entries));
}

export function useRecent() {
  const { data, revalidate, isLoading } = useCachedPromise(
    getRecentEntries,
    [],
    { keepPreviousData: true },
  );

  const recentEntries = data ?? [];
  const recentUuids = recentEntries.map((e) => e.uuid);

  const trackOpen = useCallback(
    async (uuid: string) => {
      const filtered = recentEntries.filter((e) => e.uuid !== uuid);
      const updated = [
        { uuid, openedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT);
      await saveRecentEntries(updated);
      revalidate();
    },
    [recentEntries, revalidate],
  );

  return { recentUuids, trackOpen, isLoading };
}
