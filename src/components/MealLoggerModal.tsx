import React, { useState, useMemo } from 'react';
import { X, ScanBarcode, Plus, Sparkles, Send, Loader2, History, Star, Bookmark, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { BarcodeScanner } from './BarcodeScanner';
import { FoodEntryModal } from './FoodEntryModal';
import { parseMealText } from '../utils/aiLogger';
import { clsx } from 'clsx';
import type { MealType, FoodItem, FoodLogEntry } from '../types';

interface MealLoggerModalProps {
  mealType: MealType;
  onClose: () => void;
}

export const MealLoggerModal: React.FC<MealLoggerModalProps> = ({ mealType, onClose }) => {
  const { addFoodLog, updateFoodLog, removeFoodLog, recentFoods, favoriteFoods, savedMeals, foodLogs } = useUser();
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'saved'>('recent');
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [scannedFood, setScannedFood] = useState<Partial<FoodItem> | undefined>(undefined);
  const [editingLog, setEditingLog] = useState<FoodLogEntry | undefined>(undefined);

  // AI Logger state
  const [mealText, setMealText] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState('');
  const [logSuccess, setLogSuccess] = useState('');

  // "Same as yesterday" logic
  const yesterdayLogs = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return foodLogs.filter(log => log.date === yesterdayStr && log.mealType === mealType);
  }, [foodLogs, mealType]);

  const todaysMealLogs = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return foodLogs.filter(log => log.date === today && log.mealType === mealType);
  }, [foodLogs, mealType]);

  const mealMacros = useMemo(() => {
    return todaysMealLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.food.macrosPerUnit.calories * log.food.amount),
      protein: acc.protein + (log.food.macrosPerUnit.protein * log.food.amount),
      carbs: acc.carbs + (log.food.macrosPerUnit.carbs * log.food.amount),
      fat: acc.fat + (log.food.macrosPerUnit.fat * log.food.amount),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysMealLogs]);

  const handleSaveFood = (food: FoodItem) => {
    const log: FoodLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toISOString().split('T')[0],
      mealType,
      food
    };
    addFoodLog(log);
    setShowManual(false);
    setShowScanner(false);
    setScannedFood(undefined);
  };

  const handleAiLog = async () => {
    if (!mealText.trim()) return;
    setIsLogging(true);
    setLogError('');
    setLogSuccess('');
    try {
      const macros = await parseMealText(mealText);
      const foodItem: FoodItem = {
        id: `ai-${Date.now()}`,
        name: mealText,
        amount: 1,
        unit: 'meal',
        macrosPerUnit: macros
      };
      handleSaveFood(foodItem);
      setLogSuccess(`Successfully logged: ${foodItem.name}`);
      setMealText('');
      setTimeout(() => setLogSuccess(''), 3000);
    } catch (err: any) {
      setLogError(err.message || 'Failed to log meal. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  const handleSameAsYesterday = () => {
    yesterdayLogs.forEach(log => {
      handleSaveFood(log.food);
    });
    setLogSuccess(`Added ${yesterdayLogs.length} items from yesterday.`);
    setTimeout(() => setLogSuccess(''), 3000);
  };

  if (showScanner) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[70] flex flex-col">
        <BarcodeScanner 
          onClose={() => setShowScanner(false)}
          onScanSuccess={(food) => {
            setScannedFood(food);
            setShowScanner(false);
            setShowManual(true);
          }} 
        />
      </div>
    );
  }

  if (showManual) {
    return <FoodEntryModal onClose={() => { setShowManual(false); setScannedFood(undefined); }} onSave={handleSaveFood} initialFood={scannedFood} />;
  }

  if (editingLog) {
    return (
      <FoodEntryModal 
        onClose={() => setEditingLog(undefined)} 
        initialFood={editingLog.food}
        isEditing={true}
        onSave={(updatedFood) => {
          updateFoodLog(editingLog.id, updatedFood);
          setEditingLog(undefined);
        }}
        onDelete={() => {
          removeFoodLog(editingLog.id);
          setEditingLog(undefined);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-tactical-800 flex flex-col animate-in slide-in-from-bottom-full duration-200 sm:items-center sm:bg-black/80 sm:p-4">
      <div className="w-full h-full sm:max-w-md sm:h-[85vh] sm:rounded-2xl flex flex-col bg-tactical-800 overflow-hidden relative pb-safe sm:pb-0 shadow-2xl">
        
        {/* Header */}
        <div className="bg-tactical-900 p-4 flex items-center justify-between border-b border-tactical-700 shrink-0 shadow-sm z-10">
          <div>
            <h3 className="esports-heading text-xl text-white">Log {mealType}</h3>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs mt-1">
              <span className="text-neon-red font-bold">{Math.round(mealMacros.calories)} kcal</span>
              <span className="text-tactical-600">|</span>
              <span className="text-neon-blue">{Math.round(mealMacros.protein)}g P</span>
              <span className="text-tactical-600">|</span>
              <span className="text-neon-gold">{Math.round(mealMacros.carbs)}g C</span>
              <span className="text-tactical-600">|</span>
              <span className="text-neon-purple">{Math.round(mealMacros.fat)}g F</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-tactical-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Already Logged Section */}
          {todaysMealLogs.length > 0 && (
            <div className="mb-6">
              <h4 className="font-rajdhani font-bold text-gray-400 uppercase tracking-wider text-xs mb-3 flex items-center justify-between">
                <span>Already Logged</span>
                <span>{todaysMealLogs.length} item{todaysMealLogs.length !== 1 ? 's' : ''}</span>
              </h4>
              <div className="space-y-2">
                {todaysMealLogs.map(log => (
                  <div key={log.id} className="relative overflow-hidden rounded-xl group">
                    {/* Delete Background */}
                    <div className="absolute inset-y-0 right-0 w-20 bg-neon-red flex items-center justify-center rounded-xl">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFoodLog(log.id);
                        }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <Trash2 className="w-6 h-6 text-tactical-900" />
                      </button>
                    </div>

                    {/* Swipeable Foreground */}
                    <motion.div 
                      drag="x"
                      dragConstraints={{ left: -80, right: 0 }}
                      dragElastic={0.1}
                      dragDirectionLock
                      onClick={() => setEditingLog(log)}
                      className="relative z-10 bg-tactical-900 border border-tactical-700 p-3 rounded-xl flex items-center justify-between cursor-pointer group-hover:border-neon-blue transition-colors bg-opacity-100"
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm group-hover:text-neon-blue transition-colors">{log.food.name}</h4>
                        <div className="text-xs text-gray-400 mt-1">
                          {log.food.amount} {log.food.unit} • <span className="text-neon-red font-bold">{Math.round(log.food.macrosPerUnit.calories * log.food.amount)} kcal</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-neon-blue font-bold">{Math.round(log.food.macrosPerUnit.protein * log.food.amount)}g P</span>
                        <span className="text-tactical-600">|</span>
                        <span className="text-neon-gold font-bold">{Math.round(log.food.macrosPerUnit.carbs * log.food.amount)}g C</span>
                        <span className="text-tactical-600">|</span>
                        <span className="text-neon-purple font-bold">{Math.round(log.food.macrosPerUnit.fat * log.food.amount)}g F</span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* AI Logger Box */}
          <div className="bg-tactical-900 border border-neon-purple/30 rounded-xl p-4 mb-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-neon-purple/10 transition-colors pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              <h4 className="font-rajdhani font-bold text-white tracking-wider">AI MEAL LOGGER</h4>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={mealText}
                onChange={(e) => setMealText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiLog()}
                placeholder="e.g. 2 eggs and toast..."
                disabled={isLogging}
                className="flex-1 bg-tactical-800 border border-tactical-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-purple text-sm"
              />
              <button 
                onClick={handleAiLog}
                disabled={isLogging || !mealText.trim()}
                className="bg-neon-purple text-white px-4 py-2 rounded-lg font-rajdhani font-bold hover:bg-[#b042ff] disabled:opacity-50 flex items-center justify-center"
              >
                {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            {logError && <div className="mt-2 text-neon-red text-xs font-inter">{logError}</div>}
            {logSuccess && <div className="mt-2 text-neon-green text-xs font-inter font-bold">{logSuccess}</div>}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={() => setShowScanner(true)}
              className="bg-tactical-900 border border-tactical-700 hover:border-neon-blue rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <ScanBarcode className="w-6 h-6 text-neon-blue group-hover:scale-110 transition-transform" />
              <span className="font-rajdhani font-bold text-white text-sm">Scan Barcode</span>
            </button>
            <button 
              onClick={() => setShowManual(true)}
              className="bg-tactical-900 border border-tactical-700 hover:border-white rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <Plus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              <span className="font-rajdhani font-bold text-white text-sm">Manual Entry</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-tactical-700 mb-4 sticky top-0 bg-tactical-800 z-10 pt-2">
            <button
              onClick={() => setActiveTab('recent')}
              className={clsx(
                "flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider text-sm transition-colors",
                activeTab === 'recent' ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-2"><History className="w-4 h-4" /> Recent</div>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={clsx(
                "flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider text-sm transition-colors",
                activeTab === 'favorites' ? "text-neon-gold border-b-2 border-neon-gold" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-2"><Star className="w-4 h-4" /> Favorites</div>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={clsx(
                "flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider text-sm transition-colors",
                activeTab === 'saved' ? "text-neon-purple border-b-2 border-neon-purple" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-2"><Bookmark className="w-4 h-4" /> Saved Meals</div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-2 pb-6">
            {activeTab === 'recent' && (
              <>
                {yesterdayLogs.length > 0 && (
                  <button 
                    onClick={handleSameAsYesterday}
                    className="w-full bg-tactical-900 border border-tactical-700 hover:border-neon-blue p-3 rounded-lg flex items-center justify-between mb-4 group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center">
                        <History className="w-4 h-4 text-neon-blue" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white text-sm">Same as yesterday</div>
                        <div className="text-xs text-gray-400">{yesterdayLogs.length} items logged</div>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-neon-blue opacity-50 group-hover:opacity-100" />
                  </button>
                )}
                
                {recentFoods.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-inter text-sm">No recent foods.</div>
                )}
                
                {recentFoods.map((food, idx) => (
                  <div key={food.id + idx} className="bg-tactical-900 border border-tactical-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{food.name}</div>
                      <div className="text-xs text-gray-400">
                        {food.amount} {food.unit} • {Math.round(food.macrosPerUnit.calories * food.amount)} kcal
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSaveFood(food)}
                      className="bg-tactical-800 hover:bg-neon-blue/20 text-neon-blue p-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'favorites' && (
              <>
                {favoriteFoods.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-inter text-sm">No favorite foods.</div>
                )}
                {favoriteFoods.map((food, idx) => (
                  <div key={food.id + idx} className="bg-tactical-900 border border-tactical-700 p-3 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {food.name} <Star className="w-3 h-3 text-neon-gold fill-current" />
                      </div>
                      <div className="text-xs text-gray-400">
                        {food.amount} {food.unit} • {Math.round(food.macrosPerUnit.calories * food.amount)} kcal
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSaveFood(food)}
                      className="bg-tactical-800 hover:bg-neon-blue/20 text-neon-blue p-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </>
            )}

            {activeTab === 'saved' && (
              <>
                {savedMeals.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-inter text-sm">No saved meals yet.</div>
                )}
                {savedMeals.map((meal) => {
                  const totalCal = meal.items.reduce((sum, item) => sum + (item.macrosPerUnit.calories * item.amount), 0);
                  return (
                    <div key={meal.id} className="bg-tactical-900 border border-tactical-700 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">{meal.name}</div>
                        <div className="text-xs text-gray-400">
                          {meal.items.length} items • {Math.round(totalCal)} kcal
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          meal.items.forEach(item => {
                            addFoodLog({
                              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                              date: today,
                              mealType,
                              food: item
                            });
                          });
                          setLogSuccess(`Added ${meal.name}`);
                          setTimeout(() => setLogSuccess(''), 3000);
                        }}
                        className="bg-tactical-800 hover:bg-neon-purple/20 text-neon-purple p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
