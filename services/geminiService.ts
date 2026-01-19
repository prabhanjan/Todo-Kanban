import { GoogleGenAI, Type } from "@google/genai";
import { AITaskSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTasksFromGoal = async (goal: string): Promise<AITaskSuggestion[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of concrete, actionable tasks for a Kanban board based on this project goal: "${goal}". 
      Assign a realistic status (mostly 'todo', maybe some 'in-progress') and priority. 
      Keep descriptions concise but helpful.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
              status: { type: Type.STRING, enum: ["todo", "in-progress", "review", "done"] },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "priority", "status"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as AITaskSuggestion[];
  } catch (error) {
    console.error("Error generating tasks:", error);
    return [];
  }
};

export const enhanceTaskDescription = async (title: string, currentDescription: string): Promise<{ description: string; subtasks: string[] }> => {
  if (!process.env.API_KEY) return { description: currentDescription, subtasks: [] };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Improve the description for the task "${title}". 
      Current description: "${currentDescription}".
      Provide a more professional, clear description and a list of 3-5 subtasks to complete it.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            subtasks: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { description: currentDescription, subtasks: [] };
    return JSON.parse(text);
  } catch (error) {
    console.error("Error enhancing task:", error);
    return { description: currentDescription, subtasks: [] };
  }
};