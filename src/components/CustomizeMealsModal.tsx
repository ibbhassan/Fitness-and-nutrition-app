import React, { useState } from 'react';
import { 
  X, Plus, Trash2, ChevronUp, ChevronDown, RotateCcw, Check, Utensils,
  Coffee, Sun, Moon, Apple, Flame, Dumbbell, Zap, Shield, Heart, Cookie, Salad
} from 'lucide-react';
import { useUser, DEFAULT_MEAL_CATEGORIES } from '../context/UserContext';
import type { CustomMealCategory } from '../types';
import { clsx } from 'clsx';

export const MEAL_ICON_MAP: Record<string, any> = {
  Coffee, Sun, Moon, Apple, Flame, Dumbbell, Utensils, Zap, Shield, Heart, Cookie, Salad
};

const AVAILABLE_ICONS = [
  { name: 'Coffee', label: 'Coffee / Morning', icon: Coffee },
  { name: 'Sun', label: 'Sun / Midday', icon: Sun },
  { name: 'Moon', label: 'Moon / Night', icon: Moon },
  { name: 'Apple', label: 'Apple / Snack', icon: Apple },
  { name: 'Flame', label: 'Flame / High Energy', icon: Flame },
  { name: 'Dumbbell', label: 'Dumbbell / Workout', icon: Dumbbell },
  { name: 'Utensils', label: 'Utensils / Main Meal', icon: Utensils },
  { name: 'Zap', label: 'Zap / Pre-Workout', icon: Zap },
  { name: 'Shield', label: 'Shield / Recovery', icon: Shield },
  { name: 'Heart', label: 'Heart / Health', icon: Heart },
  { name: 'Cookie', label: 'Cookie / Treat', icon: Cookie },
  { name: 'Salad', label: 'Salad / Clean', icon: Salad },
];

const COLOR_OPTIONS = [
  { class: 'text-amber-400', label: 'Amber' },
  { class: 'text-yellow-400', label: 'Yellow' },
  { class: 'text-purple-400', label: 'Purple' },
  { class: 'text-emerald-400', label: 'Emerald' },
  { class: 'text-neon-blue', label: 'Cyan' },
  { class: 'text-neon-red', label: 'Red' },
  { class: 'text-fuchsia-400', label: 'Fuchsia' },
  { class: 'text-gray-300', label: 'Silver' },
];

interface CustomizeMealsModalProps {
  onClose: () => void;
}

export const CustomizeMealsModal: React.FC<CustomizeMealsModalProps> = ({ onClose }) => {
  const { customMealCategories, saveCustomMealCategories } = useUser();

  const [categories, setCategories] = useState<CustomMealCategory[]>(() => {
    return customMealCategories && customMealCategories.length > 0 
      ? JSON.parse(JSON.stringify(customMealCategories))
      : JSON.parse(JSON.stringify(DEFAULT_MEAL_CATEGORIES));
  });

  const [activeIconPickerId, setActiveIconPickerId] = useState<string | null>(null);

  const handleUpdateName = (id: string, name: string) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, name } : cat));
  };

  const handleUpdateIcon = (id: string, iconName: any) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, iconName } : cat));
    setActiveIconPickerId(null);
  };

  const handleUpdateColor = (id: string, colorClass: string) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, colorClass } : cat));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const next = [...categories];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setCategories(next);
  };

  const handleRemove = (id: string) => {
    if (categories.length <= 1) {
      alert("You must keep at least 1 meal category.");
      return;
    }
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };

  const handleAddMeal = () => {
    const nextNum = categories.length + 1;
    const newCat: CustomMealCategory = {
      id: `meal-${Date.now()}`,
      name: `Meal ${nextNum}`,
      iconName: 'Utensils',
      colorClass: 'text-neon-blue'
    };
    setCategories(prev => [...prev, newCat]);
  };

  const handleResetDefault = () => {
    if (window.confirm("Reset meal categories to standard Breakfast, Lunch, Dinner, Snack?")) {
      setCategories(JSON.parse(JSON.stringify(DEFAULT_MEAL_CATEGORIES)));
    }
  };

  const handleSave = () => {
    // Validate non-empty names
    const cleaned = categories.map((cat, idx) => ({
      ...cat,
      name: cat.name.trim() || `Meal ${idx + 1}`
    }));
    saveCustomMealCategories(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 pb-safe">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-tactical-950 border border-tactical-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 bg-tactical-900 border-b border-tactical-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center text-neon-blue">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">Customize Meal Categories</h2>
              <p className="text-xs text-gray-400 font-inter">Freely add, rename, or reorder your daily meal slots (e.g. Meal 1-5, Pre-Workout)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-tactical-800 p-2 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Editable List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {categories.map((cat, index) => {
            const IconComp = MEAL_ICON_MAP[cat.iconName] || Utensils;
            const isIconPickerOpen = activeIconPickerId === cat.id;

            return (
              <div key={cat.id} className="bg-tactical-900 border border-tactical-700/80 rounded-xl p-3.5 flex flex-col gap-3 transition-all">
                <div className="flex items-center gap-3">
                  {/* Icon Selector Button */}
                  <button
                    type="button"
                    onClick={() => setActiveIconPickerId(isIconPickerOpen ? null : cat.id)}
                    className={clsx(
                      "w-11 h-11 rounded-lg bg-tactical-950 border flex items-center justify-center transition-all cursor-pointer shrink-0 relative",
                      cat.colorClass || 'text-neon-blue',
                      isIconPickerOpen ? "border-neon-blue ring-2 ring-neon-blue/20" : "border-tactical-700 hover:border-tactical-500"
                    )}
                    title="Change Icon"
                  >
                    <IconComp className="w-5 h-5" />
                  </button>

                  {/* Name Input */}
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleUpdateName(cat.id, e.target.value)}
                    placeholder={`Meal ${index + 1}...`}
                    className="flex-1 bg-tactical-950 border border-tactical-700 rounded-lg px-3 py-2 text-sm font-rajdhani font-bold text-white uppercase tracking-wider focus:outline-none focus:border-neon-blue transition-colors"
                  />

                  {/* Reorder / Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-tactical-800 rounded transition-colors"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === categories.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-tactical-800 rounded transition-colors"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(cat.id)}
                      className="p-1.5 text-gray-400 hover:text-neon-red hover:bg-tactical-800 rounded transition-colors"
                      title="Remove Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Icon & Color Picker Popover */}
                {isIconPickerOpen && (
                  <div className="bg-tactical-950 border border-tactical-700 rounded-xl p-3 animate-in fade-in duration-150 space-y-3">
                    <div>
                      <span className="text-[10px] font-rajdhani uppercase font-bold text-gray-400 tracking-wider block mb-2">Select Icon</span>
                      <div className="grid grid-cols-6 gap-2">
                        {AVAILABLE_ICONS.map(item => {
                          const ItemIcon = item.icon;
                          const isSelected = cat.iconName === item.name;
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => handleUpdateIcon(cat.id, item.name)}
                              className={clsx(
                                "p-2.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer",
                                isSelected ? "bg-neon-blue/20 border-neon-blue text-neon-blue" : "bg-tactical-900 border-tactical-800 text-gray-400 hover:text-white hover:border-tactical-600"
                              )}
                              title={item.label}
                            >
                              <ItemIcon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-rajdhani uppercase font-bold text-gray-400 tracking-wider block mb-2">Accent Color</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {COLOR_OPTIONS.map(c => (
                          <button
                            key={c.class}
                            type="button"
                            onClick={() => handleUpdateColor(cat.id, c.class)}
                            className={clsx(
                              "w-7 h-7 rounded-full border flex items-center justify-center transition-transform cursor-pointer",
                              c.class.replace('text-', 'bg-'),
                              cat.colorClass === c.class ? "border-white scale-110 shadow-md" : "border-transparent hover:scale-105"
                            )}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Category & Reset Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleAddMeal}
              className="bg-tactical-900 hover:bg-tactical-800 border border-tactical-700 hover:border-neon-blue text-neon-blue px-4 py-2 rounded-xl font-rajdhani font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Meal Category
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 font-inter transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-tactical-900 border-t border-tactical-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-rajdhani font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-neon-blue text-tactical-900 font-rajdhani font-bold text-sm uppercase tracking-wider hover:bg-[#00d0dd] transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
