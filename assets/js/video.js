document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    let animeId = urlParams.get('id');
    let episodeId = urlParams.get('episodeId');
    if (episodeId) {
        fetchVideoData(episodeId);  // Automatically fetch and play the episode
    }

    let isDub = animeId.includes('-dub');
    const episodesPerPage = 50;
    let currentPage = 1;

    // Create and append Sub/Dub buttons
    const subButton = createButton('Sub', 'sub-button');
    const dubButton = createButton('Dub', 'dub-button');
    document.querySelector('.subdub-container').append(subButton, dubButton);

    // Fetch and display anime info on page load
    if (animeId) fetchAnimeInfo(animeId, currentPage);

    // // Centralized error handling
    // function handleError(error, message = 'An error occurred') {
    //     console.error(`${message}: `, error);
    //     alert(message); // Optional, to alert users of the error
    // }

    // Fetch anime info and display episode list
    async function fetchAnimeInfo(animeId, page) {
        const infoUrl = `https://anyplay.vercel.app/anime/gogoanime/info/${animeId}`;
        try {
            const response = await fetch(infoUrl);
            const animeInfo = await response.json();
            console.log(animeInfo);

            updateButtonState(); // Highlight sub or dub button
            displayAnimeInfo(animeInfo); // Display title and description
            displayEpisodesWithPagination(animeInfo.episodes, page); // Display episode list with pagination

            return animeInfo; // Return animeInfo so it can be used elsewhere

        } catch (error) {
            handleError(error, 'Error fetching anime info');
        }
    }


    // Display anime title and description along with current episode number
    function displayAnimeInfo(animeInfo) {
        const infoContainer = document.querySelector('.anime-info');

        // Find the currently playing episode number using the episodeId
        const currentEpisode = animeInfo.episodes.find(episode => episode.id === episodeId);
        const currentEpisodeNumber = currentEpisode ? currentEpisode.number : ''; // Fallback to empty string if not found

        infoContainer.innerHTML = `
        <div class="img"><img src="${animeInfo.image}"></div>
        <div class="anime-title">
        <p>${animeInfo.title} ${currentEpisodeNumber ? ` - Episode ${currentEpisodeNumber}` : ''}</p>
        </div>
        `;
    }


    // Display episodes with pagination
    function displayEpisodesWithPagination(episodes, page) {
        const episodeList = document.querySelector('.episode-list');
        episodeList.innerHTML = ''; // Clear existing episodes

        const paginatedEpisodes = episodes.slice((page - 1) * episodesPerPage, page * episodesPerPage);
        const fragment = document.createDocumentFragment(); // Using fragment to minimize DOM updates

        paginatedEpisodes.forEach(episode => {
            const episodeItem = createEpisodeItem(episode);
            fragment.appendChild(episodeItem);
        });

        episodeList.appendChild(fragment); // Append all episode items at once
        createPaginationButtons(episodes.length, page); // Add pagination if needed
    }

    // Create individual episode list item
    function createEpisodeItem(episode) {
        const episodeItem = document.createElement('li');
        episodeItem.innerText = `${animeId} - ${episode.number}`;
        episodeItem.dataset.episodeId = episode.id;

        if (episode.id === episodeId) episodeItem.classList.add('playing'); // Highlight current episode

        return episodeItem;
    }

    // Event delegation for episode list
    document.querySelector('.episode-list').addEventListener('click', (event) => {
        const episodeItem = event.target.closest('li');
        if (episodeItem) {
            episodeId = episodeItem.dataset.episodeId;
            fetchVideoData(episodeId);
            updateAnimeIdInURL(animeId, episodeId); // Update URL with new episode
            highlightPlayingEpisode(episodeItem); // Highlight selected episode

            // Scroll to video player
            scrollToVideoPlayer(); // Scroll the page to the video player
        }
    });

    // Function to scroll to the video player
    function scrollToVideoPlayer() {
        const videoPlayer = document.querySelector('.main-video');
        videoPlayer.scrollIntoView({
            behavior: 'smooth', // Smooth scrolling
            block: 'start' // Scroll to the top of the video player
        });
    }


    // Fetch video data for the selected episode and auto-play
    async function fetchVideoData(episodeId) {
        const videoUrl = `https://anyplay.vercel.app/anime/gogoanime/watch/${episodeId}`;
        try {
            const response = await fetch(videoUrl);
            const videoData = await response.json();

            console.log(videoData); // Log video data for verification

            loadVideoSources(videoData.sources);
            addQualityOptions(videoData.sources); // Populate quality settings with available options

            // Create and display the download button with the correct URL
            createDownloadButton(videoData.download);

            // Auto-play the video after loading sources
            const mainVideo = document.querySelector('.main-video');
            mainVideo.play(); // Automatically start playing the video

            // Fetch anime info and update the title with the current episode
            const animeId = new URLSearchParams(window.location.search).get('id');
            const animeInfo = await fetchAnimeInfo(animeId, currentPage); // Get anime info

            // Update the title with the current episode
            updateCurrentEpisodeInfo(episodeId, animeInfo);

        } catch (error) {
            handleError(error, 'Error fetching video data');
        }
    }


    // Update the title to reflect the current episode being played
    function updateCurrentEpisodeInfo(episodeId, animeInfo) {
        // Find the currently playing episode number using the episodeId
        const currentEpisode = animeInfo.episodes.find(episode => episode.id === episodeId);
        const currentEpisodeNumber = currentEpisode ? currentEpisode.number : ''; // Fallback to empty string if not found

        // Update the title with the current episode number
        const titleElement = document.querySelector('.anime-info p');
        titleElement.innerHTML = `${animeInfo.title} ${currentEpisodeNumber ? ` - Episode ${currentEpisodeNumber}` : ''}`;
    }


    // Function to create and display the download button
    function createDownloadButton(downloadUrl) {
        const downloadContainer = document.querySelector('.download-container');
        downloadContainer.innerHTML = ''; // Clear previous button if any

        const downloadButton = document.createElement('a');
        downloadButton.href = downloadUrl;
        downloadButton.innerText = 'Download';
        downloadButton.setAttribute('download', ''); // Forces the download behavior
        downloadButton.classList.add('download-button');

        downloadContainer.appendChild(downloadButton);
    }


    // Load video sources into video player
    function loadVideoSources(sources) {
        const mainVideo = document.querySelector('.main-video');
        mainVideo.innerHTML = ''; // Clear previous sources

        sources.forEach(source => {
            const videoSource = document.createElement('source');
            videoSource.src = source.url;
            videoSource.setAttribute('size', source.quality);
            videoSource.type = "application/vnd.apple.mpegurl";
            mainVideo.appendChild(videoSource);
        });

        mainVideo.load();
        initializePlayer(sources[0].url); // Initialize HLS.js with the first source
    }

    // Add quality options dynamically in the settings
    function addQualityOptions(sources) {
        const qualityList = document.querySelector('.settings [data-label="quality"] ul');
        qualityList.innerHTML = ''; // Clear existing quality options

        sources.forEach((source, index) => {
            const qualityItem = document.createElement('li');
            qualityItem.setAttribute('data-quality', source.quality);
            qualityItem.innerText = `${source.quality}p`;

            // Add click listener for each quality option
            qualityItem.addEventListener('click', () => {
                console.log(`Switching to quality: ${source.quality}p`);
                switchVideoQuality(source.url, qualityItem);
            });

            // Add the first quality as selected by default
            if (index === 0) {
                qualityItem.classList.add('active'); // Mark as active
            }

            qualityList.appendChild(qualityItem);
        });
    }

    // Switch video quality and update the checkmark
    function switchVideoQuality(url, selectedItem) {
        const mainVideo = document.querySelector('.main-video');
        const currentTime = mainVideo.currentTime;

        document.querySelectorAll('.settings [data-label="quality"] ul li').forEach(item => {
            item.classList.remove('active');
        });

        selectedItem.classList.add('active');

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(mainVideo);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                mainVideo.currentTime = currentTime; // Retain current time
                mainVideo.play();
            });
        } else if (mainVideo.canPlayType('application/vnd.apple.mpegurl')) {
            mainVideo.src = url;
            mainVideo.currentTime = currentTime;
            mainVideo.play();
        }

        // Close settings menu
        const settings = document.querySelector('.settings');
        const settingsBtn = document.querySelector('.settingsBtn');
        settings.classList.remove('active');
        settingsBtn.classList.remove('active');
        
    }

    // Initialize video player with HLS.js support
    function initializePlayer(sourceUrl) {
        const mainVideo = document.querySelector('.main-video');
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(mainVideo);
        } else if (mainVideo.canPlayType('application/vnd.apple.mpegurl')) {
            mainVideo.src = sourceUrl;
            mainVideo.load();
        } else {
            handleError(null, "HLS/M3U8 playback not supported");
        }
    }

    // Create pagination buttons
    function createPaginationButtons(totalEpisodes, currentPage) {
        const paginationContainer = document.querySelector('.pagination');
        paginationContainer.innerHTML = ''; // Clear old pagination

        const totalPages = Math.ceil(totalEpisodes / episodesPerPage);
        const fragment = document.createDocumentFragment();

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            if (i === currentPage) pageButton.classList.add('active');

            pageButton.addEventListener('click', () => {
                fetchAnimeInfo(animeId, i); // Fetch episodes for the selected page
            });

            fragment.appendChild(pageButton);
        }

        paginationContainer.appendChild(fragment); // Append all pagination buttons at once
    }

    // Switch between Sub and Dub
    subButton.addEventListener('click', () => switchSubDub(false));
    dubButton.addEventListener('click', () => switchSubDub(true));

    function switchSubDub(toDub) {
        if (toDub && !isDub) {
            animeId = `${animeId}-dub`;
            isDub = true;
        } else if (!toDub && isDub) {
            animeId = animeId.replace('-dub', '');
            isDub = false;
        }
        episodeId = ""; // Reset episodeId to load the first episode of new type
        updateAnimeIdInURL(animeId, episodeId); // Update URL
        fetchAnimeInfo(animeId, currentPage); // Fetch new data
    }

    // Update URL without reloading the page
    function updateAnimeIdInURL(newAnimeId, newEpisodeId) {
        const currentURL = new URL(window.location);
        currentURL.searchParams.set('id', newAnimeId);
        if (newEpisodeId) {
            currentURL.searchParams.set('episodeId', newEpisodeId);
        } else {
            currentURL.searchParams.delete('episodeId');
        }
        history.replaceState(null, '', currentURL);
    }

    // Highlight the currently playing episode
    function highlightPlayingEpisode(selectedItem) {
        document.querySelectorAll('.episode-list li').forEach(item => item.classList.remove('playing'));
        selectedItem.classList.add('playing');
    }

    // Update Sub/Dub button state
    function updateButtonState() {
        if (isDub) {
            dubButton.classList.add('activelist');
            subButton.classList.remove('activelist');
        } else {
            subButton.classList.add('activelist');
            dubButton.classList.remove('activelist');
        }
    }

    // Create button helper function
    function createButton(text, className) {
        const button = document.createElement('button');
        button.innerText = text;
        button.classList.add(className);
        return button;
    }
});
