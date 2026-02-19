import { LocalStorage } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useCallback } from "react";

const DEFAULT_PROJECT_KEY = "defaultProjectUuid";

async function getDefaultProjectUuid(): Promise<string | undefined> {
  return LocalStorage.getItem<string>(DEFAULT_PROJECT_KEY);
}

export function useDefaultProject() {
  const { data, revalidate, isLoading } = useCachedPromise(
    getDefaultProjectUuid,
    [],
    { keepPreviousData: true },
  );

  const setDefaultProject = useCallback(
    async (projectUuid: string) => {
      await LocalStorage.setItem(DEFAULT_PROJECT_KEY, projectUuid);
      revalidate();
    },
    [revalidate],
  );

  return {
    defaultProjectUuid: data,
    setDefaultProject,
    isLoading,
  };
}
