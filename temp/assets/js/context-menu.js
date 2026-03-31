class ContextMenu {
    constructor() {
        this.menu = document.getElementById('context-menu');
        this.isVisible = false;
        this.currentFocusedIndex = -1;
        this.menuItems = [];
        
        this.init();
    }

    init() {
        // Prevent default context menu
        document.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        
        // Hide menu when clicking elsewhere
        document.addEventListener('click', (e) => this.handleClick(e));
        
        // Hide menu when pressing Escape
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Handle menu item clicks
        this.menuItems = this.menu.querySelectorAll('.context-menu-item');
        this.menuItems.forEach((item, index) => {
            item.addEventListener('click', (e) => this.handleMenuItemClick(e, item));
            item.addEventListener('mouseenter', () => this.setFocusedIndex(index));
        });
        
        // Handle window resize to reposition menu if needed
        window.addEventListener('resize', () => this.hide());
        window.addEventListener('scroll', () => this.hide());
        
        // Ensure context menu works in iframes and different contexts
        this.setupGlobalContextHandling();
        
        // Listen for messages from iframes
        window.addEventListener('message', (e) => this.handleMessage(e));
    }
    
    handleMessage(e) {
        if (e.data && e.data.type === 'corroded-inspect') {
            // Trigger devtools when iframe requests inspection
            this.loadDevTools();
        }
    }
    
    setupGlobalContextHandling() {
        // Try to set up context menu in iframes if possible
        try {
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (iframeDoc && !iframeDoc.hasAttribute('data-context-menu-added')) {
                        iframeDoc.setAttribute('data-context-menu-added', 'true');
                        // Inject context menu into iframe if same origin
                        if (iframe.contentWindow && iframe.contentWindow.location.origin === window.location.origin) {
                            this.injectContextMenuIntoIframe(iframe.contentWindow);
                        }
                    }
                } catch (e) {
                    // Cross-origin iframe, cannot inject
                }
            });
        } catch (e) {
            console.warn('Could not setup context menu in iframes:', e);
        }
    }
    
    injectContextMenuIntoIframe(iframeWindow) {
        try {
            // Create a simple context menu for the iframe
            const iframeDoc = iframeWindow.document;
            const contextMenu = iframeDoc.createElement('div');
            contextMenu.id = 'context-menu';
            contextMenu.className = 'context-menu hidden';
            contextMenu.innerHTML = `
                <div class="context-menu-item" data-action="inspect">
                    <i class="fas fa-magnifying-glass"></i>
                    <span>Inspect</span>
                </div>
                <div class="context-menu-item" data-action="reload">
                    <i class="fas fa-rotate-right"></i>
                    <span>Reload</span>
                </div>
            `;
            
            // Add styles if not present
            if (!iframeDoc.querySelector('#context-menu-styles')) {
                const style = iframeDoc.createElement('style');
                style.id = 'context-menu-styles';
                style.textContent = `
                    .context-menu { position: fixed; background: #2d2d2d; border: 1px solid #444; border-radius: 4px; padding: 4px 0; min-width: 150px; z-index: 999999; font-size: 12px; color: #ccc; }
                    .context-menu-item { padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
                    .context-menu-item:hover { background: #0078d4; color: white; }
                    .context-menu.hidden { display: none; }
                    .context-menu-separator { height: 1px; background: #444; margin: 4px 0; }
                `;
                iframeDoc.head.appendChild(style);
            }
            
            iframeDoc.body.appendChild(contextMenu);
            
            // Setup event handlers for iframe
            iframeDoc.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                contextMenu.style.left = e.clientX + 'px';
                contextMenu.style.top = e.clientY + 'px';
                contextMenu.classList.remove('hidden');
            });
            
            iframeDoc.addEventListener('click', () => {
                contextMenu.classList.add('hidden');
            });
            
            // Handle menu item clicks
            contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    if (action === 'inspect') {
                        // Trigger parent's inspect
                        window.parent.postMessage({ type: 'corroded-inspect' }, '*');
                    } else if (action === 'reload') {
                        iframeWindow.location.reload();
                    }
                    contextMenu.classList.add('hidden');
                });
            });
        } catch (e) {
            console.warn('Could not inject context menu into iframe:', e);
        }
    }

    handleContextMenu(e) {
        e.preventDefault();
        
        // Update menu items based on context
        this.updateMenuItems(e);
        
        // Show menu at cursor position
        this.show(e.clientX, e.clientY);
    }

    handleClick(e) {
        // Don't hide if clicking inside the context menu
        if (!this.menu.contains(e.target)) {
            this.hide();
        }
    }

    handleKeyDown(e) {
        if (!this.isVisible) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.hide();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateMenu(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateMenu(-1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.activateFocusedItem();
                break;
        }
    }

    handleMenuItemClick(e, item) {
        e.preventDefault();
        e.stopPropagation();
        
        const action = item.dataset.action;
        if (action && !item.classList.contains('disabled')) {
            this.executeAction(action);
        }
        
        this.hide();
    }

    updateMenuItems(e) {
        const target = e.target;
        const selection = window.getSelection().toString();
        const isEditable = target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        const hasSelection = selection.length > 0;
        const isLink = target.tagName === 'A' || target.closest('a');
        const isImage = target.tagName === 'IMG' || target.closest('img');
        
        // Update menu items based on context
        this.menuItems.forEach(item => {
            const action = item.dataset.action;
            let shouldShow = true;
            let isDisabled = false;
            
            switch (action) {
                case 'back':
                    isDisabled = !window.history.length || window.history.length <= 1;
                    break;
                case 'forward':
                    isDisabled = !window.history.forward || window.history.length <= 1;
                    break;
                case 'reload':
                    shouldShow = true;
                    break;
                case 'inspect':
                    shouldShow = true;
                    break;
                case 'settings':
                    shouldShow = true;
                    break;
            }
            
            item.style.display = shouldShow ? 'flex' : 'none';
            item.classList.toggle('disabled', isDisabled);
        });
        
        // Update separators
        this.updateSeparators();
    }

    updateSeparators() {
        const separators = this.menu.querySelectorAll('.context-menu-separator');
        separators.forEach(separator => {
            const prevElement = separator.previousElementSibling;
            const nextElement = separator.nextElementSibling;
            
            const shouldShow = prevElement && nextElement && 
                               prevElement.style.display !== 'none' && 
                               nextElement.style.display !== 'none';
            
            separator.style.display = shouldShow ? 'block' : 'none';
        });
    }

    show(x, y) {
        // Position the menu
        this.positionMenu(x, y);
        
        // Show the menu
        this.menu.classList.remove('hidden');
        this.isVisible = true;
        
        // Reset focus
        this.currentFocusedIndex = -1;
        
        // Add positioning class for animation origin
        this.menu.className = 'context-menu';
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuRect = this.menu.getBoundingClientRect();
        
        if (x <= viewportWidth / 2 && y <= viewportHeight / 2) {
            this.menu.classList.add('top-left');
        } else if (x > viewportWidth / 2 && y <= viewportHeight / 2) {
            this.menu.classList.add('top-right');
        } else if (x <= viewportWidth / 2 && y > viewportHeight / 2) {
            this.menu.classList.add('bottom-left');
        } else {
            this.menu.classList.add('bottom-right');
        }
    }

    hide() {
        this.menu.classList.add('hidden');
        this.isVisible = false;
        this.currentFocusedIndex = -1;
    }

    positionMenu(x, y) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const menuRect = this.menu.getBoundingClientRect();
        
        let finalX = x;
        let finalY = y;
        
        // Ensure menu doesn't go off the right edge
        if (x + menuRect.width > viewportWidth) {
            finalX = viewportWidth - menuRect.width - 10;
        }
        
        // Ensure menu doesn't go off the bottom edge
        if (y + menuRect.height > viewportHeight) {
            finalY = viewportHeight - menuRect.height - 10;
        }
        
        // Ensure menu doesn't go off the left edge
        if (finalX < 10) {
            finalX = 10;
        }
        
        // Ensure menu doesn't go off the top edge
        if (finalY < 10) {
            finalY = 10;
        }
        
        this.menu.style.left = `${finalX}px`;
        this.menu.style.top = `${finalY}px`;
    }

    navigateMenu(direction) {
        const visibleItems = Array.from(this.menuItems).filter(item => 
            item.style.display !== 'none' && !item.classList.contains('disabled')
        );
        
        if (visibleItems.length === 0) return;
        
        // Remove current focus
        if (this.currentFocusedIndex >= 0 && this.currentFocusedIndex < visibleItems.length) {
            visibleItems[this.currentFocusedIndex].classList.remove('keyboard-focus');
        }
        
        // Calculate new index
        this.currentFocusedIndex += direction;
        
        // Wrap around
        if (this.currentFocusedIndex < 0) {
            this.currentFocusedIndex = visibleItems.length - 1;
        } else if (this.currentFocusedIndex >= visibleItems.length) {
            this.currentFocusedIndex = 0;
        }
        
        // Add focus to new item
        visibleItems[this.currentFocusedIndex].classList.add('keyboard-focus');
    }

    setFocusedIndex(index) {
        const visibleItems = Array.from(this.menuItems).filter(item => 
            item.style.display !== 'none' && !item.classList.contains('disabled')
        );
        
        // Remove current focus
        if (this.currentFocusedIndex >= 0 && this.currentFocusedIndex < visibleItems.length) {
            visibleItems[this.currentFocusedIndex].classList.remove('keyboard-focus');
        }
        
        this.currentFocusedIndex = visibleItems.indexOf(this.menuItems[index]);
        
        if (this.currentFocusedIndex >= 0) {
            visibleItems[this.currentFocusedIndex].classList.add('keyboard-focus');
        }
    }

    activateFocusedItem() {
        const visibleItems = Array.from(this.menuItems).filter(item => 
            item.style.display !== 'none' && !item.classList.contains('disabled')
        );
        
        if (this.currentFocusedIndex >= 0 && this.currentFocusedIndex < visibleItems.length) {
            const item = visibleItems[this.currentFocusedIndex];
            const action = item.dataset.action;
            
            if (action) {
                this.executeAction(action);
            }
            
            this.hide();
        }
    }

    executeAction(action) {
        switch (action) {
            case 'back':
                window.history.back();
                break;
            case 'forward':
                window.history.forward();
                break;
            case 'reload':
                window.location.reload();
                break;
            case 'inspect':
                this.loadDevTools();
                break;
            case 'settings':
                window.location.href = '/config';
                break;
        }
    }

    loadDevTools() {
        // Check if devtools are already loaded
        if (window.corrodedDevTools) {
            // Toggle devtools visibility
            if (window.corrodedDevTools.isVisible) {
                window.corrodedDevTools.hide();
            } else {
                window.corrodedDevTools.show();
            }
            return;
        }

        // Create custom devtools that mimic Chromium devtools
        window.corrodedDevTools = new CorrodedDevTools();
        window.corrodedDevTools.init();
    }

    createDevToolsPanel() {
        const devToolsContainer = document.createElement('div');
        devToolsContainer.id = 'corroded-devtools';
        devToolsContainer.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 400px;
            height: 100%;
            background: #1e1e1e;
            border-left: 1px solid #333;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 12px;
            color: #d4d4d4;
            z-index: 999999;
            display: none;
            box-sizing: border-box;
        `;

        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.style.cssText = `
            background: #2d2d2d;
            height: 30px;
            border-bottom: 1px solid #444;
            display: flex;
            align-items: center;
            padding: 0 8px;
        `;

        const tabs = [
            { id: 'elements', name: 'Elements', icon: 'fas fa-code' },
            { id: 'console', name: 'Console', icon: 'fas fa-terminal' },
            { id: 'sources', name: 'Sources', icon: 'fas fa-folder' }
        ];

        tabs.forEach(tab => {
            const tabButton = document.createElement('button');
            tabButton.style.cssText = `
                background: none;
                border: none;
                color: #ccc;
                padding: 5px 10px;
                margin-right: 5px;
                cursor: pointer;
                border-radius: 3px;
                font-size: 11px;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            tabButton.innerHTML = `<i class="${tab.icon}"></i> ${tab.name}`;
            tabButton.onclick = () => this.switchDevToolsTab(tab.id);
            
            if (tab.id === 'console') {
                tabButton.style.background = '#0078d4';
                tabButton.style.color = 'white';
            }
            
            toolbar.appendChild(tabButton);
        });

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.style.cssText = `
            background: none;
            border: none;
            color: #ccc;
            padding: 5px;
            cursor: pointer;
            margin-left: auto;
            font-size: 14px;
        `;
        closeButton.innerHTML = '<i class="fas fa-close"></i>';
        closeButton.onclick = () => window.corrodedDevTools.hide();
        toolbar.appendChild(closeButton);

        // Create content area
        const contentArea = document.createElement('div');
        contentArea.id = 'devtools-content';
        contentArea.style.cssText = `
            height: calc(100% - 30px);
            overflow: hidden;
            position: relative;
        `;

        // Create console panel (default)
        contentArea.innerHTML = this.createConsolePanel();

        // Add resize handle (now on the left side)
        const resizeHandle = document.createElement('div');
        resizeHandle.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 5px;
            height: 100%;
            background: #444;
            cursor: ew-resize;
        `;
        
        this.setupResizeHandle(resizeHandle, devToolsContainer);

        devToolsContainer.appendChild(resizeHandle);
        devToolsContainer.appendChild(toolbar);
        devToolsContainer.appendChild(contentArea);

        return devToolsContainer;
    }

    createConsolePanel() {
        return `
            <div style="height: 100%; display: flex; flex-direction: column; background: #1e1e1e;">
                <!-- Console toolbar -->
                <div style="height: 24px; background: #2d2d2d; border-bottom: 1px solid #444; display: flex; align-items: center; padding: 0 8px;">
                    <div style="display: flex; gap: 8px; font-size: 11px;">
                        <span id="console-clear" style="color: #ccc; cursor: pointer;" onclick="window.corrodedDevTools.clearConsole()">Clear</span>
                        <span style="color: #666;">|</span>
                        <span id="console-filter-all" style="color: #0078d4; cursor: pointer;" onclick="window.corrodedDevTools.setConsoleFilter('all')">All</span>
                        <span style="color: #666;">|</span>
                        <span id="console-filter-errors" style="color: #ccc; cursor: pointer;" onclick="window.corrodedDevTools.setConsoleFilter('errors')">Errors</span>
                        <span style="color: #666;">|</span>
                        <span id="console-filter-warnings" style="color: #ccc; cursor: pointer;" onclick="window.corrodedDevTools.setConsoleFilter('warnings')">Warnings</span>
                        <span style="color: #666;">|</span>
                        <span id="console-filter-info" style="color: #ccc; cursor: pointer;" onclick="window.corrodedDevTools.setConsoleFilter('info')">Info</span>
                    </div>
                    <div style="margin-left: auto; display: flex; align-items: center; gap: 4px;">
                        <input id="console-filter" type="text" placeholder="Filter" style="background: #1e1e1e; border: 1px solid #444; color: #ccc; padding: 2px 6px; font-size: 10px; width: 100px; outline: none;">
                    </div>
                </div>
                
                <!-- Console output -->
                <div id="console-output" style="flex: 1; overflow-y: auto; padding: 8px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; line-height: 1.4;">
                    <div style="color: #6a9955; margin-bottom: 4px;">// Corroded DevTools Console v1.0</div>
                    <div style="color: #6a9955; margin-bottom: 8px;">// Type JavaScript commands and press Enter to execute</div>
                    <div style="color: #dcdcaa; margin-bottom: 4px;">&gt; console.log('Welcome to Corroded DevTools!')</div>
                    <div style="color: #9cdcfe; margin-bottom: 8px; margin-left: 16px;">← "Welcome to Corroded DevTools!"</div>
                </div>
                
                <!-- Console input -->
                <div style="border-top: 1px solid #444; background: #252526;">
                    <div style="display: flex; align-items: stretch;">
                        <div style="background: #2d2d2d; color: #ccc; padding: 8px 12px; font-family: monospace; font-size: 12px; border-right: 1px solid #444; display: flex; align-items: center;">&gt;</div>
                        <input id="console-input" type="text" placeholder="input goes here" style="flex: 1; background: transparent; border: none; color: #ccc; padding: 8px 12px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12px; outline: none;">
                    </div>
                </div>
            </div>
        `;
    }

    createElementsPanel() {
        // Detect current theme
        const isDarkTheme = this.detectDevToolsTheme();
        
        return `
            <div style="height: 100%; display: flex;">
                <div style="width: 300px; border-right: 1px solid ${isDarkTheme ? '#444' : '#ddd'}; overflow-y: auto; background: ${isDarkTheme ? '#1e1e1e' : '#ffffff'};">
                    <style>
                        .element-item {
                            margin: 1px 0;
                            cursor: pointer;
                            white-space: pre;
                            padding: 2px 4px;
                            border-radius: 2px;
                            transition: background-color 0.15s ease;
                        }
                        .element-item:hover {
                            background-color: ${isDarkTheme ? '#2a2a2a' : '#f0f0f0'};
                        }
                        .element-item.active {
                            background-color: ${isDarkTheme ? '#094771' : '#cce5ff'};
                        }
                        .element-tag { color: ${isDarkTheme ? '#569cd6' : '#0000ff'}; }
                        .element-attr { color: ${isDarkTheme ? '#9cdcfe' : '#000099'}; }
                        .element-value { color: ${isDarkTheme ? '#ce9178' : '#a31515'}; }
                        .element-class { color: ${isDarkTheme ? '#d7ba7d' : '#795e26'}; }
                        .element-text { color: ${isDarkTheme ? '#6a9955' : '#008000'}; }
                    </style>
                    <div id="elements-tree" style="padding: 10px; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 11px; line-height: 1.4;">
                        ${this.generateFormattedElementsTree(document.documentElement)}
                    </div>
                </div>
                <div style="flex: 1; overflow-y: auto; background: ${isDarkTheme ? '#252526' : '#f8f8f8'}; padding: 10px;">
                    <div style="color: ${isDarkTheme ? '#ccc' : '#333'}; font-size: 12px;">
                        <div style="margin-bottom: 10px; font-weight: bold;">Styles</div>
                        <div id="element-styles">
                            <div style="color: ${isDarkTheme ? '#6a9955' : '#666'};">Select an element to view its styles</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    detectDevToolsTheme() {
        // Check for dark theme indicators
        const body = document.body;
        const html = document.documentElement;
        
        // Check for dark theme classes or data attributes
        if (body.classList.contains('dark') || 
            html.classList.contains('dark') ||
            body.getAttribute('data-theme') === 'dark' ||
            html.getAttribute('data-theme') === 'dark') {
            return true;
        }
        
        // Check CSS computed background color
        const bgColor = window.getComputedStyle(body).backgroundColor;
        if (bgColor && this.isDarkColor(bgColor)) {
            return true;
        }
        
        // Default to dark theme for Corroded
        return true;
    }

    generateFormattedElementsTree(element, level = 0) {
        if (!element) return '';
        
        const indent = '    '.repeat(level);
        const tagName = element.tagName.toLowerCase();
        const id = element.id ? `#${element.id}` : '';
        const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
        const elementSelector = `${tagName}${id}${classes}`;
        const elementId = `element-${tagName}-${id}-${classes}-${level}`.replace(/[^a-zA-Z0-9-]/g, '-');
        
        // Opening tag with proper formatting
        let html = `<div class="element-item" id="${elementId}" onclick="window.corrodedDevTools.selectElement('${elementSelector}', this, '${elementId}')" title="Click to inspect this element">`;
        html += `${indent}<span class="element-tag">&lt;</span><span class="element-tag">${tagName}</span>`;
        
        if (id) {
            html += `<span class="element-attr">${id}</span>`;
        }
        if (classes) {
            html += `<span class="element-class">${classes}</span>`;
        }
        
        // Add key attributes if any
        const importantAttrs = ['href', 'src', 'alt', 'title', 'type', 'name', 'value', 'placeholder'];
        let hasImportantAttrs = false;
        if (element.attributes.length > 0) {
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                if (importantAttrs.includes(attr.name) && attr.value) {
                    if (!hasImportantAttrs) {
                        html += `\n${indent}    `;
                        hasImportantAttrs = true;
                    }
                    const displayValue = attr.value.length > 20 ? attr.value.substring(0, 20) + '...' : attr.value;
                    html += `<span class="element-attr">${attr.name}</span>=<span class="element-value">"${displayValue}"</span> `;
                }
            }
        }
        
        html += `<span class="element-tag">&gt;</span></div>`;
        
        // Add text content if significant
        if (element.textContent && element.textContent.trim().length > 0 && element.textContent.trim().length < 50) {
            const textContent = element.textContent.trim();
            if (textContent && !element.children.length) {
                html += `<div class="element-item" style="margin-left: ${(level + 1) * 20}px; color: #6a9955; cursor: default;" title="Text content">${indent}    "${textContent}"</div>`;
            }
        }
        
        // Add children with proper indentation
        const children = Array.from(element.children);
        if (children.length > 0) {
            children.forEach(child => {
                html += this.generateFormattedElementsTree(child, level + 1);
            });
            
            // Closing tag for elements with children
            html += `<div class="element-item" style="margin-left: ${level * 20}px; cursor: default;">`;
            html += `${indent}<span class="element-tag">&lt;/</span><span class="element-tag">${tagName}</span><span class="element-tag">&gt;</span></div>`;
        }
        
        return html;
    }

    createSourcesPanel() {
        return `
            <div style="height: 100%; padding: 10px; background: #1e1e1e;">
                <div style="color: #ccc; font-size: 12px;">
                    <div style="margin-bottom: 10px; font-weight: bold;">Page Sources</div>
                    <div id="sources-tree" style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 11px; line-height: 1.4;">
                        ${this.generateFileTree()}
                    </div>
                </div>
            </div>
        `;
    }

    generateFileTree() {
        const tree = [];
        
        // Get current page info and rename if it's localhost:60784
        let currentPage = window.location.pathname.split('/').pop() || 'index.html';
        let siteName = window.location.origin;
        
        if (siteName.includes('localhost:60784')) {
            siteName = 'CorrodedProxy';
        }
        
        tree.push(`<div style="margin: 2px 0; cursor: pointer;" onclick="this.querySelector('.toggle').classList.toggle('fa-chevron-down'); this.querySelector('.toggle').classList.toggle('fa-chevron-right'); this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
            <i class="toggle fas fa-chevron-down" style="color: #ccc; margin-right: 4px;"></i><i class="fas fa-folder-open" style="color: #f8c555; margin-right: 4px;"></i> ${siteName}
        </div>`);
        
        // Main files container
        tree.push(`<div style="margin-left: 16px;">`);
        
        // Add current HTML file
        tree.push(`<div style="margin: 2px 0; cursor: pointer; padding-left: 16px;" onclick="window.corrodedDevTools.viewSource('${window.location.href}')">
            <i class="fas fa-file-code" style="color: #f8c555; margin-right: 4px;"></i> ${currentPage}
        </div>`);
        
        // Group scripts
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        if (scripts.length > 0) {
            tree.push(`<div style="margin: 2px 0; cursor: pointer;" onclick="this.querySelector('.toggle').classList.toggle('fa-chevron-down'); this.querySelector('.toggle').classList.toggle('fa-chevron-right'); this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
                <i class="toggle fas fa-chevron-down" style="color: #ccc; margin-right: 4px;"></i><i class="fas fa-folder-open" style="color: #f8c555; margin-right: 4px;"></i> scripts
            </div>`);
            tree.push(`<div style="margin-left: 16px;">`);
            scripts.forEach(script => {
                let fileName = script.src.split('/').pop();
                let displaySrc = script.src;
                
                // Rename localhost:60784 to CorrodedProxy in script sources
                if (displaySrc.includes('localhost:60784')) {
                    displaySrc = displaySrc.replace('localhost:60784', 'CorrodedProxy');
                }
                
                tree.push(`<div style="margin: 2px 0; cursor: pointer; padding-left: 16px;" onclick="window.corrodedDevTools.viewSource('${script.src}')" title="${script.src}">
                    <i class="fas fa-file-alt" style="color: #f8c555; margin-right: 4px;"></i> ${fileName}
                </div>`);
            });
            tree.push(`</div>`);
        }
        
        // Group stylesheets
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        if (stylesheets.length > 0) {
            tree.push(`<div style="margin: 2px 0; cursor: pointer;" onclick="this.querySelector('.toggle').classList.toggle('fa-chevron-down'); this.querySelector('.toggle').classList.toggle('fa-chevron-right'); this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
                <i class="toggle fas fa-chevron-down" style="color: #ccc; margin-right: 4px;"></i><i class="fas fa-folder-open" style="color: #f8c555; margin-right: 4px;"></i> styles
            </div>`);
            tree.push(`<div style="margin-left: 16px;">`);
            stylesheets.forEach(link => {
                let fileName = link.href.split('/').pop();
                let displayHref = link.href;
                
                // Rename localhost:60784 to CorrodedProxy in stylesheet sources
                if (displayHref.includes('localhost:60784')) {
                    displayHref = displayHref.replace('localhost:60784', 'CorrodedProxy');
                }
                
                tree.push(`<div style="margin: 2px 0; cursor: pointer; padding-left: 16px;" onclick="window.corrodedDevTools.viewSource('${link.href}')" title="${link.href}">
                    <i class="fas fa-palette" style="color: #f8c555; margin-right: 4px;"></i> ${fileName}
                </div>`);
            });
            tree.push(`</div>`);
        }
        
        // Group images
        const images = Array.from(document.querySelectorAll('img[src]'));
        if (images.length > 0) {
            tree.push(`<div style="margin: 2px 0; cursor: pointer;" onclick="this.querySelector('.toggle').classList.toggle('fa-chevron-down'); this.querySelector('.toggle').classList.toggle('fa-chevron-right'); this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
                <i class="toggle fas fa-chevron-down" style="color: #ccc; margin-right: 4px;"></i><i class="fas fa-folder-open" style="color: #f8c555; margin-right: 4px;"></i> images
            </div>`);
            tree.push(`<div style="margin-left: 16px;">`);
            images.forEach(img => {
                let fileName = img.src.split('/').pop();
                let displaySrc = img.src;
                
                // Rename localhost:60784 to CorrodedProxy in image sources
                if (displaySrc.includes('localhost:60784')) {
                    displaySrc = displaySrc.replace('localhost:60784', 'CorrodedProxy');
                }
                
                tree.push(`<div style="margin: 2px 0; cursor: pointer; padding-left: 16px;" onclick="window.corrodedDevTools.viewSource('${img.src}')" title="${img.src}">
                    <i class="fas fa-image" style="color: #f8c555; margin-right: 4px;"></i> ${fileName}
                </div>`);
            });
            tree.push(`</div>`);
        }
        
        // Add external domains
        const externalDomains = new Set();
        [...scripts, ...stylesheets, ...images].forEach(el => {
            const src = el.src || el.href;
            if (src && !src.includes(window.location.origin)) {
                try {
                    let domain = new URL(src).hostname;
                    if (domain && domain !== 'localhost:60784') {
                        externalDomains.add(domain);
                    }
                } catch (e) {}
            }
        });
        
        if (externalDomains.size > 0) {
            tree.push(`<div style="margin: 2px 0; cursor: pointer;" onclick="this.querySelector('.toggle').classList.toggle('fa-chevron-down'); this.querySelector('.toggle').classList.toggle('fa-chevron-right'); this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none';">
                <i class="toggle fas fa-chevron-down" style="color: #ccc; margin-right: 4px;"></i><i class="fas fa-globe" style="color: #f8c555; margin-right: 4px;"></i> external domains
            </div>`);
            tree.push(`<div style="margin-left: 16px;">`);
            externalDomains.forEach(domain => {
                tree.push(`<div style="margin: 2px 0; cursor: pointer; padding-left: 16px;">
                    <i class="fas fa-external-link-alt" style="color: #f8c555; margin-right: 4px;"></i> ${domain}
                </div>`);
            });
            tree.push(`</div>`);
        }
        
        tree.push(`</div>`);
        return tree.join('');
    }

    switchDevToolsTab(tabId) {
        const contentArea = document.getElementById('devtools-content');
        const tabButtons = document.querySelectorAll('#corroded-devtools button');
        
        // Update tab button styles
        tabButtons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(tabId)) {
                btn.style.background = '#0078d4';
                btn.style.color = 'white';
            } else if (!btn.textContent.includes('✕')) {
                btn.style.background = 'none';
                btn.style.color = '#ccc';
            }
        });
        
        // Update content
        switch (tabId) {
            case 'elements':
                contentArea.innerHTML = this.createElementsPanel();
                break;
            case 'console':
                contentArea.innerHTML = this.createConsolePanel();
                this.setupConsoleInput();
                break;
            case 'sources':
                contentArea.innerHTML = this.createSourcesPanel();
                break;
        }
    }

    setupConsoleInput() {
        setTimeout(() => {
            const input = document.getElementById('console-input');
            const output = document.getElementById('console-output');
            
            if (input && output) {
                // Initialize console message capture
                this.setupConsoleCapture();
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const command = input.value.trim();
                        if (command) {
                            // Add command to output
                            const commandDiv = document.createElement('div');
                            commandDiv.innerHTML = `<i class="fa-solid fa-chevron-right" style="color: #ccc;"></i> <span style="color: #d4d4d4;">${command}</span>`;
                            output.appendChild(commandDiv);
                            
                            try {
                                const result = eval(command);
                                const resultDiv = document.createElement('div');
                                resultDiv.innerHTML = `<i class="fa-solid fa-arrow-left" style="color: #4ec9b0;"></i> <span style="color: #d4d4d4;">${JSON.stringify(result, null, 2)}</span>`;
                                output.appendChild(resultDiv);
                            } catch (error) {
                                const errorDiv = document.createElement('div');
                                errorDiv.innerHTML = `<i class="fa-solid fa-close" style="color: #f44747;"></i> <span style="color: #f44747;">${error.message}</span>`;
                                output.appendChild(errorDiv);
                            }
                            
                            output.scrollTop = output.scrollHeight;
                            input.value = '';
                        }
                    }
                });
                
                input.focus();
            }
        }, 100);
    }

    setupConsoleCapture() {
        // Store original console methods
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        
        // Override console methods to capture messages
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.addConsoleMessage('log', args);
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.addConsoleMessage('error', args);
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.addConsoleMessage('warn', args);
        };
        
        console.info = (...args) => {
            originalInfo.apply(console, args);
            this.addConsoleMessage('info', args);
        };
    }
    
    addConsoleMessage(type, args) {
        const output = document.getElementById('console-output');
        if (!output) return;
        
        const messageDiv = document.createElement('div');
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return String(arg);
        }).join(' ');
        
        let icon = '';
        let color = '#d4d4d4';
        
        switch (type) {
            case 'log':
                icon = '<i class="fa-solid fa-chevron-right" style="color: #4ec9b0;"></i>';
                break;
            case 'error':
                icon = '<i class="fa-solid fa-close" style="color: #f44747;"></i>';
                color = '#f44747';
                break;
            case 'warn':
                icon = '<i class="fa-solid fa-triangle-exclamation" style="color: #dcdcaa;"></i>';
                color = '#dcdcaa';
                break;
            case 'info':
                icon = '<i class="fa-solid fa-info" style="color: #569cd6;"></i>';
                color = '#569cd6';
                break;
        }
        
        messageDiv.innerHTML = `${icon} <span style="color: ${color};">${message}</span>`;
        output.appendChild(messageDiv);
        output.scrollTop = output.scrollHeight;
    }
    
    clearConsole() {
        const output = document.getElementById('console-output');
        if (output) {
            output.innerHTML = '<div style="color: #6a9955; margin-bottom: 4px;">// Console cleared</div>';
        }
    }
    
    setConsoleFilter(filter) {
        // Update filter button styles
        document.querySelectorAll('[id^="console-filter-"]').forEach(btn => {
            btn.style.color = '#ccc';
        });
        document.getElementById(`console-filter-${filter}`).style.color = '#0078d4';
        
        // TODO: Implement actual filtering logic
        console.log(`Console filter set to: ${filter}`);
    }

    startNetworkMonitoring() {
        // Store original fetch and XMLHttpRequest
        const originalFetch = window.fetch;
        const originalXHR = window.XMLHttpRequest;
        
        // Override fetch
        window.fetch = function(...args) {
            const url = args[0];
            const startTime = Date.now();
            
            return originalFetch.apply(this, args).then(response => {
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                const networkLog = document.getElementById('network-log');
                if (networkLog) {
                    const logEntry = document.createElement('div');
                    logEntry.innerHTML = `<span style="color: #4ec9b0;">GET</span> ${url} - <span style="color: #dcdcaa;">${duration}ms</span> - <span style="color: #9cdcfe;">${response.status}</span>`;
                    networkLog.appendChild(logEntry);
                }
                
                return response;
            });
        };
    }

    setupResizeHandle(handle, container) {
        let isResizing = false;
        let startX = 0;
        let startWidth = 400;
        
        handle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = container.offsetWidth;
            document.body.style.cursor = 'ew-resize';
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const deltaX = startX - e.clientX;
            const newWidth = Math.max(300, Math.min(800, startWidth + deltaX));
            container.style.width = newWidth + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = 'default';
        });
    }

    selectElement(selector, element, elementId) {
        // Remove active class from all elements
        document.querySelectorAll('.element-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected element
        if (element && element.classList) {
            element.classList.add('active');
        }
        
        // Find the actual DOM element from the selector
        let actualElement = null;
        try {
            if (selector.startsWith('#')) {
                actualElement = document.getElementById(selector.substring(1));
            } else if (selector.includes('.')) {
                const parts = selector.split('.');
                const tagName = parts[0];
                const classes = parts.slice(1).join('.');
                actualElement = document.querySelector(`${tagName}.${classes}`);
            } else {
                actualElement = document.querySelector(selector);
            }
        } catch (e) {
            console.warn('Could not find element:', selector);
        }
        
        const stylesPanel = document.getElementById('element-styles');
        if (stylesPanel) {
            if (actualElement) {
                const computedStyles = window.getComputedStyle(actualElement);
                const styles = [];
                
                // Add element info
                styles.push(`<div style="color: #6a9955; margin-bottom: 10px; font-weight: bold;">Element: ${actualElement.tagName.toLowerCase()}${actualElement.id ? '#' + actualElement.id : ''}${actualElement.className ? '.' + actualElement.className.split(' ').join('.') : ''}</div>`);
                
                // Add computed styles
                styles.push(`<div style="color: #ccc; margin-bottom: 5px; font-weight: bold;">Computed Styles:</div>`);
                for (let i = 0; i < computedStyles.length && i < 30; i++) {
                    const property = computedStyles[i];
                    const value = computedStyles.getPropertyValue(property);
                    if (value && value !== 'auto' && value !== 'normal' && value !== 'initial') {
                        styles.push(`<div><span style="color: #9cdcfe;">${property}:</span> <span style="color: #ce9178;">${value}</span>;</div>`);
                    }
                }
                
                // Add element attributes
                if (actualElement.attributes.length > 0) {
                    styles.push(`<div style="color: #ccc; margin: 10px 0 5px 0; font-weight: bold;">Attributes:</div>`);
                    for (let i = 0; i < actualElement.attributes.length; i++) {
                        const attr = actualElement.attributes[i];
                        styles.push(`<div><span style="color: #569cd6;">${attr.name}:</span> <span style="color: #ce9178;">"${attr.value}"</span></div>`);
                    }
                }
                
                stylesPanel.innerHTML = styles.join('');
            } else {
                stylesPanel.innerHTML = '<div style="color: #f44747;">Could not find the selected element in the DOM</div>';
            }
        }
    }

    viewSource(url) {
        window.open(url, '_blank');
    }

}

class CorrodedDevTools {
    constructor() {
        this.isVisible = false;
        this.container = null;
    }

    init() {
        this.container = window.contextMenu.createDevToolsPanel();
        document.body.appendChild(this.container);
        this.show();
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
            this.isVisible = true;
            
            // Setup console input if showing console tab
            setTimeout(() => {
                window.contextMenu.setupConsoleInput();
            }, 100);
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
            this.isVisible = false;
        }
    }

    selectElement(selector, element) {
        window.contextMenu.selectElement(selector, element);
    }

    viewSource(url) {
        window.contextMenu.viewSource(url);
    }
}

// Initialize context menu when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contextMenu = new ContextMenu();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextMenu;
}
