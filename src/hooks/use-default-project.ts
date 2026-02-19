import { LocalStorage } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";

const DEFAULT_PROJECT_KEY = "defaultProjectUuid";

export function useDefaultProject() {
  const [defaultProjectUuid, setDefaultProjectUuid] = useState<
    string | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    LocalStorage.getItem<string>(DEFAULT_PROJECT_KEY).then((value) => {
      setDefaultProjectUuid(value);
      setIsLoading(false);
    });
  }, []);

  const setDefaultProject = useCallback(async (projectUuid: string) => {
    await LocalStorage.setItem(DEFAULT_PROJECT_KEY, projectUuid);
    setDefaultProjectUuid(projectUuid);
  }, []);

  return {
    defaultProjectUuid,
    setDefaultProject,
    isLoading,
  };
}
