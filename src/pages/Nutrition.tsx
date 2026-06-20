import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Flame, Plus, Coffee, Sun, Moon, Apple } from 'lucide-react';
import { clsx } from 'clsx';
import { MealLoggerModal } from '../components/MealLoggerModal';
import { FoodEntryModal } from '../components/FoodEntryModal';
import type { MealType, FoodLogEntry } from '../types';

export const Nutrition: React.FC = () => {
  const { nutrition, foodLogs, updateFoodLog, removeFoodLog } = useUser();
  const { calories, protein, carbs, fat } = nutrition;
  
  const [activeMeal, setActiveMeal] = useState<MealType | null>(null);
  const [editingLog, setEditingLog] = useState<FoodLogEntry | null>(null);

  // Get today's logs
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = foodLogs.filter(log => log.date === today);

  const getMealTotal = (meal: MealType) => {
    return todaysLogs
      .filter(log => log.mealType === meal)
      .reduce((sum, log) => sum + (log.food.macrosPerUnit.calories * log.food.amount), 0);
  };

  const getMealLogs = (meal: MealType) => todaysLogs.filter(log => log.mealType === meal);

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
    const totalCal = Math.round(getMealTotal(title));
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
              <div className="text-xs text-gray-400">{totalCal} kcal</div>
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
              <div 
                key={log.id} 
                onClick={() => setEditingLog(log)}
                className="flex justify-between items-center text-sm p-2 rounded hover:bg-tactical-800 cursor-pointer transition-colors group"
              >
                <div className="text-gray-300 truncate pr-4 group-hover:text-neon-blue transition-colors">
                  {log.food.name} <span className="text-gray-500 text-xs ml-1">({log.food.amount} {log.food.unit})</span>
                </div>
                <div className="text-gray-500 shrink-0">{Math.round(log.food.macrosPerUnit.calories * log.food.amount)} kcal</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const calPercent = Math.min((calories.current / calories.target) * 100, 100);
  const remainingCals = calories.target - calories.current;

  return (
    <div className="max-w-md mx-auto space-y-6 fade-in mb-24 pb-12">
      
      {/* Top Header / Calendar area */}
      <div className="text-center pt-2">
        <h1 className="font-rajdhani font-bold text-2xl text-white tracking-widest uppercase">Today</h1>
        <p className="text-gray-400 text-sm">Fuel the machine.</p>
      </div>

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
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-6 h-6 text-neon-blue mb-1" />
              <span className="text-3xl font-bold text-white leading-none tracking-tighter">{Math.round(remainingCals > 0 ? remainingCals : 0)}</span>
              <span className="text-[10px] font-rajdhani uppercase tracking-widest text-gray-400 mt-1">Kcal Left</span>
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
        <MealCard title="Breakfast" icon={Coffee} colorClass="text-neon-gold" />
        <MealCard title="Lunch" icon={Sun} colorClass="text-neon-blue" />
        <MealCard title="Dinner" icon={Moon} colorClass="text-neon-purple" />
        <MealCard title="Snack" icon={Apple} colorClass="text-neon-green" />
      </div>

      {/* Modals */}
      {activeMeal && (
        <MealLoggerModal mealType={activeMeal} onClose={() => setActiveMeal(null)} />
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

    </div>
  );
};
