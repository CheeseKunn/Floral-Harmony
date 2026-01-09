import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { FloralAnalysisResponse, Suggestion } from "../types";
import { Language } from "../utils/translations";

// Define the schema for the JSON response
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.STRING,
      description: "A brief, elegant analysis of the user's request and image",
    },
    identifiedFlowers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of flowers identified in the image (if any). Empty if no image.",
    },
    suggestions: {
      type: Type.ARRAY,
      description: "3 distinct floral arrangement suggestions",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A creative title for the arrangement" },
          description: { type: Type.STRING, description: "Why this works and how to arrange it" },
          flowerList: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "List of specific flowers and greenery to buy" 
          },
          colorPalette: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 3-4 hex color codes representing the palette" 
          },
          vibe: { type: Type.STRING, description: "One or two words describing the mood (e.g., Romantic, Rustic)" },
          flowerLanguage: { 
            type: Type.STRING, 
            description: "Concise symbolic meaning of the main flowers." 
          },
          blessing: { 
            type: Type.STRING, 
            description: "A short, concise, literary, and poetic blessing or wish suitable for a card accompanying the flowers." 
          }
        },
        required: ["title", "description", "flowerList", "colorPalette", "vibe", "flowerLanguage", "blessing"]
      },
    },
  },
  required: ["analysis", "identifiedFlowers", "suggestions"],
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeFloralRequest = async (
  text: string,
  image: File | null,
  language: Language,
  apiKey: string
): Promise<FloralAnalysisResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  const parts: any[] = [];

  if (image) {
    const base64Data = await fileToBase64(image);
    parts.push({
      inlineData: {
        mimeType: image.type,
        data: base64Data,
      },
    });
  }

  // Ensure there is at least some text prompts if no text is provided but image is
  const promptText = text.trim() === "" 
    ? "Please analyze this flower image and suggest pairings." 
    : text;

  parts.push({ text: promptText });
  
  // Append language instruction
  const langInstruction = language === 'zh' 
    ? " IMPORTANT: Output all content in Chinese (Simplified)." 
    : " IMPORTANT: Output all content in English.";
    
  parts.push({ text: langInstruction });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Supports multimodal and is fast
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (!response.text) {
        throw new Error("No response from AI");
    }

    const result = JSON.parse(response.text) as FloralAnalysisResponse;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateFloralImage = async (suggestion: Suggestion, apiKey: string): Promise<string | null> => {
  if (!apiKey) {
    console.error("API Key is missing for image generation.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  // Construct a detailed prompt for the image generation model
  // Explicitly enforcing NO TEXT in the output image
  const prompt = `A professional, photorealistic 3D visualization of a floral arrangement based on the following details:
  
  - Vibe/Style: ${suggestion.vibe}
  - Arrangement Description: ${suggestion.description}
  - Flowers included: ${suggestion.flowerList.join(', ')}
  - Color Palette: ${suggestion.colorPalette.join(', ')}
  
  Directives:
  1. The image must contain ONLY the floral arrangement in a studio setting.
  2. High quality, clear focus, neutral soft background.
  3. CRITICAL: Do NOT include any text, titles, descriptions, watermarks, or overlays in the generated image. Purely visual.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
        },
      },
    });

    // Iterate through parts to find the image data
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;

  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};