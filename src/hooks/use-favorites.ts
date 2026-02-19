import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useCallback } from "react";

const FAVORITES_KEY = "favorites";

async function getFavoriteIds(): Promise<readonly string[]> {
  const raw = await LocalStorage.getItem<string>(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as readonly string[];
  } catch {
    await LocalStorage.removeItem(FAVORITES_KEY);
    return [];
  }
}

async function setFavoriteIds(ids: readonly string[]): Promise<void> {
  await LocalStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function useFavorites() {
  const { data, revalidate, isLoading } = useCachedPromise(getFavoriteIds, [], {
    keepPreviousData: true,
  });

  const favoriteIds = data ?? [];

  const isFavorite = useCallback(
    (uuid: string) => favoriteIds.includes(uuid),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (uuid: string) => {
      const updated = isFavorite(uuid)
        ? favoriteIds.filter((id) => id !== uuid)
        : [...favoriteIds, uuid];
      await setFavoriteIds(updated);
      revalidate();
    },
    [favoriteIds, isFavorite, revalidate],
  );

  return { favoriteIds, isFavorite, toggleFavorite, isLoading };
}
