import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { X, Check } from 'lucide-react';

interface AvatarCustomizerProps {
  onClose: () => void;
}

const PRESET_AVATARS = [
  '/images/avatars/avatar_male_light.jpg',
  '/images/avatars/avatar_female_medium.jpg',
  '/images/avatars/avatar_male_dark.jpg',
  '/images/avatars/avatar_female_light.jpg',
  '/images/avatars/avatar_male_medium_bald.jpg',
  '/images/avatars/avatar_female_dark_curly.jpg',
  '/images/avatars/avatar_male_light_long.jpg',
  '/images/avatars/avatar_female_light_bob.jpg',
  '/images/avatars/avatar_male_dark_dreads.jpg',
  '/images/avatars/avatar_female_medium_bun.jpg',
  '/images/avatars/avatar_male_medium_cap.jpg',
  '/images/avatars/avatar_female_dark_straight.jpg',
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onClose }) => {
  const { profile, updateAvatar } = useUser();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    typeof profile?.avatar === 'string' ? profile.avatar : '/images/avatar_3d.png'
  );

  const handleSave = () => {
    updateAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tactical-900 border border-tactical-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-fade-in shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-xl"></div>

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-tactical-700 relative z-10">
          <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">Choose Avatar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Gallery */}
        <div className="p-6 overflow-y-auto relative z-10 custom-scrollbar flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PRESET_AVATARS.map((avatar, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  selectedAvatar === avatar 
                    ? 'border-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)] scale-105 z-10' 
                    : 'border-tactical-700 hover:border-gray-500 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover scale-110" />
                {selectedAvatar === avatar && (
                  <div className="absolute top-2 right-2 bg-neon-blue rounded-full p-1 shadow-lg">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-tactical-700 relative z-10 flex justify-end">
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none px-6 py-3 rounded-lg font-rajdhani font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-tactical-800 hover:bg-tactical-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 md:flex-none px-6 py-3 rounded-lg font-rajdhani font-bold uppercase tracking-wider text-black bg-neon-blue hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
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
