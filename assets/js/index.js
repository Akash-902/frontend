console.log("JS is Running...");

let currentPage = 1;
const itemsPerPage = 20;
let hasNextPage = true;

async function recentEpisodes(page = 1) {
  try {
    let response = await fetch(`https://anyplay.vercel.app//anime/gogoanime/recent-episodes?page=${page}`);
    let data = await response.json();
    
    console.log(data);

    currentPage = parseInt(data.currentPage);
    hasNextPage = data.hasNextPage;

    const animelist = document.getElementById("animelist");
    animelist.innerHTML = "";

    if (data && data.results && data.results.length > 0) {
      data.results.forEach(anime => {
        const animeItem = document.createElement("div");
        animeItem.classList.add("anime-item");

        animeItem.innerHTML = `
          <div data-episode-id="${anime.episodeId}">
            <div class="image">
              <img src="${anime.image}" alt="${anime.title}">
              <div class="lang">
                <div class="sub">
                  <span>${anime.sub || 'N/A'}</span>
                </div>
                <div class="dub">
                  <span>${anime.dub || 'N/A'}</span>
                </div>
              </div>
              <div class="duration">${anime.duration || 'N/A'}</div>
            </div>
            <div class="title">${anime.title}</div>
          </div>
        `;

        animelist.appendChild(animeItem);

        animeItem.addEventListener('click', () => {
          const Id = anime.id;
          const episodeId = anime.episodeId;
          window.location.href = `video.html?id=${Id}&episodeId=${episodeId}`;
        });
      });

      updatePaginationControls();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } else {
      animelist.innerHTML = "<p>No recent anime added.</p>";
    }
  } catch (error) {
    console.error("Error fetching anime data:", error);
    document.getElementById("animelist").innerHTML = "<p>Error fetching recent anime. Please try again later.</p>";
  }
}

function updatePaginationControls() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = '';

  const prevButton = document.createElement("button");
  prevButton.textContent = 'Prev';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => loadPage(currentPage - 1));
  pagination.appendChild(prevButton);

  const page1 = createPageButton(1);
  pagination.appendChild(page1);

  if (currentPage > 1) {
    const prevPage = createPageButton(currentPage - 1);
    pagination.appendChild(prevPage);
  }

  const currentPageButton = createPageButton(currentPage);
  currentPageButton.classList.add('active');
  pagination.appendChild(currentPageButton);

  if (hasNextPage) {
    const nextPage = createPageButton(currentPage + 1);
    pagination.appendChild(nextPage);
  }

  const nextButton = document.createElement("button");
  nextButton.textContent = 'Next';
  nextButton.disabled = !hasNextPage;
  nextButton.addEventListener('click', () => loadPage(currentPage + 1));
  pagination.appendChild(nextButton);
}

function createPageButton(page) {
  const pageButton = document.createElement("button");
  pageButton.textContent = page;
  pageButton.classList.add('page-button');

  pageButton.addEventListener('click', () => loadPage(page));

  return pageButton;
}

function loadPage(page) {
  if (page > 0 && page !== currentPage) {
    recentEpisodes(page);
  }
}

recentEpisodes(currentPage);
