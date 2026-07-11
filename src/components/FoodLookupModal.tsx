import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Plus } from 'lucide-react';
import type { FoodItem } from '../types';

interface FoodLookupModalProps {
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
}

export const FoodLookupModal: React.FC<FoodLookupModalProps> = ({ onClose, onSelectFood }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [logError, setLogError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      setLogError('');
      try {
        const baseUrl = import.meta.env.PROD ? 'https://api.nal.usda.gov' : '/api/food';
      const res = await fetch(`${baseUrl}/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(searchQuery)}&pageSize=20`);
        if (!res.ok) {
          throw new Error(`HTTP Error: ${res.status}`);
        }
        const data = await res.json();
        setSearchResults(data.foods || []);
      } catch (err: any) {
        setLogError('Failed to search foods. ' + (err.message || String(err)));
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[80] flex flex-col sm:items-center sm:p-4">
      <div className="w-full h-full sm:max-w-md sm:h-[85vh] sm:rounded-2xl flex flex-col bg-tactical-800 overflow-hidden shadow-2xl relative pb-safe sm:pb-0">
        <div className="bg-tactical-900 p-4 flex items-center justify-between border-b border-tactical-700 shrink-0 shadow-sm z-10">
          <h3 className="esports-heading text-xl text-white">Lookup Food</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-tactical-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col overflow-hidden custom-scrollbar">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for food (e.g. Oatmeal)..."
              autoFocus
              className="flex-1 bg-tactical-900 border border-tactical-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-neon-blue text-sm"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-neon-blue text-tactical-900 px-4 py-2 rounded-lg font-rajdhani font-bold hover:bg-[#00d0ff] disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {logError && <div className="text-neon-red text-xs font-inter text-center mb-2">{logError}</div>}

          {searchResults.length === 0 && !isSearching && searchQuery && !logError && (
            <div className="text-center py-4 text-gray-500 font-inter text-sm mt-8">No results found.</div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-6">
            {searchResults.map((product: any, idx: number) => {
              const name = product.description || 'Unknown Product';
              const brand = product.brandOwner ? `${product.brandOwner}` : '';
              
              const getNutrient = (nameStart: string) => {
                const nutrient = product.foodNutrients?.find((n: any) => n.nutrientName.startsWith(nameStart));
                return nutrient ? nutrient.value : 0;
              };

              const macrosPerUnit = {
                calories: getNutrient('Energy'),
                protein: getNutrient('Protein'),
                carbs: getNutrient('Carbohydrate'),
                fat: getNutrient('Total lipid (fat)')
              };

              const handleSelectProduct = () => {
                const newFood: FoodItem = {
                  id: `usda-${product.fdcId || Date.now()}`,
                  name: brand ? `${brand} ${name}` : name,
                  amount: 100,
                  unit: 'g',
                  macrosPerUnit: {
                    calories: macrosPerUnit.calories / 100,
                    protein: macrosPerUnit.protein / 100,
                    carbs: macrosPerUnit.carbs / 100,
                    fat: macrosPerUnit.fat / 100
                  }
                };
                onSelectFood(newFood);
              };

              return (
                <div key={`${product.fdcId || product.code || idx}-${idx}`} className="bg-tactical-900 border border-tactical-700 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-white text-sm line-clamp-1">{name}</div>
                    {brand && <div className="text-xs text-gray-400 line-clamp-1">{brand}</div>}
                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                      <span><span className="text-neon-red font-bold">{Math.round(macrosPerUnit.calories)}</span> kcal</span>
                      <span><span className="text-neon-blue font-bold">{Math.round(macrosPerUnit.protein)}g</span> P</span>
                      <span><span className="text-neon-gold font-bold">{Math.round(macrosPerUnit.carbs)}g</span> C</span>
                      <span><span className="text-neon-purple font-bold">{Math.round(macrosPerUnit.fat)}g</span> F</span>
                      <span>(per 100g)</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleSelectProduct}
                    className="bg-tactical-800 hover:bg-neon-blue/20 text-neon-blue p-2 rounded-lg transition-colors shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
