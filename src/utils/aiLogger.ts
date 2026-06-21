import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface ParsedFoodItem {
  name: string;
  amount: number;
  unit: string;
  macrosPerUnit: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface ParsedMeal {
  items: ParsedFoodItem[];
  confidence: 'high' | 'medium' | 'low';
}

export const parseMealText = async (text: string): Promise<ParsedMeal> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured in .env file.');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
  You are an expert nutritionist. Analyze the following meal description and extract each individual food item along with its estimated macronutrients and calories.
  Return ONLY a valid JSON object matching this exact structure:
  {
    "items": [
      {
        "name": "string (name of the food item)",
        "amount": number (quantity),
        "unit": "string (e.g., 'large', 'slice', 'cup', 'g', 'oz', 'tbsp')",
        "macrosPerUnit": {
          "calories": number (calories for ONE unit),
          "protein": number (protein in grams for ONE unit),
          "carbs": number (carbs in grams for ONE unit),
          "fat": number (fat in grams for ONE unit)
        }
      }
    ],
    "confidence": "high" | "medium" | "low"
  }
  
  IMPORTANT: The macros provided in macrosPerUnit must be for exactly ONE unit. For example, if the user had "2 slices of toast", the amount is 2, the unit is "slice", and the macrosPerUnit should be the nutrition for just 1 slice.
  
  Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.
  
  Meal description: "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    // Ensure we strip out any markdown formatting just in case
    const cleanJson = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as ParsedMeal;
  } catch (error: any) {
    console.error("AI Logging error:", error);
    throw new Error(`AI Error: ${error.message || 'Failed to parse meal data'}`);
  }
};
