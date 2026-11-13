export interface NutrientPromptInput {
  crop: string;
  growthStage: string;
  soilType: string;
  soilTest?: string;
  fertilizerHistory?: string;
  farmArea: string;
  language?: string;
}

export function buildNutrientPrompt(input: NutrientPromptInput): string {
  return `
Generate responsible crop nutrient management guidance.

CROP:
${input.crop}

GROWTH STAGE:
${input.growthStage}

SOIL TYPE:
${input.soilType}

SOIL TEST RESULTS:
${input.soilTest || "No recent laboratory soil test data provided"}

EXISTING FERTILIZER APPLICATION:
${input.fertilizerHistory || "None specified"}

FARM AREA:
${input.farmArea}

RESPONSE LANGUAGE:
${input.language || "English"}

TASK:
Explain nutrient management considerations.
Identify:
- Important nutrient requirements.
- Possible deficiency indicators.
- Soil testing recommendations.
- Application timing considerations.
- Environmental precautions.
- Missing information.

Do not invent fertilizer dosage.
Do not recommend unsupported chemical mixtures.
Return JSON strictly matching the schema without markdown code blocks.
`.trim();
}
