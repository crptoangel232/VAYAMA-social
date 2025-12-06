import React from 'react';
import { ItineraryPlan, BookingRequest, BookingType } from '../types';
import { BookingIcon } from './common/icons';

interface ItineraryDisplayProps {
  plan: ItineraryPlan;
  onBookNow: (request: BookingRequest) => void;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ plan, onBookNow }) => {
  
  const handleBookClick = (type: BookingType, location: string) => {
    const details: {[key: string]: string} = {};
    if (type === 'Ride') {
        details.from = location;
    } else {
        details.location = location;
        details.cuisine = location;
    }
    onBookNow({ type, details });
  };

  return (
    <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
      {plan.map(day => (
        <div key={day.day} className="bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg">
          <h3 className="font-bold text-blue-500 dark:text-blue-400 text-sm">Day {day.day}: {day.title}</h3>
          <ul className="mt-2 space-y-2 text-xs">
            {day.activities.map((activity, index) => (
              <li key={index} className="flex flex-col p-2 rounded bg-slate-200/60 dark:bg-slate-900/50">
                <div className="flex justify-between items-start">
                    <div>
                        <p><span className="font-semibold text-slate-700 dark:text-slate-200">{activity.time}:</span> <span className="text-slate-600 dark:text-slate-300">{activity.description}</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {activity.location} - Est. <span className="font-semibold">{activity.estimated_cost}</span>
                        </p>
                    </div>
                    {activity.booking_type && (
                        <button 
                            onClick={() => handleBookClick(activity.booking_type!, activity.location)}
                            className="ml-2 flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs rounded-md flex items-center gap-1"
                        >
                            <BookingIcon /> Book
                        </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ItineraryDisplay;