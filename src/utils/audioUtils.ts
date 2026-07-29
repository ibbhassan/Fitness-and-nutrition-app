// Web Audio API helper for retro level up sounds

export const playLevelUpSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // We delay the start of the sequence to match the "shatter" of the old rank at 1.5s
    const sequenceStart = now + 1.5; 
    
    // 0. The Shatter (Glass breaking / White Noise burst)
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Bandpass filter to make it sound "glassy" and sharp
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 5000;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.setValueAtTime(0.8, sequenceStart);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, sequenceStart + 0.3);
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noiseSource.start(sequenceStart);
    noiseSource.stop(sequenceStart + 0.5);

    // 1. The Riser (Whoosh building up)
    const riserDuration = 1.2;
    const riserOsc = ctx.createOscillator();
    const riserGain = ctx.createGain();
    
    riserOsc.type = 'sawtooth';
    riserOsc.frequency.setValueAtTime(50, sequenceStart);
    riserOsc.frequency.exponentialRampToValueAtTime(800, sequenceStart + riserDuration);
    
    riserGain.gain.setValueAtTime(0, sequenceStart);
    riserGain.gain.linearRampToValueAtTime(0.5, sequenceStart + riserDuration - 0.1);
    riserGain.gain.linearRampToValueAtTime(0, sequenceStart + riserDuration);
    
    riserOsc.connect(riserGain);
    riserGain.connect(ctx.destination);
    
    riserOsc.start(sequenceStart);
    riserOsc.stop(sequenceStart + riserDuration);
    
    // 2. The Slam / Assembly (Heavy impact)
    const slamStart = sequenceStart + riserDuration;
    const slamOsc = ctx.createOscillator();
    const slamGain = ctx.createGain();
    
    slamOsc.type = 'sine'; // Deep sub bass
    slamOsc.frequency.setValueAtTime(150, slamStart);
    slamOsc.frequency.exponentialRampToValueAtTime(30, slamStart + 0.3);
    
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
