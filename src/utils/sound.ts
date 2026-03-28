class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    this.playTone(800, 'sine', 0.1, 0.05);
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.3, 0.1);
  }

  playAlert() {
    this.playTone(400, 'square', 0.2, 0.1);
    setTimeout(() => this.playTone(600, 'square', 0.4, 0.1), 200);
  }

  playSuccess() {
    this.playTone(400, 'sine', 0.1, 0.05);
    setTimeout(() => this.playTone(600, 'sine', 0.2, 0.05), 100);
  }
}

export const sound = new SoundEngine();
