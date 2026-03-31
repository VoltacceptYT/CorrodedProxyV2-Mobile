// main.js
let qp;

try {
  qp = window.top.location.pathname === "/d";
} catch {
  try {
    qp = window.parent.location.pathname === "/d";
  } catch {
    qp = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Particle System if enabled
  if (localStorage.getItem("particle-system") === "true") {
    setTimeout(() => {
      if (typeof initAudioVisualizer === 'function') {
        initAudioVisualizer();
      }
    }, 1000);
  }

  // Blocked Hostnames Check

  const nav = document.querySelector(".f-nav");

  if (nav) {
    const themeId = localStorage.getItem("theme");
    let LogoUrl = "/assets/media/favicon/main.png";
    if (themeId === "Earth") {
      LogoUrl = "/assets/media/favicon/main.png";
    }
    if (themeId === "Virellus") {
      LogoUrl = "/assets/media/favicon/main.png";
    }
    if (themeId === "Neptune") {
      LogoUrl = "/assets/media/favicon/main.png";
    }
    if (themeId === "Mars") {
      LogoUrl = "/assets/media/favicon/main.png";
    }
    if (themeId === "Solar") {
      LogoUrl = "/assets/media/favicon/main.png";
    }
    const html = `
      <div id="icon-container">
        <a class="icon" href="/./home"><img alt="nav" id="INImg" src="${LogoUrl}"/></a>
      </div>
      <div class="f-nav-right">
        <a class="navbar-link" href="#" onclick="openSettings(); return false;"><i class="fa-solid fa-gear navbar-icon settings-icon"></i><an>&#83;&#101;&#116;</an><an>&#116;&#105;&#110;&#103;</an></a>
      </div>`;
    nav.innerHTML = html;
  }

  // LocalStorage Setup for 'dy'
  if (localStorage.getItem("dy") === null || localStorage.getItem("dy") === undefined) {
    localStorage.setItem("dy", "true");
  }

  // Theme Logic
  const themeid = localStorage.getItem("theme");
  const themeEle = document.createElement("link");
  themeEle.rel = "stylesheet";
  const themes = {
    Earth: "/assets/css/themes/Earth.css?v=00",
    Virellus: "/assets/css/themes/Virellus.css?v=00",
    Neptune: "/assets/css/themes/Neptune.css?v=00",
    Mars: "/assets/css/themes/Mars.css?v=00",
    Solar: "/assets/css/themes/Solar.css?v=00",
  };

  if (themes[themeid]) {
    themeEle.href = themes[themeid];
    document.body.appendChild(themeEle);
  } else {
    const customThemeEle = document.createElement("style");
    customThemeEle.textContent = localStorage.getItem(`theme-${themeid}`);
    document.head.appendChild(customThemeEle);
  }

  });

// Function to switch themes dynamically without restart
function switchTheme(themeName) {
  const themes = {
    Earth: "/assets/css/themes/Earth.css?v=00",
    Virellus: "/assets/css/themes/Virellus.css?v=00",
    Neptune: "/assets/css/themes/Neptune.css?v=00",
    Mars: "/assets/css/themes/Mars.css?v=00",
    Solar: "/assets/css/themes/Solar.css?v=00",
  };

  // Remove existing theme stylesheets
  const existingThemeLinks = document.querySelectorAll('link[rel="stylesheet"][href*="themes"]');
  existingThemeLinks.forEach(link => link.remove());
  
  // Remove existing custom theme styles
  const existingCustomStyles = document.querySelectorAll('style[data-theme-custom]');
  existingCustomStyles.forEach(style => style.remove());

  if (themes[themeName]) {
    // Add new theme stylesheet
    const themeEle = document.createElement("link");
    themeEle.rel = "stylesheet";
    themeEle.href = themes[themeName];
    themeEle.id = "theme-css";
    document.head.appendChild(themeEle);
    
    // Update localStorage
    localStorage.setItem("theme", themeName);
    
    // Update nav logo if needed
    updateNavLogo(themeName);
  } else {
    // Handle custom theme
    const customThemeEle = document.createElement("style");
    customThemeEle.setAttribute("data-theme-custom", "true");
    customThemeEle.textContent = localStorage.getItem(`theme-${themeName}`);
    document.head.appendChild(customThemeEle);
    
    // Update localStorage
    localStorage.setItem("theme", themeName);
  }
}

// Function to update navigation logo based on theme
function updateNavLogo(themeName) {
  const navImg = document.getElementById("INImg");
  if (navImg) {
    let LogoUrl = "/assets/media/favicon/main.png";
    if (themeName === "Earth") {
      LogoUrl = "/assets/media/favicon/main.png";
    } else if (themeName === "Virellus") {
      LogoUrl = "/assets/media/favicon/main.png";
    } else if (themeName === "Neptune") {
      LogoUrl = "/assets/media/favicon/main.png";
    } else if (themeName === "Mars") {
      LogoUrl = "/assets/media/favicon/main.png";
    } else if (themeName === "Solar") {
      LogoUrl = "/assets/media/favicon/main.png";
    }
    navImg.src = LogoUrl;
  }
}

// Function to open settings in new tab
function openSettings() {
  const activeIframe = document.querySelector("#frame-container iframe.active");
  if (activeIframe) {
    activeIframe.src = "/config";
    activeIframe.dataset.tabUrl = "/config";
  } else {
    window.location.href = "/config";
  }
}
