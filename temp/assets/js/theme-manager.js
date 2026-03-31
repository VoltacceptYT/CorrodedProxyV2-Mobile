// Theme Manager - Handles theme switching across all pages
class ThemeManager {
  constructor() {
    this.themes = {
      'Earth': '/assets/css/themes/Earth.css?v=00',
      'Virellus': '/assets/css/themes/Virellus.css?v=00',
      'Neptune': '/assets/css/themes/Neptune.css?v=00',
      'Mars': '/assets/css/themes/Mars.css?v=00',
      'Solar': '/assets/css/themes/Solar.css?v=00'
    };
    
    this.init();
  }
  
  init() {
    // Load current theme on page load
    this.loadTheme();
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        this.loadTheme();
      }
    });
    
    // Listen for custom theme change events
    window.addEventListener('themeChange', (e) => {
      this.switchTheme(e.detail.theme);
    });
  }
  
  loadTheme() {
    const currentTheme = localStorage.getItem('theme') || 'Earth';
    this.applyTheme(currentTheme);
  }
  
  switchTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme "${themeName}" not found`);
      return;
    }
    
    // Update localStorage
    localStorage.setItem('theme', themeName);
    
    // Apply theme
    this.applyTheme(themeName);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName }
    }));
    
    // Update particle system if available
    if (typeof updateVisualizerTheme === 'function') {
      updateVisualizerTheme();
    }
  }
  
  applyTheme(themeName) {
    // Remove existing theme stylesheets
    const existingThemeLinks = document.querySelectorAll('link[rel="stylesheet"][href*="themes"]');
    existingThemeLinks.forEach(link => link.remove());
    
    // Remove existing custom theme styles
    const existingCustomStyles = document.querySelectorAll('style[data-theme-custom]');
    existingCustomStyles.forEach(style => style.remove());
    
    if (this.themes[themeName]) {
      // Add new theme stylesheet
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = this.themes[themeName];
      themeLink.id = 'theme-css';
      document.head.appendChild(themeLink);
    } else {
      // Handle custom theme
      const customThemeEle = document.createElement('style');
      customThemeEle.setAttribute('data-theme-custom', 'true');
      customThemeEle.textContent = localStorage.getItem(`theme-${themeName}`);
      document.head.appendChild(customThemeEle);
    }
    
    // Update nav logo if function exists
    if (typeof updateNavLogo === 'function') {
      updateNavLogo(themeName);
    }
  }
  
  getCurrentTheme() {
    return localStorage.getItem('theme') || 'Earth';
  }
  
  // Global function that can be called from anywhere
  static changeTheme(themeName) {
    if (!window.themeManager) {
      window.themeManager = new ThemeManager();
    }
    window.themeManager.switchTheme(themeName);
  }
}

// Initialize theme manager
window.themeManager = new ThemeManager();

// Global function for backward compatibility
window.switchTheme = (themeName) => {
  window.themeManager.switchTheme(themeName);
};

// Auto-load theme on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.themeManager.loadTheme();
  });
} else {
  window.themeManager.loadTheme();
}
