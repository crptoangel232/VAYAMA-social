import React, { useState } from 'react';
import { User, Language, BookingHistoryItem, Theme } from '../types';
import { UserCircleIcon, LogoutIcon, HistoryIcon, FeedbackIcon, WalletIcon, CreditCardIcon, BitcoinIcon, EthereumIcon } from './common/icons';

interface ProfileProps {
  user: User;
  language: Language;
  setLanguage: (language: Language) => void;
  showNotification: (message: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  onLogout: () => void;
}

const mockPaymentHistory = [
    {id: 1, item: 'Flight to Bo', amount: '-$250.00', date: '2024-07-20'},
    {id: 2, item: 'Radisson Blu Hotel', amount: '-$150.00', date: '2024-07-20'},
    {id: 3, item: 'Wallet Top-up', amount: '+$500.00', date: '2024-07-19'},
];

const mockBookingHistory: BookingHistoryItem[] = [
    {id: 1, type: 'Flight', details: 'Freetown to Bo', date: '2024-07-20', status: 'Completed'},
    {id: 2, type: 'Hotel', details: 'Radisson Blu, 1 night', date: '2024-07-20', status: 'Completed'},
    {id: 3, type: 'Activity', details: 'Beach Tour', date: '2024-07-21', status: 'Confirmed'},
    {id: 4, type: 'Ride', details: 'Airport Transfer', date: '2024-07-19', status: 'Cancelled'},
];

const TopUpModal: React.FC<{onClose: () => void}> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Top-up Wallet</h3>
            <div className="space-y-3">
                 <button className="w-full flex items-center gap-3 p-3 text-left rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <CreditCardIcon/> Bank/Debit Card
                 </button>
                 <button className="w-full flex items-center gap-3 p-3 text-left rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <BitcoinIcon /> Bitcoin
                 </button>
                 <button className="w-full flex items-center gap-3 p-3 text-left rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                    <EthereumIcon /> Ethereum
                 </button>
            </div>
            <button onClick={onClose} className="w-full mt-6 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 font-bold py-2 px-4 rounded-md transition-colors text-sm">
                Cancel
            </button>
        </div>
    </div>
);


const Profile: React.FC<ProfileProps> = ({ user, language, setLanguage, showNotification, theme, toggleTheme, onLogout }) => {
  const [showTopUp, setShowTopUp] = useState(false);

  return (
    <div className="p-4">
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)}/>}
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Profile</h1>
      </header>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-4 ring-2 ring-blue-500/50">
          <UserCircleIcon className="w-20 h-20 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg mb-6">
        <h3 className="text-md font-semibold mb-2 text-blue-500">My Wallet</h3>
        <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Current Balance</span>
            <span className="text-2xl font-bold text-green-500">$100.00</span>
        </div>
        <button onClick={() => setShowTopUp(true)} className="w-full mt-4 bg-blue-500/90 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
            Top-up Wallet
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg space-y-6">
        <div className="flex justify-between items-center">
            <label htmlFor="theme-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </label>
            <button onClick={toggleTheme} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${theme === 'light' ? 'bg-slate-300' : 'bg-blue-600'}`}>
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'light' ? 'translate-x-1' : 'translate-x-6'}`} />
            </button>
        </div>

        <div>
          <label htmlFor="language" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Preferred Language</label>
          <select 
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {Object.values(Language).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div>
            <h3 className="text-md font-semibold mb-2 text-blue-500 flex items-center gap-2"><HistoryIcon/>Booking History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {mockBookingHistory.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm">
                        <div>
                            <p className="font-medium">{item.type}: <span className="font-normal text-slate-600 dark:text-slate-300">{item.details}</span></p>
                            <p className="text-xs text-slate-500">{item.date}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                            item.status === 'Confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                            'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
                        }`}>{item.status}</span>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-md font-semibold mb-2 text-blue-500">Payment History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {mockPaymentHistory.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm">
                        <div>
                            <p className="font-medium">{item.item}</p>
                            <p className="text-xs text-slate-500">{item.date}</p>
                        </div>
                        <p className={`font-semibold ${item.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                            {item.amount}
                        </p>
                    </div>
                ))}
            </div>
        </div>
        
        <button onClick={() => showNotification('Thank you for your feedback!')} className="w-full flex items-center justify-center gap-2 border border-blue-500/50 text-blue-500 font-bold py-2 px-4 rounded-md hover:bg-blue-500/10 transition-colors text-sm">
            <FeedbackIcon/>
            Send Feedback
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-2 px-4 rounded-md transition-colors text-sm"
        >
          <LogoutIcon />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;