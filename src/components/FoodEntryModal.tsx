import React, { useState } from 'react';
import { X, Save, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import type { FoodItem } from '../types';
import { clsx } from 'clsx';

interface FoodEntryModalProps {
  onClose: () => void;
  initialFood?: Partial<FoodItem>;
}

export const FoodEntryModal: React.FC<FoodEntryModalProps> = ({ onClose, initialFood }) => {
  const { logFood, toggleFavoriteFood } = useUser();
  const [name, setName] = useState(initialFood?.name || '');
  const [amount, setAmount] = useState<string>(initialFood?.amount?.toString() || '1');
  const [unit, setUnit] = useState(initialFood?.unit || 'serving');
  const [calories, setCalories] = useState<string>(initialFood?.macrosPerUnit?.calories?.toString() || '');
  const [protein, setProtein] = useState<string>(initialFood?.macrosPerUnit?.protein?.toString() || '');
  const [carbs, setCarbs] = useState<string>(initialFood?.macrosPerUnit?.carbs?.toString() || '');
  const [fat, setFat] = useState<string>(initialFood?.macrosPerUnit?.fat?.toString() || '');
  const [saveFavorite, setSaveFavorite] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;

    const numAmount = parseFloat(amount) || 1;
    
    const foodItem: FoodItem = {
      id: initialFood?.id || `manual-${Date.now()}`,
      name,
      amount: numAmount,
      unit,
      barcode: initialFood?.barcode,
      macrosPerUnit: {
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      }
    };

    logFood(foodItem);
    if (saveFavorite) {
      toggleFavoriteFood(foodItem);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] px-4 fade-in">
      <div className="bg-tactical-800 border border-tactical-600 rounded-xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="bg-tactical-900 p-4 flex items-center justify-between border-b border-tactical-700">
          <h3 className="esports-heading text-xl text-white">Log Food</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Food Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
              placeholder="e.g., Oatmeal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Amount</label>
              <input 
                type="number" 
                min="0.1"
                step="0.1"
                required
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-4 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-1">Unit</label>
              <select 
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-4 py-2 text-white outline-none appearance-none"
              >
                <option value="serving">serving</option>
                <option value="g">grams (g)</option>
                <option value="kg">kilograms (kg)</option>
                <option value="oz">ounces (oz)</option>
                <option value="lbs">pounds (lbs)</option>
                <option value="ml">milliliters (ml)</option>
                <option value="L">liters (L)</option>
                <option value="cup">cup</option>
                <option value="tbsp">tablespoon (tbsp)</option>
                <option value="tsp">teaspoon (tsp)</option>
                <option value="piece">piece</option>
                <option value="slice">slice</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-rajdhani uppercase tracking-wider text-gray-400 mb-2">Macros (Per {unit || 'unit'})</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-neon-red mb-1">Calories (kcal)*</div>
                <input type="number" required value={calories} onChange={e => setCalories(e.target.value)} className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none" />
              </div>
              <div>
                <div className="text-xs text-neon-blue mb-1">Protein (g)</div>
                <input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none" />
              </div>
              <div>
                <div className="text-xs text-neon-gold mb-1">Carbs (g)</div>
                <input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none" />
              </div>
              <div>
                <div className="text-xs text-neon-purple mb-1">Fat (g)</div>
                <input type="number" value={fat} onChange={e => setFat(e.target.value)} className="w-full bg-tactical-900 border border-tactical-600 rounded-lg px-3 py-2 text-white outline-none" />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSaveFavorite(!saveFavorite)}
            className="flex items-center gap-2 text-sm text-gray-300 mt-4 hover:text-white"
          >
            <div className={clsx("w-5 h-5 rounded flex items-center justify-center border", saveFavorite ? "bg-neon-gold border-neon-gold" : "border-gray-500")}>
              {saveFavorite && <Star className="w-3 h-3 text-tactical-900 fill-current" />}
            </div>
            Save to Favorites
          </button>

          <button
            type="submit"
            className="w-full mt-6 bg-neon-blue text-tactical-900 font-bold font-rajdhani text-lg py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#00d0ff] transition-colors"
          >
            <Save className="w-5 h-5" /> Log Food
          </button>
        </form>
      </div>
    </div>
  );
};
