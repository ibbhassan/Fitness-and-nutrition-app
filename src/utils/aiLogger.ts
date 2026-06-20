import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ParsedMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
}

export const parseMealText = async (text: string): Promise<ParsedMacros> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured in .env file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
  You are an expert nutritionist. Analyze the following meal description and estimate the macronutrients and calories.
  Return ONLY a valid JSON object matching this exact structure:
  {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "confidence": "high" | "medium" | "low"
  }
  
  Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.
  
  Meal description: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    // Ensure we strip out any markdown formatting just in case
    const cleanJson = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as ParsedMacros;
  } catch (error) {
    console.error("AI Logging error:", error);
    throw new Error('Failed to parse meal data.');
  }
};
