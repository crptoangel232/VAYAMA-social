import { createClient } from '@supabase/supabase-js';

// Access environment variables securely. 
// Note: In a real Vite app, these would be import.meta.env.VITE_SUPABASE_URL, etc.
// For this environment, we use process.env as per the pattern provided in other files or typical Node-ish mocks.
// If these are not set, the app will degrade gracefully to mock mode where possible.

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize the client if the URL and Key are present to avoid "supabaseUrl is required" error.
// We export a dummy object if not configured, relying on `isSupabaseConfigured()` checks in the app.
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : ({} as any);

export const isSupabaseConfigured = () => {
    return supabaseUrl.length > 0 && supabaseKey.length > 0;
};