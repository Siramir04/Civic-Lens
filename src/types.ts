
export type Sector = "security" | "health" | "education" | "agriculture" | "economy" | "infrastructure" | "governance" | "cost_of_living";

export interface NewsItem {
  headline: string;
  summary: string;
  sector: Sector;
  source_name: string;
  source_url: string | null;
  published_at: string | null;
  ai_generated: boolean;
  confidence: "high" | "medium" | "low";
}

export interface SectorScore {
  score: number;
  national_percentile: number;
  source_tier: number;
  data_age_days: number;
  is_estimated?: boolean;
  estimate_data?: AIEstimate;
}

export interface AIEstimate {
  state: string;
  sector: Sector;
  estimated_score: number;
  cannot_estimate: boolean;
  cannot_estimate_reason: string | null;
  drift_from_last_known: number;
  drift_justified: boolean;
  reasoning: {
    anchor: string;
    regional_signal: string;
    grounding_findings: string;
    factors_considered: {
      factor: string;
      direction: "up" | "down" | "neutral";
      weight: "high" | "medium" | "low";
    }[];
    final_logic: string;
  };
  confidence: "low" | "very_low";
  grounding_sources: {
    title: string;
    url: string | null;
    relevance: string;
  }[];
  expires_at: string;
  generated_at: string;
  is_estimated: true;
}

export interface HistoricalScore {
  score_30d_ago: number;
  score_90d_ago: number;
}

export interface StateAnalysis {
  stateName: string;
  overall_score: number;
  national_rank: number;
  verdict: string;
  scores: Record<Sector, SectorScore>;
  biggest_driver: {
    sector: Sector;
    direction: "improving" | "declining" | "stable";
    one_line: string;
  };
  sector_insights: {
    sector: Sector;
    trend: "improving" | "declining" | "stable";
    insight: string;
    stale: boolean;
  }[];
  watch_list: Sector[];
  bright_spots: Sector[];
  confidence_rating: "high" | "medium" | "low";
  stale_sectors: Sector[];
  generated_at: string;
}

export interface SourceValidation {
  source_name: string;
  source_url: string;
  url_accessible: boolean;
  recommended_tier: 1 | 2 | 3;
  verdict: "approve" | "approve_with_conditions" | "reject";
  verdict_summary: string;
  criteria_scores: {
    [key: string]: { score: number; finding: string };
  };
  total_score: number;
  tier_thresholds: {
    tier_1_minimum: number;
    tier_2_minimum: number;
    tier_3_minimum: number;
  };
  bias_downgrade_applied: boolean;
  conditions: string[];
  disqualifying_flags: string[];
  suggested_sectors: string[];
  suggested_refresh_rate: string;
  grounding_sources: {
    title: string;
    url: string;
    used_for: string;
  }[];
  requires_human_review: boolean;
  generated_at: string;
}
