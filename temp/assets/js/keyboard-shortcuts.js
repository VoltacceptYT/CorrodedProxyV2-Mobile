/**
 * Chromium-style Keyboard Shortcuts System
 * Windows-only implementation for CorrodedProxyV2
 * Matches Chrome, Edge, Brave, Opera behavior
 */

class KeyboardShortcuts {
  constructor() {
    this.shortcuts = new Map();
    this.closedTabs = []; // Store closed tabs for Ctrl+Shift+T
    this.zoomLevels = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
    this.currentZoomIndex = 8; // Default to 100% (index 8)
    this.isFindMode = false;
    this.findQuery = '';
    this.findResults = [];
    this.currentFindIndex = 0;
    
    this.initializeShortcuts();
    this.bindEvents();
  }

  /**
   * Complete Chromium shortcut map for Windows
   */
  initializeShortcuts() {
    // TAB MANAGEMENT
    this.addShortcut('ctrl+t', () => this.createNewTab());
    this.addShortcut('ctrl+w', () => this.closeCurrentTab());
    this.addShortcut('ctrl+f4', () => this.closeCurrentTab());
    this.addShortcut('ctrl+shift+t', () => this.reopenLastClosedTab());
    this.addShortcut('ctrl+tab', () => this.switchToNextTab());
    this.addShortcut('ctrl+shift+tab', () => this.switchToPreviousTab());
    
    // Number keys 1-8 for tab switching
    for (let i = 1; i <= 8; i++) {
      this.addShortcut(`ctrl+${i}`, () => this.switchToTab(i - 1));
    }
    this.addShortcut('ctrl+9', () => this.switchToLastTab());
    
    this.addShortcut('ctrl+shift+d', () => this.duplicateCurrentTab());
    this.addShortcut('ctrl+shift+pageup', () => this.moveTabLeft());
    this.addShortcut('ctrl+shift+pagedown', () => this.moveTabRight());

    // WINDOW MANAGEMENT
    // this.addShortcut('ctrl+n', () => this.createNewWindow()); // Removed new window feature
    // Alt+F4 is handled by system but we can add custom behavior if needed

    // NAVIGATION
    this.addShortcut('alt+left', () => this.goBack());
    this.addShortcut('alt+right', () => this.goForward());
    this.addShortcut('f5', () => this.reload());
    this.addShortcut('ctrl+f5', () => this.hardReload());
    this.addShortcut('shift+f5', () => this.hardReload());
    this.addShortcut('escape', () => this.stopLoading());

    // PAGE ACTIONS
    this.addShortcut('ctrl+f', () => this.openFindInPage());
    this.addShortcut('ctrl+g', () => this.findNext());
    this.addShortcut('ctrl+shift+g', () => this.findPrevious());
    this.addShortcut('ctrl+plus', () => this.zoomIn());
    this.addShortcut('ctrl+shift+plus', () => this.zoomIn());
    this.addShortcut('ctrl=', () => this.zoomIn());
    this.addShortcut('ctrl+shift+=', () => this.zoomIn());
    this.addShortcut('ctrl+-', () => this.zoomOut());
    this.addShortcut('ctrl+shift+-', () => this.zoomOut());
    this.addShortcut('ctrl+_', () => this.zoomOut());
    this.addShortcut('ctrl+shift+_', () => this.zoomOut());
    this.addShortcut('ctrl+0', () => this.zoomReset());
    this.addShortcut('ctrl+shift+0', () => this.zoomReset());
    // this.addShortcut('f12', () => this.toggleDevTools()); // Removed F12 shortcut
    this.addShortcut('ctrl+l', () => this.focusAddressBar());
    this.addShortcut('alt+d', () => this.focusAddressBar());
    this.addShortcut('f6', () => this.focusAddressBar());

    // MISC
    this.addShortcut('ctrl+j', () => this.openDownloads());
    this.addShortcut('ctrl+h', () => this.openHistory());
    this.addShortcut('f11', () => this.toggleFullscreen());

    console.log('Keyboard shortcuts initialized');
  }

  /**
   * Add a keyboard shortcut
   */
  addShortcut(keyCombo, handler) {
    const normalized = this.normalizeKeyCombo(keyCombo);
    this.shortcuts.set(normalized, handler);
  }

  /**
   * Normalize key combination string to consistent format
   */
  normalizeKeyCombo(combo) {
    return combo.toLowerCase()
      .replace(/\s+/g, '')
      .replace('ctrl', 'ctrl')
      .replace('shift', 'shift')
      .replace('alt', 'alt')
      .replace('meta', 'meta');
  }

  /**
   * Parse keyboard event to normalized string
   */
  parseKeyEvent(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('ctrl');
    if (event.shiftKey) parts.push('shift');
    if (event.altKey) parts.push('alt');
    if (event.metaKey) parts.push('meta');

    let key = event.key.toLowerCase();
    
    // Handle special keys
    const keyMap = {
      ' ': 'space',
      'arrowup': 'arrowup',
      'arrowdown': 'arrowdown',
      'arrowleft': 'arrowleft',
      'arrowright': 'arrowright',
      'escape': 'escape',
      'tab': 'tab',
      'enter': 'enter',
      'backspace': 'backspace',
      'delete': 'delete',
      'home': 'home',
      'end': 'end',
      'pageup': 'pageup',
      'pagedown': 'pagedown',
      'f1': 'f1', 'f2': 'f2', 'f3': 'f3', 'f4': 'f4',
      'f5': 'f5', 'f6': 'f6', 'f7': 'f7', 'f8': 'f8',
      'f9': 'f9', 'f10': 'f10', 'f11': 'f11', 'f12': 'f12'
    };

    if (keyMap[key]) {
      key = keyMap[key];
    } else if (key.length === 1) {
      key = key;
    }

    parts.push(key);
    return parts.join('+');
  }

  /**
   * Bind keyboard event listeners
   */
  bindEvents() {
    document.addEventListener('keydown', (event) => {
      // Don't trigger shortcuts when typing in input fields, textareas, or contentEditable
      if (this.shouldIgnoreEvent(event)) {
        return;
      }

      const keyCombo = this.parseKeyEvent(event);
      const handler = this.shortcuts.get(keyCombo);

      if (handler) {
        event.preventDefault();
        event.stopPropagation();
        
        try {
          handler();
        } catch (error) {
          console.error(`Error executing shortcut ${keyCombo}:`, error);
        }
      }
    });

    // Handle find mode events
    document.addEventListener('keydown', (event) => {
      if (this.isFindMode) {
        this.handleFindMode(event);
      }
    });
  }

  /**
   * Check if keyboard event should be ignored (typing in forms, etc.)
   */
  shouldIgnoreEvent(event) {
    const target = event.target;
    const tagName = target.tagName.toLowerCase();
    const isInput = ['input', 'textarea', 'select'].includes(tagName);
    const isContentEditable = target.isContentEditable || target.contentEditable === 'true';
    
    // Allow shortcuts even in inputs for specific cases
    if (isInput || isContentEditable) {
      const keyCombo = this.parseKeyEvent(event);
      const allowedInInput = [
        'ctrl+t', 'ctrl+w', 'ctrl+shift+t', 'ctrl+tab', 'ctrl+shift+tab',
        'ctrl+n', 'ctrl+1', 'ctrl+2', 'ctrl+3', 'ctrl+4', 'ctrl+5',
        'ctrl+6', 'ctrl+7', 'ctrl+8', 'ctrl+9', 'ctrl+shift+d',
        'ctrl+shift+pageup', 'ctrl+shift+pagedown', 'f11', 'f12'
      ];
      
      return !allowedInInput.includes(keyCombo);
    }
    
    return false;
  }

  // ==================== TAB MANAGEMENT ====================

  createNewTab() {
    const addTabButton = document.getElementById('add-tab');
    if (addTabButton) {
      addTabButton.click();
    }
  }

  closeCurrentTab() {
    const activeTab = document.querySelector('#tab-list li.active');
    if (activeTab) {
      const closeButton = activeTab.querySelector('.close-tab');
      if (closeButton) {
        // Store tab info for potential reopening
        const activeIframe = document.querySelector('#frame-container iframe.active');
        if (activeIframe) {
          this.closedTabs.push({
            url: activeIframe.src || activeIframe.dataset.tabUrl,
            title: activeTab.querySelector('.t').textContent
          });
          // Keep only last 10 closed tabs
          if (this.closedTabs.length > 10) {
            this.closedTabs.shift();
          }
        }
        
        closeButton.click();
      }
    }
  }

  reopenLastClosedTab() {
    if (this.closedTabs.length > 0) {
      const lastTab = this.closedTabs.pop();
      this.createNewTab();
      
      // Wait for tab to be created then navigate
      setTimeout(() => {
        const activeIframe = document.querySelector('#frame-container iframe.active');
        if (activeIframe && lastTab.url) {
          activeIframe.src = lastTab.url;
          activeIframe.dataset.tabUrl = lastTab.url;
        }
      }, 100);
    }
  }

  switchToNextTab() {
    const tabs = Array.from(document.querySelectorAll('#tab-list li'));
    if (tabs.length <= 1) return;
    
    const activeTab = document.querySelector('#tab-list li.active');
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    
    tabs[nextIndex].click();
  }

  switchToPreviousTab() {
    const tabs = Array.from(document.querySelectorAll('#tab-list li'));
    if (tabs.length <= 1) return;
    
    const activeTab = document.querySelector('#tab-list li.active');
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    
    tabs[prevIndex].click();
  }

  switchToTab(index) {
    const tabs = document.querySelectorAll('#tab-list li');
    if (tabs[index]) {
      tabs[index].click();
    }
  }

  switchToLastTab() {
    const tabs = document.querySelectorAll('#tab-list li');
    if (tabs.length > 0) {
      tabs[tabs.length - 1].click();
    }
  }

  duplicateCurrentTab() {
    const activeIframe = document.querySelector('#frame-container iframe.active');
    if (activeIframe) {
      const currentUrl = activeIframe.src || activeIframe.dataset.tabUrl;
      if (currentUrl) {
        this.createNewTab();
        setTimeout(() => {
          const newIframe = document.querySelector('#frame-container iframe.active');
          if (newIframe) {
            newIframe.src = currentUrl;
            newIframe.dataset.tabUrl = currentUrl;
          }
        }, 100);
      }
    }
  }

  moveTabLeft() {
    const activeTab = document.querySelector('#tab-list li.active');
    const tabList = document.getElementById('tab-list');
    
    if (activeTab && activeTab.previousElementSibling) {
      tabList.insertBefore(activeTab, activeTab.previousElementSibling);
    }
  }

  moveTabRight() {
    const activeTab = document.querySelector('#tab-list li.active');
    const tabList = document.getElementById('tab-list');
    
    if (activeTab && activeTab.nextElementSibling) {
      tabList.insertBefore(activeTab.nextElementSibling, activeTab);
    }
  }

  // ==================== WINDOW MANAGEMENT ====================
  // New window feature removed

  // ==================== NAVIGATION ====================

  goBack() {
    const backButton = document.querySelector('.nav-button[onclick="goBack()"]');
    if (backButton) {
      backButton.click();
    } else {
      this.callFunction('goBack');
    }
  }

  goForward() {
    const forwardButton = document.querySelector('.nav-button[onclick="goForward()"]');
    if (forwardButton) {
      forwardButton.click();
    } else {
      this.callFunction('goForward');
    }
  }

  reload() {
    this.callFunction('reload');
  }

  hardReload() {
    const activeIframe = document.querySelector('#frame-container iframe.active');
    if (activeIframe) {
      // Force hard reload by adding timestamp
      const currentSrc = activeIframe.src;
      const separator = currentSrc.includes('?') ? '&' : '?';
      activeIframe.src = currentSrc + separator + '_hardReload=' + Date.now();
    }
  }

  stopLoading() {
    const activeIframe = document.querySelector('#frame-container iframe.active');
    if (activeIframe) {
      activeIframe.src = activeIframe.src; // This stops loading
    }
    
    // Exit find mode if active
    if (this.isFindMode) {
      this.exitFindMode();
    }
  }

  // ==================== PAGE ACTIONS ====================

  openFindInPage() {
    this.isFindMode = true;
    this.findQuery = '';
    this.findResults = [];
    this.currentFindIndex = 0;
    
    // Create find bar if it doesn't exist
    this.createFindBar();
    
    const findInput = document.getElementById('find-input');
    if (findInput) {
      findInput.value = '';
      findInput.focus();
    }
  }

  createFindBar() {
    if (document.getElementById('find-bar')) return;
    
    const findBar = document.createElement('div');
    findBar.id = 'find-bar';
    findBar.className = 'find-bar';
    findBar.innerHTML = `
      <div class="find-container">
        <input type="text" id="find-input" placeholder="Find in page..." autocomplete="off">
        <div class="find-controls">
          <button id="find-prev" title="Previous (Ctrl+Shift+G)">
            <i class="fas fa-chevron-up"></i>
          </button>
          <button id="find-next" title="Next (Ctrl+G)">
            <i class="fas fa-chevron-down"></i>
          </button>
          <button id="find-close" title="Close (Escape)">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="find-results" id="find-results"></div>
      </div>
    `;
    
    document.body.appendChild(findBar);
    
    // Bind find bar events
    document.getElementById('find-close').addEventListener('click', () => this.exitFindMode());
    document.getElementById('find-next').addEventListener('click', () => this.findNext());
    document.getElementById('find-prev').addEventListener('click', () => this.findPrevious());
    document.getElementById('find-input').addEventListener('input', (e) => {
      this.findQuery = e.target.value;
      this.performFind();
    });
  }

  exitFindMode() {
    this.isFindMode = false;
    const findBar = document.getElementById('find-bar');
    if (findBar) {
      findBar.remove();
    }
    this.clearFindHighlights();
  }

  handleFindMode(event) {
    if (event.key === 'Escape') {
      this.exitFindMode();
      event.preventDefault();
    } else if (event.key === 'Enter') {
      if (event.shiftKey) {
        this.findPrevious();
      } else {
        this.findNext();
      }
      event.preventDefault();
    }
  }

  performFind() {
    if (!this.findQuery) {
      this.clearFindHighlights();
      return;
    }
    
    const activeIframe = document.querySelector('#frame-container iframe.active');
    if (!activeIframe || !activeIframe.contentDocument) {
      return;
    }
    
    const doc = activeIframe.contentDocument;
    this.clearFindHighlights(doc);
    
    // Find all text nodes containing the query
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.toLowerCase().includes(this.findQuery.toLowerCase())) {
        textNodes.push(node);
      }
    }
    
    // Highlight matches
    this.findResults = [];
    textNodes.forEach(textNode => {
      const parent = textNode.parentNode;
      const text = textNode.textContent;
      const regex = new RegExp(`(${this.escapeRegex(this.findQuery)})`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        const wrapper = document.createElement('span');
        wrapper.innerHTML = text.replace(regex, '<mark class="find-highlight">$1</mark>');
        parent.replaceChild(wrapper, textNode);
        
        const highlights = wrapper.querySelectorAll('.find-highlight');
        highlights.forEach(highlight => {
          this.findResults.push(highlight);
        });
      }
    });
    
    this.updateFindResults();
    if (this.findResults.length > 0) {
      this.currentFindIndex = 0;
      this.scrollToFindResult(0);
    }
  }

  findNext() {
    if (this.findResults.length === 0) return;
    
    this.currentFindIndex = (this.currentFindIndex + 1) % this.findResults.length;
    this.scrollToFindResult(this.currentFindIndex);
    this.updateFindResults();
  }

  findPrevious() {
    if (this.findResults.length === 0) return;
    
    this.currentFindIndex = this.currentFindIndex === 0 ? 
      this.findResults.length - 1 : this.currentFindIndex - 1;
    this.scrollToFindResult(this.currentFindIndex);
    this.updateFindResults();
  }

  scrollToFindResult(index) {
    const result = this.findResults[index];
    if (result) {
      // Remove previous active class
      this.findResults.forEach(r => {
        r.classList.remove('find-highlight-active');
      });
      
      // Add active class to current result
      result.classList.add('find-highlight-active');
      
      // Scroll into view
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  updateFindResults() {
    const resultsDiv = document.getElementById('find-results');
    if (resultsDiv) {
      if (this.findResults.length === 0) {
        resultsDiv.textContent = 'No results';
      } else {
        resultsDiv.textContent = `${this.currentFindIndex + 1} of ${this.findResults.length}`;
      }
    }
  }

  clearFindHighlights(doc = null) {
    if (!doc) {
      const activeIframe = document.querySelector('#frame-container iframe.active');
      if (activeIframe && activeIframe.contentDocument) {
        doc = activeIframe.contentDocument;
      } else {
        return;
      }
    }
    
    const highlights = doc.querySelectorAll('.find-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  zoomIn() {
    if (this.currentZoomIndex < this.zoomLevels.length - 1) {
      this.currentZoomIndex++;
      this.applyZoom();
    }
  }

  zoomOut() {
    if (this.currentZoomIndex > 0) {
      this.currentZoomIndex--;
      this.applyZoom();
    }
  }

  zoomReset() {
    this.currentZoomIndex = 8; // Reset to 100%
    this.applyZoom();
  }

  applyZoom() {
    const activeIframe = document.querySelector('#frame-container iframe.active');
    if (activeIframe) {
      const zoomLevel = this.zoomLevels[this.currentZoomIndex];
      activeIframe.style.transform = `scale(${zoomLevel})`;
      activeIframe.style.transformOrigin = 'top left';
      
      // Adjust container size to accommodate zoom
      const container = document.getElementById('frame-container');
      if (container) {
        container.style.height = `${window.innerHeight - 120}px`; // Adjust for nav height
      }
    }
  }

  toggleDevTools() {
    const activeIframe = document.querySelector('#frame-container iframe.active');
    if (activeIframe && activeIframe.contentWindow) {
      // Try to toggle eruda if available
      if (typeof eToggle === 'function') {
        eToggle();
      } else if (activeIframe.contentWindow.eruda) {
        if (activeIframe.contentWindow.eruda._isInit) {
          activeIframe.contentWindow.eruda.destroy();
        } else {
          activeIframe.contentWindow.eruda.show();
        }
      } else {
        // Fallback: open developer tools in new window
        console.log('Dev tools not available in this context');
      }
    }
  }

  focusAddressBar() {
    const addressBar = document.getElementById('iv');
    if (addressBar) {
      addressBar.focus();
      addressBar.select();
    }
  }

  // ==================== MISC ====================

  openDownloads() {
    if (window.electronAPI && window.electronAPI.openDownloads) {
      window.electronAPI.openDownloads();
    } else {
      // Fallback: try to find and click downloads button or navigate
      console.log('Downloads not available in this context');
    }
  }

  openHistory() {
    if (window.electronAPI && window.electronAPI.openHistory) {
      window.electronAPI.openHistory();
    } else {
      // Fallback: navigate to history page if it exists
      console.log('History not available in this context');
    }
  }

  toggleFullscreen() {
    if (typeof FS === 'function') {
      FS();
    } else {
      // Fallback: use document fullscreen API
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  }

  /**
   * Helper function to call global functions safely
   */
  callFunction(functionName) {
    if (typeof window[functionName] === 'function') {
      window[functionName]();
    } else {
      console.warn(`Function ${functionName} not found`);
    }
  }

  /**
   * Get all registered shortcuts (for debugging)
   */
  getShortcuts() {
    return Array.from(this.shortcuts.keys());
  }
}

// Initialize keyboard shortcuts when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.keyboardShortcuts = new KeyboardShortcuts();
  console.log('Chromium-style keyboard shortcuts loaded');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KeyboardShortcuts;
}
