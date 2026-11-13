export interface IrrigationPromptInput {
  crop: string;
  growthStage: string;
  soilInformation: string;
  irrigationMethod: string;
  waterAvailability: string;
  rainfall?: string;
  language?: string;
}

export function buildIrrigationPrompt(input: IrrigationPromptInput): string {
  return `
Generate irrigation guidance using the provided agricultural conditions.

CROP:
${input.crop}

GROWTH STAGE:
${input.growthStage}

SOIL:
${input.soilInformation}

IRRIGATION METHOD:
${input.irrigationMethod}

WATER AVAILABILITY:
${input.waterAvailability}

RECENT RAINFALL:
${input.rainfall || "No recent rainfall reported"}

RESPONSE LANGUAGE:
${input.language || "English"}

TASK:
Explain irrigation considerations, water stress indicators, monitoring practices, and irrigation scheduling principles.
Do not invent weather forecasts.
Do not claim exact irrigation quantities unless sufficient verified agricultural information is provided.

Return JSON strictly matching the schema without markdown code blocks.
`.trim();
}
