import { vi } from "vitest";

export const getPreferenceValues = vi.fn(() => ({
  baseUrl: "https://app.lightdash.cloud",
  apiKey: "ldt_test_token_123",
  defaultProjectUuid: "project-uuid-123",
}));
