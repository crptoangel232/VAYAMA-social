import { Type } from "@google/genai";

export enum Tab {
  AI = 'AI',
  BOOK = 'Book',
  CHAT = 'Chat',
  PROFILE = 'Profile',
  REELS = 'Reels',
  SOCIAL = 'Social',
}

export enum Theme {
    LIGHT = 'light',
    DARK = 'dark',
}

export enum Language {
  ENGLISH = 'English',
  KRIO = 'Krio',
  PIDGIN = 'Nigerian Pidgin',
  FRENCH = 'French',
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  itinerary?: ItineraryPlan;
}

export interface User {
  name: string;
  email: string;
  country: string;
}

export type BookingType = 'Flight' | 'Hotel' | 'Food' | 'Activity' | 'Ride';

export interface ItineraryActivity {
  time: string;
  description: string;
  estimated_cost: string;
  location: string;
  booking_type?: BookingType;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export type ItineraryPlan = ItineraryDay[];

export interface BookingRequest {
  type: BookingType;
  details: { [key: string]: string };
}

export interface BookingHistoryItem {
    id: number;
    type: BookingType;
    details: string;
    date: string;
    status: 'Confirmed' | 'Completed' | 'Cancelled';
}

export interface Comment {
    id: string;
    user: string;
    text: string;
    likes: number;
    replies?: Comment[];
}

export interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  timestamp: string;
  location?: string;
  content: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
  };
  likes: number;
  commentsData?: Comment[];
  music?: {
    title: string;
    artist: string;
  };
}


export const ItinerarySchema = {
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
              description: 'The category for booking this item. Omit if not bookable.'
            },
          },
          required: ['time', 'description', 'estimated_cost', 'location'],
        },
      },
    },
    required: ['day', 'title', 'activities'],
  },
};