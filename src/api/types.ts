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

export interface LightdashSpace {
  readonly uuid: string;
  readonly name: string;
}

export interface LightdashExplore {
  readonly name: string;
  readonly label: string;
  readonly description?: string;
  readonly groupLabel?: string;
  readonly tags?: readonly string[];
}

export interface LightdashMetricQuery {
  readonly exploreName: string;
  readonly dimensions: readonly string[];
  readonly metrics: readonly string[];
}

export interface LightdashChartConfig {
  readonly type: string;
}

export interface LightdashSavedChart {
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly tableName: string;
  readonly metricQuery: LightdashMetricQuery;
  readonly chartConfig: LightdashChartConfig;
  readonly spaceName: string;
  readonly updatedAt: string;
}

export interface LightdashApiResponse<T> {
  readonly status: string;
  readonly results: T;
}

export interface Preferences {
  readonly baseUrl: string;
  readonly apiKey: string;
}

export interface SearchResult {
  readonly type: "dashboard" | "chart" | "explore";
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly spaceName?: string;
  readonly updatedAt?: string;
  readonly views?: number;
  readonly url: string;
}
