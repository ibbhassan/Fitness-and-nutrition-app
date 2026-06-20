import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { seedSteps } from '../utils/seedData';
import { Flame, Droplet, Wheat, Target, Footprints, Sparkles, Send, Loader2, ScanBarcode, Plus, Star, History, Camera } from 'lucide-react';
import { clsx } from 'clsx';
import { parseMealText } from '../utils/aiLogger';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { FoodEntryModal } from '../components/FoodEntryModal';
import type { FoodItem } from '../types';

export const Nutrition: React.FC = () => {
  const { nutrition, addNutritionMacros, recentFoods, favoriteFoods } = useUser();
  const { calories, protein, carbs, fat } = nutrition;

  const [showScanner, setShowScanner] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const [scannedFood, setScannedFood] = useState<Partial<FoodItem> | undefined>(undefined);

  // AI Logger State
  const [mealText, setMealText] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [logError, setLogError] = useState('');
  const [logSuccess, setLogSuccess] = useState('');

  const handleAiLog = async () => {
    if (!mealText.trim()) return;
    setIsLogging(true);
    setLogError('');
    setLogSuccess('');
    
    try {
      const macros = await parseMealText(mealText);
      addNutritionMacros(macros);
      setLogSuccess(`Logged! +${macros.calories}kcal (${macros.protein}g P, ${macros.carbs}g C, ${macros.fat}g F)`);
      setMealText('');
      setTimeout(() => setLogSuccess(''), 4000);
    } catch (err) {
      setLogError('Failed to parse meal. Try being more specific or check your API key.');
    } finally {
      setIsLogging(false);
    }
  };

  const MacroBar = ({ label, current, target, colorClass, icon: Icon }: any) => {
    const percent = Math.min((current / target) * 100, 100);
    return (
      <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Icon className={clsx("w-5 h-5", colorClass.text)} />
            <span className="font-rajdhani font-bold uppercase tracking-wider text-white">{label}</span>
          </div>
          <span className="text-gray-400 font-inter text-sm">
            <span className="text-white font-bold">{current}</span> / {target}g
          </span>
        </div>
        <div className="h-2 w-full bg-tactical-800 rounded-full overflow-hidden">
          <div 
            className={clsx("h-full rounded-full transition-all duration-500", colorClass.bg)} 
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in mb-24">
      {/* Nutrition Header */}
      <div className="esports-panel p-6 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="esports-heading text-2xl text-white">Nutrition Engine</h1>
          <p className="text-gray-400 text-sm mt-1">Fuel the machine. Keep it clean.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-4 bg-tactical-900 px-6 py-3 rounded-full border border-tactical-700">
          <Flame className="w-6 h-6 text-neon-red" />
          <div className="text-right">
            <div className="text-xs text-gray-400 font-rajdhani uppercase">Calories</div>
            <div className="font-bold text-white"><span className="text-neon-red">{Math.round(calories.current)}</span> / {calories.target} kcal</div>
          </div>
        </div>
      </div>

      {/* Macros Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MacroBar 
          label="Protein" 
          current={Math.round(protein.current)} 
          target={protein.target} 
          colorClass={{ text: 'text-neon-blue', bg: 'bg-neon-blue' }} 
          icon={Target}
        />
        <MacroBar 
          label="Carbs" 
          current={Math.round(carbs.current)} 
          target={carbs.target} 
          colorClass={{ text: 'text-neon-gold', bg: 'bg-neon-gold' }} 
          icon={Wheat}
        />
        <MacroBar 
          label="Fat" 
          current={Math.round(fat.current)} 
          target={fat.target} 
          colorClass={{ text: 'text-neon-purple', bg: 'bg-neon-purple' }} 
          icon={Droplet}
        />
      </div>

      {/* AI Lazy Logger */}
      <div className="esports-panel p-6 mt-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-neon-purple/10 transition-colors pointer-events-none" />
        
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-neon-purple" />
          <h2 className="esports-heading text-xl text-white">AI Meal Logger</h2>
        </div>
        <p className="text-gray-400 text-sm mb-4 font-inter">Describe your meal naturally and let the AI estimate the macros.</p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiLog()}
            placeholder="e.g. 3 scrambled eggs with 2 slices of whole wheat toast..."
            disabled={isLogging}
            className="flex-1 bg-tactical-900 border border-tactical-600 rounded-lg p-4 text-white focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all placeholder:text-gray-500 disabled:opacity-50"
          />
          <button 
            onClick={handleAiLog}
            disabled={isLogging || !mealText.trim()}
            className="bg-neon-purple text-white px-6 py-4 rounded-lg font-rajdhani font-bold hover:bg-[#b042ff] transition-all disabled:opacity-50 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(157,0,255,0.3)] hover:shadow-[0_0_20px_rgba(157,0,255,0.5)]"
          >
            {isLogging ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5 mr-2" /> Log Meal</>}
          </button>
        </div>

        {logError && <div className="mt-3 text-neon-red text-sm font-inter">{logError}</div>}
        {logSuccess && <div className="mt-3 text-neon-green text-sm font-inter font-bold">{logSuccess}</div>}
      </div>

      {/* Manual & Barcode Food Database */}
      <div className="esports-panel p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ScanBarcode className="w-6 h-6 text-neon-blue" />
            <h2 className="esports-heading text-xl text-white">Food Database</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setScannedFood(undefined); setShowScanner(true); }}
              className="bg-tactical-900 border border-tactical-600 hover:border-neon-blue text-neon-blue px-4 py-2 rounded-lg font-rajdhani font-bold flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4 hidden sm:block" /> Scan
            </button>
            <button 
              onClick={() => { setScannedFood(undefined); setShowManualEntry(true); }}
              className="bg-tactical-900 border border-tactical-600 hover:border-white text-white px-4 py-2 rounded-lg font-rajdhani font-bold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 hidden sm:block" /> Manual
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-tactical-700 mb-4">
          <button
            onClick={() => setActiveTab('recent')}
            className={clsx(
              "flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider transition-colors",
              activeTab === 'recent' ? "text-neon-blue border-b-2 border-neon-blue" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <div className="flex items-center justify-center gap-2"><History className="w-4 h-4" /> Recent</div>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={clsx(
              "flex-1 pb-3 font-rajdhani font-bold uppercase tracking-wider transition-colors",
              activeTab === 'favorites' ? "text-neon-gold border-b-2 border-neon-gold" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <div className="flex items-center justify-center gap-2"><Star className="w-4 h-4" /> Favorites</div>
          </button>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {activeTab === 'recent' && recentFoods.length === 0 && (
            <div className="text-center py-8 text-gray-500 font-inter">No recent foods logged.</div>
          )}
          {activeTab === 'favorites' && favoriteFoods.length === 0 && (
            <div className="text-center py-8 text-gray-500 font-inter">No favorite foods saved.</div>
          )}
          
          {(activeTab === 'recent' ? recentFoods : favoriteFoods).map((food, idx) => (
            <div 
              key={food.id + idx}
              onClick={() => { setScannedFood(food); setShowManualEntry(true); }}
              className="bg-tactical-900 border border-tactical-700 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:border-neon-blue transition-colors group"
            >
              <div>
                <div className="text-white font-bold font-inter group-hover:text-neon-blue transition-colors">{food.name}</div>
                <div className="text-xs text-gray-400 mt-1">{food.amount} {food.unit} • {Math.round(food.macrosPerUnit.calories * food.amount)} kcal</div>
              </div>
              <div className="text-right text-xs text-gray-500 flex flex-col items-end">
                <span>{Math.round(food.macrosPerUnit.protein * food.amount)}g P</span>
                <span className="flex gap-2">
                  <span>{Math.round(food.macrosPerUnit.carbs * food.amount)}g C</span>
                  <span>{Math.round(food.macrosPerUnit.fat * food.amount)}g F</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Counter */}
      <div className="esports-panel p-6 mt-8">
        <div className="flex items-center gap-3 mb-6">
          <Footprints className="w-6 h-6 text-neon-green" />
          <h2 className="esports-heading text-xl text-white">Daily Steps</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Circular Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="96" cy="96" r="88" 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                className="text-tactical-700" 
              />
              <circle 
                cx="96" cy="96" r="88" 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="552.9" 
                strokeDashoffset={552.9 - (552.9 * (seedSteps.current / seedSteps.target))} 
                className="text-neon-green transition-all duration-1000" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-rajdhani font-bold text-white">{seedSteps.current.toLocaleString()}</span>
              <span className="text-sm text-gray-400 font-inter">/ {seedSteps.target.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showScanner && (
        <BarcodeScanner 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={(food) => {
            setShowScanner(false);
            setScannedFood(food);
            setShowManualEntry(true);
          }} 
        />
      )}

      {showManualEntry && (
        <FoodEntryModal 
          onClose={() => setShowManualEntry(false)} 
          initialFood={scannedFood} 
        />
      )}
    </div>
  );
};
