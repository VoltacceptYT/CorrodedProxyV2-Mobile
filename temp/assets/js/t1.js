// tabs.js
window.addEventListener("load", () => {
  navigator.serviceWorker.register("../sw.js?v=2025-04-15", { scope: "/a/" });

  // Initialize download management
  initializeDownloads();

  // Search history functionality
  const form = document.getElementById("fv");
  const input = document.getElementById("iv");
  const dropdown = document.getElementById("search-history-dropdown");

  // Load search history from localStorage
  function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    return history.slice(0, 10); // Keep only last 10 items
  }

  // Save search history to localStorage
  function saveSearchHistory(history) {
    localStorage.setItem("searchHistory", JSON.stringify(history));
  }

  // Add item to search history
  function addToSearchHistory(query) {
    if (!query || query.trim() === "") return;

    let history = loadSearchHistory();
    // Remove existing entry if it exists
    history = history.filter(item => item !== query);
    // Add to beginning
    history.unshift(query);
    // Keep only last 10 items
    history = history.slice(0, 10);
    saveSearchHistory(history);
  }

  // Remove item from search history
  function removeFromSearchHistory(query) {
    let history = loadSearchHistory();
    history = history.filter(item => item !== query);
    saveSearchHistory(history);
    showSearchHistory();
  }

  // Show search history dropdown
  function showSearchHistory() {
    const history = loadSearchHistory();
    const currentValue = input.value.trim();

    if (history.length === 0 && !currentValue) {
      dropdown.style.display = "none";
      return;
    }

    dropdown.innerHTML = "";

    if (history.length === 0 && currentValue) {
      const emptyItem = document.createElement("div");
      emptyItem.className = "search-history-empty";
      emptyItem.textContent = "No search history";
      dropdown.appendChild(emptyItem);
    } else {
      history.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "search-history-item";

        const textSpan = document.createElement("span");
        textSpan.className = "search-history-text";
        textSpan.textContent = item;

        const removeBtn = document.createElement("span");
        removeBtn.className = "search-history-remove";
        removeBtn.innerHTML = '<i class="fa-solid fa-close"></i>';
        removeBtn.onclick = e => {
          e.stopPropagation();
          removeFromSearchHistory(item);
        };

        historyItem.appendChild(textSpan);
        historyItem.appendChild(removeBtn);

        historyItem.onclick = () => {
          input.value = item;
          dropdown.style.display = "none";
          form.dispatchEvent(new Event("submit"));
        };

        dropdown.appendChild(historyItem);
      });
    }

    dropdown.style.display = "block";
  }

  // Hide search history dropdown
  function hideSearchHistory() {
    setTimeout(() => {
      dropdown.style.display = "none";
    }, 200); // Small delay to allow clicking on history items
  }

  // Event listeners for search history
  input.addEventListener("focus", showSearchHistory);
  input.addEventListener("input", showSearchHistory);
  input.addEventListener("blur", hideSearchHistory);

  // Hide dropdown when clicking outside
  document.addEventListener("click", e => {
    if (!form.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  if (form && input) {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const formValue = input.value.trim();
      
      // Handle corroded:// URLs
      if (formValue === "corroded://newtab") {
        const activeIframe = document.querySelector("#frame-container iframe.active");
        if (activeIframe) {
          activeIframe.src = "/home";
          activeIframe.dataset.tabUrl = "/home";
          input.value = "";
        } else {
          window.location.href = "/home";
        }
        dropdown.style.display = "none";
        return;
      }
      
      if (formValue === "corroded://settings") {
        const activeIframe = document.querySelector("#frame-container iframe.active");
        if (activeIframe) {
          activeIframe.src = "/config";
          activeIframe.dataset.tabUrl = "/config";
          input.value = "corroded://settings";
        } else {
          window.location.href = "/config";
        }
        dropdown.style.display = "none";
        return;
      }
      
      const url = isUrl(formValue) ? prependHttps(formValue) : `https://duckduckgo.com/?q=${formValue}`;

      // Add to search history
      addToSearchHistory(formValue);

      processUrl(url);
      dropdown.style.display = "none";
    });
  }
  function processUrl(url) {
    sessionStorage.setItem("GoUrl", __uv$config.encodeUrl(url));
    const iframeContainer = document.getElementById("frame-container");
    const activeIframe = Array.from(iframeContainer.querySelectorAll("iframe")).find(iframe => iframe.classList.contains("active"));
    activeIframe.src = `/a/${__uv$config.encodeUrl(url)}`;
    activeIframe.dataset.tabUrl = url;
    input.value = url;
    console.log(activeIframe.dataset.tabUrl);
  }
  function isUrl(val = "") {
    if (/^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ")) {
      return true;
    }
    return false;
  }
  function prependHttps(url) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  }
});
document.addEventListener("DOMContentLoaded", event => {
  const addTabButton = document.getElementById("add-tab");
  const tabList = document.getElementById("tab-list");
  const iframeContainer = document.getElementById("frame-container");
  let tabCounter = 1;
  addTabButton.addEventListener("click", () => {
    // Clear sessionStorage to prevent inheriting previous tab's URL
    sessionStorage.removeItem("URL");
    sessionStorage.removeItem("GoUrl");
    createNewTab();
    Load();
  });
  function createNewTab() {
    const newTab = document.createElement("li");
    const tabTitle = document.createElement("span");
    const tabFavicon = document.createElement("img");
    const newIframe = document.createElement("iframe");
    newIframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-modals allow-orientation-lock allow-presentation allow-storage-access-by-user-activation allow-top-navigation-by-user-activation allow-downloads";
    // When Top Navigation is not allowed links with the "top" value will be entirely blocked, if we allow Top Navigation it will overwrite the tab, which is obviously not wanted.
    
    // Setup favicon
    tabFavicon.className = "tab-favicon";
    tabFavicon.src = "/favicon.png";
    tabFavicon.width = 16;
    tabFavicon.height = 16;
    tabFavicon.style.marginRight = "6px";
    
    tabTitle.textContent = `New Tab`;
    tabTitle.className = "t";
    newTab.dataset.tabId = tabCounter;
    newTab.addEventListener("click", switchTab);
    newTab.setAttribute("draggable", true);
    
    // Add middle-click support
    newTab.addEventListener("mousedown", (e) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        closeTab(e);
      }
    });
    
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-tab");
    closeButton.innerHTML = '<i class="fa-solid fa-close"></i>';
    closeButton.addEventListener("click", closeTab);
    
    newTab.appendChild(tabFavicon);
    newTab.appendChild(tabTitle);
    newTab.appendChild(closeButton);
    tabList.appendChild(newTab);
    const allTabs = Array.from(tabList.querySelectorAll("li"));
    for (const tab of allTabs) {
      tab.classList.remove("active");
    }
    const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"));
    for (const iframe of allIframes) {
      iframe.classList.remove("active");
    }
    newTab.classList.add("active");
    newIframe.dataset.tabId = tabCounter;
    newIframe.classList.add("active");
    newIframe.addEventListener("load", () => {
      updateTabTitle(newIframe, tabTitle);
      updateTabFavicon(newIframe, newTab);
      
      // Handle navigation and redirects within iframe
      newIframe.contentWindow.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link?.href) {
          // Check if it's an external link that should open in new tab
          if (link.target === '_blank' || e.ctrlKey || e.metaKey) {
            e.preventDefault();
            sessionStorage.setItem("URL", `/a/${__uv$config.encodeUrl(link.href)}`);
            createNewTab();
            return;
          }
        }
      });
      
      newIframe.contentWindow.open = (url, target, features) => {
        if (target === '_blank' || features) {
          sessionStorage.setItem("URL", `/a/${__uv$config.encodeUrl(url)}`);
          createNewTab();
        } else {
          // Navigate in current iframe
          newIframe.src = `/a/${__uv$config.encodeUrl(url)}`;
          newIframe.dataset.tabUrl = url;
        }
        return null;
      };
      
      // Monitor for title changes
      const observer = new MutationObserver(() => {
        updateTabTitle(newIframe, tabTitle);
      });
      observer.observe(newIframe.contentDocument.head, { 
        childList: true, 
        subtree: true,
        characterData: true 
      });
      
      if (newIframe.contentDocument.documentElement.outerHTML.trim().length > 0) {
        Load();
      }
      Load();
    });
    const goUrl = sessionStorage.getItem("GoUrl");
    const url = sessionStorage.getItem("URL");

    if (tabCounter === 0 || tabCounter === 1) {
      if (goUrl !== null) {
        if (goUrl.includes("/e/")) {
          newIframe.src = window.location.origin + goUrl;
        } else {
          newIframe.src = `${window.location.origin}/a/${goUrl}`;
        }
      } else {
        newIframe.src = "/home";
      }
    } else if (tabCounter > 1) {
      if (url !== null) {
        newIframe.src = window.location.origin + url;
        sessionStorage.removeItem("URL");
      } else if (goUrl !== null) {
        if (goUrl.includes("/e/")) {
          newIframe.src = window.location.origin + goUrl;
        } else {
          newIframe.src = `${window.location.origin}/a/${goUrl}`;
        }
      } else {
        newIframe.src = "/home";
      }
    }

    iframeContainer.appendChild(newIframe);
    tabCounter += 1;
  }
  
  function updateTabTitle(iframe, titleElement) {
    try {
      const title = iframe.contentDocument.title;
      if (title && title.trim().length > 0) {
        titleElement.textContent = title.trim();
      } else {
        const url = iframe.src || iframe.dataset.tabUrl || "";
        if (url.includes("/home")) {
          titleElement.textContent = "New Tab";
        } else if (url.includes("/config")) {
          titleElement.textContent = "Settings";
        } else {
          titleElement.textContent = "Untitled";
        }
      }
    } catch (e) {
      // Fallback for cross-origin or other errors
      const url = iframe.src || iframe.dataset.tabUrl || "";
      if (url.includes("/home")) {
        titleElement.textContent = "New Tab";
      } else if (url.includes("/config")) {
        titleElement.textContent = "Settings";
      } else {
        titleElement.textContent = "Loading...";
      }
    }
  }
  
  function updateTabFavicon(iframe, tabElement) {
    try {
      const favicon = tabElement.querySelector('.tab-favicon');
      if (!favicon) return;
      
      // Try to get favicon from the page
      let faviconUrl = null;
      
      // Check for link rel="icon"
      const iconLink = iframe.contentDocument.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      if (iconLink && iconLink.href) {
        faviconUrl = iconLink.href;
      }
      
      // If no favicon found, try default favicon.ico
      if (!faviconUrl) {
        try {
          const pageUrl = new URL(iframe.src);
          faviconUrl = `${pageUrl.origin}/favicon.ico`;
        } catch (e) {
          // Invalid URL, use default
        }
      }
      
      // Update favicon if found
      if (faviconUrl) {
        favicon.src = faviconUrl;
        favicon.onerror = () => {
          // Fallback to default favicon on error
          favicon.src = "/favicon.png";
        };
      } else {
        favicon.src = "/favicon.png";
      }
    } catch (e) {
      // Fallback for cross-origin or other errors
      const favicon = tabElement.querySelector('.tab-favicon');
      if (favicon) {
        favicon.src = "/favicon.png";
      }
    }
  }
  
  function closeTab(event) {
    event.stopPropagation();
    const tabId = event.target.closest("li").dataset.tabId;
    const tabToRemove = tabList.querySelector(`[data-tab-id='${tabId}']`);
    const iframeToRemove = iframeContainer.querySelector(`[data-tab-id='${tabId}']`);
    if (tabToRemove && iframeToRemove) {
      tabToRemove.remove();
      iframeToRemove.remove();
      const remainingTabs = Array.from(tabList.querySelectorAll("li"));
      if (remainingTabs.length === 0) {
        tabCounter = 0;
        document.getElementById("iv").value = "";
        // Close the window when all tabs are closed
        if (window.electronAPI) {
          window.electronAPI.closeWindow();
        }
      } else {
        const nextTabIndex = remainingTabs.findIndex(tab => tab.dataset.tabId !== tabId);
        if (nextTabIndex > -1) {
          const nextTabToActivate = remainingTabs[nextTabIndex];
          const nextIframeToActivate = iframeContainer.querySelector(`[data-tab-id='${nextTabToActivate.dataset.tabId}']`);
          for (const tab of remainingTabs) {
            tab.classList.remove("active");
          }
          remainingTabs[nextTabIndex].classList.add("active");
          const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"));
          for (const iframe of allIframes) {
            iframe.classList.remove("active");
          }
          nextIframeToActivate.classList.add("active");
        }
      }
    }
  }
  function switchTab(event) {
    const tabId = event.target.closest("li").dataset.tabId;
    const allTabs = Array.from(tabList.querySelectorAll("li"));
    for (const tab of allTabs) {
      tab.classList.remove("active");
    }
    const allIframes = Array.from(iframeContainer.querySelectorAll("iframe"));
    for (const iframe of allIframes) {
      iframe.classList.remove("active");
    }
    const selectedTab = tabList.querySelector(`[data-tab-id='${tabId}']`);
    if (selectedTab) {
      selectedTab.classList.add("active");
      Load();
    } else {
      console.log("No selected tab found with ID:", tabId);
    }
    const selectedIframe = iframeContainer.querySelector(`[data-tab-id='${tabId}']`);
    if (selectedIframe) {
      selectedIframe.classList.add("active");
    } else {
      console.log("No selected iframe found with ID:", tabId);
    }
  }
  let dragTab = null;
  tabList.addEventListener("dragstart", event => {
    dragTab = event.target;
    dragTab.classList.add("dragging");
  });
  tabList.addEventListener("dragover", event => {
    event.preventDefault();
    const targetTab = event.target.closest("li");
    if (targetTab && targetTab !== dragTab) {
      targetTab.classList.add("drag-over");
      const targetIndex = Array.from(tabList.children).indexOf(targetTab);
      const dragIndex = Array.from(tabList.children).indexOf(dragTab);
      if (targetIndex < dragIndex) {
        tabList.insertBefore(dragTab, targetTab);
      } else {
        tabList.insertBefore(dragTab, targetTab.nextSibling);
      }
    }
  });
  tabList.addEventListener("dragleave", event => {
    const targetTab = event.target.closest("li");
    if (targetTab) {
      targetTab.classList.remove("drag-over");
    }
  });
  tabList.addEventListener("dragend", () => {
    if (dragTab) {
      dragTab.classList.remove("dragging");
    }
    document.querySelectorAll(".drag-over").forEach(tab => {
      tab.classList.remove("drag-over");
    });
    dragTab = null;
  });
  createNewTab();
  
  // Tab overflow handling
  function checkTabOverflow() {
    const leftSideNav = document.querySelector(".left-side-nav");
    const tabs = tabList.querySelectorAll("li");
    
    if (tabs.length > 0) {
      const firstTab = tabs[0];
      const lastTab = tabs[tabs.length - 1];
      
      // Check if tabs are overflowing
      const isOverflowing = tabList.scrollWidth > tabList.clientWidth;
      
      if (isOverflowing) {
        // Ensure active tab is visible
        const activeTab = tabList.querySelector("li.active");
        if (activeTab) {
          activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      }
    }
  }
  
  // Check overflow when tabs are added/removed
  const observer = new MutationObserver(() => {
    setTimeout(checkTabOverflow, 100);
  });
  observer.observe(tabList, { childList: true });
  
  // Check overflow on window resize
  window.addEventListener("resize", checkTabOverflow);

  // Window controls
  const minimizeBtn = document.getElementById("minimize-button");
  const maximizeBtn = document.getElementById("maximize-button");
  const closeBtn = document.getElementById("close-button");

  if (minimizeBtn) {
    minimizeBtn.addEventListener("click", () => {
      if (window.electronAPI) {
        window.electronAPI.minimizeWindow();
      }
    });
  }

  if (maximizeBtn) {
    maximizeBtn.addEventListener("click", () => {
      if (window.electronAPI) {
        window.electronAPI.maximizeWindow();
        // Update icon based on window state
        updateMaximizeIcon();
      }
    });
  }

  // Function to update maximize/restore icon based on window state
  async function updateMaximizeIcon() {
    if (window.electronAPI && maximizeBtn) {
      const isMaximized = await window.electronAPI.isWindowMaximized();
      const icon = maximizeBtn.querySelector("i");
      if (icon) {
        if (isMaximized) {
          icon.classList.remove("fa-square");
          icon.classList.add("fa-clone");
        } else {
          icon.classList.remove("fa-clone");
          icon.classList.add("fa-square");
        }
      }
    }
  }

  // Update icon when window is resized or focus changes
  if (window.electronAPI) {
    // Check window state on load
    setTimeout(updateMaximizeIcon, 100);
    
    // Update on window resize
    window.addEventListener("resize", () => {
      setTimeout(updateMaximizeIcon, 100);
    });
    
    // Update when window gains focus (handles dragging to maximize)
    window.addEventListener("focus", () => {
      setTimeout(updateMaximizeIcon, 100);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (window.electronAPI) {
        window.electronAPI.closeWindow();
      }
    });
  }

  // Window dragging functionality for drag area
  const dragArea = document.getElementById("drag-area");
  let isDragging = false;

  if (dragArea) {
    dragArea.addEventListener("mousedown", (e) => {
      // Check if the click is on an interactive element or within iframe bounds
      if (e.target.closest('.window-controls') || 
          e.target.closest('.left-side-nav') || 
          e.target.closest('#settings-btn')) {
        return; // Don't start drag if clicking on interactive elements
      }
      
      isDragging = true;
      if (window.electronAPI) {
        window.electronAPI.startDrag();
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        if (window.electronAPI) {
          window.electronAPI.stopDrag();
        }
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging && window.electronAPI) {
        // Stop dragging if mouse enters iframe area
        if (e.target.closest('iframe')) {
          isDragging = false;
          if (window.electronAPI) {
            window.electronAPI.stopDrag();
          }
          return;
        }
        // The actual dragging is handled by Electron's built-in functionality
        // when we call startDrag(), so we don't need to manually move the window here
      }
    });
  }
});
// Reload
function reload() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    // biome-ignore lint/correctness/noSelfAssign:
    activeIframe.src = activeIframe.src;
    Load();
  } else {
    console.error("No active iframe found");
  }
}

// Popout
function popout() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    const newWindow = window.open("about:blank", "_blank");
    if (newWindow) {
      const name = localStorage.getItem("name") || "My Drive - Google Drive";
      const icon = localStorage.getItem("icon") || "https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png";
      newWindow.document.title = name;
      const link = newWindow.document.createElement("link");
      link.rel = "icon";
      link.href = encodeURI(icon);
      newWindow.document.head.appendChild(link);

      const newIframe = newWindow.document.createElement("iframe");
      const style = newIframe.style;
      style.position = "fixed";
      style.top = style.bottom = style.left = style.right = 0;
      style.border = style.outline = "none";
      style.width = style.height = "100%";

      newIframe.src = activeIframe.src;

      newWindow.document.body.appendChild(newIframe);
    }
  } else {
    console.error("No active iframe found");
  }
}

function eToggle() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (!activeIframe) {
    console.error("No active iframe found");
    return;
  }
  const erudaWindow = activeIframe.contentWindow;
  if (!erudaWindow) {
    console.error("No content window found for the active iframe");
    return;
  }
  if (erudaWindow.eruda) {
    if (erudaWindow.eruda._isInit) {
      erudaWindow.eruda.destroy();
    } else {
      console.error("Eruda is not initialized in the active iframe");
    }
  } else {
    const erudaDocument = activeIframe.contentDocument;
    if (!erudaDocument) {
      console.error("No content document found for the active iframe");
      return;
    }
    const script = erudaDocument.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/eruda";
    script.onload = () => {
      if (!erudaWindow.eruda) {
        console.error("Failed to load Eruda in the active iframe");
        return;
      }
      erudaWindow.eruda.init();
      erudaWindow.eruda.show();
    };
    erudaDocument.head.appendChild(script);
  }
}
// Fullscreen
function FS() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    if (activeIframe.contentDocument.fullscreenElement) {
      activeIframe.contentDocument.exitFullscreen();
    } else {
      activeIframe.contentDocument.documentElement.requestFullscreen();
    }
  } else {
    console.error("No active iframe found");
  }
}
const fullscreenButton = document.getElementById("fullscreen-button");
fullscreenButton.addEventListener("click", FS);
// Home
function Home() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    activeIframe.src = "/home";
    activeIframe.dataset.tabUrl = "/home";
  } else {
    window.location.href = "/home";
  }
}
const homeButton = document.getElementById("home-page");
homeButton.addEventListener("click", Home);
// Back
function goBack() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    activeIframe.contentWindow.history.back();
    Load();
  } else {
    console.error("No active iframe found");
  }
}
// Forward
function goForward() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    activeIframe.contentWindow.history.forward();
    Load();
  } else {
    console.error("No active iframe found");
  }
}
if (navigator.userAgent.includes("Chrome")) {
  window.addEventListener("resize", () => {
    navigator.keyboard.lock(["Escape"]);
  });
}
function Load() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    // Only update URL bar if the iframe has finished loading
    if (activeIframe.contentWindow && activeIframe.contentWindow.document.readyState === "complete") {
      const website = activeIframe.contentWindow.document.location.href;
      if (website.includes("/a/")) {
        const websitePath = website.replace(window.location.origin, "").replace("/a/", "");
        localStorage.setItem("decoded", websitePath);
        const decodedValue = decodeXor(websitePath);
        document.getElementById("iv").value = decodedValue;
      } else if (website.includes("/a/q/")) {
        const websitePath = website.replace(window.location.origin, "").replace("/a/q/", "");
        const decodedValue = decodeXor(websitePath);
        localStorage.setItem("decoded", websitePath);
        document.getElementById("iv").value = decodedValue;
      } else {
        const websitePath = website.replace(window.location.origin, "");
        // Display corroded://settings for /config path
        if (websitePath === "/config") {
          document.getElementById("iv").value = "corroded://settings";
        } else if (websitePath === "/home") {
          document.getElementById("iv").value = "";
        } else {
          document.getElementById("iv").value = websitePath;
        }
        localStorage.setItem("decoded", websitePath);
      }
    } else {
      // If tab is still loading, preserve its intended URL from dataset
      if (activeIframe.dataset.tabUrl) {
        document.getElementById("iv").value = activeIframe.dataset.tabUrl;
      }
    }
  }
}
function decodeXor(input) {
  if (!input) {
    return input;
  }
  const [str, ...search] = input.split("?");
  return (
    decodeURIComponent(str)
      .split("")
      .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt(Number.NaN) ^ 2) : char))
      .join("") + (search.length ? `?${search.join("?")}` : "")
  );
}

// Download Management System
function initializeDownloads() {
  if (!window.electronAPI) {
    console.log('Electron API not available, downloads disabled');
    return;
  }
  
  console.log('Initializing download system...');
  
  // Create download bar if it doesn't exist
  createDownloadBar();
  
  // Set up download event listeners
  try {
    window.electronAPI.onDownloadStarted((download) => {
      console.log('Download started:', download);
      addDownloadItem(download);
    });
    
    window.electronAPI.onDownloadProgress((download) => {
      console.log('Download progress:', download);
      updateDownloadProgress(download);
    });
    
    window.electronAPI.onDownloadCompleted((download) => {
      console.log('Download completed:', download);
      completeDownload(download);
    });
    
    window.electronAPI.onDownloadCancelled((download) => {
      console.log('Download cancelled:', download);
      removeDownloadItem(download.id);
    });
    
    // Listen for tab close request when download starts
    window.electronAPI.onCloseDownloadingTab(() => {
      console.log('Closing downloading tab...');
      closeActiveTab();
    });
  } catch (error) {
    console.error('Error setting up download listeners:', error);
  }
}

function createDownloadBar() {
  // Check if download bar already exists
  if (document.getElementById('download-bar')) {
    console.log('Download bar already exists');
    return;
  }
  
  const navBar = document.querySelector('.nav-bar');
  if (!navBar) {
    console.error('Navigation bar not found, cannot create download bar');
    return;
  }
  
  console.log('Creating download bar...');
  
  const downloadBar = document.createElement('div');
  downloadBar.id = 'download-bar';
  downloadBar.className = 'download-bar';
  downloadBar.innerHTML = `
    <div class="download-bar-header">
      <span class="download-bar-title">Downloads</span>
      <button class="download-bar-toggle" onclick="toggleDownloadBar()">
        <i class="fas fa-chevron-down"></i>
      </button>
    </div>
    <div class="download-list" id="download-list"></div>
  `;
  
  // Insert download bar after the navigation bar
  navBar.parentNode.insertBefore(downloadBar, navBar.nextSibling);
  console.log('Download bar created successfully');
}

function addDownloadItem(download) {
  console.log('Adding download item:', download);
  
  const downloadList = document.getElementById('download-list');
  if (!downloadList) {
    console.error('Download list not found');
    return;
  }
  
  const downloadItem = document.createElement('div');
  downloadItem.className = 'download-item';
  downloadItem.id = `download-${download.id}`;
  downloadItem.dataset.state = download.state || 'progressing';
  
  const progressPercent = download.totalBytes > 0 ? 
    Math.round((download.receivedBytes / download.totalBytes) * 100) : 0;
  
  const statusIcon = download.state === 'completed' ? 'fa-check-circle' : 
                     download.state === 'interrupted' ? 'fa-exclamation-circle' : 
                     'fa-download';
  
  downloadItem.innerHTML = `
    <div class="download-icon">
      <i class="fas ${statusIcon}"></i>
    </div>
    <div class="download-content">
      <div class="download-filename">${download.filename}</div>
      <div class="download-status">
        <span class="download-progress-text">${download.state === 'completed' ? 'Completed' : `${progressPercent}%`}</span>
        <span class="download-speed">${download.state === 'completed' ? '' : formatSpeed(download.speed)}</span>
      </div>
      <div class="download-progress-bar">
        <div class="download-progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    </div>
    <div class="download-actions">
      <button class="download-cancel" onclick="cancelDownload(${download.id})" title="${download.state === 'completed' ? 'Remove' : 'Cancel'}">
        <i class="fas ${download.state === 'completed' ? 'fa-times' : 'fa-times-circle'}"></i>
      </button>
    </div>
  `;
  
  downloadList.appendChild(downloadItem);
  
  // Show download bar if hidden
  const downloadBar = document.getElementById('download-bar');
  if (downloadBar) {
    downloadBar.classList.add('visible');
    console.log('Download bar made visible');
  } else {
    console.error('Download bar not found when trying to show it');
  }
}

function updateDownloadProgress(download) {
  const downloadItem = document.getElementById(`download-${download.id}`);
  if (!downloadItem) return;
  
  const progressPercent = download.totalBytes > 0 ? 
    Math.round((download.receivedBytes / download.totalBytes) * 100) : 0;
  
  const progressText = downloadItem.querySelector('.download-progress-text');
  const speedText = downloadItem.querySelector('.download-speed');
  const progressFill = downloadItem.querySelector('.download-progress-fill');
  
  if (progressText) progressText.textContent = `${progressPercent}%`;
  if (speedText) speedText.textContent = formatSpeed(download.speed);
  if (progressFill) progressFill.style.width = `${progressPercent}%`;
}

function completeDownload(download) {
  const downloadItem = document.getElementById(`download-${download.id}`);
  if (!downloadItem) return;
  
  const progressText = downloadItem.querySelector('.download-progress-text');
  const speedText = downloadItem.querySelector('.download-speed');
  const progressFill = downloadItem.querySelector('.download-progress-fill');
  const cancelButton = downloadItem.querySelector('.download-cancel');
  
  if (progressText) {
    progressText.textContent = download.state === 'completed' ? 'Completed' : 'Failed';
  }
  if (speedText) speedText.textContent = '';
  if (progressFill) progressFill.style.width = '100%';
  
  // Change cancel button to remove button
  if (cancelButton) {
    cancelButton.onclick = () => removeDownloadItem(download.id);
    cancelButton.innerHTML = '<i class="fas fa-check"></i>';
  }
  
  // Auto-remove completed downloads after 5 seconds
  if (download.state === 'completed') {
    setTimeout(() => {
      removeDownloadItem(download.id);
    }, 5000);
  }
}

function removeDownloadItem(downloadId) {
  const downloadItem = document.getElementById(`download-${downloadId}`);
  if (downloadItem) {
    downloadItem.remove();
    
    // Hide download bar if no more downloads
    const downloadList = document.getElementById('download-list');
    if (downloadList && downloadList.children.length === 0) {
      const downloadBar = document.getElementById('download-bar');
      if (downloadBar) {
        downloadBar.classList.remove('visible');
      }
    }
  }
}

function toggleDownloadBar() {
  const downloadBar = document.getElementById('download-bar');
  if (downloadBar) {
    downloadBar.classList.toggle('collapsed');
  }
}

function formatSpeed(bytesPerSecond) {
  if (bytesPerSecond === 0) return '';
  
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  let size = bytesPerSecond;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function closeActiveTab() {
  const activeTab = document.querySelector("#tab-list li.active");
  const activeIframe = document.querySelector("#frame-container iframe.active");
  
  if (activeTab && activeIframe) {
    console.log('Closing active tab:', activeTab.dataset.tabId);
    
    // Remove the tab and iframe
    activeTab.remove();
    activeIframe.remove();
    
    // Check if there are remaining tabs
    const remainingTabs = Array.from(document.querySelectorAll("#tab-list li"));
    if (remainingTabs.length === 0) {
      // Create a new tab if all tabs are closed
      createNewTab();
    } else {
      // Activate the next available tab
      const nextTab = remainingTabs[remainingTabs.length - 1]; // Get the last tab
      const nextIframe = document.querySelector(`#frame-container iframe[data-tab-id='${nextTab.dataset.tabId}']`);
      
      // Remove active class from all tabs and iframes
      document.querySelectorAll("#tab-list li").forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll("#frame-container iframe").forEach(iframe => {
        iframe.classList.remove('active');
      });
      
      // Add active class to the selected tab and iframe
      nextTab.classList.add('active');
      if (nextIframe) {
        nextIframe.classList.add('active');
        Load(); // Update URL bar
      }
    }
  } else {
    console.log('No active tab found to close');
  }
}

function cancelDownload(downloadId) {
  console.log('Cancelling download:', downloadId);
  
  // Call the main process to cancel the download
  window.electronAPI.cancelDownload(downloadId)
    .then(result => {
      if (result.success) {
        console.log('Download cancelled successfully');
        // The UI will be updated by the download-cancelled event listener
      } else {
        console.error('Failed to cancel download:', result.error);
        // Fallback: just remove the UI element
        removeDownloadItem(downloadId);
      }
    })
    .catch(error => {
      console.error('Error cancelling download:', error);
      // Fallback: just remove the UI element
      removeDownloadItem(downloadId);
    });
}
