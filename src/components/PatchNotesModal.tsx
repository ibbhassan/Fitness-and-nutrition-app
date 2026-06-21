import React from 'react';
import { X, CheckCircle2, Zap, Layout as LayoutIcon, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface PatchNotesModalProps {
  version: string;
  onClose: () => void;
}

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ version, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-tactical-800/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg bg-tactical-900 border border-tactical-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="bg-tactical-800 p-6 border-b border-tactical-700 relative shrink-0">
          <div className="absolute top-4 right-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors bg-tactical-900/50 p-2 rounded-full hover:bg-tactical-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-neon-blue/20 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h2 className="esports-heading text-2xl text-white tracking-wider">Major Update</h2>
              <p className="text-neon-blue font-rajdhani font-bold tracking-widest text-sm">{version}</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-neon-gold" />
              <h3 className="text-lg font-bold text-white">Adjustable AI Logging</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>The AI Meal Logger now works like a Meal Builder. You can review individual parsed items and tweak amounts before finalizing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>"Same as yesterday" now explicitly lists the foods you had and opens the review screen so you can adjust today's amounts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>Quick Add: "Same Lunch From Yesterday" now dynamically pulls your actual previous lunch items instead of placeholder data!</span>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutIcon className="w-5 h-5 text-neon-purple" />
              <h3 className="text-lg font-bold text-white">Layout & Saved Meals</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>Saved Meals full page builder: A complete interface with recent foods, favorites, and manual entry to easily build your saved meals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>Workout Preset Builder and Active Workout screens now fully utilize your screen width for a less cramped experience.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>UI/Header fixes for the preset builder: headers no longer cover the back button or title input.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>Add Exercise button styled consistently with the rest of the app's neon aesthetic.</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="p-4 bg-tactical-800 border-t border-tactical-700 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-neon-blue text-tactical-950 font-rajdhani font-bold text-lg uppercase tracking-wider py-3 rounded-xl hover:bg-[#00f0ff] transition-all"
          >
            Got it, Let's go!
          </button>
        </div>
      </motion.div>
    </div>
  );
};
