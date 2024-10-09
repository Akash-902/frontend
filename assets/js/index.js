// Initialize the current page and variables
let currentPage = 1;
let hasNextPage = true;

// Add event listeners to the tabs
document.getElementById("subbedTab").addEventListener("click", () => {
  switchTab("subbed");
  subEpisodes(1); // Load recent episodes data
});

document.getElementById("dubbedTab").addEventListener("click", () => {
  switchTab("dubbed");
  dubEpisodes(1); // Load trending anime data
});

document.getElementById("chinesTab").addEventListener("click", () => {
  switchTab("chines");
  chineseEpisodes(1); // Load anime movies data
});

// Function to switch tabs and manage active class
function switchTab(tab) {
  document.querySelectorAll(".tab").forEach((tabElement) => {
    tabElement.classList.remove("active"); // Remove 'active' class from all tabs
  });
  document.getElementById(`${tab}Tab`).classList.add("active"); // Add 'active' class to the clicked tab

  // Clear anime list and pagination
  document.getElementById("animelist").innerHTML = "";
  document.getElementById("pagination").innerHTML = "";
}

// Function to cache data in localStorage
function cacheData(key, data) {
  const cacheObject = {
    data: data,
    timestamp: new Date().getTime() // Store current timestamp
  };
  localStorage.setItem(key, JSON.stringify(cacheObject));
}

// Function to get cached data from localStorage
function getCachedData(key, maxAgeInMinutes) {
  const cachedItem = localStorage.getItem(key);
  if (cachedItem) {
    const parsedCache = JSON.parse(cachedItem);
    const cacheAge = (new Date().getTime() - parsedCache.timestamp) / (1000 * 60); // Age in minutes
    if (cacheAge < maxAgeInMinutes) {
      return parsedCache.data;
    } else {
      localStorage.removeItem(key); // Cache is stale, remove it
    }
  }
  return null;
}

// Function to fetch recent episodes data (with caching)
async function subEpisodes(page = 1) {
  const cacheKey = `subEpisodes_page_${page}`;
  const cachedData = getCachedData(cacheKey, 5); // Cache valid for 10 minutes

  if (cachedData) {
    console.log("Using cached sub episodes data",);
    displayAnimeList(cachedData);
    currentPage = parseInt(cachedData.currentPage);
    hasNextPage = cachedData.hasNextPage;
    updatePaginationControls();
    return;
  }

  try {
    let response = await fetch(`https://anyplay.vercel.app/anime/gogoanime/recent-episodes?page=${page}&type=1`);
    let data = await response.json();
    console.log(data);
    
    displayAnimeList(data);
    currentPage = parseInt(data.currentPage);
    hasNextPage = data.hasNextPage;
    updatePaginationControls();

    cacheData(cacheKey, data); // Cache the fetched data
  } catch (error) {
    console.error("Error fetching sub episodes:", error);
    document.getElementById("animelist").innerHTML = "<p>Error fetching sub episodes. Please try again later.</p>";
  }
}

// Function to fetch trending anime data (with caching)
async function dubEpisodes(page = 1) {
  const cacheKey = `dubEpisodes_page_${page}`;
  const cachedData = getCachedData(cacheKey, 5); // Cache valid for 10 minutes

  if (cachedData) {
    console.log("Using cached dub anime data");
    displayAnimeList(cachedData);
    currentPage = parseInt(cachedData.currentPage);
    hasNextPage = cachedData.hasNextPage;
    updatePaginationControls();
    return;
  }

  try {
    let response = await fetch(`https://anyplay.vercel.app/anime/gogoanime/recent-episodes?page=${page}&type=2`);
    let data = await response.json();
    console.log(data);
    
    displayAnimeList(data);
    currentPage = parseInt(data.currentPage);
    hasNextPage = data.hasNextPage;
    updatePaginationControls();

    cacheData(cacheKey, data); // Cache the fetched data
  } catch (error) {
    console.error("Error fetching dub anime:", error);
    document.getElementById("animelist").innerHTML = "<p>Error fetching dub anime. Please try again later.</p>";
  }
}

// Function to fetch anime movies data (with caching)
async function chineseEpisodes(page = 1) {
  const cacheKey = `chineseEpisodes_page_${page}`;
  const cachedData = getCachedData(cacheKey, 5); // Cache valid for 10 minutes

  if (cachedData) {
    console.log("Using cached chinese anime data");
    displayAnimeList(cachedData);
    currentPage = parseInt(cachedData.currentPage);
    hasNextPage = cachedData.hasNextPage;
    updatePaginationControls();
    return;
  }

  try {
    let response = await fetch(`https://anyplay.vercel.app/anime/gogoanime/recent-episodes?page=${page}&type=3`);
    let data = await response.json();
    console.log(data);
    
    displayAnimeList(data);
    currentPage = parseInt(data.currentPage);
    hasNextPage = data.hasNextPage;
    updatePaginationControls();

    cacheData(cacheKey, data); // Cache the fetched data
  } catch (error) {
    console.error("Error fetching chinese anime:", error);
    document.getElementById("animelist").innerHTML = "<p>Error fetching chinese anime. Please try again later.</p>";
  }
}

// Function to display anime list in the DOM
function displayAnimeList(data) {
  const animelist = document.getElementById("animelist");
  animelist.innerHTML = ""; // Clear previous list

  if (data && data.results && data.results.length > 0) {
    data.results.forEach(anime => {
      const animeItem = document.createElement("div");
      animeItem.classList.add("anime-item");

      animeItem.innerHTML = `
        <div data-episode-id="${anime.episodeId}">
          <div class="image">
            <img src="${anime.image}" alt="${anime.title}"></div>
          <div class="title">${anime.episodeId}  </div>
        </div>
      `;

      animelist.appendChild(animeItem);

      animeItem.addEventListener('click', () => {
        const Id = anime.id;
        const episodeId = anime.episodeId;

        // Store current page and active tab in localStorage before navigation
        localStorage.setItem('lastVisitedPage', currentPage);
        localStorage.setItem('lastActiveTab', document.querySelector('.tab.active').id);

        window.location.href = `video.html?id=${Id}&episodeId=${episodeId}`;
      });
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

  } else {
    animelist.innerHTML = "<p>No anime found.</p>";
  }
}

// Function to update pagination controls
function updatePaginationControls() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = '';

  // Always display the 'Prev' button
  const prevButton = document.createElement("button");
  prevButton.textContent = 'Prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => loadPage(currentPage - 1));
  pagination.appendChild(prevButton);

  // Always display the first page number (Page 1)
  const firstPageButton = createPageButton(1);
  if (currentPage === 1) {
    firstPageButton.classList.add('active');
  }
  pagination.appendChild(firstPageButton);

  // Display middle page (currentPage) and next page if applicable
  if (currentPage > 1) {
    // If we're not on the first page, show the current page
    const currentPageButton = createPageButton(currentPage);
    currentPageButton.classList.add('active');
    pagination.appendChild(currentPageButton);
  }

  if (hasNextPage && currentPage + 1 > 1) {
    // Display the next page after the current page
    const nextPageButton = createPageButton(currentPage + 1);
    pagination.appendChild(nextPageButton);
  }

  // Always display the 'Next' button
  const nextButton = document.createElement("button");
  nextButton.textContent = 'Next';
  nextButton.disabled = !hasNextPage;
  nextButton.addEventListener('click', () => loadPage(currentPage + 1));
  pagination.appendChild(nextButton);
}

// Function to create page button
function createPageButton(page) {
  const pageButton = document.createElement("button");
  pageButton.textContent = page;
  pageButton.classList.add('page-button');
  pageButton.addEventListener('click', () => loadPage(page));
  return pageButton;
}

// Function to load the desired page
function loadPage(page) {
  if (page > 0) {
    const activeTab = document.querySelector(".tab.active").id.replace("Tab", "");
    currentPage = page; // Update the current page
    if (activeTab === "subbed") {
      subEpisodes(page);
    } else if (activeTab === "dubbed") {
      dubEpisodes(page);
    } else if (activeTab === "chines") {
      chineseEpisodes(page);
    }
  }
}

// Function to load the desired page
function loadPage(page) {
  if (page > 0) {
    const activeTab = document.querySelector(".tab.active").id.replace("Tab", "");
    if (activeTab === "subbed") {
      subEpisodes(page);
    } else if (activeTab === "dubbed") {
      dubEpisodes(page);
    } else if (activeTab === "chines") {
      chineseEpisodes(page);
    }
  }
}

// Automatically refresh API data every 10 minutes
setInterval(() => {
  const activeTab = document.querySelector(".tab.active").id.replace("Tab", "");
  if (activeTab === "subbed") {
    subEpisodes(1);
  } else if (activeTab === "dubbed") {
    dubEpisodes(1);
  } else if (activeTab === "chines") {
    chineseEpisodes(1);
  }
}, 5 * 60 * 1000); // 10 minutes

// Detect back button navigation and handle refresh cache clearing
document.addEventListener("DOMContentLoaded", () => {
  // Detect page reload
  if (performance.navigation.type === 1) {
    // Clear the cache for the current tab and page
    localStorage.removeItem('subEpisodes_page_1');
    localStorage.removeItem('dubEpisodes_page_1');
    localStorage.removeItem('chineseEpisodes_page_1');
    localStorage.removeItem('lastVisitedPage');
    localStorage.removeItem('lastActiveTab');

    // Load the default first page and fetch new data
    subEpisodes(1); // Default to subbed tab and first page
    switchTab('subbed');
  } else {
    // Check if there's a last visited page and tab stored (returning from video.html)
    const lastVisitedPage = localStorage.getItem('lastVisitedPage');
    const lastActiveTab = localStorage.getItem('lastActiveTab');

    if (lastVisitedPage && lastActiveTab) {
      // Restore the active tab and page
      switchTab(lastActiveTab.replace('Tab', ''));
      
      // Load the page from where the user left off
      if (lastActiveTab === "subbedTab") {
        subEpisodes(parseInt(lastVisitedPage));
      } else if (lastActiveTab === "dubbedTab") {
        dubEpisodes(parseInt(lastVisitedPage));
      } else if (lastActiveTab === "chinesTab") {
        chineseEpisodes(parseInt(lastVisitedPage));
      }
    } else {
      // Default behavior if there's no stored info
      subEpisodes(1); // Default to subbed tab and first page
      switchTab('subbed');
    }
  }
});

