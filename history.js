/**
 * GestureHistory - Manages gesture history log
 * Features: Last 10 entries, export to JSON, clear functionality
 */

class GestureHistory {
  constructor() {
    this.history = [];
    this.maxEntries = 10;
    this.storageKey = 'gestureflow_history';
    this.loadFromStorage();
  }

  /**
   * Add a new gesture entry to history
   */
  addEntry(gesture, hand = 'Both') {
    const entry = {
      id: Date.now(),
      gesture: gesture,
      hand: hand,
      timestamp: new Date().toLocaleTimeString()
    };

    // Add to beginning of array (newest first)
    this.history.unshift(entry);

    // Keep only the last maxEntries
    if (this.history.length > this.maxEntries) {
      this.history.pop();
    }

    // Update display and save to storage
    this.updateDisplay();
    this.saveToStorage();
  }

  /**
   * Update the history display in the UI
   */
  updateDisplay() {
    const container = document.getElementById('history-list');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Add each history item
    this.history.forEach((entry, index) => {
      const item = document.createElement('div');
      item.className = 'history-item';
      item.style.animationDelay = `${index * 0.05}s`; // Stagger animation

      // Determine hand class
      let handClass = 'both';
      if (entry.hand === 'Right') handClass = 'right';
      else if (entry.hand === 'Left') handClass = 'left';

      item.innerHTML = `
        <span class="gesture">${entry.gesture}</span>
        <span class="hand ${handClass}">${entry.hand}</span>
        <span class="time">${entry.timestamp}</span>
      `;

      container.appendChild(item);
    });
  }

  /**
   * Clear all history entries
   */
  clear() {
    this.history = [];
    this.updateDisplay();
    this.saveToStorage();
  }

  /**
   * Export history to JSON file
   */
  export() {
    if (this.history.length === 0) {
      alert('No history to export!');
      return;
    }

    const data = JSON.stringify(this.history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `gestureflow_history_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Save history to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save history to storage:', error);
    }
  }

  /**
   * Load history from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        this.history = JSON.parse(data);
        // Limit to maxEntries on load
        if (this.history.length > this.maxEntries) {
          this.history = this.history.slice(0, this.maxEntries);
        }
      }
    } catch (error) {
      console.warn('Failed to load history from storage:', error);
      this.history = [];
    }
  }

  /**
   * Get all history entries
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Get the most recent gesture
   */
  getLatestGesture() {
    return this.history.length > 0 ? this.history[0] : null;
  }
}

// Export for use in other modules
window.GestureHistory = GestureHistory;
