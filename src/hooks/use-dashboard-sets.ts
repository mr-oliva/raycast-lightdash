import { useCachedPromise } from "@raycast/utils";
import { useCallback } from "react";
import {
  addItemToSet,
  createSet,
  deleteSet,
  getSets,
  removeItemFromSet,
  renameSet,
} from "../dashboard-set/storage";
import type { DashboardSetItem } from "../dashboard-set/types";

export function useDashboardSets() {
  const { data, revalidate, isLoading } = useCachedPromise(getSets, [], {
    keepPreviousData: true,
  });

  const sets = data ?? [];

  const create = useCallback(
    async (name: string) => {
      await createSet(name);
      revalidate();
    },
    [revalidate],
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteSet(id);
      revalidate();
    },
    [revalidate],
  );

  const addItem = useCallback(
    async (setId: string, item: DashboardSetItem) => {
      await addItemToSet(setId, item);
      revalidate();
    },
    [revalidate],
  );

  const removeItem = useCallback(
    async (setId: string, itemUuid: string) => {
      await removeItemFromSet(setId, itemUuid);
      revalidate();
    },
    [revalidate],
  );

  const createAndAddItem = useCallback(
    async (name: string, item: DashboardSetItem) => {
      const newSet = await createSet(name);
      await addItemToSet(newSet.id, item);
      revalidate();
      return newSet;
    },
    [revalidate],
  );

  const rename = useCallback(
    async (id: string, name: string) => {
      await renameSet(id, name);
      revalidate();
    },
    [revalidate],
  );

  return {
    sets,
    create,
    remove,
    rename,
    addItem,
    createAndAddItem,
    removeItem,
    isLoading,
  };
}
