/**
 * GestureFlow - Main Application Controller
 * Integrates all modules for hand gesture recognition
 * Features: Two-hand detection (0-10), sound effects, history, fullscreen, particles
 */

class GestureFlowApp {
  constructor() {
    // Initialize all modules
    this.camera = new CameraManager();
    this.gesture = new GestureRecognizer();
    this.audio = new AudioManager();
    this.history = new GestureHistory();
    this.fullscreen = new FullScreenManager();
    this.confidence = new ConfidenceManager();
    this.particles = null;
    
    // State
    this.isRunning = false;
    this.lastGesture = -1;
    this.gestureDebounce = 150;
    this.lastGestureTime = 0;
  }

  /**
   * Initialize the application
   */
  async initialize() {
    console.log('Initializing GestureFlow...');

    // Setup particle system first (background)
    const particleCanvas = document.getElementById('particle-canvas');
    console.log('Particle canvas:', particleCanvas ? 'found' : 'NOT FOUND');
    if (particleCanvas) {
      this.particles = new ParticleSystem(particleCanvas);
      this.particles.init();
      this.particles.animate();
    }

    // Initialize camera
    console.log('Initializing camera...');
    const cameraReady = await this.camera.initialize();
    console.log('Camera ready:', cameraReady);
    if (!cameraReady) {
      this.showError('Camera initialization failed. Please check permissions.');
      return false;
    }

    // Setup gesture canvas dimensions
    const video = this.camera.getVideoElement();
    if (video && this.gesture) {
      video.onloadedmetadata = () => {
        this.gesture.setupCanvas(video.videoWidth, video.videoHeight);
      };
    }

    // Initialize gesture recognizer
    console.log('Initializing gesture recognition...');
    const gestureReady = await this.gesture.initialize();
    console.log('Gesture ready:', gestureReady);
    if (!gestureReady) {
      this.showError('Gesture recognition initialization failed.');
      return false;
    }

    // Setup event listeners
    this.setupEventListeners();

    // Start the main loop
    this.isRunning = true;
    this.mainLoop();

    console.log('GestureFlow initialized successfully');
    console.log('Main loop started, waiting for camera feed...');
    return true;
  }

  /**
   * Main application loop
   */
  mainLoop() {
    if (!this.isRunning) return;

    const video = this.camera.getVideoElement();

    if (video && video.readyState >= 1) {
      // Process frame for gesture detection
      this.gesture.processFrame(video);
      
      // Log once when video is ready
      if (!this.videoReadyLogged) {
        console.log('Video feed ready, processing frames...');
        console.log('Video readyState:', video.readyState);
        this.videoReadyLogged = true;
      }

      // Get current gesture
      const currentGesture = this.gesture.getCurrentGesture();
      const confidence = this.gesture.getConfidence();

      // Update confidence display
      this.confidence.update(confidence);

      // Update particles (react to hand position - simplified)
      if (this.particles) {
        // Use center of screen as hand position for particle system
        // In a full implementation, you'd track actual hand position
        this.particles.update(0.5, 0.5, currentGesture);
      }

      // Handle gesture changes with debouncing
      const now = Date.now();
      if (currentGesture !== this.lastGesture && now - this.lastGestureTime > this.gestureDebounce) {
        this.handleGestureChange(currentGesture, confidence);
        this.lastGesture = currentGesture;
        this.lastGestureTime = now;
      }
    }

    requestAnimationFrame(() => this.mainLoop());
  }

  /**
   * Handle gesture changes
   */
  handleGestureChange(gesture, confidence) {
    // Update number display
    const numberDisplay = document.getElementById('number-display');
    if (numberDisplay) {
      numberDisplay.textContent = gesture;
      numberDisplay.classList.add('detecting');
      setTimeout(() => numberDisplay.classList.remove('detecting'), 300);
    }

    // Play sound effect
    this.audio.playNumberSound(gesture);

    // Add to history (only if confidence is reasonable)
    if (confidence > 30) {
      const hand = gesture > 5 ? 'Both' : 'Right';
      this.history.addEntry(gesture, hand);
    }
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Fullscreen setup
    this.fullscreen.setupEventListeners();

    // Sound toggle
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const enabled = this.audio.toggle();
        soundToggle.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      });
    }

    // Camera switch
    const switchCamera = document.getElementById('switch-camera');
    if (switchCamera) {
      switchCamera.addEventListener('click', () => {
        this.camera.switchCamera();
      });
    }

    // History controls
    const clearHistory = document.getElementById('clear-history');
    if (clearHistory) {
      clearHistory.addEventListener('click', () => {
        this.history.clear();
        this.audio.playBeep(600, 0.1);
      });
    }

    const exportHistory = document.getElementById('export-history');
    if (exportHistory) {
      exportHistory.addEventListener('click', () => {
        this.history.export();
        this.audio.playBeep(800, 0.1);
      });
    }

    // Initialize audio on first user interaction (browser requirement)
    document.addEventListener('click', () => {
      this.audio.initialize();
    }, { once: true });

    // Update history display on load
    this.history.updateDisplay();
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }
    console.error('GestureFlow Error:', message);
  }

  /**
   * Cleanup and stop the application
   */
  stop() {
    this.isRunning = false;
    this.camera.stopCamera();
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new GestureFlowApp();
  
  // Store app globally for debugging
  window.gestureFlowApp = app;
  
  // Initialize
  app.initialize().then(success => {
    if (success) {
      console.log('GestureFlow ready!');
    } else {
      console.error('GestureFlow failed to initialize');
    }
  });
});
