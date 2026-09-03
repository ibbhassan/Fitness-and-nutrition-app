import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { X, Check, Users } from 'lucide-react';
import clsx from 'clsx';

interface AvatarCustomizerProps {
  onClose: () => void;
}

export interface AvatarPreset {
  id: string;
  name: string;
  category: string;
  url: string;
}

const DIVERSE_AVATAR_PRESETS: AvatarPreset[] = [
  // Local Presets
  { id: 'local_3', name: 'Dark Skin Athletic Male', category: 'Black / African', url: '/images/avatars/avatar_male_dark.jpg' },
  { id: 'local_6', name: 'Dark Skin Curly Female', category: 'Black / African', url: '/images/avatars/avatar_female_dark_curly.jpg' },
  { id: 'local_9', name: 'Dark Skin Dreads Male', category: 'Black / African', url: '/images/avatars/avatar_male_dark_dreads.jpg' },
  { id: 'local_5', name: 'Medium Skin Bald Male', category: 'Black / African', url: '/images/avatars/avatar_male_medium_bald.jpg' },
  { id: 'local_8', name: 'East Asian Bob Female', category: 'East Asian', url: '/images/avatars/avatar_female_light_bob.jpg' },
  { id: 'local_12', name: 'East Asian Straight Female', category: 'East Asian', url: '/images/avatars/avatar_female_dark_straight.jpg' },
  { id: 'local_10', name: 'South Asian Bun Female', category: 'South Asian', url: '/images/avatars/avatar_female_medium_bun.jpg' },
  { id: 'local_2', name: 'Latina Athletic Female', category: 'Hispanic / Latino', url: '/images/avatars/avatar_female_medium.jpg' },
  { id: 'local_11', name: 'Latino Cap Male', category: 'Hispanic / Latino', url: '/images/avatars/avatar_male_medium_cap.jpg' },
  { id: 'local_1', name: 'Caucasian Light Male', category: 'Caucasian', url: '/images/avatars/avatar_male_light.jpg' },
  { id: 'local_4', name: 'Caucasian Light Female', category: 'Caucasian', url: '/images/avatars/avatar_female_light.jpg' },
  { id: 'local_7', name: 'Caucasian Long Hair Male', category: 'Caucasian', url: '/images/avatars/avatar_male_light_long.jpg' },

  // Black / African Representation
  { id: 'afro_male_1', name: 'Malik (Dreads)', category: 'Black / African', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=black,brown,darkBrown&top=dreads,shortCurly,fro&hairColor=black&facialHair=beardLight,beardMajestic' },
  { id: 'afro_female_1', name: 'Zuri (Box Braids)', category: 'Black / African', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=black,brown,darkBrown&top=bigHair,curly,straightAndStrand&hairColor=black' },
  { id: 'afro_male_2', name: 'Kobe (Short Fade)', category: 'Black / African', url: 'https://api.dicebear.com/7.x/micah/svg?skinColor=black,darkBrown&hair=pixie,short' },
  { id: 'afro_female_2', name: 'Nia (High Afro)', category: 'Black / African', url: 'https://api.dicebear.com/7.x/micah/svg?skinColor=black,darkBrown&hair=full,dreads' },

  // East Asian Representation
  { id: 'asian_male_1', name: 'Kenji (Slicked Hair)', category: 'East Asian', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=yellow,tanned&top=shortFlat,shortWaved,sides&hairColor=black' },
  { id: 'asian_female_1', name: 'Mei (Straight Bob)', category: 'East Asian', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=yellow,tanned&top=straight1,straight2,bob&hairColor=black' },
  { id: 'asian_male_2', name: 'Min-jun (Spiky Hair)', category: 'East Asian', url: 'https://api.dicebear.com/7.x/micah/svg?skinColor=yellow,tanned&hair=fonze,full' },
  { id: 'asian_female_2', name: 'Hana (Long Waves)', category: 'East Asian', url: 'https://api.dicebear.com/7.x/lorelei/svg?hair=straight01,wavy01' },

  // South Asian Representation
  { id: 'desi_male_1', name: 'Rohan (Full Beard)', category: 'South Asian', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=brown,darkBrown&top=shortCurly,shortFlat&facialHair=beardMajestic,beardMedium&hairColor=black' },
  { id: 'desi_female_1', name: 'Priya (Long Wavy Hair)', category: 'South Asian', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=brown,darkBrown&top=longButNotTooLong,curly&hairColor=black' },
  { id: 'desi_male_2', name: 'Arjun (Trimmed Beard)', category: 'South Asian', url: 'https://api.dicebear.com/7.x/micah/svg?skinColor=brown,darkBrown&facialHair=beard&hair=full' },

  // Hispanic / Latino Representation
  { id: 'latino_male_1', name: 'Carlos (Waves & Mustache)', category: 'Hispanic / Latino', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=tanned,brown&top=shortWaved,shortCurly&facialHair=mustacheMagnum,beardLight' },
  { id: 'latino_female_1', name: 'Sofia (Curly Waves)', category: 'Hispanic / Latino', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=tanned,brown&top=curly,curlyBun&hairColor=black,brown' },
  { id: 'latino_male_2', name: 'Mateo (Short Quiff)', category: 'Hispanic / Latino', url: 'https://api.dicebear.com/7.x/micah/svg?skinColor=tanned,brown&hair=fonze' },

  // Middle Eastern Representation
  { id: 'arab_male_1', name: 'Tariq (Full Beard)', category: 'Middle Eastern', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=tanned,brown&top=shortFlat,shortWaved&facialHair=beardMedium&hairColor=black' },
  { id: 'arab_female_1', name: 'Layla (Hijab)', category: 'Middle Eastern', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=tanned,brown&top=hijab&hairColor=black' },
  { id: 'arab_male_2', name: 'Zayd (Taper & Scruff)', category: 'Middle Eastern', url: 'https://api.dicebear.com/7.x/micah/svg?skinColor=tanned,brown&facialHair=scruff,beard' },

  // Indigenous & Mixed Representation
  { id: 'indigenous_male_1', name: 'Kaelen (Braids)', category: 'Indigenous & Mixed', url: 'https://api.dicebear.com/7.x/avataaars/svg?skinColor=brown,tanned&top=longButNotTooLong,dreads&hairColor=black' },
  { id: 'indigenous_female_1', name: 'Aiyana (Long Dark Hair)', category: 'Indigenous & Mixed', url: 'https://api.dicebear.com/7.x/lorelei/svg?hair=straight01,wavy01' },

  // Cyber Tactical & Mecha
  { id: 'cyber_bot_1', name: 'Mecha Prime', category: 'Cyber Tactical', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MechaPrime' },
  { id: 'cyber_bot_2', name: 'Cyber Ghost', category: 'Cyber Tactical', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberGhost' },
  { id: 'cyber_bot_3', name: 'Neo Stealth', category: 'Cyber Tactical', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeoStealth' }
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onClose }) => {
  const { profile, updateAvatar } = useUser();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    typeof profile?.avatar === 'string' ? profile.avatar : '/images/avatar_3d.png'
  );
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Black / African', 'East Asian', 'South Asian', 'Hispanic / Latino', 'Middle Eastern', 'Caucasian', 'Indigenous & Mixed', 'Cyber Tactical'];

  const filteredAvatars = activeCategory === 'All' 
    ? DIVERSE_AVATAR_PRESETS 
    : DIVERSE_AVATAR_PRESETS.filter(a => a.category === activeCategory);

  const handleSave = () => {
    updateAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tactical-900 border border-tactical-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-fade-in shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-xl"></div>

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-tactical-700 relative z-10 bg-tactical-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neon-blue/20 border border-neon-blue/50 flex items-center justify-center text-neon-blue">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">Choose Agent Avatar</h2>
              <p className="text-xs text-gray-400 font-inter">Inclusive avatar presets representing diverse races, ethnicities, and tactical styles</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 p-3 overflow-x-auto border-b border-tactical-800 bg-tactical-950/50 relative z-10 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                activeCategory === cat
                  ? "bg-neon-blue text-tactical-950 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                  : "bg-tactical-800 text-gray-400 hover:text-white hover:bg-tactical-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery */}
        <div className="p-5 overflow-y-auto relative z-10 custom-scrollbar flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredAvatars.map((preset) => (
              <button
                type="button"
                key={preset.id}
                onClick={() => setSelectedAvatar(preset.url)}
                className={clsx(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 group cursor-pointer flex flex-col justify-end p-2 bg-tactical-950",
                  selectedAvatar === preset.url 
                    ? "border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-105 z-10" 
                    : "border-tactical-700 hover:border-gray-500 opacity-80 hover:opacity-100"
                )}
              >
                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover absolute inset-0 scale-105 group-hover:scale-110 transition-transform" />
                
                {/* Title Overlay */}
                <div className="relative z-10 bg-black/80 backdrop-blur-xs p-1.5 rounded border border-tactical-700/60 text-left">
                  <span className="text-[10px] font-rajdhani font-bold text-white uppercase tracking-wider block truncate">
                    {preset.name}
                  </span>
                  <span className="text-[9px] font-mono text-neon-blue block">
                    {preset.category}
                  </span>
                </div>

                {selectedAvatar === preset.url && (
                  <div className="absolute top-2 right-2 bg-neon-blue rounded-full p-1 shadow-lg z-20">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-tactical-700 relative z-10 flex justify-end bg-tactical-950/80">
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-rajdhani font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-tactical-800 hover:bg-tactical-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-lg font-rajdhani font-bold uppercase tracking-wider text-black bg-neon-blue hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

