/**
 * GestureRecognizer - Two-hand gesture detection using MediaPipe Hands
 * Features: Two-hand detection (0-10 fingers), cyan/magenta color coding, real-time tracking
 */

class GestureRecognizer {
  constructor() {
    this.hands = null;
    this.gestureHistory = [];
    this.currentGesture = 0;
    this.confidence = 0;
    this.canvas = null;
    this.ctx = null;
    this.lastGestureTime = 0;
    this.gestureDebounce = 100; // ms between gesture changes
  }

  /**
   * Initialize MediaPipe Hands
   */
  async initialize() {
    try {
      // Load MediaPipe Hands from CDN
      console.log('Loading MediaPipe Hands...');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load MediaPipe Hands'));
      });
      console.log('MediaPipe Hands loaded');

      // Load drawing utils
      console.log('Loading MediaPipe drawing utils...');
      const drawScript = document.createElement('script');
      drawScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1620248257/drawing_utils.min.js';
      document.head.appendChild(drawScript);
      await new Promise((resolve, reject) => {
        drawScript.onload = resolve;
        drawScript.onerror = () => reject(new Error('Failed to load drawing utils'));
      });
      console.log('MediaPipe drawing utils loaded');

      // Initialize MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      // Configure for two-hand detection
      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      });

      // Set up results callback
      this.hands.onResults(this.onResults.bind(this));

      console.log('Gesture recognizer initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize gesture recognizer:', error);
      return false;
    }
  }

  /**
   * Process video frame and detect gestures
   */
  processFrame(videoElement) {
    if (this.hands && videoElement && videoElement.readyState >= 2) {
      this.hands.send({ image: videoElement });
    } else if (!this.hands) {
      console.log('Hands not initialized yet');
    }
  }

  /**
   * Handle detection results from MediaPipe
   */
  onResults(results) {
    // Clear canvas (only if canvas exists)
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    let totalFingers = 0;
    let handCount = 0;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      handCount = results.multiHandLandmarks.length;

      results.multiHandLandmarks.forEach((landmarks, index) => {
        // Get handedness (Right/Left)
        const handedness = results.multiHandedness[index].label;

        // Count fingers for this hand
        const fingerCount = this.countFingers(landmarks, index);
        totalFingers += fingerCount;

        // Draw hand landmarks with color coding
        this.drawHandLandmarks(landmarks, handedness);
      });
    }

    // Update confidence based on hand detection
    this.confidence = handCount > 0 ? Math.min(100, 50 + (handCount * 25)) : 0;

    // Update display with debouncing
    const now = Date.now();
    if (now - this.lastGestureTime > this.gestureDebounce && totalFingers !== this.currentGesture) {
      this.currentGesture = totalFingers;
      this.lastGestureTime = now;

      // Trigger gesture changed event
      window.dispatchEvent(new CustomEvent('gestureChanged', {
        detail: { gesture: totalFingers, confidence: this.confidence }
      }));
    }

    // Update confidence display
    this.updateConfidenceDisplay();
  }

  /**
   * Count extended fingers on a hand
   */
  countFingers(landmarks, handIndex) {
    let count = 0;

    // Thumb detection (orientation-dependent)
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const thumbMCP = landmarks[2];

    // For right hand (index 0): thumb extended if tip.x < IP.x
    // For left hand (index 1): thumb extended if tip.x > IP.x
    if (handIndex === 0) {
      // Right hand
      if (thumbTip.x < thumbIP.x) count++;
    } else {
      // Left hand
      if (thumbTip.x > thumbIP.x) count++;
    }

    // Other fingers (index, middle, ring, pinky)
    // A finger is extended if tip.y < pip.y (tip is above the middle joint)
    const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky tips
    const fingerPIPs = [6, 10, 14, 18]; // PIP joints

    for (let i = 0; i < fingerTips.length; i++) {
      const tip = landmarks[fingerTips[i]];
      const pip = landmarks[fingerPIPs[i]];

      // Check if finger tip is above the PIP joint
      if (tip.y < pip.y) {
        count++;
      }
    }

    return count;
  }

  /**
   * Draw hand landmarks with color coding
   * Cyan for right hand, Magenta for left hand
   */
  drawHandLandmarks(landmarks, handedness) {
    if (!this.ctx || !this.canvas) return;
    
    const color = handedness === 'Right' ? '#00FFFF' : '#FF33CC';

    // Draw connections (landmark pairs)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    // Draw lines
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = color;

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      this.ctx.beginPath();
      this.ctx.moveTo(startPoint.x * this.canvas.width, startPoint.y * this.canvas.height);
      this.ctx.lineTo(endPoint.x * this.canvas.width, endPoint.y * this.canvas.height);
      this.ctx.stroke();
    });

    // Draw landmarks (points)
    landmarks.forEach((landmark, index) => {
      const x = landmark.x * this.canvas.width;
      const y = landmark.y * this.canvas.height;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 5, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    });

    this.ctx.shadowBlur = 0;
  }

  /**
   * Update confidence display
   */
  updateConfidenceDisplay() {
    const fill = document.getElementById('confidence-fill');
    const text = document.getElementById('confidence-text');

    if (fill && text) {
      fill.style.width = this.confidence + '%';
      text.textContent = Math.round(this.confidence) + '%';
    }
  }

  /**
   * Get current gesture count
   */
  getCurrentGesture() {
    return this.currentGesture;
  }

  /**
   * Get current confidence level
   */
  getConfidence() {
    return this.confidence;
  }

  /**
   * Setup canvas dimensions based on video size
   */
  setupCanvas(videoWidth, videoHeight) {
    if (!this.canvas) {
      this.canvas = document.getElementById('hand-overlay');
      console.log('Hand overlay canvas:', this.canvas ? 'found' : 'NOT FOUND');
    }
    if (!this.ctx && this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      console.log('Canvas context created');
    }
    if (this.canvas) {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
      console.log(`Canvas size set to ${videoWidth}x${videoHeight}`);
    }
  }
}

// Export for use in other modules
window.GestureRecognizer = GestureRecognizer;
