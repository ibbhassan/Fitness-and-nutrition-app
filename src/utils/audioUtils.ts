// Web Audio API helper for retro level up sounds

export const playLevelUpSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // 1. The Riser (Whoosh building up)
    const riserDuration = 1.2;
    const riserOsc = ctx.createOscillator();
    const riserGain = ctx.createGain();
    
    riserOsc.type = 'sawtooth';
    // Frequency sweeps from low to high
    riserOsc.frequency.setValueAtTime(50, now);
    riserOsc.frequency.exponentialRampToValueAtTime(800, now + riserDuration);
    
    // Volume builds up then cuts off
    riserGain.gain.setValueAtTime(0, now);
    riserGain.gain.linearRampToValueAtTime(0.5, now + riserDuration - 0.1);
    riserGain.gain.linearRampToValueAtTime(0, now + riserDuration);
    
    riserOsc.connect(riserGain);
    riserGain.connect(ctx.destination);
    
    riserOsc.start(now);
    riserOsc.stop(now + riserDuration);
    
    // 2. The Slam / Assembly (Heavy impact)
    const slamStart = now + riserDuration;
    const slamOsc = ctx.createOscillator();
    const slamGain = ctx.createGain();
    
    slamOsc.type = 'sine'; // Deep sub bass
    
    // Pitch drop for the impact punch
    slamOsc.frequency.setValueAtTime(150, slamStart);
    slamOsc.frequency.exponentialRampToValueAtTime(30, slamStart + 0.3);
    
    // Volume spike and slow decay
    slamGain.gain.setValueAtTime(0, slamStart);
    slamGain.gain.linearRampToValueAtTime(1.0, slamStart + 0.05);
    slamGain.gain.exponentialRampToValueAtTime(0.01, slamStart + 2.0);
    
    slamOsc.connect(slamGain);
    slamGain.connect(ctx.destination);
    
    slamOsc.start(slamStart);
    slamOsc.stop(slamStart + 2.0);

    // 3. The Metallic Ring / Flash
    const ringOsc = ctx.createOscillator();
    const ringGain = ctx.createGain();
    
    ringOsc.type = 'triangle';
    ringOsc.frequency.setValueAtTime(1200, slamStart);
    ringOsc.frequency.exponentialRampToValueAtTime(400, slamStart + 1.5);
    
    ringGain.gain.setValueAtTime(0, slamStart);
    ringGain.gain.linearRampToValueAtTime(0.3, slamStart + 0.02);
    ringGain.gain.exponentialRampToValueAtTime(0.01, slamStart + 1.5);
    
    ringOsc.connect(ringGain);
    ringGain.connect(ctx.destination);
    
    ringOsc.start(slamStart);
    ringOsc.stop(slamStart + 1.5);
    
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};
