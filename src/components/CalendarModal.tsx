import { getLocalDateString } from '../utils/dateUtils';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

interface CalendarModalProps {
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ onClose, selectedDate, onSelectDate }) => {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const handleSelect = (day: number) => {
    // Avoid timezone shift issues by creating the date accurately
    const m = (viewDate.getMonth() + 1).toString().padStart(2, '0');
    const dStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${m}-${dStr}`;
    onSelectDate(dateStr);
  };

  const todayStr = getLocalDateString();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-tactical-800 border border-tactical-600 p-6 rounded-xl w-full max-w-sm relative fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider mb-6">Select Date</h3>

        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-tactical-700 rounded transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <span className="font-rajdhani font-bold text-lg text-white tracking-wider">
            {monthName} {year}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-tactical-700 rounded transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-gray-500 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const m = (viewDate.getMonth() + 1).toString().padStart(2, '0');
            const dStr = day.toString().padStart(2, '0');
            const dateStr = `${year}-${m}-${dStr}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={day}
                onClick={() => handleSelect(day)}
                className={clsx(
                  "w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all mx-auto",
                  isSelected ? "bg-neon-blue text-tactical-900 shadow-[0_0_10px_rgba(0,240,255,0.4)]" :
                  isToday ? "border border-neon-blue text-neon-blue" :
                  "text-gray-300 hover:bg-tactical-700"
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            onClick={() => onSelectDate(todayStr)}
            className="w-full bg-neon-blue text-tactical-900 py-2.5 rounded-full font-rajdhani font-bold uppercase tracking-wider hover:bg-[#00d0dd] transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};
