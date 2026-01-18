import { GoogleGenAI, Type, Schema } from "@google/genai";
import { HabitSuggestion, Habit } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client once. 
// Note: In a real production app, we might handle empty API keys more gracefully in the UI.
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateHabitSuggestions = async (userGoal: string): Promise<HabitSuggestion[]> => {
  if (!apiKey) return [];

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
      contents: `Generate 5 structured habit suggestions based on this user goal: "${userGoal}". 
      Ensure a mix of frequencies (daily, weekly) if appropriate. 
      The targetCount should be reasonable (e.g. 1 for daily tasks, 3 for weekly gym visits).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an expert behavioral psychologist and habit coach. Suggest specific, actionable habits.",
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as HabitSuggestion[];
  } catch (error) {
    console.error("Gemini suggestion error:", error);
    return [];
  }
};

export const getHabitMotivation = async (habit: Habit): Promise<string> => {
  if (!apiKey) return "Keep going! You're doing great.";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `The user has a habit: "${habit.title}". 
      Frequency: ${habit.frequency}. 
      Current streak: ${habit.streak}.
      Target: ${habit.targetCount} times per ${habit.frequency.slice(0, -2)}.
      
      Give a short, punchy, 1-sentence motivational message or a specific tip to help them stick to it.`,
      config: {
        maxOutputTokens: 100,
        temperature: 0.8,
      }
    });

    return response.text || "Consistency is key!";
  } catch (error) {
    console.error("Gemini motivation error:", error);
    return "Stay consistent!";
  }
};

export const analyzeProgress = async (habits: Habit[]): Promise<string> => {
  if (!apiKey) return "Track your habits to see insights here.";
  
  // Simplified summary for the prompt
  const summary = habits.map(h => `- ${h.title} (${h.frequency}): Streak ${h.streak}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analyze this user's habit data:\n${summary}\n\nProvide a brief 3-sentence summary of their performance and one area for improvement. Be encouraging but honest.`,
      config: {
        maxOutputTokens: 200,
        systemInstruction: "You are a data-driven life coach."
      }
    });

    return response.text || "Good job tracking your habits.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Keep tracking to unlock insights.";
  }
};
