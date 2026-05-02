import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStateNews(stateName: string): Promise<NewsItem[]> {
  const prompt = `
    You are a news intelligence analyst for CivicLens (Tier 3 Grounding). 
    Extract structured signals relevant to development in ${stateName} State, Nigeria.

    EXTRACTION RULES:
    1. Extract: event type, location (state/LGA if specified), date, actors, stated impacts, source publication.
    2. Do NOT quantify impacts unless explicitly stated. Preserve as "source_claim".
    3. Assess: relevance to which sector(s), geographic specificity, temporal proximity.
    4. Flag: unverified claims, partisan framing, conflicting accounts.
    5. Prioritize recency (last 14 days).

    OUTPUT FORMAT:
    {
      "events": [
        {
          "headline": "string",
          "source": "string",
          "date": "ISO8601",
          "location": {"state": "string", "lga": "string | null"},
          "sector_relevance": ["security" | "health" | "education" | "agriculture" | "economy" | "infrastructure" | "governance" | "cost_of_living"],
          "event_type": "conflict | policy | infrastructure | climate | health | education | economic",
          "source_claims": [{"claim": "string", "quantified": boolean}],
          "verification_status": "verified | partial | unverified",
          "narrative_relevance": "string (1 sentence)"
        }
      ]
    }
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
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  source: { type: Type.STRING },
                  date: { type: Type.STRING },
                  location: {
                    type: Type.OBJECT,
                    properties: {
                      state: { type: Type.STRING },
                      lga: { type: Type.STRING, nullable: true }
                    },
                    required: ["state", "lga"]
                  },
                  sector_relevance: { type: Type.ARRAY, items: { type: Type.STRING } },
                  event_type: { type: Type.STRING },
                  source_claims: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        claim: { type: Type.STRING },
                        quantified: { type: Type.BOOLEAN }
                      },
                      required: ["claim", "quantified"]
                    }
                  },
                  verification_status: { type: Type.STRING },
                  narrative_relevance: { type: Type.STRING }
                },
                required: ["headline", "source", "date", "location", "sector_relevance", "event_type", "source_claims", "verification_status", "narrative_relevance"]
              }
            }
          },
          required: ["events"]
        },
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text);
    return result.events;
  } catch (error) {
    console.error("Error generating news signals:", error);
    return [];
  }
}
