import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthProps {
  onAuthSuccess: (user?: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // If Supabase is not configured, fallback to mock login
    if (!isSupabaseConfigured()) {
        setTimeout(() => {
            console.log("Supabase not configured, using mock auth");
            onAuthSuccess({
                email,
                name: fullName || 'Demo User',
                id: 'mock-id'
            });
        }, 1000);
        return;
    }

    try {
        if (isLoginView) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            onAuthSuccess(data.user);
        } else {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });
            if (error) throw error;
            onAuthSuccess(data.user);
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred');
        // For demo purposes, if login fails (e.g. fake credentials in a demo environment), we might still want to let them in as mock
        // Uncomment below to force entry on error for demo:
        // onAuthSuccess({ email, name: 'Fallback User' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden text-slate-800 dark:text-slate-200">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0">
         <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-[2px]"></div>
         <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
         >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4" type="video/mp4" />
         </video>
      </div>

      <div className="w-full max-w-sm z-20">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white tracking-tight drop-shadow-md">VAYAMA</h1>
          <p className="text-slate-200 mt-2 text-lg font-light drop-shadow-sm">Explore. Connect. Book.</p>
        </header>

        <div className="bg-white/90 dark:bg-black/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">
            {isLoginView ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  placeholder="Alex Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-1 p-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all" 
                  required={!isLoginView}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Email Address</label>
              <input 
                type="email" 
                id="email"
                placeholder="alex.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all" 
                required 
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLoginView ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => { setIsLoginView(!isLoginView); setError(null); }}
              className="font-semibold text-blue-600 hover:text-blue-500 ml-1 transition-colors"
            >
              {isLoginView ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;