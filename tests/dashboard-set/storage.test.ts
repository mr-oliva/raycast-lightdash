import { beforeEach, describe, expect, it } from "vitest";
import {
  LocalStorage,
  __resetLocalStorage,
} from "../__mocks__/raycast-api";
import type { DashboardSet, DashboardSetItem } from "../../src/dashboard-set/types";
import {
  addItemToSet,
  createSet,
  deleteSet,
  getSets,
  getSetUrls,
  removeItemFromSet,
  renameSet,
} from "../../src/dashboard-set/storage";

beforeEach(() => {
  __resetLocalStorage();
});

const sampleItem: DashboardSetItem = {
  uuid: "dash-1",
  name: "Sales Dashboard",
  url: "https://app.lightdash.cloud/projects/p1/dashboards/dash-1",
  type: "dashboard",
};

const sampleItem2: DashboardSetItem = {
  uuid: "chart-1",
  name: "Revenue Chart",
  url: "https://app.lightdash.cloud/projects/p1/saved/chart-1",
  type: "chart",
};

describe("Dashboard Set Storage", () => {
  describe("getSets", () => {
    it("returns empty array when no sets exist", async () => {
      const sets = await getSets();
      expect(sets).toEqual([]);
    });

    it("returns parsed sets from LocalStorage", async () => {
      const stored: DashboardSet[] = [
        { id: "set-1", name: "My Set", items: [sampleItem], createdAt: "2024-01-01T00:00:00Z" },
      ];
      await LocalStorage.setItem("dashboardSets", JSON.stringify(stored));
      const sets = await getSets();
      expect(sets).toEqual(stored);
    });

    it("returns empty array and clears storage on corrupt JSON", async () => {
      await LocalStorage.setItem("dashboardSets", "not-valid-json");
      const sets = await getSets();
      expect(sets).toEqual([]);
      expect(LocalStorage.removeItem).toHaveBeenCalledWith("dashboardSets");
    });
  });

  describe("createSet", () => {
    it("creates a new set with given name and empty items", async () => {
      const set = await createSet("Morning Dashboards");
      expect(set.name).toBe("Morning Dashboards");
      expect(set.items).toEqual([]);
    });

    it("generates a unique id", async () => {
      const set1 = await createSet("Set A");
      const set2 = await createSet("Set B");
      expect(set1.id).toBeTruthy();
      expect(set2.id).toBeTruthy();
      expect(set1.id).not.toBe(set2.id);
    });

    it("records createdAt timestamp", async () => {
      const before = new Date().toISOString();
      const set = await createSet("Test");
      const after = new Date().toISOString();
      expect(set.createdAt >= before).toBe(true);
      expect(set.createdAt <= after).toBe(true);
    });
  });

  describe("deleteSet", () => {
    it("removes a set by id", async () => {
      const set1 = await createSet("Set A");
      await createSet("Set B");
      const remaining = await deleteSet(set1.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].name).toBe("Set B");
    });

    it("does not modify other sets", async () => {
      const set1 = await createSet("Set A");
      const set2 = await createSet("Set B");
      await deleteSet(set1.id);
      const sets = await getSets();
      expect(sets).toHaveLength(1);
      expect(sets[0].id).toBe(set2.id);
    });
  });

  describe("addItemToSet", () => {
    it("adds an item to a set", async () => {
      const set = await createSet("My Set");
      const updated = await addItemToSet(set.id, sampleItem);
      const targetSet = updated.find((s) => s.id === set.id);
      expect(targetSet?.items).toHaveLength(1);
      expect(targetSet?.items[0]).toEqual(sampleItem);
    });

    it("does not add duplicate items (same uuid)", async () => {
      const set = await createSet("My Set");
      await addItemToSet(set.id, sampleItem);
      const updated = await addItemToSet(set.id, sampleItem);
      const targetSet = updated.find((s) => s.id === set.id);
      expect(targetSet?.items).toHaveLength(1);
    });
  });

  describe("removeItemFromSet", () => {
    it("removes an item by uuid", async () => {
      const set = await createSet("My Set");
      await addItemToSet(set.id, sampleItem);
      await addItemToSet(set.id, sampleItem2);
      const updated = await removeItemFromSet(set.id, sampleItem.uuid);
      const targetSet = updated.find((s) => s.id === set.id);
      expect(targetSet?.items).toHaveLength(1);
      expect(targetSet?.items[0].uuid).toBe(sampleItem2.uuid);
    });

    it("handles removal of non-existent item", async () => {
      const set = await createSet("My Set");
      await addItemToSet(set.id, sampleItem);
      const updated = await removeItemFromSet(set.id, "nonexistent");
      const targetSet = updated.find((s) => s.id === set.id);
      expect(targetSet?.items).toHaveLength(1);
    });
  });

  describe("renameSet", () => {
    it("renames a set by id", async () => {
      const set = await createSet("Old Name");
      const updated = await renameSet(set.id, "New Name");
      const targetSet = updated.find((s) => s.id === set.id);
      expect(targetSet?.name).toBe("New Name");
    });

    it("does not modify other sets", async () => {
      const set1 = await createSet("Set A");
      const set2 = await createSet("Set B");
      await renameSet(set1.id, "Set A Renamed");
      const sets = await getSets();
      const unchanged = sets.find((s) => s.id === set2.id);
      expect(unchanged?.name).toBe("Set B");
    });
  });

  describe("getSetUrls", () => {
    it("returns all URLs from a set", () => {
      const set: DashboardSet = {
        id: "set-1",
        name: "Test",
        items: [sampleItem, sampleItem2],
        createdAt: "2024-01-01T00:00:00Z",
      };
      const urls = getSetUrls(set);
      expect(urls).toEqual([sampleItem.url, sampleItem2.url]);
    });

    it("handles empty set", () => {
      const set: DashboardSet = {
        id: "set-1",
        name: "Empty",
        items: [],
        createdAt: "2024-01-01T00:00:00Z",
      };
      const urls = getSetUrls(set);
      expect(urls).toEqual([]);
    });
  });
});
