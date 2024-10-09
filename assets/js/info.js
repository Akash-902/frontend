console.log("JS is Running...");

// Function to get query parameters from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Get the anime ID from the URL
const infoid = getQueryParam('id');
console.log("info ID:", infoid);

async function animeInfo() {
    try {
        // Fetch anime info from the server
        let response = await fetch(`https://anyplay.vercel.app/anime/gogoanime/info/${infoid}`);
        let data = await response.json();
        console.log(data);

        // Selecting the animeInfo container
        const animeInfo = document.getElementById("animeInfo");

        // Clear existing content
        animeInfo.innerHTML = "";

        // Check if data exists
        if (data) {
            // Create anime detail structure
            const animeDetail = `
                <div class="anime-detail">
                <div class="anime-image">
                <img src="${data.image}" alt="${data.title}">
                </div>
                <div class="anime-information"
                <p><strong>Name:</strong>${data.title}</p>
                <p><strong>Genres:</strong> ${data.genres.join(', ') || 'N/A'}</p>
                <p><strong>Status:</strong> ${data.status || 'N/A'}</p>
                <p><strong>Total Episodes:</strong> ${data.totalEpisodes || 'N/A'}</p>
                <p><strong>Sub or Dub:</strong> ${data.subOrDub || 'N/A'}</p>
                <p><strong>Release Date:</strong> ${data.releaseDate || 'N/A'}</p>
                </div>
                </div>
                <p><strong>Description:</strong> ${data.description || 'N/A'}</p>
                    <h3>Episodes</h3>
                    <ul id="episodeList"></ul>
            `;

            // Append the anime detail to the page
            animeInfo.innerHTML = animeDetail;

            // Display the list of episodes
            const episodeList = document.getElementById("episodeList");
            if (data.episodes && data.episodes.length > 0) {
                data.episodes.forEach(episode => {
                    const episodeItem = document.createElement("li");
                    episodeItem.innerHTML = `<a href="video.html?episodeId=${episode.id}&id=${infoid}">Episode ${episode.number}</a>`;
                    episodeList.appendChild(episodeItem);
                });
            } else {
                episodeList.innerHTML = "<li>No episodes available.</li>";
            }
        } else {
            // If no anime info is found, show a message
            animeInfo.innerHTML = "<p>No anime information found.</p>";
        }
    } catch (error) {
        console.error("Error fetching anime data:", error);
        const animeInfo = document.getElementById("animeInfo");
        animeInfo.innerHTML = "<p>Error fetching anime data. Please try again later.</p>";
    }
}

// Call the function to load anime information on page load
animeInfo();
