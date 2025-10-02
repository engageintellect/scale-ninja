/** Audio playback engine for Scale Ninja */

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private isInitialized = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private async initializeAudio(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      // @ts-expect-error - webkitAudioContext is not in standard types but needed for Safari compatibility
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Play a note given its MIDI number
   * @param midiNote - MIDI note number (40 = E2, 64 = E4)
   * @param duration - Duration in seconds (default: 0.8 for guitar pluck)
   */
  async playNote(midiNote: number, duration: number = 0.8): Promise<void> {
    await this.initializeAudio();
    
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    // Resume audio context if suspended (required by some browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const frequency = this.midiToFrequency(midiNote);
    const currentTime = this.audioContext.currentTime;

    // Create a more realistic guitar sound with multiple harmonics
    this.createGuitarSound(frequency, currentTime, duration);
  }

  /**
   * Create a realistic guitar pluck sound with sharp attack and natural decay
   */
  private createGuitarSound(frequency: number, startTime: number, duration: number): void {
    if (!this.audioContext) return;

    // Master gain node
    const masterGain = this.audioContext.createGain();
    
    // Guitar-specific filtering
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, startTime); // Brighter than before for pluck
    filter.Q.setValueAtTime(0.7, startTime);
    
    // High-pass to clean up low end
    const highPassFilter = this.audioContext.createBiquadFilter();
    highPassFilter.type = 'highpass';
    highPassFilter.frequency.setValueAtTime(60, startTime);
    
    // Connect audio chain
    masterGain.connect(highPassFilter);
    highPassFilter.connect(filter);
    filter.connect(this.audioContext.destination);

    // Guitar harmonics - more realistic ratios and gains for plucked string
    const harmonics = [
      { ratio: 1.0, gain: 1.0, wave: 'triangle' },    // Fundamental - triangle for warmer tone
      { ratio: 2.0, gain: 0.6, wave: 'sine' },        // Octave
      { ratio: 3.0, gain: 0.3, wave: 'sine' },        // Perfect fifth
      { ratio: 4.0, gain: 0.2, wave: 'sine' },        // Second octave
      { ratio: 5.0, gain: 0.15, wave: 'sine' },       // Major third
      { ratio: 6.0, gain: 0.1, wave: 'sine' },        // Perfect fifth
    ];

    harmonics.forEach((harmonic) => {
      const oscillator = this.audioContext!.createOscillator();
      const harmonicGain = this.audioContext!.createGain();
      
      // Use triangle for fundamental, sine for harmonics (more guitar-like)
      oscillator.type = harmonic.wave as OscillatorType;
      oscillator.frequency.setValueAtTime(frequency * harmonic.ratio, startTime);
      
      // Connect harmonic
      oscillator.connect(harmonicGain);
      harmonicGain.connect(masterGain);
      
      // Guitar pluck envelope - sharp attack, quick decay
      harmonicGain.gain.setValueAtTime(0, startTime);
      harmonicGain.gain.linearRampToValueAtTime(harmonic.gain * 0.8, startTime + 0.001); // Instant attack
      harmonicGain.gain.exponentialRampToValueAtTime(harmonic.gain * 0.4, startTime + 0.02); // Quick initial decay
      harmonicGain.gain.exponentialRampToValueAtTime(harmonic.gain * 0.4, startTime + 0.4); // Faster decay
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7); // Natural fade
      
      // Start and stop
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      // Clean up
      oscillator.onended = () => {
        oscillator.disconnect();
        harmonicGain.disconnect();
      };
    });

    // Master envelope - guitar pluck characteristics
    masterGain.gain.setValueAtTime(0, startTime);
    masterGain.gain.linearRampToValueAtTime(0.6, startTime + 0.001); // Instant pluck attack
    masterGain.gain.exponentialRampToValueAtTime(0.4, startTime + 0.02); // Quick decay
    masterGain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.08); // Continued decay
    masterGain.gain.exponentialRampToValueAtTime(0.1, startTime + 0.5); // Sustain level
    masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Natural release

    // Add subtle filter modulation for pluck realism
    const filterMod = this.audioContext.createOscillator();
    const filterModGain = this.audioContext.createGain();
    
    filterMod.type = 'sine';
    filterMod.frequency.setValueAtTime(8, startTime); // Subtle modulation
    filterModGain.gain.setValueAtTime(0, startTime);
    filterModGain.gain.linearRampToValueAtTime(50, startTime + 0.01); // Quick filter sweep
    filterModGain.gain.exponentialRampToValueAtTime(0.1, startTime + 0.1); // Settle
    
    filterMod.connect(filterModGain);
    filterModGain.connect(filter.frequency);
    
    filterMod.start(startTime);
    filterMod.stop(startTime + duration);
    
    // Clean up
    filterMod.onended = () => {
      filterMod.disconnect();
      filterModGain.disconnect();
      masterGain.disconnect();
      filter.disconnect();
      highPassFilter.disconnect();
    };
  }

  /**
   * Convert MIDI note number to frequency in Hz
   */
  private midiToFrequency(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
  }

  /**
   * Calculate MIDI note number from string and fret
   * @param stringIndex - 0-5 (low E to high E)
   * @param fret - 0-24
   */
  stringFretToMidi(stringIndex: number, fret: number): number {
    // Standard tuning MIDI notes for open strings
    const openStringMidi = [40, 45, 50, 55, 59, 64]; // E2, A2, D3, G3, B3, E4
    return openStringMidi[stringIndex] + fret;
  }

  /**
   * Play a note from string and fret position
   */
  async playStringFret(stringIndex: number, fret: number, duration?: number): Promise<void> {
    const midiNote = this.stringFretToMidi(stringIndex, fret);
    await this.playNote(midiNote, duration);
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
