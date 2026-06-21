import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Flame, Plus, Coffee, Sun, Moon, Apple, Trash2, ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { clsx } from 'clsx';
import { MealLoggerModal } from '../components/MealLoggerModal';
import { FoodEntryModal } from '../components/FoodEntryModal';
import { CalendarModal } from '../components/CalendarModal';
import type { MealType, FoodLogEntry } from '../types';

export const Nutrition: React.FC = () => {
  const { foodLogs, updateFoodLog, removeFoodLog, getMacrosForDate, saveToFavorites } = useUser();
  
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [editingLog, setEditingLog] = useState<FoodLogEntry | null>(null);
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  const dailyNutrition = getMacrosForDate(viewDate);
  const { calories, protein, carbs, fat } = dailyNutrition;

  const viewedLogs = foodLogs.filter(log => log.date === viewDate);

  const getMealMacros = (meal: MealType) => {
    return viewedLogs
      .filter(log => log.mealType === meal)
      .reduce((acc, log) => ({
        calories: acc.calories + (log.food.macrosPerUnit.calories * log.food.amount),
        protein: acc.protein + (log.food.macrosPerUnit.protein * log.food.amount),
        carbs: acc.carbs + (log.food.macrosPerUnit.carbs * log.food.amount),
        fat: acc.fat + (log.food.macrosPerUnit.fat * log.food.amount),
      }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const getMealLogs = (meal: MealType) => viewedLogs.filter(log => log.mealType === meal);

  const MacroCircle = ({ label, current, target, colorClass }: any) => {
    const percent = Math.min((current / target) * 100, 100);
    return (
      <div className="flex flex-col items-center">
        <div className="text-white font-bold text-lg leading-none">{Math.round(current)}</div>
        <div className="text-[10px] text-gray-400 font-rajdhani uppercase tracking-wider mb-2">{label}</div>
        <div className="w-full bg-tactical-800 h-1.5 rounded-full overflow-hidden">
          <div className={clsx("h-full rounded-full", colorClass)} style={{ width: `${percent}%` }} />
        </div>
        <div className="text-[10px] text-gray-500 mt-1">{target}g max</div>
      </div>
    );
  };

  const MealCard = ({ title, icon: Icon, colorClass }: { title: MealType; icon: any; colorClass: string }) => {
    const macros = getMealMacros(title);
    const logs = getMealLogs(title);
    
    return (
      <div className="bg-tactical-900 border border-tactical-700 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center bg-tactical-800", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rajdhani font-bold text-white text-lg">{title}</h3>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="text-neon-red font-bold">{Math.round(macros.calories)} kcal</span>
                <span className="text-tactical-600">|</span>
                <span className="text-neon-blue">{Math.round(macros.protein)}g P</span>
                <span className="text-tactical-600">|</span>
                <span className="text-neon-gold">{Math.round(macros.carbs)}g C</span>
                <span className="text-tactical-600">|</span>
                <span className="text-neon-purple">{Math.round(macros.fat)}g F</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveMeal(title)}
            className="w-8 h-8 rounded-full bg-tactical-800 hover:bg-tactical-700 text-white flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {logs.length > 0 && (
          <div className="space-y-2 mt-2 border-t border-tactical-800 pt-3">
            {logs.map((log) => (
              <div key={log.id} className="relative overflow-hidden rounded group">
                {/* Favorite Background */}
                <div className="absolute inset-y-0 left-0 w-16 bg-neon-gold flex items-center justify-center rounded">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      saveToFavorites(log.food);
                      // Add a little visual feedback if desired, or let it just happen
                    }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Star className="w-5 h-5 text-tactical-900 fill-tactical-900" />
                  </button>
                </div>

                {/* Delete Background */}
                <div className="absolute inset-y-0 right-0 w-16 bg-neon-red flex items-center justify-center rounded">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFoodLog(log.id);
                    }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5 text-tactical-900" />
                  </button>
                </div>
                
                {/* Swipeable Foreground */}
                <motion.div 
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  dragDirectionLock
                  onDragEnd={(_e, info) => {
                    if (info.offset.x > 50) {
                      saveToFavorites(log.food);
                    } else if (info.offset.x < -50) {
                      removeFoodLog(log.id);
                    }
                  }}
                  onClick={() => setEditingLog(log)}
                  className="relative z-10 bg-tactical-900 flex justify-between items-center text-sm p-2 rounded cursor-pointer border border-transparent group-hover:bg-tactical-800 transition-colors"
                >
                  <div className="text-gray-300 truncate pr-4 group-hover:text-neon-blue transition-colors">
                    {log.food.name} <span className="text-gray-500 text-xs ml-1">({log.food.amount} {log.food.unit})</span>
                  </div>
                  <div className="text-gray-500 shrink-0">{Math.round(log.food.macrosPerUnit.calories * log.food.amount)} kcal</div>
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const calPercent = Math.min((calories.current / calories.target) * 100, 100);
  const remainingCals = calories.target - calories.current;

  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      const d = new Date(viewDate + 'T12:00:00');
      if (info.offset.x > 0) {
        // Swiped right -> Previous day
        d.setDate(d.getDate() - 1);
      } else {
        // Swiped left -> Next day
        d.setDate(d.getDate() + 1);
      }
      setViewDate(d.toISOString().split('T')[0]);
    }
  };

  const shiftDate = (days: number) => {
    const d = new Date(viewDate + 'T12:00:00');
    d.setDate(d.getDate() + days);
    setViewDate(d.toISOString().split('T')[0]);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  let displayDateStr = '';
  if (viewDate === todayStr) displayDateStr = 'Today';
  else if (viewDate === yesterdayStr) displayDateStr = 'Yesterday';
  else if (viewDate === tomorrowStr) displayDateStr = 'Tomorrow';
  else {
    const d = new Date(viewDate + 'T12:00:00');
    displayDateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <div className="max-w-md mx-auto space-y-6 fade-in mb-24 pb-12 overflow-x-hidden">
      
      {/* Top Header / Calendar area */}
      <div className="flex items-center justify-between pt-2 px-4">
        <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-tactical-800 rounded-full transition-colors text-gray-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div 
          className="text-center cursor-pointer group flex flex-col items-center justify-center"
          onClick={() => setShowCalendar(true)}
        >
          <div className="flex items-center gap-2">
            <h1 className="font-rajdhani font-bold text-2xl text-white tracking-widest uppercase group-hover:text-neon-blue transition-colors">
              {displayDateStr}
            </h1>
            <Calendar className="w-4 h-4 text-gray-500 group-hover:text-neon-blue transition-colors" />
          </div>
          <p className="text-gray-400 text-xs">Fuel the machine.</p>
        </div>
        <button onClick={() => shiftDate(1)} className="p-2 hover:bg-tactical-800 rounded-full transition-colors text-gray-400 hover:text-white">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <motion.div
        key={viewDate}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="space-y-6"
      >

      {/* Unified Macro Summary */}
      <div className="bg-tactical-900 border border-tactical-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-red" />
        
        <div className="flex justify-center mb-8 mt-2 relative">
          {/* Circular Progress for Calories */}
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a2a" strokeWidth="8" />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="#00f0ff" 
                strokeWidth="8" 
                strokeLinecap="round"
                strokeDasharray={`${calPercent * 2.827} 282.7`} 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <Flame className="w-4 h-4 text-neon-blue mb-1" />
              <span className="text-2xl font-bold text-white leading-none tracking-tighter">{Math.round(calories.current)}</span>
              <span className="text-[9px] font-rajdhani uppercase tracking-widest text-gray-400 mt-0.5">Eaten</span>
              <div className="w-10 h-px bg-tactical-700 my-1.5" />
              <span className="text-xl font-bold text-neon-blue leading-none tracking-tighter">{Math.round(remainingCals > 0 ? remainingCals : 0)}</span>
              <span className="text-[9px] font-rajdhani uppercase tracking-widest text-gray-500 mt-0.5">Left</span>
            </div>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="grid grid-cols-3 gap-6">
          <MacroCircle label="Protein" current={protein.current} target={protein.target} colorClass="bg-neon-blue" />
          <MacroCircle label="Carbs" current={carbs.current} target={carbs.target} colorClass="bg-neon-gold" />
          <MacroCircle label="Fat" current={fat.current} target={fat.target} colorClass="bg-neon-purple" />
        </div>
      </div>

      {/* Meal Cards */}
      <div className="space-y-4">
        <MealCard title="Breakfast" icon={Coffee} colorClass="text-neon-blue" />
        <MealCard title="Lunch" icon={Sun} colorClass="text-neon-gold" />
        <MealCard title="Dinner" icon={Moon} colorClass="text-neon-purple" />
        <MealCard title="Snack" icon={Apple} colorClass="text-neon-red" />
      </div>
      </motion.div>

      {/* Modals */}
      {activeMeal && (
        <MealLoggerModal 
          mealType={activeMeal} 
          selectedDate={viewDate}
          onClose={() => setActiveMeal(null)} 
        />
      )}
      
      {editingLog && (
        <FoodEntryModal
          isEditing
          initialFood={editingLog.food}
          onSave={(updatedFood) => {
            updateFoodLog(editingLog.id, updatedFood);
            setEditingLog(null);
          }}
          onDelete={() => {
            removeFoodLog(editingLog.id);
            setEditingLog(null);
          }}
          onClose={() => setEditingLog(null)}
        />
      )}

      {showCalendar && (
        <CalendarModal
          selectedDate={viewDate}
          onClose={() => setShowCalendar(false)}
          onSelectDate={(dateStr) => {
            setViewDate(dateStr);
            setShowCalendar(false);
          }}
        />
      )}

    </div>
  );
};
