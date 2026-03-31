// Ads
// settings.js
document.addEventListener("DOMContentLoaded", () => {
  function adChange(selectedValue) {
    if (selectedValue === "default") {
      localStorage.setItem("ads", "on");
    } else if (selectedValue === "popups") {
      localStorage.setItem("ads", "popups");
    } else if (selectedValue === "off") {
      localStorage.setItem("ads", "off");
    }
  }

  const adTypeElement = document.getElementById("adType");

  if (adTypeElement) {
    adTypeElement.addEventListener("change", function () {
      const selectedOption = this.value;
      adChange(selectedOption);
    });

    const storedAd = localStorage.getItem("ads");
    if (storedAd === "on") {
      adTypeElement.value = "default";
    } else if (storedAd === "popups") {
      adTypeElement.value = "popups";
    } else if (storedAd === "off") {
      adTypeElement.value = "off";
    } else {
      adTypeElement.value = "default";
    }
  }

});



// Theme Selector
document.addEventListener("DOMContentLoaded", () => {
  // Set active theme on page load
  const currentTheme = localStorage.getItem("theme") || "Earth";
  updateActiveTheme(currentTheme);
});

function themeChange(themeName) {
  console.log("Theme change triggered for:", themeName);
  
  // Use the new theme manager
  if (window.themeManager) {
    window.themeManager.switchTheme(themeName);
  } else if (typeof ThemeManager !== 'undefined') {
    ThemeManager.changeTheme(themeName);
  } else {
    // Fallback - use existing switchTheme function
    if (typeof switchTheme === 'function') {
      switchTheme(themeName);
    } else {
      // Last resort - reload page to apply theme
      localStorage.setItem("theme", themeName);
      location.reload();
    }
  }
  
  // Update active theme styling
  updateActiveTheme(themeName);
}

function updateActiveTheme(themeName) {
  // Remove active class from all theme options
  const themeOptions = document.querySelectorAll('.theme-option');
  themeOptions.forEach(option => {
    option.classList.remove('active');
  });
  
  // Add active class to the selected theme
  const selectedOption = document.querySelector(`[data-theme="${themeName}"]`);
  if (selectedOption) {
    selectedOption.classList.add('active');
  }
}

function saveIcon() {
  const iconElement = document.getElementById("icon");
  const iconValue = iconElement.value;
  console.log("saveIcon function called with icon value:", iconValue);
  localStorage.setItem("icon", iconValue);
}

function saveName() {
  const nameElement = document.getElementById("name");
  const nameValue = nameElement.value;
  console.log("saveName function called with name value:", nameValue);
  localStorage.setItem("name", nameValue);
}


function redirectToMainDomain() {
  const currentUrl = window.location.href;
  const mainDomainUrl = currentUrl.replace(/\/[^\/]*$/, "");
  const target = mainDomainUrl + window.location.pathname;
  if (window !== top) {
    try {
      top.location.href = target;
    } catch {
      try {
        parent.location.href = target;
      } catch {
        window.location.href = target;
      }
    }
  } else window.location.href = mainDomainUrl + window.location.pathname;
}


// Particle System
const particleSystemSwitch = document.getElementById("particle-system");

if (window.localStorage.getItem("particle-system") !== "") {
  if (window.localStorage.getItem("particle-system") === "true") {
    particleSystemSwitch.checked = true;
  } else {
    particleSystemSwitch.checked = false;
  }
}

particleSystemSwitch.addEventListener("change", event => {
  if (event.currentTarget.checked) {
    window.localStorage.setItem("particle-system", "true");
    if (typeof initAudioVisualizer === 'function') {
      initAudioVisualizer();
    }
  } else {
    window.localStorage.setItem("particle-system", "false");
    if (typeof stopAudioVisualizer === 'function') {
      stopAudioVisualizer();
    }
  }
});

// Discord RPC Setting
const discordRpcSwitch = document.getElementById("discord-rpc");

if (window.localStorage.getItem("discord-rpc") !== "") {
  if (window.localStorage.getItem("discord-rpc") === "true") {
    discordRpcSwitch.checked = true;
  } else {
    discordRpcSwitch.checked = false;
  }
} else {
  // Default to on
  window.localStorage.setItem("discord-rpc", "true");
  discordRpcSwitch.checked = true;
}

discordRpcSwitch.addEventListener("change", async event => {
  if (event.currentTarget.checked) {
    window.localStorage.setItem("discord-rpc", "true");
    // Notify main process to enable Discord RPC
    if (window.electronAPI && window.electronAPI.setDiscordRpcEnabled) {
      await window.electronAPI.setDiscordRpcEnabled(true);
    }
  } else {
    window.localStorage.setItem("discord-rpc", "false");
    // Notify main process to disable Discord RPC
    if (window.electronAPI && window.electronAPI.setDiscordRpcEnabled) {
      await window.electronAPI.setDiscordRpcEnabled(false);
    }
  }
});


