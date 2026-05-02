import { GoogleGenAI, Type } from "@google/genai";
import { StateNormalizer } from "../utils/stateNormalizer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface FoodPriceData {
  item: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  month: string;
  year: number;
  data_quality: string;
}

export async function fetchNBSFoodPrices(stateName: string): Promise<FoodPriceData[]> {
  const normalizedState = StateNormalizer.normalize(stateName) || stateName;
  
  const prompt = `
    You are an NBS (National Bureau of Statistics) Data Retrieval Engine for CivicLens.
    Ground your response in the latest available "Selected Food Price Watch" reports from NBS (nigerianstat.gov.ng).
    
    TARGET: ${normalizedState} State, Nigeria.
    
    TASKS:
    1. Search for the most recent NBS Selected Food Price Watch report (PDF or Excel).
    2. Extract key food prices for ${normalizedState}. Focus on Staples: Rice (agric/local), Beans (brown/white), Yam, Bread, Egg, Beef.
    3. Return structured data with current price in Naira, the reporting month/year, and an estimated trend if historical signal exists.
    
    DATA INTEGRITY RULES:
    - Only return numbers found in NBS documentation or high-confidence news reporting of NBS releases.
    - If specific prices for ${normalizedState} are unavailable, use the Geopolitical Zone average (Note this in data_quality).
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
            prices: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
                  month: { type: Type.STRING },
                  year: { type: Type.NUMBER },
                  data_quality: { type: Type.STRING }
                },
                required: ["item", "price", "unit", "trend", "month", "year", "data_quality"]
              }
            }
          },
          required: ["prices"]
        },
        tools: [{ googleSearch: {} }],
      },
    });

    const result = JSON.parse(response.text || '{"prices": []}');
    return result.prices;
  } catch (error) {
    console.error("NBS Data Engine Failure:", error);
    return [];
  }
}
