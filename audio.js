/**
 * AudioManager - Sound effects for gesture detection
 * Features: Different tones for each number 0-10, toggleable audio
 */

class AudioManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
    this.initialized = false;
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('Audio initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Play sound for a specific number
   */
  playNumberSound(number) {
    if (!this.enabled || !this.audioContext) return;

    // Different frequency for each number (musical notes)
    const frequencies = [
      261.63, // 0 - C4 (Middle C)
      293.66, // 1 - D4
      329.63, // 2 - E4
      349.23, // 3 - F4
      392.00, // 4 - G4
      440.00, // 5 - A4
      493.88, // 6 - B4
      523.25, // 7 - C5
      587.33, // 8 - D5
      659.25, // 9 - E5
      698.46  // 10 - F5
    ];

    const frequency = frequencies[number] || 440;
    const duration = 0.15;

    // Create oscillator for tone
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Set oscillator properties
    oscillator.type = 'sine'; // Smooth, pleasant tone
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Set envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    // Play and stop
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Play a short beep for button clicks or feedback
   */
  playBeep(frequency = 800, duration = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  /**
   * Toggle audio on/off
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Check if audio is enabled
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Set audio enabled state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Export for use in other modules
window.AudioManager = AudioManager;
