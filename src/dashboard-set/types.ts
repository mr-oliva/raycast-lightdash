export interface DashboardSetItem {
  readonly uuid: string;
  readonly name: string;
  readonly url: string;
  readonly type: "dashboard" | "chart" | "explore";
}

export interface DashboardSet {
  readonly id: string;
  readonly name: string;
  readonly items: readonly DashboardSetItem[];
  readonly createdAt: string;
}
