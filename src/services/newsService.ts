import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStateNews(stateName: string): Promise<NewsItem[]> {
  const prompt = `
    You are CivicLens's news intelligence engine. Your output feeds directly 
    into a double-tap-to-open interface. Users will be taken to source_url 
    with no intermediate confirmation. A broken link destroys trust permanently.

    TARGET: ${stateName} State, Nigeria.

    ## ABSOLUTE RULES
    1. source_url MUST be a direct, absolute URL to the specific article.
       - CORRECT: "https://www.premiumtimesng.com/news/headlines/123456-example.html"
       - WRONG: "https://www.premiumtimesng.com" (homepage)
       - WRONG: Any URL you constructed, inferred, or "guessed" looks right
    2. If you cannot verify the exact article URL through your tools, you MUST return "source_url": null and set source_url_status accordingly.
    3. NEVER fabricate, complete, or "fix" a partial URL.

    ## SECTOR TAGS (allowed values only)
    ["security", "education", "healthcare", "agriculture", "infrastructure", 
     "cost_of_living", "governance", "environment"]

    ## VERIFICATION TIERS
    - "verified": Claim appears in 2+ independent sources OR official govt source
    - "partial": Claim appears in 1 reputable source with named attribution
    - "single_source": Claim appears in 1 source without clear attribution
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
            news: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  source_name: { type: Type.STRING },
                  source_url: { type: Type.STRING, nullable: true },
                  source_url_status: { type: Type.STRING, enum: ["verified_live", "scraped_unverified", "null"] },
                  display_restriction: { type: Type.STRING, enum: ["summary_only_no_link", "none"], nullable: true },
                  published_date: { type: Type.STRING },
                  state_relevance: { type: Type.ARRAY, items: { type: Type.STRING } },
                  sector_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  verification_status: { type: Type.STRING, enum: ["verified", "partial", "single_source"] },
                  key_claims: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        claim: { type: Type.STRING },
                        attributed_to: { type: Type.STRING }
                      },
                      required: ["claim", "attributed_to"]
                    }
                  }
                },
                required: ["headline", "summary", "source_name", "source_url", "source_url_status", "published_date", "state_relevance", "sector_tags", "verification_status", "key_claims"]
              }
            }
          },
          required: ["news"]
        },
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    if (!text) return [];
    const result = JSON.parse(text);
    return result.news;
  } catch (error) {
    console.error("Error generating news signals:", error);
    return [];
  }
}
