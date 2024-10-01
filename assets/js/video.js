console.log("JS is Running...");

const video = document.getElementById('videoPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const qualitySelect = document.getElementById('quality');
const speedSelect = document.getElementById('speed');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const episodeListContainer = document.getElementById('episodeList'); // For displaying episodes

let currentSources = []; // Store the video sources fetched from the server
let subAnimeInfo = null; // Store subbed anime info
let dubAnimeInfo = null; // Store dubbed anime info

// Update play/pause button state
function updatePlayPauseButton() {
    if (video.paused) {
        playPauseBtn.textContent = '►'; // Play icon
    } else {
        playPauseBtn.textContent = '❚❚'; // Pause icon
    }
}

// Play/Pause functionality
playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
});

// Listen for play and pause events to update the button automatically
video.addEventListener('play', updatePlayPauseButton);
video.addEventListener('pause', updatePlayPauseButton);

// Update progress bar and current time
video.addEventListener('timeupdate', () => {
    const currentProgress = (video.currentTime / video.duration) * 100;
    progressBar.value = currentProgress;

    // Update time displays
    const currentMinutes = Math.floor(video.currentTime / 60);
    const currentSeconds = Math.floor(video.currentTime % 60);
    const durationMinutes = Math.floor(video.duration / 60);
    const durationSeconds = Math.floor(video.duration % 60);

    currentTimeDisplay.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
    durationDisplay.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
});

// Seek video based on progress bar change
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * video.duration;
    video.currentTime = seekTime;
});

// Quality selection
qualitySelect.addEventListener('change', () => {
    const selectedQuality = qualitySelect.value;
    const selectedSource = currentSources.find(source => source.quality === selectedQuality);
    if (selectedSource) {
        playVideo(selectedSource.url, selectedSource.isM3U8);
    } else {
        alert('Selected quality is not available.');
    }
});

// Speed control
speedSelect.addEventListener('change', () => {
    video.playbackRate = parseFloat(speedSelect.value);
});

// Fullscreen toggle
fullscreenBtn.addEventListener('click', () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.mozRequestFullScreen) { // Firefox
        video.mozRequestFullScreen();
    } else if (video.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) { // IE/Edge
        video.msRequestFullscreen();
    }
});

// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get the episodeId and id from the URL
const episodeId = getQueryParam('episodeId');
const id = getQueryParam('id');
console.log("Episode ID:", episodeId);
console.log("Anime ID:", id);

// Function to fetch anime info
async function fetchAnimeInfo(animeId) {
    try {
        const response = await fetch(`http://localhost:3000/anime/gogoanime/info/${animeId}`);
        if (!response.ok) {
            console.error("Error fetching anime info:", response.statusText);
            return null; // Return null if the request fails
        }
        const animeInfo = await response.json();
        console.log("Fetched Anime Info:", animeInfo);

        return animeInfo; // Return anime info for further use
    } catch (error) {
        console.error("Error fetching anime info:", error);
        return null; // Return null on fetch error
    }
}

// Button to toggle between sub and dub
const subDubButton = document.getElementById('subDubButton');
subDubButton.addEventListener('click', async () => {
    const currentMode = subDubButton.textContent.trim().toLowerCase();

    if (currentMode === 'dub') {
        // Switch to dub
        let dubId = `${id}-dub`; // Add 'dub' to the end of the ID

        // Special case for "fairy-tail-100-years-quest"
        if (id === "fairy-tail-100-years-quest") {
            dubId = "fairy-tail-100-nen-quest-dub"; // Replace 'years' with 'nen'
        }

        // Fetch dub anime info
        await fetchDubAnimeInfo(dubId);

    } else {
        // Switch to sub
        subDubButton.textContent = 'Dub';
        displayEpisodeList(subAnimeInfo.episodes, 'sub');

        const lastSubEpisode = subAnimeInfo.episodes[subAnimeInfo.episodes.length - 1];
        console.log("Last Sub Episode:", lastSubEpisode);
        await fetchVideoData(lastSubEpisode.id);
    }
});

// Function to fetch dub anime info
async function fetchDubAnimeInfo(dubId) {
    dubAnimeInfo = await fetchAnimeInfo(dubId);
    if (dubAnimeInfo && dubAnimeInfo.episodes) {
        displayEpisodeList(dubAnimeInfo.episodes, 'dub');

        // Automatically set the button to 'Sub' when dub data is loaded
        subDubButton.textContent = 'Sub';

        // Automatically play the last dub episode
        const lastDubEpisode = dubAnimeInfo.episodes[dubAnimeInfo.episodes.length - 1];
        console.log("Last Dub Episode:", lastDubEpisode);
        await fetchVideoData(lastDubEpisode.id);
    } else {
        alert('Dub version not available.');
        subDubButton.textContent = 'Dub'; // Revert back if no dub is available
    }
}

// Initial setting: default to sub
subDubButton.textContent = 'Dub';

// Fetch video data and server data for the episode
fetchVideoData(episodeId);
fetchServerData(episodeId);

// Fetch sub anime info and display the sub episode list on page load
fetchAnimeInfo(id).then(animeInfo => {
    subAnimeInfo = animeInfo;
    displayEpisodeList(subAnimeInfo.episodes, 'sub');

    // Automatically set the button to 'Dub' when sub data is loaded
    subDubButton.textContent = 'Dub';
});

// Function to fetch video data remains the same
async function fetchVideoData(id) {
    try {
        const response = await fetch(`http://localhost:3000/anime/gogoanime/watch/${id}`);
        const data = await response.json();
        console.log("Fetched Video Data:", data);

        // Check if the data contains sources
        if (data && data.sources && data.sources.length > 0) {
            currentSources = data.sources;
            const highestQualitySource = data.sources.find(source => source.quality === "1080p") || data.sources[0];
            playVideo(highestQualitySource.url, highestQualitySource.isM3U8);
        } else {
            console.error("No video data found for this episode.");
        }
    } catch (error) {
        console.error("Error fetching video data:", error);
    }
}

function playVideo(sourceUrl, isM3U8) {
    const videoPlayer = document.getElementById('videoPlayer');

    // Remove any existing source
    while (videoPlayer.firstChild) {
        videoPlayer.removeChild(videoPlayer.firstChild);
    }

    // Add an event listener to play after the metadata is loaded
    videoPlayer.addEventListener('loadedmetadata', function() {
        videoPlayer.play().catch(error => {
            console.error("Error playing video:", error);
        });
    }, { once: true }); // Ensure the listener is called only once

    if (isM3U8) {
        // Use HLS.js for playing .m3u8 streams
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(videoPlayer);
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            // For Safari browsers that support HLS natively
            videoPlayer.src = sourceUrl;
        }
    } else {
        // Set MP4 source for non-HLS files
        const sourceElement = document.createElement('source');
        sourceElement.src = sourceUrl;
        sourceElement.type = 'video/mp4';
        videoPlayer.appendChild(sourceElement);
        videoPlayer.load(); // Load the new source into the player
    }
}

// Function to fetch server data
async function fetchServerData(id) {
    try {
        const response = await fetch(`http://localhost:3000/anime/gogoanime/servers/${id}`);
        const servers = await response.json();
        console.log("Fetched Servers Data:", servers);
        displayServers(servers);
    } catch (error) {
        console.error("Error fetching servers:", error);
    }
}

// Display episode list and attach event listeners to episode links
function displayEpisodeList(episodes, mode) {
    episodeListContainer.innerHTML = ''; // Clear previous list
    episodes.forEach(episode => {
        const episodeItem = document.createElement('div');
        episodeItem.textContent = `${mode.toUpperCase()} - Episode ${episode.number}`;
        episodeItem.classList.add('episode-item');
        episodeItem.addEventListener('click', async () => {
            console.log(`Fetching video data for episode ${episode.number}...`);
            await fetchVideoData(episode.id);
        });
        episodeListContainer.appendChild(episodeItem);
    });
}

// Function to display available servers remains unchanged
function displayServers(servers) {
    const serverList = document.getElementById('serverList');
    serverList.innerHTML = ''; // Clear the previous list

    servers.forEach(server => {
        const serverItem = document.createElement('div');
        serverItem.textContent = server.name;
        serverItem.classList.add('server-item');
        serverItem.addEventListener('click', () => {
            playVideo(server.url, server.isM3U8);
        });
        serverList.appendChild(serverItem);
    });
}
