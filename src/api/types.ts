export interface LightdashProject {
  readonly projectUuid: string;
  readonly name: string;
}

export interface LightdashDashboard {
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly spaceUuid: string;
  readonly spaceName?: string;
  readonly updatedAt: string;
  readonly views: number;
}

export interface LightdashChart {
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly spaceUuid: string;
  readonly spaceName?: string;
  readonly chartKind?: string;
  readonly updatedAt: string;
  readonly views: number;
}

export interface LightdashApiResponse<T> {
  readonly status: string;
  readonly results: T;
}

export interface SearchResult {
  readonly type: "dashboard" | "chart";
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly spaceName?: string;
  readonly updatedAt: string;
  readonly views: number;
  readonly url: string;
}
