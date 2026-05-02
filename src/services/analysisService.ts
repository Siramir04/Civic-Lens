import { GoogleGenAI, Type } from "@google/genai";
import { 
  Sector, 
  SectorScore, 
  StateAnalysis, 
  DataQualityFlag, 
  Trend, 
  AIEstimate,
  ReasoningTrace
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// MOCK DATA REPOSITORY (Simulated Database for Tier 0)
// In a real app, this would be a Firestore or Postgres call
const DATA_REPOSITORY: Record<string, any> = {
  // Populated dynamically by generateMockData for demo
};

export function generateMockDataForVault(stateName: string) {
  const seed = stateName.length;
  const sectors: Sector[] = ["security", "education", "agriculture", "infrastructure", "health", "cost_of_living"];
  
  const vault: Record<string, any> = {};
  
  sectors.forEach((s) => {
    const ageDays = (seed * s.length) % 800; // Some data will be very old
    vault[s] = {
      indicators: [
        { name: `${s}_index_alpha`, value: 40 + (seed % 40) },
        { name: `${s}_volume_beta`, value: 1000 + (seed * 10) }
      ],
      last_verified_at: new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000).toISOString(),
      historical: [
        { year: 2023, value: 45 },
        { year: 2022, value: 42 }
      ],
      national_baseline: 50
    };
  });

  return vault;
}

// TIER 0: GROUNDING CHECK
function getGroundingProtocol(stateName: string, sector: Sector) {
  const vault = generateMockDataForVault(stateName);
  const data = vault[sector];
  if (!data) return { status: "unavailable", data: null };

  const ageDays = Math.floor((Date.now() - new Date(data.last_verified_at).getTime()) / (1000 * 60 * 60 * 24));

  if (ageDays <= 365) return { status: "current", data, ageDays };
  if (ageDays <= 730) return { status: "stale_12_24mo", data, ageDays };
  return { status: "stale_24mo_plus", data, ageDays };
}

// TIER 1 & 2 PROMPT GENERATOR
async function invokeAIIntelligence(
  tier: 1 | 2, 
  stateName: string, 
  sector: Sector, 
  grounding: any
): Promise<any> {
  const isTier2 = tier === 2;
  
  const systemPrompt = isTier2 ? `
    You are a statistical estimation assistant (CivicLens Tier 2). 
    You generate ONLY conservative, interval-based estimates when primary data is unavailable.
    STRICT: methodology must be explicit and auditable.
    NEVER estimate conflict fatalities.
  ` : `
    You are a senior research analyst (CivicLens Tier 1). 
    Synthesize verified data into neutral state profiles. 
    Use ONLY provided data. Use Tier 4 Reasoning Trace.
  `;

  const userPrompt = `
    STATE: ${stateName}
    SECTOR: ${sector}
    DATA_QUALITY: ${grounding.status}
    DATASET: ${JSON.stringify(grounding.data)}
  `;

  const responseSchema = isTier2 ? {
    type: Type.OBJECT,
    properties: {
      estimated_range: {
        type: Type.OBJECT,
        properties: {
          low: { type: Type.NUMBER },
          high: { type: Type.NUMBER },
          unit: { type: Type.STRING }
        },
        required: ["low", "high", "unit"]
      },
      confidence: { type: Type.STRING },
      methodology: { type: Type.STRING },
      proxy_indicators_used: { type: Type.ARRAY, items: { type: Type.STRING } },
      warning: { type: Type.STRING },
      reasoning_trace: {
        type: Type.OBJECT,
        properties: {
          data_points_provided: { type: Type.ARRAY, items: { type: Type.STRING } },
          inferences_drawn: { type: Type.ARRAY, items: { type: Type.STRING } },
          uncertainties_identified: { type: Type.ARRAY, items: { type: Type.STRING } },
          counter_evidence_scenarios: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    required: ["estimated_range", "confidence", "methodology", "proxy_indicators_used", "warning", "reasoning_trace"]
  } : {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      score: { type: Type.NUMBER },
      trend: { type: Type.STRING },
      key_concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
      comparative_context: { type: Type.STRING },
      reasoning_trace: {
        type: Type.OBJECT,
        properties: {
          data_points_provided: { type: Type.ARRAY, items: { type: Type.STRING } },
          inferences_drawn: { type: Type.ARRAY, items: { type: Type.STRING } },
          uncertainties_identified: { type: Type.ARRAY, items: { type: Type.STRING } },
          counter_evidence_scenarios: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    },
    required: ["summary", "score", "trend", "key_concerns", "comparative_context", "reasoning_trace"]
  };

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "system", parts: [{ text: systemPrompt }] },
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema
      }
    });

    return JSON.parse(result.text);
  } catch (error) {
    console.error(`AI Tier ${tier} Failure:`, error);
    return null;
  }
}

export async function analyzeStateData(stateName: string): Promise<StateAnalysis | null> {
  const sectors: Sector[] = ["security", "education", "agriculture", "infrastructure", "health", "cost_of_living"];
  const scores: Record<Sector, SectorScore> = {} as any;
  const insights: any[] = [];
  
  let totalScore = 0;

  for (const sector of sectors) {
    // TIER 0: Grounding
    const grounding = getGroundingProtocol(stateName, sector);
    
    let aiResult;
    let isEstimated = false;

    if (grounding.status === "stale_24mo_plus" || grounding.status === "unavailable") {
      // TIER 2: Gap-Fill Estimator (Exclude security from synthetic estimates as per rules)
      if (sector === "security") {
        aiResult = {
          summary: "Official security data is critically outdated. Synthetic estimation blocked for sovereign safety metrics.",
          score: 30, // Default low for lack of transparency
          trend: "insufficient_data",
          key_concerns: ["Data transparency gap", "Potential blind spots in incident reporting"],
          comparative_context: "Below national average due to reporting atrophy.",
          reasoning_trace: {
            data_points_provided: ["No data within 730 days"],
            inferences_drawn: ["Critical reporting atrophy detected"],
            uncertainties_identified: ["True casualty/incident rates unknown"],
            counter_evidence_scenarios: ["Independent verification by third-party NGOs required"]
          }
        };
      } else {
        isEstimated = true;
        aiResult = await invokeAIIntelligence(2, stateName, sector, grounding);
      }
    } else {
      // TIER 1: Narrative Synthesizer
      aiResult = await invokeAIIntelligence(1, stateName, sector, grounding);
    }

    if (aiResult) {
      const scoreValue = isEstimated ? (aiResult.estimated_range.low + aiResult.estimated_range.high) / 2 : aiResult.score;
      totalScore += scoreValue;

      scores[sector] = {
        score: Math.round(scoreValue),
        national_percentile: Math.round(scoreValue * 0.9), // Simulated
        source_tier: isEstimated ? 2 : 1,
        data_age_days: grounding.ageDays || 0,
        is_estimated: isEstimated,
        estimate_data: isEstimated ? aiResult : undefined,
        data_quality: grounding.status as DataQualityFlag,
        trend: aiResult.trend as Trend
      };

      insights.push({
        sector: sector,
        trend: (aiResult.trend || "stable") as Trend,
        data_quality_flag: grounding.status as DataQualityFlag,
        summary: aiResult.summary || (isEstimated ? `AI Estimation: ${aiResult.methodology}` : ""),
        key_concerns: aiResult.key_concerns || (isEstimated ? [aiResult.warning] : []),
        comparative_context: aiResult.comparative_context || "Compared to regional peers.",
        reasoning_trace: aiResult.reasoning_trace
      });
    }
  }

  const finalScore = Math.round(totalScore / sectors.length);

  return {
    stateName,
    overall_score: finalScore,
    national_rank: (stateName.length % 36) + 1,
    verdict: `A critical synthesis of ${stateName} shows a diverse developmental trajectory with significant data ${finalScore > 50 ? 'resilience' : 'atrophy'}.`,
    scores,
    biggest_driver: {
      sector: "security",
      direction: "stable",
      one_line: "Security remains the primary anchor of the composite rating."
    },
    sector_insights: insights,
    confidence_rating: finalScore > 40 ? "medium" : "low",
    generated_at: new Date().toISOString()
  };
}
