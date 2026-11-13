export interface CropRecommendationPromptInput {
  farmInformation: string;
  environmentalInformation: string;
  farmingObjective: string;
  season: string;
  cropCategory?: string;
  preferredCrop?: string;
  language?: string;
}

export function buildCropRecommendationPrompt(input: CropRecommendationPromptInput): string {
  return `
Analyze the following agricultural conditions and recommend suitable crops.

FARM INFORMATION:
${input.farmInformation}

ENVIRONMENTAL CONDITIONS:
${input.environmentalInformation}

FARMING OBJECTIVE:
${input.farmingObjective}

SEASON:
${input.season}

PREFERRED CATEGORY:
${input.cropCategory || "Any category"}

PREFERRED CROP SPECIFIED:
${input.preferredCrop || "None specified"}

RESPONSE LANGUAGE:
${input.language || "English"}

TASK:
1. Identify suitable crop options.
2. Explain the suitability of each crop.
3. Identify important missing information.
4. Highlight major agricultural risks.
5. Recommend practical cultivation considerations.
6. Provide alternative crop choices.
7. Avoid unsupported yield predictions.
8. Do not invent crop-specific scientific data.
9. Suitability score must be an integer between 0 and 100 reflecting comparative AI assessment (not a probability).
10. Return strictly valid JSON conforming to the requested schema. Do not enclose in markdown code blocks.
`.trim();
}
