import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { X } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { personas } from '@dicebear/collection';

interface AvatarCustomizerProps {
  onClose: () => void;
}

const SKIN_COLORS = ['f9c9b6', 'f4d150', 'e0ddff', 'd2eff3', 'ffeba4', 'ffedef', 'ffffff'];
const HAIR_COLORS = ['000000', '6bd9e9', '9287ff', 'f4d150', 'ac6651', '77311d'];
const CLOTHING_COLORS = ['9287ff', '6bd9e9', 'fc909f', 'f4d150', 'e0ddff', 'd2eff3', 'ffeba4', 'ffedef', 'ffffff'];

const TOPS = [
  { value: 'shortCombover', label: 'Short' },
  { value: 'curlyHighTop', label: 'High Top' },
  { value: 'bobCut', label: 'Bob' },
  { value: 'curly', label: 'Curly' },
  { value: 'buzzcut', label: 'Buzzcut' },
  { value: 'bald', label: 'Bald' },
  { value: 'cap', label: 'Cap' },
  { value: 'beanie', label: 'Beanie' },
  { value: 'fade', label: 'Fade' },
  { value: 'mohawk', label: 'Mohawk' }
];

const EYES = ['open', 'sleep', 'wink', 'glasses', 'happy', 'sunglasses'];
const MOUTHS = ['smile', 'frown', 'surprise', 'bigSmile', 'smirk'];
const BODIES = ['squared', 'rounded', 'small', 'checkered'];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ onClose }) => {
  const { profile, updateAvatar } = useUser();
  
  // Initialize with existing config or defaults
  const [config, setConfig] = useState(profile?.avatar || {
    seed: profile?.name || 'Agent',
    skinColor: 'f9c9b6',
    top: 'shortCombover',
    hairColor: '000000',
    clothingColor: '9287ff',
    facialHair: 'none',
    eyes: 'open',
    eyebrows: 'none',
    mouth: 'smile',
    body: 'squared'
  });

  const [svgUrl, setSvgUrl] = useState<string>('');

  // Update SVG whenever config changes
  useEffect(() => {
    const avatar = createAvatar(personas, {
      seed: config.seed,
      skinColor: [config.skinColor],
      hair: [config.top as any],
      hairColor: [config.hairColor as any],
      clothingColor: [config.clothingColor as any],
      facialHair: config.facialHair === 'none' ? [] : [config.facialHair as any],
      backgroundColor: ['transparent'],
      mouth: [(config.mouth || 'smile') as any],
      eyes: [(config.eyes || 'open') as any],
      body: [(config.body || 'squared') as any]
    });
    
    // Create an object URL from the SVG
    const svgString = avatar.toString();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setSvgUrl(url);
    
    return () => URL.revokeObjectURL(url);
  }, [config]);

  const handleSave = () => {
    updateAvatar(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-tactical-900 border border-tactical-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-fade-in shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* Left Side - Preview */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-tactical-700 relative z-10 bg-tactical-800/50">
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-neon-blue/50 overflow-hidden relative shadow-[0_0_30px_rgba(0,240,255,0.2)] bg-tactical-800 mb-6">
            {svgUrl && <img src={svgUrl} alt="Avatar Preview" className="w-full h-full object-cover scale-110" />}
          </div>
          
          <button 
            onClick={() => setConfig({ ...config, seed: Math.random().toString(36).substring(7) })}
            className="flex items-center gap-2 text-neon-blue hover:text-white transition-colors text-sm font-rajdhani uppercase tracking-wider font-bold"
          >
            Randomize Face
          </button>
        </div>

        {/* Right Side - Controls */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto relative z-10 custom-scrollbar bg-tactical-900">
          <div className="flex justify-between items-center mb-6 hidden md:flex">
            <h2 className="text-xl font-rajdhani font-bold text-white uppercase tracking-wider">Configure Agent</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6 pb-20 md:pb-0">
            {/* Base Color / Skin */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Skin Tone</label>
              <div className="flex flex-wrap gap-2">
                {SKIN_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, skinColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.skinColor === color ? 'border-neon-blue scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: `#${color}` }}
                  />
                ))}
              </div>
            </div>

            {/* Hair Style */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Hair Style</label>
              <select 
                value={config.top}
                onChange={(e) => setConfig({ ...config, top: e.target.value })}
                className="w-full bg-tactical-800 border border-tactical-700 rounded-lg p-2 text-white font-inter"
              >
                {TOPS.map(top => (
                  <option key={top.value} value={top.value}>{top.label}</option>
                ))}
              </select>
            </div>

            {/* Hair Color */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Hair Color</label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, hairColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.hairColor === color ? 'border-neon-blue scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: `#${color}` }}
                  />
                ))}
              </div>
            </div>

            {/* Shirt Color */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Shirt Color</label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, clothingColor: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.clothingColor === color ? 'border-neon-blue scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: `#${color}` }}
                  />
                ))}
              </div>
            </div>

            {/* Body Shape */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Body Shape</label>
              <select 
                value={config.body || 'squared'}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
                className="w-full bg-tactical-800 border border-tactical-700 rounded-lg p-2 text-white font-inter"
              >
                {BODIES.map(b => (
                  <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Mouth */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Mouth / Lip Shape</label>
              <select 
                value={config.mouth || 'smile'}
                onChange={(e) => setConfig({ ...config, mouth: e.target.value })}
                className="w-full bg-tactical-800 border border-tactical-700 rounded-lg p-2 text-white font-inter"
              >
                {MOUTHS.map(mouth => (
                  <option key={mouth} value={mouth}>{mouth.charAt(0).toUpperCase() + mouth.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Eyes */}
            <div>
              <label className="block text-xs font-rajdhani text-gray-400 uppercase tracking-wider mb-2">Eyes</label>
              <select 
                value={config.eyes || 'open'}
                onChange={(e) => setConfig({ ...config, eyes: e.target.value })}
                className="w-full bg-tactical-800 border border-tactical-700 rounded-lg p-2 text-white font-inter"
              >
                {EYES.map(eye => (
                  <option key={eye} value={eye}>{eye.charAt(0).toUpperCase() + eye.slice(1)}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-tactical-900 border-t border-tactical-700 md:relative md:border-0 md:bg-transparent md:p-0 md:mt-8">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-neon-blue text-black font-rajdhani font-bold uppercase tracking-wider rounded-lg hover:bg-white transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)]"
            >
              Confirm Identity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
