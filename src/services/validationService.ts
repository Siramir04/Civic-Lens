import { GoogleGenAI, Type } from "@google/genai";
import { SourceValidation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface SourceSubmission {
  name: string;
  url: string;
  description: string;
  claimed_sectors: string;
  claimed_coverage: string;
  claimed_refresh_rate: string;
  contributor_notes: string;
}

export async function validateSource(submission: SourceSubmission): Promise<SourceValidation | null> {
  const prompt = `
    You are the source validation engine for CivicLens — an open-source civic intelligence platform tracking quality of life across Nigerian states.

    --- PROPOSED SOURCE ---
    Name: ${submission.name}
    URL: ${submission.url}
    Description: ${submission.description}
    Claimed sectors: ${submission.claimed_sectors}
    Claimed coverage: ${submission.claimed_coverage}
    Claimed refresh rate: ${submission.claimed_refresh_rate}
    Contributor notes: ${submission.contributor_notes}

    --- RULES ---
    1. Be skeptical. Require evidence.
    2. Tier 1 = NBS, World Bank, etc. Tier 2 = Premium Times, Punch. Tier 3 = Blogs.
    3. Evaluate: Ownership, Methodology, Correction Policy, Coverage, Relevance, Frequency, Accessibility, Bias.
    4. Output only valid JSON.

    --- REQUIRED OUTPUT SCHEMA ---
    Return a single JSON object matching the SourceValidation interface.
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
            source_name: { type: Type.STRING },
            source_url: { type: Type.STRING },
            url_accessible: { type: Type.BOOLEAN },
            recommended_tier: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            verdict_summary: { type: Type.STRING },
            criteria_scores: {
              type: Type.OBJECT,
              properties: {
                ownership_accountability: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                methodology_transparency: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                correction_policy: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                geographic_coverage: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                sector_relevance: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                update_frequency: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                accessibility: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                },
                bias_risk: { 
                  type: Type.OBJECT, 
                  properties: { score: { type: Type.NUMBER }, finding: { type: Type.STRING } },
                  required: ["score", "finding"]
                }
              },
              required: [
                "ownership_accountability", "methodology_transparency", "correction_policy", 
                "geographic_coverage", "sector_relevance", "update_frequency", 
                "accessibility", "bias_risk"
              ]
            },
            total_score: { type: Type.NUMBER },
            tier_thresholds: {
              type: Type.OBJECT,
              properties: {
                tier_1_minimum: { type: Type.NUMBER },
                tier_2_minimum: { type: Type.NUMBER },
                tier_3_minimum: { type: Type.NUMBER }
              },
              required: ["tier_1_minimum", "tier_2_minimum", "tier_3_minimum"]
            },
            bias_downgrade_applied: { type: Type.BOOLEAN },
            conditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            disqualifying_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggested_sectors: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggested_refresh_rate: { type: Type.STRING },
            grounding_sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  used_for: { type: Type.STRING }
                },
                required: ["title", "url", "used_for"]
              }
            },
            requires_human_review: { type: Type.BOOLEAN },
            generated_at: { type: Type.STRING }
          },
          required: [
            "source_name", "source_url", "url_accessible", "recommended_tier", 
            "verdict", "verdict_summary", "criteria_scores", "total_score", 
            "tier_thresholds", "bias_downgrade_applied", "conditions", 
            "disqualifying_flags", "suggested_sectors", "suggested_refresh_rate", 
            "grounding_sources", "requires_human_review", "generated_at"
          ]
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error validating source:", error);
    return null;
  }
}
