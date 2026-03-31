const CONFIG = {
  SPOTIFY_API_ENDPOINT: 'https://api.allorigins.win/raw?url=https://rss.marketingtools.apple.com/api/v2/us/music/most-played/100/songs.json'
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else {
  window.CONFIG = CONFIG;
}
