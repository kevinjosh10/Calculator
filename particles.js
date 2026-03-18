/**
 * ParticleSystem - Dynamic particle background that reacts to gestures
 * Features: 150 particles, dynamic reactivity based on gesture count, cyan/magenta colors
 */

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.handPosition = { x: 0.5, y: 0.5 };
    this.gestureIntensity = 0;
    this.lastGestureCount = 0;
  }

  /**
   * Initialize particle system
   */
  init() {
    // Set canvas size to window size
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Create 150 particles for dynamic effect
    for (let i = 0; i < 150; i++) {
      this.particles.push(this.createParticle());
    }

    console.log('Particle system initialized with', this.particles.length, 'particles');
  }

  /**
   * Create a new particle
   */
  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: Math.random() * 3 + 1,
      baseRadius: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? '#00FFFF' : '#FF33CC',
      opacity: Math.random() * 0.5 + 0.3
    };
  }

  /**
   * Update particle positions based on hand position and gesture intensity
   */
  update(handX, handY, gestureCount) {
    // Update hand position and gesture intensity
    this.handPosition = { x: handX, y: handY };
    this.gestureIntensity = gestureCount / 10; // 0-1 range
    
    // Detect gesture changes for extra visual feedback
    const gestureChanged = gestureCount !== this.lastGestureCount;
    this.lastGestureCount = gestureCount;

    this.particles.forEach(p => {
      // Calculate distance to hand position
      const handXpx = handX * this.canvas.width;
      const handYpx = handY * this.canvas.height;
      const dx = handXpx - p.x;
      const dy = handYpx - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Dynamic behavior based on gesture intensity
      // Stronger attraction when more fingers are shown
      const attractionForce = this.gestureIntensity * 0.8;
      const maxDistance = 300;

      if (distance < maxDistance) {
        // Calculate attraction force (inverse square law)
        const force = (1 - distance / maxDistance) * attractionForce;
        
        // Apply force in direction of hand
        p.vx += (dx / distance) * force;
        p.vy += (dy / distance) * force;
      }

      // Add random movement for organic feel
      p.vx += (Math.random() - 0.5) * 0.2;
      p.vy += (Math.random() - 0.5) * 0.2;

      // Apply velocity with damping
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;

      // Update particle size based on gesture intensity
      p.radius = p.baseRadius + (this.gestureIntensity * 8);

      // Wrap around edges
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      // Extra burst on gesture change
      if (gestureChanged && Math.random() > 0.7) {
        p.vx += (Math.random() - 0.5) * 5;
        p.vy += (Math.random() - 0.5) * 5;
      }
    });
  }

  /**
   * Draw particles on canvas
   */
  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#0A0A0F';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw each particle
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      
      // Set color with dynamic opacity
      this.ctx.globalAlpha = p.opacity + (this.gestureIntensity * 0.3);
      this.ctx.fillStyle = p.color;
      
      // Add glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = p.color;
      
      this.ctx.fill();
    });

    // Reset shadow and alpha
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  /**
   * Animation loop
   */
  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  /**
   * Resize canvas to window size
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Set hand position (0-1 range)
   */
  setHandPosition(x, y) {
    this.handPosition = { x, y };
  }

  /**
   * Set gesture intensity (0-1 range)
   */
  setGestureIntensity(intensity) {
    this.gestureIntensity = Math.max(0, Math.min(1, intensity));
  }
}

// Export for use in other modules
window.ParticleSystem = ParticleSystem;
