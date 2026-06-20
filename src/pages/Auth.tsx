import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Crosshair, Shield } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // For local storage, any non-empty username will "login" or "create" an account.
      login(username);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #0a0a0a 100%)' }}>
      
      {/* Brand Header */}
      <div className="mb-12 text-center fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Crosshair className="w-12 h-12 text-neon-blue" />
          <h1 className="esports-heading text-5xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white">EVOKE</h1>
        </div>
        <p className="font-rajdhani text-gray-400 tracking-[0.2em] uppercase text-sm">Tactical Fitness Protocol</p>
      </div>

      {/* Auth Panel */}
      <div className="bg-tactical-900 border border-tactical-700 p-8 rounded-xl w-full max-w-md shadow-2xl fade-in relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <h2 className="esports-heading text-2xl mb-6 flex items-center gap-2 relative z-10">
          <Shield className="w-6 h-6 text-neon-gold" />
          {isLogin ? 'System Login' : 'Create Operative'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-rajdhani uppercase text-gray-400 tracking-wider mb-2">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white font-rajdhani text-lg focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] outline-none transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-xs font-rajdhani uppercase text-gray-400 tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-tactical-800 border border-tactical-600 rounded p-3 text-white font-rajdhani text-lg focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-neon-blue text-tactical-900 py-4 rounded font-rajdhani font-bold text-lg uppercase tracking-widest hover:bg-[#00d0dd] transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] mt-4"
          >
            {isLogin ? 'Initialize Session' : 'Register Operative'}
          </button>
        </form>

        <div className="mt-6 text-center relative z-10">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-inter text-gray-400 hover:text-neon-blue transition-colors"
          >
            {isLogin ? "Don't have an account? Create one." : "Already an operative? Login."}
          </button>
        </div>
      </div>
    </div>
  );
};
