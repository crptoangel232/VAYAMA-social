import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, Message, MessageSender, ItineraryPlan, BookingRequest } from '../types';
import { geminiService } from '../services/geminiService';
import { SendIcon, BotIcon, UserIcon } from './common/icons';
import ItineraryDisplay from './ItineraryDisplay';

interface AIAssistantProps {
  language: Language;
  onBookNow: (request: BookingRequest) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ language, onBookNow }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      text: `Hello! I'm your Vayama AI travel assistant. How can I help you plan your next trip today? For example, say "Plan me a 3-day budget trip in Freetown under 500k Le."`,
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
          text: `Hello! My language is now set to ${language}. How can I help you plan your trip?`,
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

  const handleSend = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.USER,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const aiResponseText = await geminiService.generatePlan(currentInput, language);
      let itinerary: ItineraryPlan | undefined = undefined;
      let text = aiResponseText;

      try {
        const parsedJson = JSON.parse(aiResponseText);
        if (Array.isArray(parsedJson) && parsedJson[0]?.activities) {
            itinerary = parsedJson;
            text = `Here is the travel plan I've prepared for you based on your request.`;
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
  }, [input, isLoading, language]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black">
      <header className="text-center p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-slate-50/80 dark:bg-black/80 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">AI Travel Assistant</h1>
      </header>
      <div className="flex-grow overflow-y-auto space-y-8 p-4 md:p-6 lg:p-8">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 mx-auto max-w-4xl ${
              msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === MessageSender.AI && (
              <div className="bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-full p-2 flex-shrink-0 mt-1">
                <BotIcon />
              </div>
            )}
            <div
              className={`max-w-md lg:max-w-2xl flex flex-col p-4 rounded-2xl shadow-sm ${
                msg.sender === MessageSender.USER
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm leading-6">{msg.text}</p>
              {msg.itinerary && <ItineraryDisplay plan={msg.itinerary} onBookNow={onBookNow} />}
            </div>
             {msg.sender === MessageSender.USER && (
              <div className="bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-full p-2 flex-shrink-0">
                <UserIcon />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 justify-start mx-auto max-w-4xl">
             <div className="bg-slate-200 dark:bg-slate-800 rounded-full p-2">
                <BotIcon />
              </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-none shadow-sm">
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
      <div className="p-4 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800 sticky bottom-0">
        <div className="max-w-4xl mx-auto flex items-center bg-white dark:bg-slate-800 rounded-xl p-2 shadow-md">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to plan your trip..."
              className="flex-grow bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none px-4 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ''}
              className="bg-blue-500 rounded-lg p-2.5 text-white hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <SendIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
