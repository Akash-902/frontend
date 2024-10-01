console.log("JS is Running...");

async function recentEpisodes() {
  try {
    // Fetch recent added anime from the server
    let response = await fetch("https://anyplay.vercel.app/anime/zoro/top-airing");
    let data = await response.json();
    console.log(data)
    // Selecting the animelist container
    const animelist = document.getElementById("animelist");

    // Clear existing content
    animelist.innerHTML = "";

    // Check if data exists
    if (data && data.results && data.results.length > 0) {
      // Loop through each anime and add it to the page
      data.results.forEach(anime => {
        const animeItem = document.createElement("div");
        animeItem.classList.add("anime-item");

        // Create inner HTML structure
        animeItem.innerHTML = `
          <div class="image">
            <img src="${anime.image}" alt="${anime.title}">
            <div class="lang">
              <div class="sub">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                </svg>
                <span>${anime.sub || 'N/A'}</span>
              </div>
              <div class="dub">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"/>
                </svg>
                <span>${anime.dub || 'N/A'}</span>
              </div>
            </div>
            <div class="duration">${anime.duration || 'N/A'}</div>
          </div>
          <div class="title">${anime.title}</div>
        `;

        // Append the anime item to the list
        animelist.appendChild(animeItem);
      });
    } else {
      // If no anime is found, show a message
      animelist.innerHTML = "<p>No recent anime added.</p>";
    }
  } catch (error) {
    console.error("Error fetching anime data:", error);
    const animelist = document.getElementById("animelist");
    animelist.innerHTML = "<p>Error fetching recent anime. Please try again later.</p>";
  }
}

// Call the function to load recent episodes on page load
recentEpisodes();
