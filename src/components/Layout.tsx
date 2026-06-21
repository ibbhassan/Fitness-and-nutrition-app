import React, { useState, useEffect, useMemo } from 'react';
import { Activity, LayoutDashboard, History, Dumbbell, Utensils, HeartPulse, User, LogOut, TrendingUp, Award, ChevronRight, Plus, X, Scale, Footprints, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';
import { useUser } from '../context/UserContext';
import type { FoodItem } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { profile, logout, addSteps, logWeight, customPresets, startWorkout, foodLogs, addFoodLog } = useUser();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [prevLevel, setPrevLevel] = useState(profile.level);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogMode, setQuickLogMode] = useState<'menu' | 'nutrition' | 'mealEditor' | 'steps' | 'weight' | 'workout'>('menu');
  const [activeMealType, setActiveMealType] = useState<string>('Lunch');
  const [manualStepsInput, setManualStepsInput] = useState<number>(0);
  const [manualWeightInput, setManualWeightInput] = useState<number>(0);

  // FAB Scroll state
  const [showFab, setShowFab] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      setShowFab(false);
    } else if (currentScrollY < lastScrollY) {
      setShowFab(true);
    }
    setLastScrollY(currentScrollY);
  };

  const yesterdayLogs = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return foodLogs.filter(log => log.date === yesterdayStr);
  }, [foodLogs]);

  const [quickMealItems, setQuickMealItems] = useState<FoodItem[]>([]);

  const calculateQuickMealMacros = () => {
    return quickMealItems.reduce((acc, item) => {
      acc.calories += item.macrosPerUnit.calories * item.amount;
      acc.protein += item.macrosPerUnit.protein * item.amount;
      acc.carbs += item.macrosPerUnit.carbs * item.amount;
      acc.fat += item.macrosPerUnit.fat * item.amount;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  useEffect(() => {
    if (profile.level > prevLevel) {
      setShowLevelUp(true);
      setPrevLevel(profile.level);
    } else if (profile.level < prevLevel) {
      setPrevLevel(profile.level);
    }
  }, [profile.level, prevLevel]);

  useEffect(() => {
    if (showLevelUp) {
      // Play level up sound
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        audio.volume = 0.7;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }

      // Big initial center explosion
      confetti({
        particleCount: 150,
        spread: 160,
        origin: { y: 0.5 },
        colors: ['#00f0ff', '#ffd700', '#ffffff', '#ff003c'],
        gravity: 1.2,
        scalar: 1.5,
        ticks: 300
      });
      
      // Continuous side cannons
      const end = Date.now() + 2500;
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#00f0ff', '#ffd700']
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#00f0ff', '#ffd700']
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [showLevelUp]);
  
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
    { id: 'biometrics', label: 'Body', icon: HeartPulse },
    { id: 'analytics', label: 'Stats', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-tactical-900 text-gray-100 overflow-hidden">
      <header className="flex-none bg-tactical-800 border-b border-tactical-600 p-4 flex items-center justify-between z-[60] shadow-sm relative">
        <div className="flex items-center">
          <Activity className="w-6 h-6 text-neon-blue mr-2" />
          <span className="text-xl font-rajdhani font-bold tracking-widest text-white uppercase">
            Evoke
          </span>
        </div>
        <div id="global-header-actions" className="flex items-center gap-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="text-gray-400 hover:text-neon-red transition-colors p-2 rounded-full hover:bg-tactical-700"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main 
        className="flex-1 overflow-y-auto bg-tactical-900 relative"
        onScroll={handleScroll}
      >
        <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-32">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-none bg-tactical-800 border-t border-tactical-600 pb-safe flex justify-around items-center px-2 pt-1 pb-3 z-40 relative shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "flex-1 min-w-0 flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-all duration-200 relative -translate-y-1",
                isActive 
                  ? "text-neon-blue" 
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <div className={clsx(
                "p-1.5 rounded-full mb-0.5 transition-all",
                isActive ? "bg-neon-blue/10" : "bg-transparent"
              )}>
                <Icon className={clsx("w-5 h-5 sm:w-6 sm:h-6 transition-transform", isActive && "scale-110")} />
              </div>
              <span className={clsx(
                "text-[9px] sm:text-[10px] font-inter font-medium whitespace-nowrap overflow-visible transition-colors",
                isActive ? "text-neon-blue font-bold" : ""
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
          <div className="bg-tactical-800 border border-neon-red/30 p-6 rounded-xl w-full max-w-sm shadow-2xl scale-in">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neon-red/10 mx-auto mb-4">
              <LogOut className="w-6 h-6 text-neon-red" />
            </div>
            <h3 className="text-xl font-rajdhani font-bold text-center text-white mb-2">Confirm Logout</h3>
            <p className="text-gray-400 text-center mb-6 text-sm">
              Are you sure you want to terminate your current session? You will need to log back in to access your data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-tactical-500 text-gray-300 hover:bg-tactical-700 transition-colors font-inter font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 rounded-lg bg-neon-red/20 text-neon-red border border-neon-red hover:bg-neon-red/30 hover:shadow-[0_0_15px_rgba(255,0,60,0.4)] transition-all duration-300 font-inter font-medium text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg px-4"
          >
            {/* Pulsing light rays behind */}
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
              className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] rounded-full border-[10vw] border-dashed border-neon-gold/10 opacity-50 pointer-events-none"
            />

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.3, 0.9, 1.1, 1], 
                opacity: 1,
                rotate: [-10, 10, -5, 5, 0]
              }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.6 }}
              className="bg-tactical-800 border-4 border-neon-gold p-10 rounded-3xl shadow-[0_0_100px_rgba(255,215,0,0.8)] text-center relative max-w-sm w-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-gold/10 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-neon-gold/40 blur-3xl rounded-full pointer-events-none" />
              
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Award className="w-28 h-28 text-neon-gold mx-auto mb-2 drop-shadow-[0_0_25px_rgba(255,215,0,1)] relative z-10" />
              </motion.div>
              
              <motion.h2 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="text-5xl font-rajdhani font-black text-white uppercase tracking-widest mb-2 relative z-10 drop-shadow-xl"
              >
                Level Up
              </motion.h2>
              
              <div className="flex items-center justify-center gap-4 my-8 relative z-10">
                <span className="text-gray-500 text-4xl font-rajdhani font-bold">{profile.level - 1}</span>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <ChevronRight className="w-8 h-8 text-neon-gold" />
                </motion.div>
                <motion.span 
                  initial={{ scale: 3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6, type: "spring", bounce: 0.7 }}
                  className="text-neon-gold text-7xl font-rajdhani font-black drop-shadow-[0_0_20px_rgba(255,215,0,1)]"
                >
                  {profile.level}
                </motion.span>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-gray-300 font-inter mb-10 relative z-10 text-lg font-bold uppercase tracking-wider"
              >
                Unstoppable Force.
              </motion.p>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLevelUp(false)}
                className="w-full bg-neon-gold text-black py-4 rounded-xl font-rajdhani font-black text-xl uppercase tracking-[0.2em] hover:bg-[#ffdf00] transition-all relative z-10 shadow-[0_0_30px_rgba(255,215,0,0.6)]"
              >
                Claim Power
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Floating Quick Log Button */}
        <AnimatePresence>
          {showFab && activeTab === 'dashboard' && (
            <motion.button 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setQuickLogMode('menu'); setIsQuickLogOpen(true); }}
              className="fixed bottom-24 right-6 sm:bottom-8 sm:right-8 z-40 bg-neon-blue text-tactical-900 p-4 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-shadow flex items-center justify-center group"
            >
              <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>
          )}
        </AnimatePresence>

      {/* Quick Log Modal Overlay */}
      <AnimatePresence>
        {isQuickLogOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-tactical-900/90 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-tactical-800 border border-tactical-600 p-6 rounded-xl shadow-2xl max-w-sm w-full relative"
            >
              <button 
                onClick={() => setIsQuickLogOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {quickLogMode === 'menu' && (
                <div className="space-y-4 fade-in">
                  <h2 className="esports-heading text-2xl text-white mb-6">Quick Log</h2>
                  
                  <button 
                    onClick={() => setQuickLogMode('nutrition')}
                    className="w-full flex items-center justify-between p-4 bg-tactical-900 border border-tactical-700 rounded-lg hover:border-neon-gold group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tactical-800 flex items-center justify-center text-neon-gold group-hover:bg-neon-gold/20 transition-colors">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <span className="font-rajdhani font-bold text-white uppercase tracking-wide text-lg">Nutrition</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setQuickLogMode('workout')}
                    className="w-full flex items-center justify-between p-4 bg-tactical-900 border border-tactical-700 rounded-lg hover:border-neon-green group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tactical-800 flex items-center justify-center text-neon-green group-hover:bg-neon-green/20 transition-colors">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <span className="font-rajdhani font-bold text-white uppercase tracking-wide text-lg">Workout</span>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setQuickLogMode('weight')}
                    className="w-full flex items-center justify-between p-4 bg-tactical-900 border border-tactical-700 rounded-lg hover:border-neon-red group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tactical-800 flex items-center justify-center text-neon-red group-hover:bg-neon-red/20 transition-colors">
                        <Scale className="w-5 h-5" />
                      </div>
                      <span className="font-rajdhani font-bold text-white uppercase tracking-wide text-lg">Body Weight</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setQuickLogMode('steps')}
                    className="w-full flex items-center justify-between p-4 bg-tactical-900 border border-tactical-700 rounded-lg hover:border-neon-green group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-tactical-800 flex items-center justify-center text-neon-green group-hover:bg-neon-green/20 transition-colors">
                        <Footprints className="w-5 h-5" />
                      </div>
                      <span className="font-rajdhani font-bold text-white uppercase tracking-wide text-lg">Add Steps</span>
                    </div>
                  </button>
                </div>
              )}

              {quickLogMode === 'nutrition' && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center gap-2 mb-6">
                    <Utensils className="w-6 h-6 text-neon-gold" />
                    <h2 className="esports-heading text-xl text-white">Quick Add Nutrition</h2>
                  </div>
                  
                  <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((mealType) => {
                      const mealLogs = yesterdayLogs.filter(l => l.mealType === mealType);
                      return (
                        <button 
                          key={mealType}
                          onClick={() => {
                            setQuickMealItems(mealLogs.map(log => log.food));
                            setActiveMealType(mealType);
                            setQuickLogMode('mealEditor');
                          }}
                          disabled={mealLogs.length === 0}
                          className="w-full flex items-center justify-between p-4 bg-tactical-900 border border-tactical-700 rounded-lg hover:border-neon-gold transition-all text-left disabled:opacity-50"
                        >
                          <div>
                            <h3 className="font-rajdhani font-bold text-white uppercase tracking-wide text-lg">Yesterday's {mealType}</h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                              {mealLogs.length > 0 
                                ? mealLogs.map(l => l.food.name).join(', ') 
                                : `No ${mealType.toLowerCase()} logged yesterday`}
                            </p>
                          </div>
                          <Plus className="w-5 h-5 text-neon-gold" />
                        </button>
                      );
                    })}

                    <button 
                      onClick={() => {
                        setIsQuickLogOpen(false);
                        setActiveTab('nutrition');
                      }}
                      className="w-full flex items-center justify-between p-4 bg-neon-blue/10 border border-neon-blue rounded-lg hover:bg-neon-blue/20 transition-all text-left mt-4"
                    >
                      <div>
                        <h3 className="font-rajdhani font-bold text-white uppercase tracking-wide text-lg">Log New Meal</h3>
                        <p className="text-xs text-gray-400 mt-1">Jump to the AI Logger or search</p>
                      </div>
                      <Plus className="w-5 h-5 text-neon-blue" />
                    </button>
                  </div>
                  
                  <button onClick={() => setQuickLogMode('menu')} className="text-xs text-gray-500 hover:text-white mt-4 font-inter block w-full text-center">
                    ← Back to Menu
                  </button>
                </div>
              )}

              {quickLogMode === 'mealEditor' && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <Utensils className="w-6 h-6 text-neon-gold" />
                    <h2 className="esports-heading text-xl text-white">Adjust {activeMealType} Amounts</h2>
                  </div>
                  
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                    {quickMealItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-tactical-900 border border-tactical-700 p-3 rounded-lg">
                        <span className="text-white text-sm font-bold w-1/2">{item.name}</span>
                        <div className="flex items-center gap-2 w-1/2 justify-end">
                          <input 
                            type="number"
                            value={item.amount || ''}
                            onChange={(e) => {
                              const newItems = [...quickMealItems];
                              newItems[index].amount = e.target.value === '' ? 0 : Number(e.target.value);
                              setQuickMealItems(newItems);
                            }}
                            className="bg-tactical-800 border border-tactical-600 text-white p-2 rounded w-20 text-right focus:border-neon-gold outline-none"
                          />
                          <span className="text-xs text-gray-500 w-8">{item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-tactical-900 p-4 rounded-lg border border-tactical-700 mt-4">
                    <h4 className="text-xs font-rajdhani uppercase text-gray-400 tracking-wider mb-2">Calculated Macros</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-white"><span className="text-neon-gold font-bold">{Math.round(calculateQuickMealMacros().calories)}</span> kcal</span>
                      <span className="text-gray-400">P: <span className="text-white">{Math.round(calculateQuickMealMacros().protein)}g</span></span>
                      <span className="text-gray-400">C: <span className="text-white">{Math.round(calculateQuickMealMacros().carbs)}g</span></span>
                      <span className="text-gray-400">F: <span className="text-white">{Math.round(calculateQuickMealMacros().fat)}g</span></span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      quickMealItems.forEach(item => {
                        addFoodLog({
                          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          date: todayStr,
                          mealType: activeMealType as 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks',
                          food: item
                        });
                      });
                      setIsQuickLogOpen(false);
                      setQuickLogMode('menu');
                    }}
                    className="w-full bg-neon-gold text-tactical-900 py-3 rounded-lg font-rajdhani font-bold text-lg uppercase tracking-widest hover:bg-[#ffdf00] transition-all mt-4"
                  >
                    Confirm & Log
                  </button>

                  <button onClick={() => setQuickLogMode('nutrition')} className="text-xs text-gray-500 hover:text-white mt-2 block mx-auto font-inter">
                    ← Back to Meals
                  </button>
                </div>
              )}

              {quickLogMode === 'steps' && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center gap-2 mb-6">
                     <Footprints className="w-6 h-6 text-neon-green" />
                     <h2 className="esports-heading text-xl text-white">Manual Steps Log</h2>
                  </div>
                  
                  <div className="bg-tactical-900 p-6 rounded-lg border border-tactical-700 text-center">
                    <h3 className="text-gray-400 font-rajdhani uppercase tracking-widest text-sm mb-4">Steps to Add</h3>
                    <input 
                      type="number"
                      autoFocus
                      placeholder="0"
                      value={manualStepsInput || ''}
                      onChange={(e) => setManualStepsInput(Number(e.target.value))}
                      className="bg-tactical-800 border-b-2 border-neon-green text-white text-4xl font-rajdhani font-bold text-center w-full p-2 outline-none focus:bg-tactical-700 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {[100, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setManualStepsInput(prev => (prev || 0) + amt)}
                        className="bg-tactical-900 border border-tactical-700 py-2 rounded text-neon-green font-bold text-sm hover:bg-neon-green/10 transition-colors"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (manualStepsInput > 0) {
                        addSteps(manualStepsInput);
                        setManualStepsInput(0);
                        setIsQuickLogOpen(false);
                        setQuickLogMode('menu');
                      }
                    }}
                    className="w-full bg-neon-green text-tactical-900 py-3 rounded font-rajdhani font-bold text-lg uppercase tracking-widest hover:bg-[#00ff44] transition-all mt-4 shadow-[0_0_15px_rgba(0,255,0,0.3)]"
                  >
                    Confirm & Add
                  </button>

                  <button onClick={() => setQuickLogMode('menu')} className="text-xs text-gray-500 hover:text-white mt-4 block mx-auto font-inter">
                    ← Back to Menu
                  </button>
                </div>
              )}

              {quickLogMode === 'weight' && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center gap-2 mb-6">
                     <Scale className="w-6 h-6 text-neon-red" />
                     <h2 className="esports-heading text-xl text-white">Log Body Weight</h2>
                  </div>
                  
                  <div className="bg-tactical-900 p-6 rounded-lg border border-tactical-700 text-center">
                    <h3 className="text-gray-400 font-rajdhani uppercase tracking-widest text-sm mb-4">Today's Weight (lbs)</h3>
                    <input 
                      type="number"
                      autoFocus
                      placeholder="0"
                      value={manualWeightInput || ''}
                      onChange={(e) => setManualWeightInput(Number(e.target.value))}
                      className="bg-tactical-800 border-b-2 border-neon-red text-white text-4xl font-rajdhani font-bold text-center w-full p-2 outline-none focus:bg-tactical-700 transition-colors"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (manualWeightInput > 0) {
                        logWeight(manualWeightInput);
                        setManualWeightInput(0);
                        setIsQuickLogOpen(false);
                        setQuickLogMode('menu');
                      }
                    }}
                    className="w-full bg-neon-red text-white py-3 rounded font-rajdhani font-bold text-lg uppercase tracking-widest hover:bg-[#ff1a4d] transition-all mt-4 shadow-[0_0_15px_rgba(255,0,60,0.3)]"
                  >
                    Confirm & Save
                  </button>

                  <button onClick={() => setQuickLogMode('menu')} className="text-xs text-gray-500 hover:text-white mt-4 block mx-auto font-inter">
                    ← Back to Menu
                  </button>
                </div>
              )}

              {quickLogMode === 'workout' && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center gap-2 mb-6">
                     <Dumbbell className="w-6 h-6 text-neon-green" />
                     <h2 className="esports-heading text-xl text-white">Start Workout</h2>
                  </div>
                  
                  <button 
                    onClick={() => {
                      startWorkout(null);
                      setIsQuickLogOpen(false);
                      setQuickLogMode('menu');
                      setActiveTab('workout');
                    }}
                    className="w-full bg-tactical-900 border border-tactical-600 text-white px-6 py-4 rounded-lg font-rajdhani font-bold hover:bg-tactical-700 hover:border-neon-green transition-all mb-4 text-left flex justify-between items-center group"
                  >
                    <span>Start Empty Workout</span>
                    <Play className="w-5 h-5 text-gray-500 group-hover:text-neon-green transition-colors" />
                  </button>

                  {customPresets.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-rajdhani text-gray-400 uppercase tracking-widest mb-2">Your Presets</h3>
                      {customPresets.map((preset) => (
                        <button 
                          key={preset.id}
                          onClick={() => {
                            startWorkout(preset);
                            setIsQuickLogOpen(false);
                            setQuickLogMode('menu');
                            setActiveTab('workout');
                          }}
                          className="w-full bg-tactical-900 border border-tactical-700 text-gray-300 px-4 py-3 rounded-lg font-rajdhani font-bold uppercase tracking-wider hover:bg-neon-green/10 hover:text-neon-green hover:border-neon-green transition-all flex items-center justify-between"
                        >
                          <span>{preset.name}</span>
                          <Play className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={() => setQuickLogMode('menu')} className="text-xs text-gray-500 hover:text-white mt-4 block mx-auto font-inter">
                    ← Back to Menu
                  </button>
                </div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
