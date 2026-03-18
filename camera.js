/**
 * CameraManager - Handles webcam access and permissions
 * Features: Permission management, camera switching, error handling
 */

class CameraManager {
  constructor() {
    this.video = document.getElementById('webcam');
    this.stream = null;
    this.currentFacingMode = 'user'; // 'user' = front camera, 'environment' = back camera
    this.permissionsGranted = false;
  }

  /**
   * Initialize camera with user permission
   * @returns {Promise<boolean>} - Success status
   */
  async initialize() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: this.currentFacingMode
        },
        audio: false
      });

      this.video.srcObject = this.stream;
      await this.video.play();
      this.permissionsGranted = true;
      
      // Add loading complete class
      this.video.parentElement.classList.remove('loading');
      
      return true;
    } catch (error) {
      this.handleCameraError(error);
      return false;
    }
  }

  /**
   * Switch between front and back camera
   */
  async switchCamera() {
    this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
    
    // Stop current stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // Reinitialize with new facing mode
    return await this.initialize();
  }

  /**
   * Handle camera errors with user-friendly messages
   */
  handleCameraError(error) {
    const messages = {
      'NotAllowedError': 'Camera permission denied. Please allow camera access in your browser settings.',
      'NotFoundError': 'No camera found on this device.',
      'OverconstrainedError': 'Camera does not meet requirements. Try a different camera.',
      'NotReadableError': 'Camera is already in use by another application.',
      'NotAllowedError': 'Camera access denied. Please allow camera access.'
    };

    const message = messages[error.name] || `Camera error: ${error.message}`;
    
    // Show error in UI
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      // Hide after 5 seconds
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 5000);
    }

    console.error('Camera error:', error);
  }

  /**
   * Stop camera stream
   */
  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Get current video element
   */
  getVideoElement() {
    return this.video;
  }

  /**
   * Check if camera permissions are granted
   */
  hasPermissions() {
    return this.permissionsGranted;
  }
}

// Export for use in other modules
window.CameraManager = CameraManager;
