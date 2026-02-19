import type { SearchResult } from "../api/types";

export type SortMode =
  | "name-asc"
  | "name-desc"
  | "updated-desc"
  | "updated-asc"
  | "views-desc"
  | "views-asc";

export const DEFAULT_SORT_MODE: SortMode = "name-asc";

type CompareFn = (a: SearchResult, b: SearchResult) => number;

function compareByName(a: SearchResult, b: SearchResult): number {
  return a.name.localeCompare(b.name);
}

function withUndefinedLast<K extends keyof SearchResult>(
  key: K,
  fn: CompareFn,
): CompareFn {
  return (a, b) => {
    const aHas = a[key] !== undefined;
    const bHas = b[key] !== undefined;
    if (!aHas && !bHas) return 0;
    if (!aHas) return 1;
    if (!bHas) return -1;
    return fn(a, b);
  };
}

function compareByUpdatedAtAsc(a: SearchResult, b: SearchResult): number {
  return new Date(a.updatedAt!).getTime() - new Date(b.updatedAt!).getTime();
}

function compareByViewsAsc(a: SearchResult, b: SearchResult): number {
  return a.views! - b.views!;
}

const comparators: Record<SortMode, CompareFn> = {
  "name-asc": compareByName,
  "name-desc": (a, b) => compareByName(b, a),
  "updated-asc": withUndefinedLast("updatedAt", compareByUpdatedAtAsc),
  "updated-desc": withUndefinedLast("updatedAt", (a, b) =>
    compareByUpdatedAtAsc(b, a),
  ),
  "views-asc": withUndefinedLast("views", compareByViewsAsc),
  "views-desc": withUndefinedLast("views", (a, b) => compareByViewsAsc(b, a)),
};

export function sortSearchResults(
  results: readonly SearchResult[],
  mode: SortMode,
): readonly SearchResult[] {
  return [...results].sort(comparators[mode]);
}
