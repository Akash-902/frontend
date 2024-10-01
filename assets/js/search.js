// Base URL for Zoro API route
const baseUrl = 'https://anyplay.vercel.app/anime/gogoanime/';

// Search button event listener
document.getElementById('search-btn').addEventListener('click', async () => {
  const query = document.getElementById('search-input').value;
  
  if (!query) {
    alert('Please enter a search term');
    return;
  }
  
  const animeResults = await fetchAnime(query);
  console.log(animeResults)
  displayAnimeResults(animeResults);
});

// Function to fetch anime from the API
async function fetchAnime(query) {
  try {
    const response = await fetch(`${baseUrl}${query}`);
    const data = await response.json();
    
    if (response.ok) {
      return data.results; // Assuming API returns a "results" array
    } else {
      throw new Error(data.message || 'Error fetching anime');
    }
  } catch (error) {
    console.error(error);
    alert('Failed to fetch anime. Please try again.');
    return [];
  }
}

// Function to display anime results in the DOM
function displayAnimeResults(animeList) {
  const animeResultsDiv = document.getElementById('anime-results');
  animeResultsDiv.innerHTML = ''; // Clear previous results

  if (animeList.length === 0) {
    animeResultsDiv.innerHTML = '<p>No anime found.</p>';
    return;
  }

  animeList.forEach(anime => {
    const animeItem = document.createElement('div');
    animeItem.classList.add('anime-item');

    animeItem.innerHTML = `
      <div anime-id="${anime.id}">
        <img src="${anime.image}" alt="${anime.title}">
        <h4>${anime.title}</h4>
        <p>Type: ${anime.subOrDub}</p>
        <p> Release Date: ${anime.releaseDate}</p>
      </div>
    `;

    // Make the anime item clickable to redirect to info.html
    animeItem.addEventListener('click', () => {
      const animeId = anime.id;
      window.location.href = `info.html?id=${animeId}`; // Redirect to info.html with the anime ID
    });

    animeResultsDiv.appendChild(animeItem);
  });
}

