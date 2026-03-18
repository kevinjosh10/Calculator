/**
 * FullScreenManager - Handles fullscreen mode functionality
 * Features: Toggle fullscreen, keyboard shortcuts, responsive adjustments
 */

class FullScreenManager {
  constructor() {
    this.isFullscreen = false;
    this.element = document.documentElement;
    this.fullscreenButton = document.getElementById('fullscreen-btn');
  }

  /**
   * Toggle fullscreen mode
   */
  toggle() {
    if (this.isFullscreen) {
      this.exit();
    } else {
      this.enter();
    }
  }

  /**
   * Enter fullscreen mode
   */
  async enter() {
    try {
      if (this.element.requestFullscreen) {
        await this.element.requestFullscreen();
      } else if (this.element.webkitRequestFullscreen) {
        await this.element.webkitRequestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        await this.element.mozRequestFullScreen();
      } else if (this.element.msRequestFullscreen) {
        await this.element.msRequestFullscreen();
      }

      this.isFullscreen = true;
      this.updateButton();
      
      // Request pointer lock for better experience
      if (this.element.requestPointerLock) {
        this.element.requestPointerLock();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }

  /**
   * Exit fullscreen mode
   */
  async exit() {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }

      this.isFullscreen = false;
      this.updateButton();
      
      // Exit pointer lock
      if (document.exitPointerLock) {
        document.exitPointerLock();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }

  /**
   * Update fullscreen button text
   */
  updateButton() {
    if (this.fullscreenButton) {
      this.fullscreenButton.textContent = this.isFullscreen ? '⛶ Exit Full' : '⛶ Full Screen';
    }
  }

  /**
   * Handle fullscreen change events
   */
  handleChange() {
    // Check if we're actually in fullscreen
    const fullscreenElement = document.fullscreenElement || 
                              document.webkitFullscreenElement || 
                              document.mozFullScreenElement || 
                              document.msFullscreenElement;

    this.isFullscreen = !!fullscreenElement;
    this.updateButton();
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyPress(event) {
    // F key for fullscreen (without Ctrl)
    if (event.key === 'f' && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      this.toggle();
    }
    
    // Escape to exit fullscreen
    if (event.key === 'Escape' && this.isFullscreen) {
      this.exit();
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Fullscreen button click
    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('click', () => {
        this.toggle();
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleKeyPress(e);
    });

    // Fullscreen change events
    document.addEventListener('fullscreenchange', () => this.handleChange());
    document.addEventListener('webkitfullscreenchange', () => this.handleChange());
    document.addEventListener('mozfullscreenchange', () => this.handleChange());
    document.addEventListener('MSFullscreenChange', () => this.handleChange());
  }

  /**
   * Check if currently in fullscreen
   */
  isFullscreenMode() {
    return this.isFullscreen;
  }
}

// Export for use in other modules
window.FullScreenManager = FullScreenManager;
