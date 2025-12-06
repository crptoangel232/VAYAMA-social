import React, { useState, useCallback, useEffect } from 'react';
import { Tab, Language, BookingRequest, Theme } from './types';
import AIAssistant from './components/AIAssistant';
import Booking from './components/Booking';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Reels from './components/Reels';
import Social from './components/Social';
import BottomNav from './components/common/BottomNav';
import Notification from './components/common/Notification';
import Auth from './components/Auth';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AI);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [user, setUser] = useState({
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
    country: 'Sierra Leone',
  });
  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('vayama-theme') as Theme;
    return savedTheme || Theme.DARK;
  });

  useEffect(() => {
    // Check for existing session
    if (isSupabaseConfigured()) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setUser({
                    name: session.user.user_metadata.full_name || 'User',
                    email: session.user.email || '',
                    country: 'Sierra Leone',
                });
                setIsAuthenticated(true);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setUser({
                    name: session.user.user_metadata.full_name || 'User',
                    email: session.user.email || '',
                    country: 'Sierra Leone',
                });
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        });

        return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
    root.classList.add(theme);
    localStorage.setItem('vayama-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };
  
  const handleBookingRequest = useCallback((request: BookingRequest) => {
    setBookingRequest(request);
    setActiveTab(Tab.BOOK);
  }, []);
  
  const showNotification = (message: string) => {
    setNotification(message);
  };

  const handleAuthSuccess = (userData?: any) => {
      if (userData) {
           setUser({
              name: userData.user_metadata?.full_name || userData.name || 'User',
              email: userData.email || '',
              country: 'Sierra Leone'
           });
      }
      setIsAuthenticated(true);
  }
  
  const handleLogout = async () => {
      if (isSupabaseConfigured()) {
          await supabase.auth.signOut();
      }
      setIsAuthenticated(false);
  }
  
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case Tab.AI:
        return <AIAssistant language={language} onBookNow={handleBookingRequest} />;
      case Tab.BOOK:
        return <Booking 
                  initialRequest={bookingRequest} 
                  clearRequest={() => setBookingRequest(null)}
                  showNotification={showNotification} 
                />;
      case Tab.CHAT:
        return <Chat />;
      case Tab.REELS:
        return <Reels />;
      case Tab.SOCIAL:
        return <Social setActiveTab={setActiveTab} />;
      case Tab.PROFILE:
        return (
          <Profile
            user={user}
            language={language}
            setLanguage={setLanguage}
            showNotification={showNotification}
            theme={theme}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
          />
        );
      default:
        return <AIAssistant language={language} onBookNow={handleBookingRequest} />;
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-200 font-sans antialiased h-screen w-screen flex flex-col">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <div className="flex-grow overflow-hidden flex flex-col">
        {/* Social and Reels handle their own scrolling/layout, others use default container */}
        {activeTab === Tab.REELS || activeTab === Tab.SOCIAL ? (
          <div className="flex-grow h-full">{renderContent()}</div>
        ) : (
          <div className="flex-grow overflow-y-auto pb-20">{renderContent()}</div>
        )}
      </div>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;