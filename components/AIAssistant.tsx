import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, Message, MessageSender, ItineraryPlan, BookingRequest } from '../types';
import { geminiService } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon } from './common/icons';
import ItineraryDisplay from './ItineraryDisplay';
import CurrencyConverter from './CurrencyConverter';

interface AIAssistantProps {
  language: Language;
  onBookNow: (request: BookingRequest) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ language, onBookNow }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: `Hello! I'm your KUNKU AI travel assistant. How can I help you plan your next trip today? For example, say "Plan me a 3-day budget trip in Freetown under 500k Le." You can also check live exchange rates with the KUNKU Pay currency tool above, then book and pay easily with KUNKU PAY!`,
      sender: MessageSender.AI,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    geminiService.resetChat();
    setMessages([
        {
          id: 'initial',
          text: `Hello! My language is now set to ${language}. How can I help you plan your trip? You can also check live exchange rates for your KUNKU Pay wallet transactions with the currency tool above!`,
          sender: MessageSender.AI,
        },
    ]);
  }, [language]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendQuery = useCallback(async (queryText: string) => {
    if (queryText.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: queryText,
      sender: MessageSender.USER,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await geminiService.generatePlan(queryText, language);
      let itinerary: ItineraryPlan | undefined = undefined;
      let text = aiResponseText;

      try {
        let cleanText = aiResponseText.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        const parsedJson = JSON.parse(cleanText);
        if (Array.isArray(parsedJson) && parsedJson.length > 0 && parsedJson[0]?.activities) {
            itinerary = parsedJson;
            text = `Here is the travel plan I've prepared for you based on your request:`;
        }
      } catch (e) {
        // Not a JSON response, treat as plain text
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: text,
        sender: MessageSender.AI,
        itinerary: itinerary,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I faced an error. Please try again.',
        sender: MessageSender.AI,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language]);

  const handleSend = () => {
    sendQuery(input);
  };

  const handleBudgetPlanRequest = (budgetPrompt: string) => {
    sendQuery(budgetPrompt);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black">
      <header className="p-3 md:p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/80 dark:bg-black/80 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <BotIcon />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">KUNKU AI Assistant</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart Trip Planner & KUNKU Pay Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </div>
        </div>
      </header>

      {/* Currency Converter Section */}
      <div className="px-4 pt-3 pb-1 max-w-4xl mx-auto w-full">
        <CurrencyConverter onAskAIWithBudget={handleBudgetPlanRequest} />
      </div>

      <div className="flex-grow overflow-y-auto space-y-6 p-4 md:p-6 lg:p-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 md:gap-4 mx-auto max-w-4xl ${
              msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === MessageSender.AI && (
              <div className="bg-blue-600 text-white rounded-xl p-2 flex-shrink-0 mt-1 shadow-sm">
                <BotIcon />
              </div>
            )}
            <div
              className={`max-w-md lg:max-w-2xl flex flex-col p-4 rounded-2xl shadow-sm ${
                msg.sender === MessageSender.USER
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-6">{msg.text}</p>
              {msg.itinerary && <ItineraryDisplay plan={msg.itinerary} onBookNow={onBookNow} />}
            </div>
             {msg.sender === MessageSender.USER && (
              <div className="bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-xl p-2 flex-shrink-0">
                <UserIcon />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start mx-auto max-w-4xl">
             <div className="bg-blue-600 text-white rounded-xl p-2">
                <BotIcon />
              </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Quick prompt suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar text-xs">
            <button
              onClick={() => sendQuery("What is the current exchange rate for USD to SLE in KUNKU Pay?")}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
            >
              💵 USD to SLE rate
            </button>
            <button
              onClick={() => sendQuery("Plan a 3-day luxury beach trip to Tokeh Beach with KUNKU PAY bookings")}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
            >
              🏖️ 3-Day Tokeh Beach
            </button>
            <button
              onClick={() => sendQuery("Recommend top restaurants in Aberdeen Freetown under $50")}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-colors"
            >
              🍽️ Food in Aberdeen
            </button>
          </div>

          <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl p-2 shadow-md border border-slate-200/60 dark:border-slate-700/60">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask KUNKU AI to plan a trip, check rates, or budget..."
                className="flex-grow bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none px-4 text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || input.trim() === ''}
                className="bg-blue-600 rounded-lg p-2.5 text-white hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                <SendIcon />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
