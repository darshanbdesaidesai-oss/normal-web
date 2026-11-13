export interface AdvisoryPromptInput {
  farmInformation: string;
  cropInformation: string;
  advisoryCategory: string;
  growthStage?: string;
  observations?: string;
  language?: string;
}

export function buildAdvisoryPrompt(input: AdvisoryPromptInput): string {
  return `
Generate a practical agricultural advisory.

FARM:
${input.farmInformation}

CROP:
${input.cropInformation}

ADVISORY CATEGORY:
${input.advisoryCategory}

GROWTH STAGE:
${input.growthStage || "Not specified / general"}

USER OBSERVATIONS:
${input.observations || "None provided"}

RESPONSE LANGUAGE:
${input.language || "English"}

TASK:
Provide practical, understandable recommendations.

Include:
- Advisory summary.
- Detailed recommendations with heading, description, priority (low, medium, high, urgent), and reason.
- Step-by-step actions with action description, timing, and details.
- Suggested timing.
- Potential risks.
- Important warnings.
- Missing information that would help make the advisory more precise.
- Expert verification guidance when appropriate.

Do not invent weather data, fertilizer quantities, or chemical dosage.
Return JSON strictly matching the required schema without markdown wrappers.
`.trim();
}
