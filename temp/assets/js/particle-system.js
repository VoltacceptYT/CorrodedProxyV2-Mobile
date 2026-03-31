// 3D Particle System with Grouping Behavior
class ParticleSystem3D {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
    this.particleCount = 150;
    this.isSpawning = false;
    this.isPopping = false;
    this.spawnIndex = 0;
    this.popIndex = 0;
    
    this.init();
  }

  init() {
    this.createCanvas();
    this.createParticles();
    this.hideExistingParticles();
    this.setupThemeListener();
    this.startSpawning();
  }

  setupThemeListener() {
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      this.updateParticleColors();
    });
    
    // Observe changes to theme stylesheets
    observer.observe(document.head, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
    
    // Also listen for localStorage changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        this.updateParticleColors();
      }
    });
  }

  updateParticleColors() {
    // Update all particle colors when theme changes
    this.particles.forEach(particle => {
      particle.color = this.getRandomColor();
    });
  }

  hideExistingParticles() {
    // Hide existing particles-js canvas
    const existingParticles = document.querySelector('.particles-js-canvas-el');
    if (existingParticles) {
      existingParticles.style.display = 'none';
    }
    
    // Set body attribute for CSS targeting
    document.body.setAttribute('data-audio-visualizer', 'true');
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'audio-visualizer-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.opacity = '0';
    this.canvas.style.transition = 'opacity 0.5s ease-in-out';
    
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    
    window.addEventListener('resize', () => this.resizeCanvas());
    document.body.appendChild(this.canvas);
    
    // Fade in after a short delay
    setTimeout(() => {
      this.canvas.style.opacity = '0.8';
    }, 100);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 2, // Random horizontal velocity
        vy: (Math.random() - 0.5) * 2, // Random vertical velocity
        radius: Math.random() * 3 + 2,
        color: this.getRandomColor(),
        opacity: 0, // Start invisible for spawn animation
        targetOpacity: 0.8,
        scale: 0, // Start small for spawn animation
        targetScale: 1,
        isPopping: false
      });
    }
  }

  getRandomColor() {
    const currentTheme = localStorage.getItem('theme') || 'Earth';
    
    // Theme colors based on CSS variables from the new theme system
    const themeColors = {
      'Earth': [
        'rgba(58, 228, 116, 0.8)',   // --particle-color: #3ae474
        'rgba(50, 209, 104, 0.8)',   // Slightly darker variant
        'rgba(76, 234, 132, 0.8)',   // Lighter variant
        'rgba(42, 188, 92, 0.8)',    // Darker variant
        'rgba(86, 238, 140, 0.8)'    // Light variant
      ],
      'Mars': [
        'rgba(246, 10, 17, 0.8)',    // --particle-color: #F60A11
        'rgba(214, 9, 15, 0.8)',     // Darker variant
        'rgba(255, 50, 56, 0.8)',    // Lighter variant
        'rgba(196, 8, 13, 0.8)',     // Much darker variant
        'rgba(255, 100, 105, 0.8)'   // Much lighter variant
      ],
      'Neptune': [
        'rgba(1, 157, 234, 0.8)',    // --particle-color: #019DEA
        'rgba(0, 133, 214, 0.8)',     // Darker variant
        'rgba(51, 167, 238, 0.8)',    // Lighter variant
        'rgba(0, 117, 189, 0.8)',     // Much darker variant
        'rgba(102, 177, 242, 0.8)'   // Much lighter variant
      ],
      'Virellus': [
        'rgba(111, 95, 253, 0.8)',   // --particle-color: #6F5FFD
        'rgba(90, 78, 232, 0.8)',     // Darker variant
        'rgba(131, 115, 255, 0.8)',   // Lighter variant
        'rgba(70, 60, 203, 0.8)',     // Much darker variant
        'rgba(152, 135, 255, 0.8)'    // Much lighter variant
      ],
      'Solar': [
        'rgba(255, 156, 0, 0.8)',     // --particle-color: #FF9C00
        'rgba(230, 140, 0, 0.8)',     // Darker variant
        'rgba(255, 171, 51, 0.8)',    // Lighter variant
        'rgba(204, 125, 0, 0.8)',     // Much darker variant
        'rgba(255, 191, 102, 0.8)'    // Much lighter variant
      ]
    };
    
    // Get colors for current theme or fallback to Earth
    const colors = themeColors[currentTheme] || themeColors['Earth'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  updateParticles() {
    this.particles.forEach(particle => {
      // Add random movement
      particle.vx += (Math.random() - 0.5) * 0.2;
      particle.vy += (Math.random() - 0.5) * 0.2;
      
      // Apply velocity damping
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Bounce off walls
      if (particle.x < particle.radius || particle.x > this.canvas.width - particle.radius) {
        particle.vx *= -0.8;
        particle.x = Math.max(particle.radius, Math.min(this.canvas.width - particle.radius, particle.x));
      }
      
      if (particle.y < particle.radius || particle.y > this.canvas.height - particle.radius) {
        particle.vy *= -0.8;
        particle.y = Math.max(particle.radius, Math.min(this.canvas.height - particle.radius, particle.y));
      }
    });
  }

  draw() {
    // Clear canvas completely (no background)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw particles
    this.particles.forEach(particle => {
      this.ctx.save();
      
      // Apply scale and opacity for animations
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.translate(particle.x, particle.y);
      this.ctx.scale(particle.scale, particle.scale);
      
      this.ctx.beginPath();
      this.ctx.arc(0, 0, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
      
      // Add glow effect for larger particles
      if (particle.radius > 3) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.restore();
    });
    
    // Draw connections between nearby particles (only for visible particles)
    this.drawConnections();
  }

  drawConnections() {
    const connectionDistance = 100;
    const currentTheme = localStorage.getItem('theme') || 'Earth';
    
    // Connection colors based on the new theme system
    const themeConnectionColors = {
      'Earth': 'rgba(58, 228, 116',     // --particle-color: #3ae474
      'Mars': 'rgba(246, 10, 17',      // --particle-color: #F60A11
      'Neptune': 'rgba(1, 157, 234',   // --particle-color: #019DEA
      'Virellus': 'rgba(111, 95, 253', // --particle-color: #6F5FFD
      'Solar': 'rgba(255, 156, 0'      // --particle-color: #FF9C00
    };
    
    const connectionColorBase = themeConnectionColors[currentTheme] || themeConnectionColors['Earth'];
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        
        // Only draw connections for visible particles (not popping or invisible)
        if (p1.opacity > 0 && p2.opacity > 0 && !p1.isPopping && !p2.isPopping) {
          const distance = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
          );
          
          if (distance < connectionDistance) {
            const opacity = Math.min(p1.opacity, p2.opacity) * (1 - distance / connectionDistance) * 0.3;
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `${connectionColorBase}, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }
    }
  }

  animate() {
    if (!this.isActive) return;
    
    // Start spawning particles if this is the beginning
    if (this.isSpawning && this.spawnIndex === 0) {
      this.spawnNextParticle();
    }
    
    this.updateParticles();
    this.draw();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  startSpawning() {
    this.isSpawning = true;
    this.spawnIndex = 0;
    this.isActive = true;
    this.animate();
  }

  spawnNextParticle() {
    if (this.spawnIndex < this.particles.length) {
      const particle = this.particles[this.spawnIndex];
      particle.opacity = particle.targetOpacity;
      particle.scale = particle.targetScale;
      this.spawnIndex++;
      
      // Spawn next particle after a short delay
      setTimeout(() => {
        if (this.isSpawning) {
          this.spawnNextParticle();
        }
      }, 20); // 20ms delay between each particle
    } else {
      this.isSpawning = false;
    }
  }

  start() {
    if (!this.isSpawning && !this.isPopping) {
      this.isActive = true;
      this.animate();
    }
  }

  stop() {
    // Start popping animation instead of immediately stopping
    this.isPopping = true;
    this.popIndex = 0;
    this.popNextParticle();
  }

  popNextParticle() {
    if (this.popIndex < this.particles.length) {
      const particle = this.particles[this.popIndex];
      
      // Despawn the same way as spawn - just fade out and scale down
      particle.opacity = 0;
      particle.scale = 0;
      this.popIndex++;
      
      // Continue with next particle after a short delay (same as spawn)
      setTimeout(() => {
        if (this.isPopping) {
          this.popNextParticle();
        }
      }, 20); // 20ms delay between each particle (same as spawn)
    } else {
      // All particles have despawned, now clean up
      this.isPopping = false;
      this.finishStop();
    }
  }

  finishStop() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Fade out before removing
    if (this.canvas) {
      this.canvas.style.opacity = '0';
      setTimeout(() => {
        if (this.canvas && this.canvas.parentNode) {
          this.canvas.parentNode.removeChild(this.canvas);
        }
      }, 500); // Wait for fade out transition
    }
    
    // Restore existing particles
    const existingParticles = document.querySelector('.particles-js-canvas-el');
    if (existingParticles) {
      existingParticles.style.display = 'block';
    }
    
    // Remove body attribute
    document.body.removeAttribute('data-audio-visualizer');
  }
}

// Global instance
let particleSystemInstance = null;

// Initialize function called from settings
function initAudioVisualizer() {
  if (!particleSystemInstance) {
    particleSystemInstance = new ParticleSystem3D();
  }
}

// Stop function called from settings
function stopAudioVisualizer() {
  if (particleSystemInstance) {
    particleSystemInstance.stop();
    particleSystemInstance = null;
  }
}

// Update visualizer colors when theme changes
function updateVisualizerTheme() {
  if (particleSystemInstance) {
    particleSystemInstance.updateParticleColors();
  }
}

// Auto-start if setting is enabled
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('particle-system') === 'true') {
    setTimeout(() => initAudioVisualizer(), 1000);
  }
});

// Hook into existing theme change function
const originalThemeChange = window.themeChange;
if (typeof originalThemeChange === 'function') {
  window.themeChange = function(themeName) {
    originalThemeChange(themeName);
    updateVisualizerTheme();
  };
}
