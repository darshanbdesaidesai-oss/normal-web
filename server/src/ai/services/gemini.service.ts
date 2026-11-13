import { gemini, GEMINI_MODEL } from "../../config/gemini.js";
import { env } from "../../config/env.js";
import { AGRISAGE_SYSTEM_PROMPT } from "../prompts/system.prompt.js";
import {
  buildCropRecommendationPrompt,
  CropRecommendationPromptInput,
} from "../prompts/crop-recommendation.prompt.js";
import {
  buildAdvisoryPrompt,
  AdvisoryPromptInput,
} from "../prompts/advisory.prompt.js";
import {
  buildDiseasePrompt,
  DiseasePromptInput,
} from "../prompts/disease.prompt.js";
import {
  buildIrrigationPrompt,
  IrrigationPromptInput,
} from "../prompts/irrigation.prompt.js";
import {
  buildNutrientPrompt,
  NutrientPromptInput,
} from "../prompts/nutrient.prompt.js";
import {
  cropRecommendationOutputSchema,
  CropRecommendationOutput,
  advisoryOutputSchema,
  AdvisoryOutput,
  diseaseOutputSchema,
  DiseaseOutput,
  irrigationOutputSchema,
  IrrigationOutput,
  nutrientOutputSchema,
  NutrientOutput,
} from "../schemas/ai-output.schemas.js";

// Helper to sanitize model JSON text response
function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

async function executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`AI generation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export class GeminiAgriculturalService {
  /**
   * 1. Generate Structured Crop Recommendations
   */
  public async generateCropRecommendations(
    input: CropRecommendationPromptInput
  ): Promise<CropRecommendationOutput> {
    const promptText = buildCropRecommendationPrompt(input);

    const callApi = async () => {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [promptText],
        config: {
          systemInstruction: AGRISAGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const cleaned = cleanJsonResponse(responseText);
      const parsedJson = JSON.parse(cleaned);
      return cropRecommendationOutputSchema.parse(parsedJson);
    };

    try {
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    } catch (err: unknown) {
      console.warn("First attempt failed for crop recommendations, retrying once...", err);
      // Single retry attempt
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    }
  }

  /**
   * 2. Generate Agricultural Advisory Report
   */
  public async generateAdvisory(input: AdvisoryPromptInput): Promise<AdvisoryOutput> {
    const promptText = buildAdvisoryPrompt(input);

    const callApi = async () => {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [promptText],
        config: {
          systemInstruction: AGRISAGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const cleaned = cleanJsonResponse(responseText);
      const parsedJson = JSON.parse(cleaned);
      return advisoryOutputSchema.parse(parsedJson);
    };

    try {
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    } catch (err: unknown) {
      console.warn("First attempt failed for advisory, retrying once...", err);
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    }
  }

  /**
   * 3. Analyze Crop Disease from Image (Multimodal)
   */
  public async analyzeDisease(
    input: DiseasePromptInput,
    imageBuffer: Buffer,
    mimeType: string
  ): Promise<DiseaseOutput> {
    const promptText = buildDiseasePrompt(input);
    const base64Data = imageBuffer.toString("base64");

    const callApi = async () => {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              { text: promptText },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          systemInstruction: AGRISAGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const cleaned = cleanJsonResponse(responseText);
      const parsedJson = JSON.parse(cleaned);
      return diseaseOutputSchema.parse(parsedJson);
    };

    try {
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    } catch (err: unknown) {
      console.warn("First attempt failed for disease analysis, retrying once...", err);
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    }
  }

  /**
   * 4. Generate Irrigation Advisory
   */
  public async generateIrrigationAdvisory(
    input: IrrigationPromptInput
  ): Promise<IrrigationOutput> {
    const promptText = buildIrrigationPrompt(input);

    const callApi = async () => {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [promptText],
        config: {
          systemInstruction: AGRISAGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const cleaned = cleanJsonResponse(responseText);
      const parsedJson = JSON.parse(cleaned);
      return irrigationOutputSchema.parse(parsedJson);
    };

    try {
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    } catch (err: unknown) {
      console.warn("First attempt failed for irrigation advisory, retrying once...", err);
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    }
  }

  /**
   * 5. Generate Nutrient Advisory
   */
  public async generateNutrientAdvisory(
    input: NutrientPromptInput
  ): Promise<NutrientOutput> {
    const promptText = buildNutrientPrompt(input);

    const callApi = async () => {
      const response = await gemini.models.generateContent({
        model: GEMINI_MODEL,
        contents: [promptText],
        config: {
          systemInstruction: AGRISAGE_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "";
      const cleaned = cleanJsonResponse(responseText);
      const parsedJson = JSON.parse(cleaned);
      return nutrientOutputSchema.parse(parsedJson);
    };

    try {
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    } catch (err: unknown) {
      console.warn("First attempt failed for nutrient advisory, retrying once...", err);
      return await executeWithTimeout(callApi(), env.AI_REQUEST_TIMEOUT_MS);
    }
  }
}

export const geminiAgriculturalService = new GeminiAgriculturalService();
