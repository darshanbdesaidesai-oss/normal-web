export interface DiseasePromptInput {
  cropName: string;
  location: string;
  symptoms: string;
  language?: string;
}

export function buildDiseasePrompt(input: DiseasePromptInput): string {
  return `
You are analyzing a crop image for preliminary agricultural diagnostic assistance.

CROP:
${input.cropName}

FARM LOCATION:
${input.location}

USER OBSERVATIONS:
${input.symptoms}

RESPONSE LANGUAGE:
${input.language || "English"}

IMAGE:
Provided as image input.

TASK:
1. Describe visible symptoms in detail.
2. Identify possible causes (diseases, physiological disorders, or pests) with confidence rating (high, moderate, low) and explanation.
3. Explain diagnostic uncertainty clearly.
4. Suggest additional field observations the farmer should make.
5. Recommend safe immediate actions (e.g. sanitation, isolation, cultural controls).
6. Suggest prevention measures and integrated management.
7. Explain when professional diagnosis by local agricultural university or extension officer is needed.

Do not identify diseases with certainty from insufficient evidence.
Do not prescribe dangerous chemical treatments without verified laboratory diagnosis.
Always emphasize that this is a preliminary visual decision-support tool.

Return JSON strictly matching the required schema without markdown code blocks.
`.trim();
}
