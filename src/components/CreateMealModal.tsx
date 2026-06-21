import React, { useState } from 'react';
import { X, Save, History, Star, ScanBarcode, Plus, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useUser } from '../context/UserContext';
import { FoodEntryModal } from './FoodEntryModal';
import { BarcodeScanner } from './BarcodeScanner';
import type { FoodItem, Meal } from '../types';

interface CreateMealModalProps {
  onClose: () => void;
}

export const CreateMealModal: React.FC<CreateMealModalProps> = ({ onClose }) => {
  const { recentFoods, favoriteFoods, saveMeal } = useUser();
  const [mealName, setMealName] = useState('');
  const [mealItems, setMealItems] = useState<FoodItem[]>([]);
  
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [showManual, setShowManual] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedFood, setScannedFood] = useState<Partial<FoodItem> | undefined>(undefined);

  const totalCalories = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.calories * item.amount), 0);
  const totalProtein = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.protein * item.amount), 0);
  const totalCarbs = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.carbs * item.amount), 0);
  const totalFat = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.fat * item.amount), 0);

  const handleSaveMeal = () => {
    if (!mealName.trim() || mealItems.length === 0) return;
    const newMeal: Meal = {
      id: String(Date.now()),
      name: mealName.trim(),
      items: mealItems
    };
    saveMeal(newMeal);
    onClose();
  };

  const removeItem = (idx: number) => {
    setMealItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveManualFood = (food: FoodItem) => {
    setMealItems(prev => [...prev, food]);
    setShowManual(false);
    setScannedFood(undefined);
  };

  if (showScanner) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[80] flex flex-col">
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
    return (
      <FoodEntryModal 
        initialFood={scannedFood}
        onSave={handleSaveManualFood}
        onClose={() => { setShowManual(false); setScannedFood(undefined); }} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-tactical-800 flex flex-col animate-in slide-in-from-bottom-full duration-200 sm:items-center sm:bg-black/80 sm:p-4">
      <div className="w-full h-full sm:max-w-md sm:h-[85vh] sm:rounded-2xl flex flex-col bg-tactical-800 overflow-hidden relative pb-safe sm:pb-0 shadow-2xl">
        
        {/* Header */}
        <div className="bg-tactical-900 p-4 flex flex-col border-b border-tactical-700 shrink-0 shadow-sm z-10 gap-3">
          <div className="flex items-center justify-between">
            <h3 className="esports-heading text-xl text-white flex items-center gap-2">
              <Save className="w-5 h-5 text-[#39ff14]" /> Create Meal
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-tactical-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <input 
            type="text" 
            value={mealName}
            onChange={e => setMealName(e.target.value)}
            placeholder="Name your meal... (e.g. Pre-Workout)"
            className="w-full bg-tactical-800 border border-tactical-600 text-white p-3 rounded focus:border-[#39ff14] outline-none transition-all"
          />

          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-gray-400 uppercase tracking-wider">Total Macros:</span>
            <div className="flex gap-2">
              <span className="text-neon-red font-bold">{Math.round(totalCalories)} kcal</span>
              <span className="text-tactical-600">|</span>
              <span className="text-neon-blue">{Math.round(totalProtein)}g P</span>
              <span className="text-tactical-600">|</span>
              <span className="text-neon-gold">{Math.round(totalCarbs)}g C</span>
              <span className="text-tactical-600">|</span>
              <span className="text-neon-purple">{Math.round(totalFat)}g F</span>
            </div>
          </div>
        </div>

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Items Currently in Meal */}
          {mealItems.length > 0 && (
            <div className="mb-6">
              <h4 className="font-rajdhani font-bold text-gray-400 uppercase tracking-wider text-xs mb-3 flex items-center justify-between">
                <span>Items in Meal</span>
                <span>{mealItems.length} item{mealItems.length !== 1 ? 's' : ''}</span>
              </h4>
              <div className="space-y-2">
                {mealItems.map((item, idx) => (
                  <div key={idx} className="bg-tactical-900 border border-tactical-700 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <div className="text-xs text-gray-400 mt-1">
                        {item.amount} {item.unit} • <span className="text-neon-red">{Math.round(item.macrosPerUnit.calories * item.amount)} kcal</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(idx)}
                      className="p-2 text-gray-500 hover:text-neon-red transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
          </div>

          {/* Tab Content */}
          <div className="space-y-2 pb-6">
            {activeTab === 'recent' && (
              <>
                {recentFoods.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-inter text-sm">No recent foods.</div>
                )}
                {recentFoods.map((food, i) => {
                  const totalCal = food.macrosPerUnit.calories * food.amount;
                  return (
                    <div key={`recent-${i}`} className="bg-tactical-900 border border-tactical-700 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{food.name}</h4>
                        <div className="text-xs text-gray-400 mt-1">
                          {food.amount} {food.unit} • <span className="text-neon-red">{Math.round(totalCal)} kcal</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setMealItems(prev => [...prev, food]);
                        }}
                        className="bg-tactical-800 hover:bg-neon-blue/20 text-neon-blue p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === 'favorites' && (
              <>
                {favoriteFoods.length === 0 && (
                  <div className="text-center py-8 text-gray-500 font-inter text-sm">No favorite foods yet.</div>
                )}
                {favoriteFoods.map((food, i) => {
                  const totalCal = food.macrosPerUnit.calories * food.amount;
                  return (
                    <div key={`fav-${i}`} className="bg-tactical-900 border border-tactical-700 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-sm">{food.name}</h4>
                        <div className="text-xs text-gray-400 mt-1">
                          {food.amount} {food.unit} • <span className="text-neon-red">{Math.round(totalCal)} kcal</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setMealItems(prev => [...prev, food]);
                        }}
                        className="bg-tactical-800 hover:bg-neon-gold/20 text-neon-gold p-2 rounded-lg transition-colors"
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

        {/* Footer */}
        <div className="p-4 bg-tactical-900 border-t border-tactical-700 shrink-0">
          <button
            onClick={handleSaveMeal}
            disabled={!mealName.trim() || mealItems.length === 0}
            className="w-full bg-[#39ff14] text-tactical-900 py-4 rounded-lg font-rajdhani font-bold text-lg uppercase tracking-widest hover:bg-[#32e011] transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" /> Save Meal
          </button>
        </div>

      </div>
    </div>
  );
};
