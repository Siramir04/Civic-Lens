import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStateNews(stateName: string): Promise<NewsItem[]> {
  const prompt = `
    Generate a news digest for ${stateName} State, Nigeria.

    RULES YOU MUST FOLLOW:
    1. Be strictly factual. Do not speculate, editorialize, or infer beyond what the sources state.
    2. Never fabricate events. If you cannot find credible recent news for a sector, say so explicitly — do not fill the gap with assumptions.
    3. Maintain political neutrality. Do not frame events in a way that favors any political party, government, or group.
    4. Prioritize recency. Prefer news from the last 7 days. If nothing recent exists, use the most recent available and flag it with the date.
    5. Prefer Tier 1 sources (Reuters, AP, BBC, Channels TV, Punch, Premium Times, NAN) over blogs or unverified outlets.
    6. Keep language plain and accessible. Write at a reading level appropriate for a general Nigerian audience.
    7. Flag AI-generated summaries honestly. If a summary is synthesized by you rather than drawn from a direct source, mark it with "ai_generated": true.
    8. Never combine unrelated events into one headline. Each headline must represent one distinct story.
    9. Output only valid JSON. No markdown, no preamble, no explanation outside the JSON array.

    Sectors to cover where news exists (do not force coverage if nothing is happening):
    - Security and conflict
    - Health and disease outbreaks
    - Education
    - Agriculture and food security
    - Cost of living and economy
    - Infrastructure and governance

    Return a JSON array of 3 to 5 objects. Each object must follow this exact schema:

    [
      {
        "headline": "Short, factual headline under 12 words",
        "summary": "One to two sentences. Factual. No opinion. Cite the source name inline.",
        "sector": "security | health | education | agriculture | economy | infrastructure | governance",
        "source_name": "Publication or agency name",
        "source_url": "Direct URL or null if grounding-only",
        "published_at": "ISO 8601 date or null",
        "ai_generated": false,
        "confidence": "high | medium | low"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              sector: { type: Type.STRING },
              source_name: { type: Type.STRING },
              source_url: { type: Type.STRING, nullable: true },
              published_at: { type: Type.STRING, nullable: true },
              ai_generated: { type: Type.BOOLEAN },
              confidence: { type: Type.STRING },
            },
            required: ["headline", "summary", "sector", "source_name", "ai_generated", "confidence"],
          },
        },
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating news:", error);
    return [];
  }
}
