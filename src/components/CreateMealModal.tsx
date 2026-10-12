import React, { useState } from 'react';
import { X, Save, History, Star, ScanBarcode, Plus, Minus, Trash2, Search, Pencil, Edit3, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { useUser } from '../context/UserContext';
import { FoodEntryModal } from './FoodEntryModal';
import { BarcodeScanner } from './BarcodeScanner';
import { FoodLookupModal } from './FoodLookupModal';
import type { FoodItem, Meal } from '../types';

interface CreateMealModalProps {
  onClose: () => void;
  initialMeal?: Meal;
  onDeleteMeal?: (mealId: string) => void;
}

export const CreateMealModal: React.FC<CreateMealModalProps> = ({ onClose, initialMeal, onDeleteMeal }) => {
  const { recentFoods, favoriteFoods, saveMeal, deleteMeal } = useUser();
  const [mealName, setMealName] = useState(initialMeal?.name || '');
  const [mealItems, setMealItems] = useState<FoodItem[]>(initialMeal?.items ? [...initialMeal.items] : []);
  
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [showManual, setShowManual] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [scannedFood, setScannedFood] = useState<Partial<FoodItem> | undefined>(undefined);

  // Edit existing food item inside meal via modal
  const [editingItemIdx, setEditingItemIdx] = useState<number | null>(null);

  // Confirmation modal for deleting the meal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = Boolean(initialMeal);

  const totalCalories = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.calories * item.amount), 0);
  const totalProtein = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.protein * item.amount), 0);
  const totalCarbs = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.carbs * item.amount), 0);
  const totalFat = mealItems.reduce((acc, item) => acc + (item.macrosPerUnit.fat * item.amount), 0);

  const handleSaveMeal = () => {
    if (!mealName.trim() || mealItems.length === 0) return;
    const mealToSave: Meal = {
      id: initialMeal?.id || `meal-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: mealName.trim(),
      items: mealItems
    };
    saveMeal(mealToSave);
    onClose();
  };

  const handleDeleteMeal = () => {
    if (!initialMeal) return;
    deleteMeal(initialMeal.id);
    if (onDeleteMeal) onDeleteMeal(initialMeal.id);
    onClose();
  };

  const removeItem = (idx: number) => {
    setMealItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItemAmount = (idx: number, delta: number) => {
    setMealItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const isGramOrMl = item.unit === 'g' || item.unit === 'ml';
      const step = isGramOrMl ? 10 : 1;
      const nextAmount = Math.max(0, Math.round((item.amount + (delta * step)) * 10) / 10);
      return { ...item, amount: nextAmount };
    }));
  };

  const setItemExactAmount = (idx: number, valStr: string) => {
    const val = parseFloat(valStr);
    setMealItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, amount: isNaN(val) ? 0 : Math.max(0, val) };
    }));
  };

  const handleSaveManualFood = (food: FoodItem) => {
    setMealItems(prev => [...prev, food]);
    setShowManual(false);
    setScannedFood(undefined);
  };

  if (editingItemIdx !== null && mealItems[editingItemIdx]) {
    return (
      <FoodEntryModal
        isEditing
        initialFood={mealItems[editingItemIdx]}
        onSave={(updatedFood) => {
          setMealItems(prev => prev.map((it, i) => i === editingItemIdx ? updatedFood : it));
          setEditingItemIdx(null);
        }}
        onDelete={() => {
          removeItem(editingItemIdx);
          setEditingItemIdx(null);
        }}
        onClose={() => setEditingItemIdx(null)}
      />
    );
  }

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

  if (showLookup) {
    return (
      <FoodLookupModal
        onClose={() => setShowLookup(false)}
        onSelectFood={(food) => {
          setScannedFood(food);
          setShowLookup(false);
          setShowManual(true);
        }}
      />
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
              {isEditing ? (
                <>
                  <Edit3 className="w-5 h-5 text-neon-blue" /> Edit Saved Meal
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 text-[#39ff14]" /> Create Meal
                </>
              )}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-tactical-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <input 
            type="text" 
            value={mealName}
            onChange={e => setMealName(e.target.value)}
            placeholder="Name your meal... (e.g. Pre-Workout Power)"
            className="w-full bg-tactical-800 border border-tactical-600 text-white p-3 rounded-lg focus:border-neon-blue outline-none transition-all text-sm font-semibold"
          />

          <div className="flex items-center justify-between text-[11px] sm:text-xs bg-tactical-800/80 p-2 rounded-lg border border-tactical-700/60">
            <span className="text-gray-400 uppercase tracking-wider font-rajdhani font-bold">Total Macros:</span>
            <div className="flex gap-2 items-center font-mono font-bold">
              <span className="text-neon-red">{Math.round(totalCalories)} kcal</span>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-rajdhani font-bold text-gray-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <span>Foods in this Meal</span>
                <span className="bg-tactical-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {mealItems.length}
                </span>
              </h4>
              <span className="text-[10px] text-gray-500 font-inter">
                Adjust amounts or tap pencil
              </span>
            </div>

            {mealItems.length === 0 ? (
              <div className="p-5 border border-dashed border-tactical-700 rounded-xl text-center text-gray-500 text-xs">
                No foods added yet. Search, scan, or pick from favorites/recents below.
              </div>
            ) : (
              <div className="space-y-2.5">
                {mealItems.map((item, idx) => {
                  const itemCal = Math.round(item.macrosPerUnit.calories * item.amount);
                  const itemP = Math.round(item.macrosPerUnit.protein * item.amount);
                  const itemC = Math.round(item.macrosPerUnit.carbs * item.amount);
                  const itemF = Math.round(item.macrosPerUnit.fat * item.amount);

                  return (
                    <div key={`${item.id || item.name}-${idx}`} className="bg-tactical-900 border border-tactical-700 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                          <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                            <span className="text-neon-red font-semibold">{itemCal} kcal</span>
                            <span className="text-tactical-600">•</span>
                            <span className="text-neon-blue">{itemP}g P</span>
                            <span className="text-tactical-600">•</span>
                            <span className="text-neon-gold">{itemC}g C</span>
                            <span className="text-tactical-600">•</span>
                            <span className="text-neon-purple">{itemF}g F</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingItemIdx(idx)}
                            className="p-1.5 text-gray-400 hover:text-neon-blue hover:bg-tactical-800 rounded-lg transition-colors"
                            title="Edit Food Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            className="p-1.5 text-gray-500 hover:text-neon-red hover:bg-tactical-800 rounded-lg transition-colors"
                            title="Remove from Meal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive Amount Adjuster */}
                      <div className="flex items-center justify-between bg-tactical-800/80 px-2.5 py-1.5 rounded-lg border border-tactical-700/60">
                        <span className="text-[11px] font-rajdhani uppercase font-bold text-gray-400 tracking-wider">
                          Amount
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => updateItemAmount(idx, -1)}
                            className="w-7 h-7 bg-tactical-700 hover:bg-tactical-600 text-white rounded flex items-center justify-center font-bold text-base transition-colors"
                            title="Decrease amount"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="flex items-center bg-tactical-900 border border-tactical-600 rounded px-2 py-0.5 focus-within:border-neon-blue">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={item.amount === 0 ? '' : item.amount}
                              onChange={(e) => setItemExactAmount(idx, e.target.value)}
                              placeholder="0"
                              className="w-16 bg-transparent text-white text-center font-bold text-sm outline-none"
                            />
                            <span className="text-xs text-gray-400 ml-1 font-mono">{item.unit}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => updateItemAmount(idx, 1)}
                            className="w-7 h-7 bg-tactical-700 hover:bg-tactical-600 text-white rounded flex items-center justify-center font-bold text-base transition-colors"
                            title="Increase amount"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions to Add Foods */}
          <div className="mb-6">
            <h4 className="font-rajdhani font-bold text-gray-400 uppercase tracking-wider text-xs mb-2.5">
              Add More Foods
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              <button 
                type="button"
                onClick={() => setShowLookup(true)}
                className="bg-tactical-900 border border-tactical-700 hover:border-neon-blue rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <Search className="w-5 h-5 text-neon-blue group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-white text-xs">Search Food</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowScanner(true)}
                className="bg-tactical-900 border border-tactical-700 hover:border-[#39ff14] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <ScanBarcode className="w-5 h-5 text-[#39ff14] group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-white text-xs">Scan Barcode</span>
              </button>
              <button 
                type="button"
                onClick={() => setShowManual(true)}
                className="bg-tactical-900 border border-tactical-700 hover:border-neon-gold rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 transition-all group"
              >
                <Plus className="w-5 h-5 text-neon-gold group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-white text-xs">Manual Food</span>
              </button>
            </div>
          </div>

          {/* Tabs for Recent / Favorites */}
          <div className="flex border-b border-tactical-700 mb-3 sticky top-0 bg-tactical-800 z-10 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={clsx(
                "flex-1 pb-2.5 font-rajdhani font-bold uppercase tracking-wider text-xs transition-colors",
                activeTab === 'recent' ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-1.5"><History className="w-3.5 h-3.5" /> Recent Foods</div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={clsx(
                "flex-1 pb-2.5 font-rajdhani font-bold uppercase tracking-wider text-xs transition-colors",
                activeTab === 'favorites' ? "text-neon-gold border-b-2 border-neon-gold" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <div className="flex items-center justify-center gap-1.5"><Star className="w-3.5 h-3.5" /> Favorites</div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-2 pb-6">
            {activeTab === 'recent' && (
              <>
                {recentFoods.length === 0 && (
                  <div className="text-center py-6 text-gray-500 font-inter text-xs">No recent foods logged yet.</div>
                )}
                {recentFoods.map((food, i) => {
                  const totalCal = food.macrosPerUnit.calories * food.amount;
                  return (
                    <div key={`recent-${food.id || food.name}-${i}`} className="bg-tactical-900 border border-tactical-700 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-white text-xs truncate">{food.name}</h4>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {food.amount} {food.unit} • <span className="text-neon-red font-semibold">{Math.round(totalCal)} kcal</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setMealItems(prev => [...prev, { ...food, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` }]);
                        }}
                        className="bg-tactical-800 hover:bg-neon-blue/20 text-neon-blue p-2 rounded-lg transition-colors shrink-0"
                        title="Add to meal"
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
                  <div className="text-center py-6 text-gray-500 font-inter text-xs">No favorite foods yet.</div>
                )}
                {favoriteFoods.map((food, i) => {
                  const totalCal = food.macrosPerUnit.calories * food.amount;
                  return (
                    <div key={`fav-${food.id || food.name}-${i}`} className="bg-tactical-900 border border-tactical-700 p-2.5 rounded-xl flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <h4 className="font-bold text-white text-xs truncate">{food.name}</h4>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {food.amount} {food.unit} • <span className="text-neon-red font-semibold">{Math.round(totalCal)} kcal</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setMealItems(prev => [...prev, { ...food, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` }]);
                        }}
                        className="bg-tactical-800 hover:bg-neon-gold/20 text-neon-gold p-2 rounded-lg transition-colors shrink-0"
                        title="Add to meal"
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
        <div className="p-4 bg-tactical-900 border-t border-tactical-700 shrink-0 flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-3.5 bg-tactical-800 border border-neon-red/40 text-neon-red hover:bg-neon-red/10 rounded-lg font-rajdhani font-bold text-sm uppercase tracking-wider transition-colors flex items-center gap-1.5"
              title="Delete Saved Meal"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveMeal}
            disabled={!mealName.trim() || mealItems.length === 0}
            className={clsx(
              "flex-1 py-3.5 rounded-lg font-rajdhani font-bold text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2",
              isEditing
                ? "bg-neon-blue text-tactical-900 hover:bg-[#00d0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:shadow-none"
                : "bg-[#39ff14] text-tactical-900 hover:bg-[#32e011] shadow-[0_0_15px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:shadow-none"
            )}
          >
            <Save className="w-5 h-5" />
            <span>{isEditing ? 'Save Changes' : 'Save Meal'}</span>
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[90] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-tactical-900 border border-tactical-700 rounded-xl p-5 max-w-xs w-full shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-neon-red/10 border border-neon-red/30 flex items-center justify-center text-neon-red mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-rajdhani font-bold text-white text-lg mb-1">Delete Saved Meal?</h4>
            <p className="text-xs text-gray-400 mb-5">
              Are you sure you want to delete <span className="text-white font-semibold">"{mealName}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-tactical-800 text-gray-300 py-2.5 rounded-lg font-rajdhani font-bold text-sm uppercase tracking-wider hover:bg-tactical-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMeal}
                className="flex-1 bg-neon-red text-tactical-900 py-2.5 rounded-lg font-rajdhani font-bold text-sm uppercase tracking-wider hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
