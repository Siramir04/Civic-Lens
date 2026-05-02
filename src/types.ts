
export type Sector = "security" | "education" | "healthcare" | "agriculture" | "infrastructure" | "cost_of_living" | "governance" | "environment";

export type DataQualityFlag = "current" | "stale_12_24mo" | "stale_24mo_plus" | "partial" | "unavailable";
export type Trend = "improving" | "declining" | "stable" | "mixed" | "insufficient_data";

export interface NewsItem {
  headline: string;
  summary: string;
  source_name: string;
  source_url: string | null;
  source_url_status?: "verified_live" | "scraped_unverified" | null;
  display_restriction?: "summary_only_no_link" | null;
  published_date: string;
  state_relevance: string[];
  sector_tags: Sector[];
  verification_status: "verified" | "partial" | "single_source";
  key_claims: { claim: string; attributed_to: string }[];
}

export interface ReasoningTrace {
  data_points_provided: string[];
  inferences_drawn: string[];
  uncertainties_identified: string[];
  counter_evidence_scenarios: string[];
}

export interface SectorScore {
  score: number;
  national_percentile: number;
  source_tier: number;
  data_age_days: number;
  is_estimated?: boolean;
  estimate_data?: AIEstimate;
  data_quality?: DataQualityFlag;
  trend?: Trend;
}

export interface AIEstimate {
  state: string;
  sector: Sector;
  estimated_range: { low: number; high: number; unit: string };
  confidence: "low" | "medium" | "high";
  methodology: string;
  proxy_indicators_used: string[];
  warning: string;
  reasoning_trace?: ReasoningTrace;
  generated_at: string;
}

export interface FoodPriceData {
  item: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  month: string;
  year: number;
  data_quality: string;
}

export interface StateAnalysis {
  stateName: string;
  overall_score: number;
  national_rank: number;
  verdict: string;
  scores: Record<Sector, SectorScore>;
  food_prices?: FoodPriceData[];
  biggest_driver: {
    sector: Sector;
    direction: "improving" | "declining" | "stable";
    one_line: string;
  };
  sector_insights: {
    sector: Sector;
    trend: Trend;
    data_quality_flag: DataQualityFlag;
    summary: string;
    key_concerns: string[];
    comparative_context: string;
    reasoning_trace?: ReasoningTrace;
  }[];
  confidence_rating: "high" | "medium" | "low";
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
