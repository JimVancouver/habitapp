import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HabitSuggestion, Habit } from "../types";

// Robust check for API Key in browser/deployment environments
const getApiKey = (): string => {
  try {
    // Check for process.env (Vercel/Node) or window.process (some polyfills)
    const key = process.env.API_KEY;
    return key || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();

// Only initialize if we have a key to avoid crashes
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateHabitSuggestions = async (userGoal: string): Promise<HabitSuggestion[]> => {
  if (!ai || !apiKey) {
    console.warn("Gemini API not initialized: Missing API Key");
    return [];
  }

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        frequency: { type: Type.STRING, enum: ['daily', 'weekly', 'monthly'] },
        targetCount: { type: Type.INTEGER },
        category: { type: Type.STRING, enum: ['health', 'productivity', 'learning', 'mindfulness', 'other'] }
      },
      required: ['title', 'description', 'frequency', 'targetCount', 'category'],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate 5 structured habit suggestions based on this user goal: "${userGoal}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert habit coach.",
      },
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return [];
  }
};

export const getHabitMotivation = async (habit: Habit): Promise<string> => {
  if (!ai || !apiKey) return "Consistency is the bridge between goals and accomplishment.";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Give a 1-sentence motivation for the habit: "${habit.title}". Current streak: ${habit.streak}.`,
      config: { maxOutputTokens: 60 }
    });
    return response.text || "Keep going!";
  } catch (error) {
    return "Stay focused on your goals!";
  }
};

export const analyzeProgress = async (habits: Habit[]): Promise<string> => {
  if (!ai || !apiKey || habits.length === 0) return "Add some habits and track them to see AI insights!";
  
  const summary = habits.map(h => `${h.title}: ${h.streak} day streak`).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze my progress: ${summary}. Give me a 2-sentence coach's perspective.`,
      config: { maxOutputTokens: 150 }
    });
    return response.text || "You're making steady progress. Keep showing up!";
  } catch (error) {
    return "Your consistency is building the foundation for your future self.";
  }
};