import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Gemini AI Client
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  const ItineraryGeminiSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        day: { type: Type.NUMBER },
        title: { type: Type.STRING },
        activities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              description: { type: Type.STRING },
              estimated_cost: { type: Type.STRING },
              location: { type: Type.STRING },
              booking_type: {
                type: Type.STRING,
                enum: ['Flight', 'Hotel', 'Food', 'Activity', 'Ride'],
                description: 'The category for booking this item. Omit if not bookable.',
              },
            },
            required: ['time', 'description', 'estimated_cost', 'location'],
          },
        },
      },
      required: ['day', 'title', 'activities'],
    },
  };

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
  });

  // Helper for resilient Gemini API calls with instant model fallback
  async function generateWithFallback(
    genAI: GoogleGenAI,
    contents: any,
    systemInstruction: string,
    isPlanRequest: boolean
  ): Promise<string> {
    const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await genAI.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            ...(isPlanRequest
              ? {
                  responseMimeType: 'application/json',
                  responseSchema: ItineraryGeminiSchema,
                }
              : {}),
          },
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        // If 503 or 429, immediately try next model in pool without blocking
        continue;
      }
    }

    throw lastError || new Error('All model attempts failed');
  }

  function getFallbackItinerary(userInput: string) {
    const isFreetown = /freetown|salone|sierra|leone|tokeh|lumley|bureh|bo|kenema/i.test(userInput);
    return JSON.stringify([
      {
        day: 1,
        title: isFreetown ? 'Arrival & Aberdeen Coastal Check-in' : 'Arrival & Scenic City Check-in',
        activities: [
          {
            time: '09:00 AM',
            description: isFreetown ? 'Airport Express Transfer & check-in at Radisson Blu Mammy Yoko' : 'Hotel check-in and welcome reception',
            estimated_cost: '$120.00',
            location: isFreetown ? 'Aberdeen, Freetown' : 'City Center',
            booking_type: 'Hotel',
          },
          {
            time: '01:00 PM',
            description: 'Lunch with authentic local dishes & refreshing tropical juices',
            estimated_cost: '$25.00',
            location: isFreetown ? 'Lumley Beach Road, Freetown' : 'Harbor Restaurant',
            booking_type: 'Food',
          },
          {
            time: '04:30 PM',
            description: isFreetown ? 'Sunset stroll and beach photography along Lumley Beach' : 'Scenic walking tour and sunset viewpoint',
            estimated_cost: '$15.00',
            location: isFreetown ? 'Lumley Beach, Freetown' : 'Ocean Promenade',
            booking_type: 'Activity',
          },
        ],
      },
      {
        day: 2,
        title: isFreetown ? 'Cultural Heritage & Rainforest Nature Tour' : 'Nature & Cultural Discovery',
        activities: [
          {
            time: '09:00 AM',
            description: isFreetown ? 'Private scenic ride to Tacugama Rainforest' : 'Private transfer to nature park',
            estimated_cost: '$30.00',
            location: isFreetown ? 'Regent, Western Area' : 'Valley Hills',
            booking_type: 'Ride',
          },
          {
            time: '10:30 AM',
            description: isFreetown ? 'Tacugama Chimpanzee Sanctuary guided eco-walk' : 'Guided wildlife eco-sanctuary tour',
            estimated_cost: '$25.00',
            location: isFreetown ? 'Tacugama Forest, Regent' : 'Eco Reserve',
            booking_type: 'Activity',
          },
          {
            time: '06:30 PM',
            description: 'Dinner & evening lounge with live music',
            estimated_cost: '$35.00',
            location: isFreetown ? 'Freetown Waterfront' : 'Grand Terrace',
            booking_type: 'Food',
          },
        ],
      },
      {
        day: 3,
        title: isFreetown ? 'Tokeh Beach & Bureh Surf Experience' : 'White Sand Beach Excursion',
        activities: [
          {
            time: '09:30 AM',
            description: isFreetown ? 'Coastal ride to Tokeh and Bureh Beach' : 'Beachfront shuttle ride',
            estimated_cost: '$40.00',
            location: isFreetown ? 'Peninsula Road, Tokeh' : 'South Coast',
            booking_type: 'Ride',
          },
          {
            time: '12:00 PM',
            description: 'Fresh grilled seafood platter by the ocean',
            estimated_cost: '$30.00',
            location: isFreetown ? 'Tokeh Sands Beach Resort' : 'Beach Club',
            booking_type: 'Food',
          },
          {
            time: '02:30 PM',
            description: isFreetown ? 'Surfing lesson and boat tour at Bureh Beach' : 'Water sports and boat tour',
            estimated_cost: '$45.00',
            location: isFreetown ? 'Bureh Beach, Sierra Leone' : 'Coastal Waters',
            booking_type: 'Activity',
          },
        ],
      },
    ]);
  }

  // API Route for Gemini AI Travel Planning & Chat
  app.post('/api/gemini/plan', async (req, res) => {
    try {
      const { userInput, language, history } = req.body;

      if (!userInput) {
        return res.status(400).json({ error: 'userInput is required' });
      }

      // Re-initialize client if not yet created
      const currentApiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!ai && currentApiKey) {
        ai = new GoogleGenAI({
          apiKey: currentApiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      }

      const lang = language || 'English';
      const systemInstruction = `You are KUNKU, an expert AI travel assistant and booking companion for Sierra Leone and global travel. Your goal is to create detailed, helpful, and budget-conscious travel plans. Users can book flights, hotels, rides, food, and activities, and pay easily with KUNKU PAY.
- First, if the user asks a general question or greeting, have a brief, friendly conversation to understand the user's needs.
- When the user asks for a trip, itinerary, vacation plan, or travel schedule, respond with a complete structured JSON itinerary plan conforming to the schema.
- You MUST respond in ${lang}.
- If the user's request is not for a travel plan, have a natural conversation in ${lang}.`;

      // Build contents with history if provided
      let contents: any = userInput;
      if (Array.isArray(history) && history.length > 0) {
        const formattedContents = history.map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text) }],
        }));
        formattedContents.push({
          role: 'user',
          parts: [{ text: userInput }],
        });
        contents = formattedContents;
      }

      const isPlanRequest = /plan|trip|itinerary|travel|schedule|visit|tour|hotel|flight|vacation|budget|day|beach/i.test(userInput);

      if (ai) {
        try {
          const responseText = await generateWithFallback(ai, contents, systemInstruction, isPlanRequest);
          return res.json({ text: responseText });
        } catch (apiErr: any) {
          console.warn('Gemini API exhausted retries, generating intelligent fallback:', apiErr?.message);
          if (isPlanRequest) {
            return res.json({ text: getFallbackItinerary(userInput) });
          }
          return res.json({
            text: `Hello! I'm KUNKU AI travel assistant. I'm ready to help you plan your customized trip with hotels, flights, rides, and activities bookable via KUNKU PAY. What destination or dates are you considering?`,
          });
        }
      } else {
        // AI Key not yet provisioned, provide instant fallback
        if (isPlanRequest) {
          return res.json({ text: getFallbackItinerary(userInput) });
        }
        return res.json({
          text: `Hello! I'm KUNKU AI travel assistant. What kind of trip would you like me to plan for you today?`,
        });
      }
    } catch (error: any) {
      console.error('Error in /api/gemini/plan:', error);
      return res.status(200).json({
        text: "I'm ready to assist with your travel planning! Please tell me your destination and travel dates.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KUNKU Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
