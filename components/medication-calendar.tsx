'use client';
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Medication } from './medication-schedule';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface MedicationCalendarProps {
  medications: Medication[];
}

export default function MedicationCalendar({ medications }: MedicationCalendarProps) {
  const [activeDate, setActiveDate] = useState<Date>(new Date());

  // Function to determine if a date has medications
  const hasMedications = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    return medications.some(med => {
      const medStart = med.start_date || '';
      const medEnd = med.end_date || '';
      return medStart <= formattedDate && (medEnd === '' || medEnd >= formattedDate);
    });
  };

  // Handle calendar date change with proper typing
  const handleDateChange = (value: Value) => {
    // Only update if the value is a Date (not null)
    if (value instanceof Date) {
      setActiveDate(value);
    }
  };

  // Get medications for a specific date
  const getTileContent = ({ date }: { date: Date }) => {
    const formattedDate = date.toISOString().split('T')[0];
    const dailyMeds = medications.filter(med => {
      const medStart = med.start_date || '';
      const medEnd = med.end_date || '';
      return medStart <= formattedDate && (medEnd === '' || medEnd >= formattedDate);
    });

    if (dailyMeds.length === 0) return null;

    return (
      <div className="flex justify-center items-center mt-1">
        <div className="flex space-x-1">
          {dailyMeds.slice(0, 3).map((_, idx) => (
            <div 
              key={idx} 
              className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"
            />
          ))}
          {dailyMeds.length > 3 && (
            <div className="h-1.5 w-1.5 rounded-full bg-blue-700 dark:bg-blue-300" />
          )}
        </div>
      </div>
    );
  };

  // Custom class for tiles
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    
    const hasEvents = hasMedications(date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isActive = activeDate.toDateString() === date.toDateString();
    
    let classes = 'rounded-lg transition-all duration-200 ';
    
    if (isToday) {
      classes += 'bg-blue-100 dark:bg-blue-900/30 font-bold ';
    }
    
    if (isActive) {
      classes += 'ring-2 ring-blue-500 dark:ring-blue-400 ';
    }
    
    if (hasEvents) {
      classes += 'hover:bg-blue-50 dark:hover:bg-blue-800/30 ';
    } else {
      classes += 'hover:bg-gray-50 dark:hover:bg-gray-800/30 ';
    }
    
    return classes;
  };

  return (
    <div className="bg-white/10 dark:bg-gray-800/50 p-5 rounded-xl shadow-lg backdrop-blur-md border border-white/20 dark:border-gray-700/50 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Medication Calendar
      </h3>
      
      <div className="calendar-container overflow-hidden rounded-lg">
        <Calendar
          onChange={handleDateChange} 
          value={activeDate}
          tileContent={getTileContent}
          tileClassName={getTileClassName}
          className="border-0 w-full bg-transparent text-gray-800 dark:text-gray-200 shadow-none"
          prevLabel={<ChevronLeft />}
          nextLabel={<ChevronRight />}
          prev2Label={null}
          next2Label={null}
          navigationLabel={({ date }) => (
            <span className="text-blue-600 dark:text-blue-400 font-medium text-lg">
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          )}
        />
      </div>
      
      {/* Active date medications */}
      {hasMedications(activeDate) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            {activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h4>
          <div className="space-y-2">
            {medications
              .filter(med => {
                const formattedDate = activeDate.toISOString().split('T')[0];
                const medStart = med.start_date || '';
                const medEnd = med.end_date || '';
                return medStart <= formattedDate && (medEnd === '' || medEnd >= formattedDate);
              })
              .map((med, idx) => (
                <div key={med.id || idx} className="flex items-center text-sm">
                  <div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-2" />
                  <span className="font-medium">{med.name}</span>
                  <span className="mx-1">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {Array.isArray(med.times) ? med.times.join(', ') : 'No time specified'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Icon components
const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);