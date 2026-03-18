/**
 * ConfidenceManager - Manages confidence display and calculation
 * Features: Visual confidence bar, percentage display, color coding
 */

class ConfidenceManager {
  constructor() {
    this.confidenceBar = document.getElementById('confidence-fill');
    this.confidenceText = document.getElementById('confidence-text');
    this.currentConfidence = 0;
  }

  /**
   * Update confidence display with new value
   */
  update(confidence) {
    this.currentConfidence = confidence;
    
    if (this.confidenceBar && this.confidenceText) {
      this.confidenceBar.style.width = confidence + '%';
      this.confidenceText.textContent = Math.round(confidence) + '%';
      
      // Change color based on confidence level
      if (confidence < 30) {
        this.confidenceBar.style.background = 'linear-gradient(90deg, #FF3333, #FF6666)';
      } else if (confidence < 60) {
        this.confidenceBar.style.background = 'linear-gradient(90deg, #FF33CC, #FF6699)';
      } else {
        this.confidenceBar.style.background = 'linear-gradient(90deg, #FF33CC, #FFF700, #00FFFF)';
      }
    }
  }

  /**
   * Get current confidence value
   */
  getConfidence() {
    return this.currentConfidence;
  }

  /**
   * Calculate confidence based on detection quality
   */
  calculateConfidence(handCount, detectionQuality = 1) {
    // Base confidence from number of hands detected
    let confidence = 0;
    
    if (handCount === 1) {
      confidence = 50 + (detectionQuality * 25);
    } else if (handCount === 2) {
      confidence = 75 + (detectionQuality * 25);
    }
    
    return Math.min(100, Math.max(0, confidence));
  }
}

// Export for use in other modules
window.ConfidenceManager = ConfidenceManager;
