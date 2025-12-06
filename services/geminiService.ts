import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { Language, ItinerarySchema } from '../types';

class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private initializeChat(language: Language) {
    const systemInstruction = `You are Vayama, an expert travel assistant. Your goal is to create detailed, helpful, and budget-conscious travel plans.
- First, have a brief, friendly conversation to understand the user's needs. Ask clarifying questions if needed.
- Once you have enough information, respond with a complete travel itinerary.
- You MUST respond in ${language}.
- When generating a travel plan, you MUST respond with only a JSON object that strictly follows this schema: ${JSON.stringify(ItinerarySchema)}. Do not add any conversational text or markdown formatting around the JSON object.
- If the user's request is not for a travel plan, have a normal conversation without returning JSON.`;
    
    this.chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: ItinerarySchema,
      }
    });
  }

  public async generatePlan(userInput: string, language: Language): Promise<string> {
    if (!this.chat) {
      this.initializeChat(language);
    }

    try {
      const response: GenerateContentResponse = await this.chat!.sendMessage({
        message: userInput,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating plan with Gemini:", error);
      // Reset chat on error
      this.chat = null; 
      return "I'm sorry, I encountered an error. Let's try again. What kind of trip are you thinking of?";
    }
  }

  public resetChat() {
    this.chat = null;
  }
}

export const geminiService = new GeminiService();
