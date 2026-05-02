import { GoogleGenAI, Type } from "@google/genai";
import { Sector, SectorScore, HistoricalScore, StateAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Mock data generator for demo purposes
export function generateMockScores(stateName: string) {
  const seed = stateName.length;
  // Focus sectors: security, education, agriculture, infrastructure
  const sectors: Sector[] = ["security", "education", "agriculture", "infrastructure", "health", "cost_of_living"];
  
  const current_scores: Record<string, SectorScore> = {};
  const historical_scores: Record<string, HistoricalScore> = {};
  
  sectors.forEach((s, i) => {
    const base = 40 + (seed * (i + 1)) % 40;
    current_scores[s] = {
      score: base,
      national_percentile: Math.max(1, Math.min(99, 100 - ((seed * (i + 5)) % 99))),
      source_tier: 1,
      data_age_days: (seed * i) % 20
    };
    historical_scores[s] = {
      score_30d_ago: base + (seed % 10) - 5,
      score_90d_ago: base + (seed % 15) - 7
    };
  });

  return {
    current_scores,
    historical_scores,
    overall_score: Math.round(Object.values(current_scores).reduce((a, b) => a + b.score, 0) / sectors.length),
    national_average: 52,
    national_rank: (seed % 36) + 1,
    weights: { security: 0.25, education: 0.20, agriculture: 0.15, infrastructure: 0.20, health: 0.10, cost_of_living: 0.10 },
    stale_threshold_days: 60
  };
}

export async function analyzeStateData(stateName: string): Promise<StateAnalysis | null> {
  const data = generateMockScores(stateName);
  
  const prompt = `
    Analyze the following data for ${stateName} State, Nigeria, and produce a composite score reasoning verdict.

    --- CURRENT SECTOR SCORES (0–100 scale, higher is better) ---
    ${JSON.stringify(data.current_scores, null, 2)}

    --- HISTORICAL SCORES (same sectors, previous periods) ---
    ${JSON.stringify(data.historical_scores, null, 2)}

    --- COMPOSITE SCORE ---
    Overall score: ${data.overall_score} / 100
    Nigerian state average: ${data.national_average} / 100
    National rank: ${data.national_rank} of 37

    --- SECTOR WEIGHTS USED ---
    ${JSON.stringify(data.weights, null, 2)}

    --- STALE DATA THRESHOLD ---
    Flag any sector where data_age_days exceeds: ${data.stale_threshold_days}

    RULES YOU MUST FOLLOW:
    1. Ground every claim in the data provided. Do not introduce external facts.
    2. Be specific with numbers. Focus on Security, Education, Agriculture, and Infrastructure.
    3. Compare within Nigeria using the provided Percentile ranks (higher percentile = better state performance).
    4. Identify the single biggest driver of the overall score.
    5. If a sector score is stale, acknowledge it.
    6. Maintain political neutrality.
    7. Do not catastrophize or over-praise.
    8. Write in second person where helpful.
    9. Output only valid JSON.
  `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                properties: {
                  security: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      national_percentile: { type: Type.NUMBER },
                      source_tier: { type: Type.NUMBER },
                      data_age_days: { type: Type.NUMBER }
                    },
                    required: ["score", "national_percentile", "source_tier", "data_age_days"]
                  },
                  education: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      national_percentile: { type: Type.NUMBER },
                      source_tier: { type: Type.NUMBER },
                      data_age_days: { type: Type.NUMBER }
                    },
                    required: ["score", "national_percentile", "source_tier", "data_age_days"]
                  },
                  agriculture: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      national_percentile: { type: Type.NUMBER },
                      source_tier: { type: Type.NUMBER },
                      data_age_days: { type: Type.NUMBER }
                    },
                    required: ["score", "national_percentile", "source_tier", "data_age_days"]
                  },
                  infrastructure: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      national_percentile: { type: Type.NUMBER },
                      source_tier: { type: Type.NUMBER },
                      data_age_days: { type: Type.NUMBER }
                    },
                    required: ["score", "national_percentile", "source_tier", "data_age_days"]
                  },
                  health: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      national_percentile: { type: Type.NUMBER },
                      source_tier: { type: Type.NUMBER },
                      data_age_days: { type: Type.NUMBER }
                    },
                    required: ["score", "national_percentile", "source_tier", "data_age_days"]
                  },
                  cost_of_living: {
                    type: Type.OBJECT,
                    properties: {
                      score: { type: Type.NUMBER },
                      national_percentile: { type: Type.NUMBER },
                      source_tier: { type: Type.NUMBER },
                      data_age_days: { type: Type.NUMBER }
                    },
                    required: ["score", "national_percentile", "source_tier", "data_age_days"]
                  }
                },
                required: ["security", "education", "agriculture", "infrastructure", "health", "cost_of_living"]
              },
              biggest_driver: {
                type: Type.OBJECT,
                properties: {
                  sector: { type: Type.STRING },
                  direction: { type: Type.STRING },
                  one_line: { type: Type.STRING }
                },
                required: ["sector", "direction", "one_line"]
              },
              sector_insights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sector: { type: Type.STRING },
                    trend: { type: Type.STRING },
                    insight: { type: Type.STRING },
                    stale: { type: Type.BOOLEAN }
                  },
                  required: ["sector", "trend", "insight", "stale"]
                }
              },
              watch_list: { type: Type.ARRAY, items: { type: Type.STRING } },
              bright_spots: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence_rating: { type: Type.STRING },
              stale_sectors: { type: Type.ARRAY, items: { type: Type.STRING } },
              generated_at: { type: Type.STRING }
            },
            required: ["verdict", "biggest_driver", "sector_insights", "watch_list", "bright_spots", "confidence_rating", "stale_sectors", "generated_at"]
          }
        }
      });

    const text = response.text;
    if (!text) return null;
    const result = JSON.parse(text) as StateAnalysis;

    // For demo purposes, if infrastructure is stale (mock logic), mark it as estimated
    if (result.scores && result.scores.infrastructure && result.scores.infrastructure.data_age_days > 15) {
      result.scores.infrastructure.is_estimated = true;
      result.scores.infrastructure.estimate_data = {
        state: stateName,
        sector: "infrastructure",
        estimated_score: result.scores.infrastructure.score,
        cannot_estimate: false,
        cannot_estimate_reason: null,
        drift_from_last_known: -2,
        drift_justified: true,
        reasoning: {
          anchor: `Critical road projects in ${stateName} have faced funding delays over the last 90 days.`,
          regional_signal: "National grid performance reaching local distribution hubs has stabilized, but secondary networks remain degraded.",
          grounding_findings: "Satellite imagery and local transit reports suggest a 5% decrease in road maintenance activity across primary corridors.",
          factors_considered: [
            { factor: "Fuel distribution", direction: "neutral", weight: "medium" },
            { factor: "Road project funding", direction: "down", weight: "high" },
            { factor: "Telecomm coverage", direction: "up", weight: "low" }
          ],
          final_logic: `While digital infrastructure is improving, the hardware decay in road networks warrants a 2-point downward correction to ${result.scores.infrastructure.score}.`
        },
        confidence: "low",
        grounding_sources: [
          { title: "National Infrastructure Audit", url: null, relevance: "Provides baseline for project completion rates." }
        ],
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        generated_at: new Date().toISOString(),
        is_estimated: true
      };
    }

    return result;
  } catch (error) {
    console.error("Error analyzing state data:", error);
    return null;
  }
}
