import { LocalStorage } from "@raycast/api";
import { randomUUID } from "crypto";
import type { DashboardSet, DashboardSetItem } from "./types";

const STORAGE_KEY = "dashboardSets";

export async function getSets(): Promise<readonly DashboardSet[]> {
  const raw = await LocalStorage.getItem<string>(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as readonly DashboardSet[];
  } catch {
    await LocalStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

async function saveSets(
  sets: readonly DashboardSet[],
): Promise<readonly DashboardSet[]> {
  await LocalStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  return sets;
}

export async function createSet(name: string): Promise<DashboardSet> {
  const sets = await getSets();
  const newSet: DashboardSet = {
    id: randomUUID(),
    name,
    items: [],
    createdAt: new Date().toISOString(),
  };
  await saveSets([...sets, newSet]);
  return newSet;
}

export async function deleteSet(id: string): Promise<readonly DashboardSet[]> {
  const sets = await getSets();
  const filtered = sets.filter((s) => s.id !== id);
  return saveSets(filtered);
}

export async function addItemToSet(
  setId: string,
  item: DashboardSetItem,
): Promise<readonly DashboardSet[]> {
  const sets = await getSets();
  const updated = sets.map((s) => {
    if (s.id !== setId) return s;
    if (s.items.some((i) => i.uuid === item.uuid)) return s;
    return { ...s, items: [...s.items, item] };
  });
  return saveSets(updated);
}

export async function removeItemFromSet(
  setId: string,
  itemUuid: string,
): Promise<readonly DashboardSet[]> {
  const sets = await getSets();
  const updated = sets.map((s) => {
    if (s.id !== setId) return s;
    return { ...s, items: s.items.filter((i) => i.uuid !== itemUuid) };
  });
  return saveSets(updated);
}

export async function renameSet(
  id: string,
  name: string,
): Promise<readonly DashboardSet[]> {
  const sets = await getSets();
  const updated = sets.map((s) => {
    if (s.id !== id) return s;
    return { ...s, name };
  });
  return saveSets(updated);
}

export function getSetUrls(set: DashboardSet): readonly string[] {
  return set.items.map((i) => i.url);
}
