import { Language, Message } from '../types';

class GeminiService {
  private history: Message[] = [];

  public async generatePlan(userInput: string, language: Language): Promise<string> {
    try {
      const response = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          language,
          history: this.history,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Server returned error for Gemini plan:', errData);
        if (errData.text) {
          return errData.text;
        }
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Error generating plan with Gemini:', error);
      return "I'm sorry, I encountered an issue reaching the AI service. Please make sure your connection is stable and try again.";
    }
  }

  public resetChat() {
    this.history = [];
  }
}

export const geminiService = new GeminiService();
