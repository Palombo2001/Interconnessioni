/**
 * Native, lightweight Web Audio API Synthesizer
 * Avoids heavy/unstable p5.sound addon and delivers high-performance chimes and ambient stereo textures.
 */

const CELESTIAL_SCALE = [
  146.83, // D3
  164.81, // E3
  196.00, // G3
  220.00, // A3
  246.94, // B3
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00, // A5
  987.77, // B5
  1174.66, // D6
  1318.51  // E6
];

function getClosestCelestial(freq: number): number {
  return CELESTIAL_SCALE.reduce((prev, curr) => 
    Math.abs(curr - freq) < Math.abs(prev - freq) ? curr : prev
  );
}

class SynapticSynth {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  // Continuous Ambient Soundscape Engine fields
  private ambientOscs: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private isAmbientStarted = false;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private init() {
    if (this.ctx) return;
    try {
      // Handle browser prefixes
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      // Setup lowpass resonance filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(550, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      // Main output gain manager
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      // Connect graph
      this.filter.connect(this.primaryGain);
      this.primaryGain.connect(this.ctx.destination);

      // Configure Ambient soundscape nodes
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = "lowpass";
      this.ambientFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
      this.ambientFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.ambientFilter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
    } catch (e) {
      console.error("Web Audio API is not supported in this browser:", e);
    }
  }

  public triggerTypingPiano(index: number) {
    this.init();
    if (!this.ctx || !this.primaryGain) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    
    // Choose a note from the scale based on the index (character code or length)
    const idx = Math.abs(index) % CELESTIAL_SCALE.length;
    // Shift it up an octave or two for a delicate piano-like register
    const baseFreq = CELESTIAL_SCALE[idx] * 2;

    // Create a delicate sine/triangle mix to simulate a soft piano hammer
    const osc = this.ctx.createOscillator();
    osc.type = "sine"; // Very soft
    osc.frequency.setValueAtTime(baseFreq, t);

    // Add a tiny bit of "hammer" attack transient
    const hammerOsc = this.ctx.createOscillator();
    hammerOsc.type = "triangle";
    hammerOsc.frequency.setValueAtTime(baseFreq * 2, t); // Octave higher

    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (panner) {
      // Random delicate panning
      panner.pan.setValueAtTime((Math.random() - 0.5) * 0.4, t);
    }

    const gainNode = this.ctx.createGain();
    const hammerGain = this.ctx.createGain();

    // Delicate piano envelope (fast attack, natural decay)
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.06, t + 0.015); // Very soft peak
    gainNode.gain.exponentialRampToValueAtTime(1e-4, t + 0.4);

    // Hammer envelope (very fast transient)
    hammerGain.gain.setValueAtTime(0, t);
    hammerGain.gain.linearRampToValueAtTime(0.02, t + 0.005);
    hammerGain.gain.exponentialRampToValueAtTime(1e-4, t + 0.05);

    if (panner) {
      osc.connect(panner);
      hammerOsc.connect(panner);
      panner.connect(gainNode);
      panner.connect(hammerGain);
    } else {
      osc.connect(gainNode);
      hammerOsc.connect(hammerGain);
    }

    gainNode.connect(this.primaryGain);
    hammerGain.connect(this.primaryGain);

    // Ensure master gain is open
    this.primaryGain.gain.cancelScheduledValues(t);
    this.primaryGain.gain.setTargetAtTime(1.0, t, 0.01);

    osc.start(t);
    hammerOsc.start(t);
    osc.stop(t + 0.5);
    hammerOsc.stop(t + 0.1);
  }

  /**
   * Triggers a beautiful synthetic cell ripple, tuned to our pentatonic scale.
   * Completely avoids harsh beep sounds, producing a clean glassy droplet resonance.
   */
  public triggerSynapticBeep(frequencyOrIndex: number, alpha: number, beta: number) {
    this.init();
    if (!this.ctx || !this.filter || !this.primaryGain) return;

    // Direct resume for user interaction gates
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    
    // Auto-tune the incoming frequency/index into our beautiful celestial scale
    let noteFreq = frequencyOrIndex;
    if (frequencyOrIndex < 100) {
      const idx = Math.floor(Math.abs(frequencyOrIndex)) % CELESTIAL_SCALE.length;
      noteFreq = CELESTIAL_SCALE[idx];
    } else {
      noteFreq = getClosestCelestial(frequencyOrIndex);
    }

    // Dynamic Filter modification (Alpha makes filter wider and resonant; Beta makes it sharp and low)
    const filterFreq = 180 + (alpha * 1200) + (beta * 150);
    this.filter.frequency.cancelScheduledValues(t);
    this.filter.frequency.setTargetAtTime(Math.max(100, filterFreq), t, 0.2);
    this.filter.Q.cancelScheduledValues(t);
    this.filter.Q.setTargetAtTime(1.5 + (alpha * 4.0), t, 0.2);

    // VOICE 1: Root liquid bell (Sine wave)
    const oscRoot = this.ctx.createOscillator();
    oscRoot.type = "sine";
    oscRoot.frequency.setValueAtTime(noteFreq, t);

    // VOICE 2: Soft harmonic over-tone (Sine wave representing Alpha creativity/sparkle)
    const oscShimmer = this.ctx.createOscillator();
    oscShimmer.type = "sine";
    oscShimmer.frequency.setValueAtTime(noteFreq * 2.0, t); // Octave

    // Create a beautiful stereo space sweep based on pitch
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const panVal = Math.sin(noteFreq * 0.05) * 0.7; // Stereo movement based on frequency
    if (panner) {
      panner.pan.setValueAtTime(panVal, t);
    }

    // Custom synthesizer envelope (VCA gain managers)
    const gainRoot = this.ctx.createGain();
    const gainShimmer = this.ctx.createGain();

    // Fast, responsive attack, extremely short percussive decay for clean mechanical typing clicks.
    // This avoids overlapping long-tail notes from creating an unwanted continuous background drone.
    gainRoot.gain.setValueAtTime(0.0, t);
    gainRoot.gain.linearRampToValueAtTime(0.2 * (alpha + 0.1), t + 0.004); // Instant peak
    gainRoot.gain.exponentialRampToValueAtTime(1e-4, t + 0.14 + (alpha * 0.06)); // Extremely brief decay tail

    gainShimmer.gain.setValueAtTime(0.0, t);
    gainShimmer.gain.linearRampToValueAtTime(0.08 * alpha, t + 0.003); // Fast shimmer strike
    gainShimmer.gain.exponentialRampToValueAtTime(1e-4, t + 0.08); // Quick cutoff

    // Wire up connections
    if (panner) {
      oscRoot.connect(panner);
      oscShimmer.connect(panner);
      
      panner.connect(gainRoot);
      panner.connect(gainShimmer);
    } else {
      oscRoot.connect(gainRoot);
      oscShimmer.connect(gainShimmer);
    }

    gainRoot.connect(this.filter);
    gainShimmer.connect(this.filter);

    // Turn up master gain safely
    this.primaryGain.gain.cancelScheduledValues(t);
    this.primaryGain.gain.setValueAtTime(1.0, t);
    this.primaryGain.gain.exponentialRampToValueAtTime(0.02, t + 0.25);

    // Start oscillators and clean up on completion quickly
    oscRoot.start(t);
    oscRoot.stop(t + 0.25);

    oscShimmer.start(t);
    oscShimmer.stop(t + 0.12);
  }

  /**
   * Trigger a breathtaking, cinematic glass chime harp chord when analysis completes.
   */
  public triggerAnalysisArrival(frequency: number) {
    this.init();
    if (!this.ctx || !this.filter || !this.primaryGain) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;
    const base = getClosestCelestial(frequency);

    // Spelling a gorgeous, modern Major Lydian chord cascade
    this.filter.frequency.cancelScheduledValues(t);
    this.filter.frequency.setTargetAtTime(1200, t, 0.5);
    this.filter.Q.cancelScheduledValues(t);
    this.filter.Q.setTargetAtTime(2.0, t, 0.5);
    
    this.primaryGain.gain.cancelScheduledValues(t);
    this.primaryGain.gain.setValueAtTime(1.1, t);
    this.primaryGain.gain.linearRampToValueAtTime(0.1, t + 3.0);
    // Root, Fifth, Octave, High 9th, High Maj7th
    const chordRatios = [0.5, 0.75, 1.0, 1.25, 1.5];
    
    chordRatios.forEach((ratio, index) => {
      // Stagger each note's strike by 45 milliseconds for a celestial harp brush effect!
      const strikeTime = t + (index * 0.045);
      const noteFreq = getClosestCelestial(base * ratio);

      const osc = this.ctx!.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(noteFreq, strikeTime);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0, strikeTime);
      gain.gain.linearRampToValueAtTime(0.09 * (5 - index) / 5, strikeTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(1e-4, strikeTime + 2.2);

      const panner = this.ctx!.createStereoPanner ? this.ctx!.createStereoPanner() : null;
      if (panner) {
        // Pan notes across the stereo field from left-to-right
        const panValue = -0.6 + (index * 0.3);
        panner.pan.setValueAtTime(panValue, strikeTime);
        osc.connect(panner);
        panner.connect(gain);
      } else {
        osc.connect(gain);
      }

      gain.connect(this.filter!);
      
      osc.start(strikeTime);
      osc.stop(strikeTime + 2.4);
    });
  }

  /**
   * Resilient, beautiful continuous ambient engine for the result view.
   */
  public updateAmbientEngine(alpha: number, beta: number, complexity: number, isMuted: boolean) {
    if (isMuted) {
      this.stopAmbientEngine();
      return;
    }
    this.init();
    if (!this.ctx || !this.ambientGain || !this.ambientFilter) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const t = this.ctx.currentTime;

    if (!this.isAmbientStarted) {
      this.isAmbientStarted = true;
      
      this.ambientGain.gain.cancelScheduledValues(t);
      this.ambientGain.gain.setValueAtTime(0, t);
      this.ambientGain.gain.linearRampToValueAtTime(0.25, t + 2.0);

      // Create harmonic ambient pad oscillators (A Major 7th chord)
      const freqs = [220.00, 277.18, 329.63, 415.30]; // A3, C#4, E4, G#4
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t);

        const pan = this.ctx!.createStereoPanner ? this.ctx!.createStereoPanner() : null;
        if (pan) {
          pan.pan.setValueAtTime(idx % 2 === 0 ? -0.4 : 0.4, t);
          osc.connect(pan);
          pan.connect(this.ambientFilter!);
        } else {
          osc.connect(this.ambientFilter!);
        }
        
        osc.start(t);
        this.ambientOscs.push(osc);
      });

      // LFO for filter modulation
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = "sine";
      this.lfo.frequency.setValueAtTime(0.1, t); // Very slow sweep
      
      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(200, t);
      
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.ambientFilter.frequency);
      this.lfo.start(t);
    }

    // Dynamic modulation based on alpha/beta
    const baseFreq = 400 + (alpha * 600);
    this.ambientFilter.frequency.cancelScheduledValues(t);
    this.ambientFilter.frequency.setTargetAtTime(baseFreq, t, 1.0);
    this.ambientFilter.Q.cancelScheduledValues(t);
    this.ambientFilter.Q.setTargetAtTime(1.0 + (beta * 5.0), t, 1.0);

    if (this.lfoGain && this.lfo) {
      this.lfoGain.gain.setTargetAtTime(50 + (complexity * 300), t, 1.0);
      this.lfo.frequency.setTargetAtTime(0.05 + (alpha * 0.2), t, 1.0);
    }
  }

  public stopAmbientEngine() {
    if (!this.isAmbientStarted || !this.ctx || !this.ambientGain) return;
    
    const t = this.ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(t);
    this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, t);
    this.ambientGain.gain.linearRampToValueAtTime(0, t + 1.0);
    
    setTimeout(() => {
      this.ambientOscs.forEach(osc => osc.stop());
      this.ambientOscs = [];
      if (this.lfo) this.lfo.stop();
      this.lfo = null;
      this.isAmbientStarted = false;
    }, 1500);
  }
}

export const synapticSynth = new SynapticSynth();
