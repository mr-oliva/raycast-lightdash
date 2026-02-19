import { vi } from "vitest";

export const getPreferenceValues = vi.fn(() => ({
  baseUrl: "https://app.lightdash.cloud",
  apiKey: "ldt_test_token_123",
}));

// LocalStorage mock
const store = new Map<string, string>();

export const LocalStorage = {
  getItem: vi.fn(async (key: string) => store.get(key)),
  setItem: vi.fn(async (key: string, value: string) => {
    store.set(key, value);
  }),
  removeItem: vi.fn(async (key: string) => {
    store.delete(key);
  }),
  clear: vi.fn(async () => {
    store.clear();
  }),
};

export function __resetLocalStorage() {
  store.clear();
  LocalStorage.getItem.mockClear();
  LocalStorage.setItem.mockClear();
  LocalStorage.removeItem.mockClear();
  LocalStorage.clear.mockClear();
}

// UI component mocks
export const Icon = {
  AppWindowGrid3x3: "app-window-grid-3x3",
  LineChart: "line-chart",
  MagnifyingGlass: "magnifying-glass",
  Star: "star",
  StarDisabled: "star-disabled",
  PlusSquare: "plus-square",
  Plus: "plus",
  Trash: "trash",
  ArrowUp: "arrow-up",
  ArrowDown: "arrow-down",
  Clock: "clock",
  Eye: "eye",
  TextCursor: "text-cursor",
  Pencil: "pencil",
  Globe: "globe",
  Link: "link",
  List: "list",
};

export const Color = {
  Blue: "blue",
  Green: "green",
  Orange: "orange",
  Red: "red",
  Purple: "purple",
  Yellow: "yellow",
};

export const List = {};
export const Action = {};
export const ActionPanel = {};
