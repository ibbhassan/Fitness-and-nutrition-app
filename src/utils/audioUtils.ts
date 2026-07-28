// Web Audio API helper for retro level up sounds

export const playLevelUpSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    
    // Play an epic arpeggio: C4, E4, G4, C5
    const notes = [261.63, 329.63, 392.00, 523.25];
    const duration = 0.15; // duration of each note
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square'; // 'square' or 'sawtooth' gives that retro 8-bit feel
      osc.frequency.setValueAtTime(freq, ctx.currentTime + (i * duration));
      
      // Envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime + (i * duration));
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + (i * duration) + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i * duration) + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(ctx.currentTime + (i * duration));
      osc.stop(ctx.currentTime + (i * duration) + duration);
    });

    // Add a satisfying final "chord" or longer note at the end
    const finalOsc1 = ctx.createOscillator();
    const finalOsc2 = ctx.createOscillator();
    const finalGain = ctx.createGain();
    
    finalOsc1.type = 'square';
    finalOsc2.type = 'sawtooth';
    
    finalOsc1.frequency.setValueAtTime(523.25, ctx.currentTime + (notes.length * duration)); // C5
    finalOsc2.frequency.setValueAtTime(659.25, ctx.currentTime + (notes.length * duration)); // E5
    
    finalGain.gain.setValueAtTime(0, ctx.currentTime + (notes.length * duration));
    finalGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + (notes.length * duration) + 0.1);
    finalGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (notes.length * duration) + 1.0);
    
    finalOsc1.connect(finalGain);
    finalOsc2.connect(finalGain);
    finalGain.connect(ctx.destination);
    
    finalOsc1.start(ctx.currentTime + (notes.length * duration));
    finalOsc2.start(ctx.currentTime + (notes.length * duration));
    finalOsc1.stop(ctx.currentTime + (notes.length * duration) + 1.0);
    finalOsc2.stop(ctx.currentTime + (notes.length * duration) + 1.0);
    
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
