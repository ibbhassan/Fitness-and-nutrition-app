import React, { useState } from 'react';
import { Save, Star, Calculator } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { clsx } from 'clsx';
import type { FoodItem } from '../types';

interface FoodEntryModalProps {
  onClose: () => void;
  initialFood?: Partial<FoodItem>;
  onSave?: (food: FoodItem) => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({ onClose, initialFood, onSave, onDelete, isEditing }) => {
  const { toggleFavoriteFood } = useUser();
  const [name, setName] = useState(initialFood?.name || '');
  const [saveFavorite, setSaveFavorite] = useState(false);

  // We set label serving amount to 1 by default. If editing, we just use 1.
  const [labelServingAmount, setLabelServingAmount] = useState<string>('1');
  const [labelServingUnit, setLabelServingUnit] = useState<string>(initialFood?.unit || 'serving');
  
  // The macros per the label's serving size
  const [labelCalories, setLabelCalories] = useState<string>(initialFood?.macrosPerUnit?.calories?.toString() || '');
  const [labelProtein, setLabelProtein] = useState<string>(initialFood?.macrosPerUnit?.protein?.toString() || '');
  const [labelCarbs, setLabelCarbs] = useState<string>(initialFood?.macrosPerUnit?.carbs?.toString() || '');
  const [labelFat, setLabelFat] = useState<string>(initialFood?.macrosPerUnit?.fat?.toString() || '');

  // What the user actually ate
  const [amountEaten, setAmountEaten] = useState<string>(initialFood?.amount?.toString() || '1');

  // Calculate live totals for display
  const parsedLabelAmount = parseFloat(labelServingAmount) || 1;
  const parsedEaten = parseFloat(amountEaten) || 0;
  const ratio = parsedEaten / parsedLabelAmount;

  const liveCalories = Math.round((parseFloat(labelCalories) || 0) * ratio);
  const liveProtein = Math.round((parseFloat(labelProtein) || 0) * ratio);
  const liveCarbs = Math.round((parseFloat(labelCarbs) || 0) * ratio);
  const liveFat = Math.round((parseFloat(labelFat) || 0) * ratio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize macros down to 1 single unit for storage
    const unitRatio = 1 / parsedLabelAmount;

    const food: FoodItem = {
      id: initialFood?.id || String(Date.now()),
      name,
      amount: parsedEaten,
      unit: labelServingUnit,
      macrosPerUnit: {
        calories: (parseFloat(labelCalories) || 0) * unitRatio,
        protein: (parseFloat(labelProtein) || 0) * unitRatio,
        carbs: (parseFloat(labelCarbs) || 0) * unitRatio,
        fat: (parseFloat(labelFat) || 0) * unitRatio,
      }
    };
    
    if (saveFavorite) toggleFavoriteFood(food);
    if (onSave) onSave(food);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-tactical-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-tactical-800 border-2 border-tactical-600 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-tactical-700 flex justify-between items-center bg-tactical-900 shrink-0">
          <h2 className="font-rajdhani font-bold text-xl text-white uppercase tracking-wider">
            {isEditing ? 'Edit Log' : 'Manual Entry'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">✕</button>
        </div>

        <div className="p-4 overflow-y-auto">
          <form id="food-entry-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Food Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
                placeholder="e.g., Olive Oil"
              />
            </div>

            {/* Nutrition Label Section */}
            <div className="bg-tactical-900 border border-tactical-700 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-gold" />
              
              {initialFood?.macrosPerUnit ? (
                <>
                  <h3 className="font-rajdhani font-bold text-white uppercase tracking-wider mb-2">Base Nutrition Info</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-300 text-sm font-bold">1 {labelServingUnit}</span>
                    <span className="text-gray-500 text-sm">contains:</span>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neon-red font-bold uppercase">Cal</span>
                      <span className="text-white font-bold">{Math.round(parseFloat(labelCalories) || 0)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neon-blue font-bold uppercase">Pro</span>
                      <span className="text-white font-bold">{Math.round(parseFloat(labelProtein) || 0)}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neon-gold font-bold uppercase">Carb</span>
                      <span className="text-white font-bold">{Math.round(parseFloat(labelCarbs) || 0)}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neon-purple font-bold uppercase">Fat</span>
                      <span className="text-white font-bold">{Math.round(parseFloat(labelFat) || 0)}g</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-rajdhani font-bold text-white uppercase tracking-wider mb-3">1. Nutrition Label</h3>
                  <p className="text-xs text-gray-400 mb-4 font-inter leading-relaxed">
                    Enter the nutrition facts exactly as they appear on the package.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Serving Size</label>
                      <input 
                        type="number" min="0.1" step="0.1" required
                        value={labelServingAmount} onChange={e => setLabelServingAmount(e.target.value)}
                        className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none"
                        placeholder="e.g., 15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Unit</label>
                      <select 
                        value={labelServingUnit} onChange={e => setLabelServingUnit(e.target.value)}
                        className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none appearance-none"
                      >
                        <option value="serving">serving</option>
                        <option value="g">grams (g)</option>
                        <option value="ml">milliliters (ml)</option>
                        <option value="oz">ounces (oz)</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tablespoon (tbsp)</option>
                        <option value="tsp">teaspoon (tsp)</option>
                        <option value="piece">piece</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] text-neon-red font-bold uppercase mb-1">Cal</div>
                      <input type="number" required value={labelCalories} onChange={e => setLabelCalories(e.target.value)} className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-2 py-2 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <div className="text-[10px] text-neon-blue font-bold uppercase mb-1">Pro (g)</div>
                      <input type="number" value={labelProtein} onChange={e => setLabelProtein(e.target.value)} className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-2 py-2 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <div className="text-[10px] text-neon-gold font-bold uppercase mb-1">Carb (g)</div>
                      <input type="number" value={labelCarbs} onChange={e => setLabelCarbs(e.target.value)} className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-2 py-2 text-white text-sm outline-none" />
                    </div>
                    <div>
                      <div className="text-[10px] text-neon-purple font-bold uppercase mb-1">Fat (g)</div>
                      <input type="number" value={labelFat} onChange={e => setLabelFat(e.target.value)} className="w-full bg-tactical-800 border border-tactical-600 rounded-lg px-2 py-2 text-white text-sm outline-none" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* What you ate section */}
            <div className="bg-tactical-900 border border-tactical-700 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue" />
              <h3 className="font-rajdhani font-bold text-white uppercase tracking-wider mb-3">
                {initialFood?.macrosPerUnit ? 'How much did you eat?' : '2. How much did you eat?'}
              </h3>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Amount Eaten</label>
                  <div className="flex items-center">
                    <input 
                      type="number" min="0" step="0.1" required
                      value={amountEaten} onChange={e => setAmountEaten(e.target.value)}
                      className="w-full bg-tactical-800 border border-tactical-600 rounded-l-lg px-4 py-3 text-white text-lg font-bold outline-none focus:border-neon-blue"
                    />
                    <div className="bg-tactical-700 border border-tactical-600 border-l-0 rounded-r-lg px-4 py-3 text-gray-300 font-rajdhani font-bold">
                      {labelServingUnit}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Calculation Result */}
            <div className="bg-tactical-800 border border-tactical-600 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-neon-green" />
                <span className="text-xs font-rajdhani uppercase tracking-wider text-gray-400">Total Logging:</span>
              </div>
              <div className="font-rajdhani font-bold text-white tracking-wider flex items-center gap-2">
                <span className="text-neon-red">{liveCalories} kcal</span>
                <span className="text-tactical-600">|</span>
                <span className="text-neon-blue">{liveProtein} P</span>
                <span className="text-tactical-600">|</span>
                <span className="text-neon-gold">{liveCarbs} C</span>
                <span className="text-tactical-600">|</span>
                <span className="text-neon-purple">{liveFat} F</span>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setSaveFavorite(!saveFavorite)}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <div className={clsx("w-5 h-5 rounded flex items-center justify-center border", saveFavorite ? "bg-neon-gold border-neon-gold" : "border-gray-500")}>
                  {saveFavorite && <Star className="w-3 h-3 text-tactical-900 fill-current" />}
                </div>
                Save to Favorites
              </button>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-tactical-700 bg-tactical-900 shrink-0 flex gap-3">
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="bg-tactical-800 border border-neon-red text-neon-red font-bold font-rajdhani text-lg py-3 px-6 rounded-lg hover:bg-neon-red/10 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            form="food-entry-form"
            className="flex-1 bg-neon-blue text-tactical-900 font-bold font-rajdhani text-lg py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00d0ff] transition-colors"
          >
            <Save className="w-5 h-5" /> {isEditing ? 'Save Changes' : 'Log Food'}
          </button>
        </div>

      </div>
    </div>
  );
};
