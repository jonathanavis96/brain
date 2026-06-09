import type { InferSelectModel } from "drizzle-orm";
import type {
  leads,
  messages,
  templates,
  events,
  runs,
  metricSnapshots,
  partners,
} from "@/db/schema";

export type Lead = InferSelectModel<typeof leads>;
export type Message = InferSelectModel<typeof messages>;
export type Template = InferSelectModel<typeof templates>;
export type Event = InferSelectModel<typeof events>;
export type Run = InferSelectModel<typeof runs>;
export type MetricSnapshot = InferSelectModel<typeof metricSnapshots>;
export type Partner = InferSelectModel<typeof partners>;

// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalLeads: number;
  contacted: number;
  replied: number;
  booked: number;
  closed: number;
  nurture: number;
  avgScore: number;
  recentActivity: Event[];
}

// Scoring rule factor from JSON
export interface ScoringFactor {
  name: string;
  weight: number;
  description: string;
  levels: Record<string, number>;
}

export interface ScoringRules {
  version: number;
  maxScore: number;
  factors: ScoringFactor[];
}
