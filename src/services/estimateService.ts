import { GoogleGenAI, Type } from "@google/genai";
import { Sector, AIEstimate, SectorScore } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAIEstimate(
  stateName: string, 
  sector: Sector, 
  lastKnown: SectorScore & { last_known_date: string },
  nationalAverage: number,
  neighbors: Record<string, { score: number, is_estimated: boolean }>,
  geopoliticalZone: string
): Promise<AIEstimate | null> {
  const prompt = `
    Estimate the current ${sector} score for ${stateName} State, Nigeria.

    This estimate is needed because the most recent verified data is too old to use reliably.

    --- CONTEXT ---
    State: ${stateName}
    Geopolitical zone: ${geopoliticalZone}
    Sector: ${sector}
    Score range: 0–100 (higher = better conditions for residents)

    --- LAST KNOWN DATA ---
    Last verified score: ${lastKnown.score} / 100
    Data recorded on: ${lastKnown.last_known_date}
    Days since last update: ${lastKnown.data_age_days}
    Source tier at that time: ${lastKnown.source_tier}

    --- REGIONAL SIGNALS ---
    National average for this sector: ${nationalAverage} / 100
    Neighboring states and their current scores:
    ${JSON.stringify(neighbors, null, 2)}

    RULES YOU MUST FOLLOW:
    1. Never produce a score below 5 or above 95.
    2. Anchor to last known score first (drift limit 15 unless justified).
    3. Use neighboring state scores as a regional signal.
    4. Use grounding to search for recent developments in ${stateName} related to ${sector} (last 60 days).
    5. Document every factor you considered.
    6. If unable to estimate, set "cannot_estimate": true.
    7. Output only valid JSON.

    --- SECTOR SCORING GUIDE ---
    Interpret what a score means in Nigerian context for ${sector}:
    (Standard ranges: 80-100 optimal, 60-79 basic, 40-59 significant issues, 20-39 critical gaps, 5-19 near collapse)

    Return a single JSON object matching the AIEstimate schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            state: { type: Type.STRING },
            sector: { type: Type.STRING },
            estimated_score: { type: Type.NUMBER },
            cannot_estimate: { type: Type.BOOLEAN },
            cannot_estimate_reason: { type: Type.STRING, nullable: true },
            drift_from_last_known: { type: Type.NUMBER },
            drift_justified: { type: Type.BOOLEAN },
            reasoning: {
              type: Type.OBJECT,
              properties: {
                anchor: { type: Type.STRING },
                regional_signal: { type: Type.STRING },
                grounding_findings: { type: Type.STRING },
                factors_considered: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      factor: { type: Type.STRING },
                      direction: { type: Type.STRING },
                      weight: { type: Type.STRING }
                    },
                    required: ["factor", "direction", "weight"]
                  }
                },
                final_logic: { type: Type.STRING }
              },
              required: ["anchor", "regional_signal", "grounding_findings", "factors_considered", "final_logic"]
            },
            confidence: { type: Type.STRING },
            grounding_sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING, nullable: true },
                  relevance: { type: Type.STRING }
                },
                required: ["title", "relevance"]
              }
            },
            expires_at: { type: Type.STRING },
            generated_at: { type: Type.STRING },
            is_estimated: { type: Type.BOOLEAN }
          },
          required: [
            "state", "sector", "estimated_score", "cannot_estimate", 
            "drift_from_last_known", "drift_justified", "reasoning", 
            "confidence", "grounding_sources", "expires_at", "generated_at", "is_estimated"
          ]
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating AI estimate:", error);
    return null;
  }
}
