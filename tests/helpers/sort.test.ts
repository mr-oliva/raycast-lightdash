import { describe, expect, it } from "vitest";
import type { SearchResult } from "../../src/api/types";
import { sortSearchResults } from "../../src/helpers/sort";

function makeResult(
  overrides: Partial<SearchResult> & { readonly name: string },
): SearchResult {
  return {
    type: "dashboard",
    uuid: overrides.name.toLowerCase().replace(/\s/g, "-"),
    url: `https://example.com/${overrides.name}`,
    ...overrides,
  };
}

describe("sortSearchResults", () => {
  const alpha = makeResult({ name: "Alpha", updatedAt: "2024-01-01T00:00:00Z", views: 10 });
  const bravo = makeResult({ name: "Bravo", updatedAt: "2024-06-01T00:00:00Z", views: 50 });
  const charlie = makeResult({ name: "Charlie", updatedAt: "2024-03-01T00:00:00Z", views: 30 });

  it("sorts by name ascending (A-Z)", () => {
    const sorted = sortSearchResults([charlie, alpha, bravo], "name-asc");
    expect(sorted.map((r) => r.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
  });

  it("sorts by name descending (Z-A)", () => {
    const sorted = sortSearchResults([alpha, bravo, charlie], "name-desc");
    expect(sorted.map((r) => r.name)).toEqual(["Charlie", "Bravo", "Alpha"]);
  });

  it("sorts by updatedAt descending (newest first)", () => {
    const sorted = sortSearchResults([alpha, charlie, bravo], "updated-desc");
    expect(sorted.map((r) => r.name)).toEqual(["Bravo", "Charlie", "Alpha"]);
  });

  it("sorts by updatedAt ascending (oldest first)", () => {
    const sorted = sortSearchResults([bravo, charlie, alpha], "updated-asc");
    expect(sorted.map((r) => r.name)).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("sorts by views descending (most viewed first)", () => {
    const sorted = sortSearchResults([alpha, charlie, bravo], "views-desc");
    expect(sorted.map((r) => r.name)).toEqual(["Bravo", "Charlie", "Alpha"]);
  });

  it("sorts by views ascending (least viewed first)", () => {
    const sorted = sortSearchResults([bravo, charlie, alpha], "views-asc");
    expect(sorted.map((r) => r.name)).toEqual(["Alpha", "Charlie", "Bravo"]);
  });

  it("places items without updatedAt at the end when sorting by updatedAt descending", () => {
    const noDate = makeResult({ name: "NoDate", type: "explore" });
    const sorted = sortSearchResults([noDate, alpha, bravo], "updated-desc");
    expect(sorted.map((r) => r.name)).toEqual(["Bravo", "Alpha", "NoDate"]);
  });

  it("places items without updatedAt at the end when sorting by updatedAt ascending", () => {
    const noDate = makeResult({ name: "NoDate", type: "explore" });
    const sorted = sortSearchResults([noDate, bravo, alpha], "updated-asc");
    expect(sorted.map((r) => r.name)).toEqual(["Alpha", "Bravo", "NoDate"]);
  });

  it("places items without views at the end when sorting by views descending", () => {
    const noViews = makeResult({ name: "NoViews", type: "explore" });
    const sorted = sortSearchResults([noViews, alpha, bravo], "views-desc");
    expect(sorted.map((r) => r.name)).toEqual(["Bravo", "Alpha", "NoViews"]);
  });

  it("places items without views at the end when sorting by views ascending", () => {
    const noViews = makeResult({ name: "NoViews", type: "explore" });
    const sorted = sortSearchResults([noViews, bravo, alpha], "views-asc");
    expect(sorted.map((r) => r.name)).toEqual(["Alpha", "Bravo", "NoViews"]);
  });

  it("returns a new array without mutating the input", () => {
    const input = [charlie, alpha, bravo];
    const inputCopy = [...input];
    const sorted = sortSearchResults(input, "name-asc");
    expect(input).toEqual(inputCopy);
    expect(sorted).not.toBe(input);
  });

  it("handles empty array", () => {
    const sorted = sortSearchResults([], "name-asc");
    expect(sorted).toEqual([]);
  });
});
