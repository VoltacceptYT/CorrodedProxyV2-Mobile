// index.js
window.addEventListener("load", () => {
  navigator.serviceWorker.register("../sw.js?v=2025-04-15", {
    scope: "/a/",
  });
});

let xl;

try {
  xl = window.top.location.pathname === "/d";
} catch {
  try {
    xl = window.parent.location.pathname === "/d";
  } catch {
    xl = false;
  }
}

const form = document.getElementById("fv");
const input = document.getElementById("iv");

if (form && input) {
  form.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      if (xl) processUrl(input.value, "");
      else processUrl(input.value, "/");
    } catch {
      processUrl(input.value, "/");
    }
  });
}
function processUrl(value, path) {
  let url = value.trim();
  
  // Handle corroded:// URLs
  if (url === "corroded://newtab") {
    window.location.href = "/home";
    return;
  }
  
  if (url === "corroded://settings") {
    window.location.href = "/config";
    return;
  }
  
  const searchUrl = "https://duckduckgo.com/?q=";

  if (!isUrl(url)) {
    url = searchUrl + url;
  } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
    url = `https://${url}`;
  }

  sessionStorage.setItem("GoUrl", __uv$config.encodeUrl(url));
  window.location.href = `/a/q/${__uv$config.encodeUrl(url)}`;
}

function go(value) {
  processUrl(value, "/d");
}

function blank(value) {
  processUrl(value);
}

function dy(value) {
  processUrl(value, `/a/q/${__uv$config.encodeUrl(value)}`);
}

function isUrl(val = "") {
  if (/^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ")) {
    return true;
  }
  return false;
}

// Music Feed Functionality
let allSongs = [];
let currentIndex = 0;
const songsPerLoad = 15;

async function loadMusic() {
  const musicContainer = document.getElementById('news-container');
  
  if (!musicContainer) return; // Only run on newtab page
  
  try {
    const response = await fetch(window.CONFIG.SPOTIFY_API_ENDPOINT);
    const data = await response.json();
    
    console.log('Music API Response:', data);
    
    allSongs = [];
    
    if (data.feed && data.feed.results) {
      data.feed.results.forEach((song, index) => {
        // Only include country songs
        const isCountry = song.genres && song.genres.some(genre => 
          genre.name.toLowerCase().includes('country')
        );
        
        if (isCountry) {
          allSongs.push({
            rank: allSongs.length + 1,
            title: song.name,
            artist: song.artistName,
            artwork: song.artworkUrl1024 || song.artworkUrl100 || song.artworkUrl60,
            url: song.url,
            genre: song.genres && song.genres.length > 0 ? song.genres[0].name : 'Music',
            releaseDate: song.releaseDate
          });
        }
      });
    }
    
    if (allSongs.length > 0) {
      currentIndex = 0;
      musicContainer.innerHTML = ''; // Clear existing content
      loadMoreSongs();
      
      // Add scroll event listener for infinite loading
      window.addEventListener('scroll', handleScroll);
    } else {
      throw new Error('No songs found');
    }
    
  } catch (error) {
    console.error('Error loading music:', error);
    // Show error message instead of fallback
    const musicContainer = document.getElementById('news-container');
    musicContainer.innerHTML = '<div class="news-loading">Error Loading Top Country Songs...</div>';
  }
}

function loadMoreSongs() {
  const musicContainer = document.getElementById('news-container');
  const endIndex = Math.min(currentIndex + songsPerLoad, allSongs.length);
  const songsToLoad = allSongs.slice(currentIndex, endIndex);
  
  if (songsToLoad.length > 0) {
    displaySongs(songsToLoad, false); // false = don't clear container
    currentIndex = endIndex;
  }
}

function handleScroll() {
  if (currentIndex >= allSongs.length) return; // All songs loaded
  
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.offsetHeight;
  
  // Load more when user is within 500px of bottom
  if (scrollPosition >= documentHeight - 500) {
    loadMoreSongs();
  }
}

function displaySongs(songs, clearContainer = true) {
  const musicContainer = document.getElementById('news-container');
  
  if (!songs || songs.length === 0) {
    if (clearContainer) {
      musicContainer.innerHTML = '<div class="news-loading">No songs available.</div>';
    }
    return;
  }

  const musicHTML = songs.map(song => {
    return `
      <a href="${song.url}" target="_blank" class="news-item">
        <div class="song-rank">#${song.rank}</div>
        <div class="news-image-container">
          <img src="${song.artwork}" alt="${song.title} by ${song.artist}" class="news-image" />
        </div>
        <div class="news-content">
          <h3>${song.title}</h3>
          <p class="song-artist">${song.artist}</p>
          <div class="news-meta">
            <span class="song-genre">${song.genre}</span>
            <span class="news-time">${new Date(song.releaseDate).getFullYear()}</span>
          </div>
        </div>
      </a>
    `;
  }).join('');

  if (clearContainer) {
    musicContainer.innerHTML = musicHTML;
  } else {
    musicContainer.innerHTML += musicHTML;
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  
  return "Just now";
}

// Load music when page loads
document.addEventListener('DOMContentLoaded', loadMusic);

// Refresh music every 5 minutes
setInterval(loadMusic, 300000);
