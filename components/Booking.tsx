import React, { useState, useEffect } from 'react';
import { CarIcon, HotelIcon, FoodIcon, WalletIcon, CashIcon, MobileMoneyIcon, CreditCardIcon } from './common/icons';
import { BookingRequest, BookingType } from '../types';

interface BookingProps {
  initialRequest: BookingRequest | null;
  clearRequest: () => void;
  showNotification: (message: string) => void;
}

type BookingCategory = 'Ride' | 'Hotel' | 'Food' | 'Flight' | 'Activity';

const mockApiResults = {
  Ride: [{ id: 1, name: 'Standard Ride', price: 'Le 50,000', time: '5 mins away' }],
  Hotel: [
    { id: 1, name: 'Radisson Blu', price: '$150/night', rating: '★★★★★' },
    { id: 2, name: 'The Country Lodge', price: '$120/night', rating: '★★★★☆' },
  ],
  Food: [{ id: 1, name: 'Tess restaurant', price: 'Avg. Le 150,000', cuisine: 'Local' }],
  Flight: [
    { id: 1, name: 'SL Airways F501', price: '$250', time: '1h 30m' },
    { id: 2, name: 'Afri-Jet A102', price: '$220', time: '1h 45m' },
  ],
  Activity: [{ id: 1, name: 'Beach Tour', price: '$25', duration: '3 hours' }],
}

const paymentOptions = [
    { name: 'Pay with Wallet', icon: <WalletIcon /> },
    { name: 'Cash on Delivery', icon: <CashIcon /> },
    { name: 'Orange Money', icon: <MobileMoneyIcon /> },
    { name: 'AfriMoney', icon: <MobileMoneyIcon /> },
    { name: 'Bank/Debit Card', icon: <CreditCardIcon /> }
]

const Booking: React.FC<BookingProps> = ({ initialRequest, clearRequest, showNotification }) => {
  const [activeCategory, setActiveCategory] = useState<BookingCategory>('Ride');
  const [step, setStep] = useState(1); // 1: Form, 2: Results, 3: Payment
  const [results, setResults] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0].name);
  const [formState, setFormState] = useState({
    from: '', to: '', location: '', checkin: '', checkout: '', cuisine: '', 'delivery-location': ''
  });

  useEffect(() => {
    if(initialRequest) {
      const categoryMap: Record<BookingType, BookingCategory> = {
        'Ride': 'Ride',
        'Hotel': 'Hotel',
        'Food': 'Food',
        'Flight': 'Flight',
        'Activity': 'Activity',
      };
      const category = categoryMap[initialRequest.type];
      if (category) {
        setActiveCategory(category);
        setFormState(prev => ({ ...prev, ...initialRequest.details }));
      }
      clearRequest();
    }
  }, [initialRequest, clearRequest]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({...formState, [e.target.id]: e.target.value});
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setResults(mockApiResults[activeCategory] || []);
    setStep(2);
  };
  
  const handleSelectOption = (option: any) => {
    setSelectedOption(option);
    setStep(3);
  }

  const handlePayment = () => {
    setTimeout(() => {
      showNotification(`Booking confirmed via ${selectedPayment}!`);
      setStep(1);
      setResults([]);
      setSelectedOption(null);
    }, 1500);
  };
  
  const renderForm = () => (
    <form onSubmit={handleSearch} className="space-y-4">
      {activeCategory === 'Ride' && <>
        <div>
          <label htmlFor="from" className="block text-xs font-medium text-slate-500 dark:text-slate-400">From</label>
          <input type="text" id="from" placeholder="e.g., Lumley Beach" value={formState.from} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs font-medium text-slate-500 dark:text-slate-400">To</label>
          <input type="text" id="to" placeholder="e.g., Aberdeen" value={formState.to} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
      </>}
       {activeCategory === 'Hotel' && <>
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Location</label>
          <input type="text" id="location" placeholder="e.g., Freetown" value={formState.location} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
      </>}
       {activeCategory === 'Flight' && <>
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Destination</label>
          <input type="text" id="location" placeholder="e.g., Bo" value={formState.location} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
      </>}
      {activeCategory === 'Food' && <>
        <div>
          <label htmlFor="cuisine" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Cuisine or Restaurant</label>
          <input type="text" id="cuisine" placeholder="e.g., Local Sierra Leonean food" value={formState.cuisine} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
      </>}
       {activeCategory === 'Activity' && <>
        <div>
          <label htmlFor="location" className="block text-xs font-medium text-slate-500 dark:text-slate-400">Activity Location</label>
          <input type="text" id="location" placeholder="e.g., Tacugama Chimpanzee Sanctuary" value={formState.location} onChange={handleInputChange} className="w-full mt-1 p-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md border border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500 text-sm" />
        </div>
      </>}
      <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-colors text-sm">Find Options</button>
    </form>
  );

  const renderResults = () => (
    <div>
        <h2 className="text-lg font-bold text-center mb-4">Available Options</h2>
        <div className="space-y-3">
            {results.map(res => (
                <div key={res.id} className="bg-white dark:bg-slate-800 p-3 rounded-md flex justify-between items-center shadow-sm">
                    <div>
                        <p className="font-bold text-sm">{res.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{res.rating || res.time || res.cuisine || res.duration}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-blue-500 text-sm">{res.price}</p>
                        <button onClick={() => handleSelectOption(res)} className="mt-1 text-xs bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600">Select</button>
                    </div>
                </div>
            ))}
        </div>
         <button onClick={() => setStep(1)} className="w-full mt-4 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Back</button>
    </div>
  );

  const renderPayment = () => (
    <div>
        <h2 className="text-lg font-bold text-center mb-4">Confirm & Pay</h2>
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Item:</span> <span className="font-semibold">{selectedOption.name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Price:</span> <span className="font-bold text-blue-500">{selectedOption.price}</span></div>
        </div>
        
        <div className="space-y-2">
            <h3 className="font-bold text-md text-slate-700 dark:text-slate-300">Select Payment Method</h3>
            {paymentOptions.map(opt => (
                <button 
                    key={opt.name} 
                    onClick={() => setSelectedPayment(opt.name)}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-md border-2 transition-colors text-sm ${selectedPayment === opt.name ? 'bg-slate-200 dark:bg-slate-700 border-blue-500' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                    <span className="text-blue-500">{opt.icon}</span>
                    <span>{opt.name}</span>
                </button>
            ))}
        </div>
        
        <button onClick={handlePayment} className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition-colors text-sm">Pay Now</button>
        <button onClick={() => setStep(2)} className="w-full mt-2 bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">Back</button>
    </div>
  );

  const renderContent = () => {
    switch(step) {
      case 1: return renderForm();
      case 2: return renderResults();
      case 3: return renderPayment();
      default: return renderForm();
    }
  }

  const tabs = [
    { name: 'Ride', icon: <CarIcon /> },
    { name: 'Hotel', icon: <HotelIcon /> },
    { name: 'Food', icon: <FoodIcon /> },
  ];

  return (
    <div className="p-4">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Create a Booking</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Quickly book services for your trip</p>
      </header>
      
      <div className="mb-6">
        <div className="flex justify-around bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => { setActiveCategory(tab.name as BookingCategory); setStep(1); }}
              className={`w-full flex justify-center items-center gap-2 p-2 rounded-md text-xs font-medium transition-colors ${
                activeCategory === tab.name ? 'bg-white dark:bg-slate-700 text-blue-500 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
};

export default Booking;