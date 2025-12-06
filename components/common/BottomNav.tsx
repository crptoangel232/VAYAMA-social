import React from 'react';
import { Tab } from '../../types';
import { BotIcon, BookingIcon, ChatIcon, ProfileIcon, ReelsIcon, SocialIcon } from './icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
    }`}
    aria-label={label}
  >
    {icon}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { tab: Tab.AI, label: 'AI Plan', icon: <BotIcon /> },
    { tab: Tab.BOOK, label: 'Book', icon: <BookingIcon /> },
    { tab: Tab.SOCIAL, label: 'Social', icon: <SocialIcon /> },
    { tab: Tab.REELS, label: 'Reels', icon: <ReelsIcon /> },
    { tab: Tab.CHAT, label: 'Chat', icon: <ChatIcon /> },
    { tab: Tab.PROFILE, label: 'Profile', icon: <ProfileIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex justify-around items-center z-10">
      {navItems.map((item) => (
        <NavItem
          key={item.tab}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.tab}
          onClick={() => setActiveTab(item.tab)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;