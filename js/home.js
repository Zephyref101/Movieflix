const API_KEY = '60fae3fb011db1ea56cc195b1c96dc67';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';
let currentItem;

let pageMovies = 1;
let pageTVShows = 1;
let pageAnime = 1;

async function fetchTrending(type, page) {
  const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}&page=${page}`);
  const data = await res.json();
  return data.results;
}

async function fetchTrendingAnime(page) {
  let allResults = [];

  const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
  const data = await res.json();
  const filtered = data.results.filter(item =>
    item.original_language === 'ja' && item.genre_ids.includes(16)
  );
  allResults = allResults.concat(filtered);

  return allResults;
}

function displayBanner(item) {
  document.getElementById('banner').style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById('banner-title').textContent = item.title || item.name;
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  items.forEach(item => {
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.loading = 'lazy';
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

function showDetails(item) {
  currentItem = item;
  document.getElementById('modal-title').textContent = item.title || item.name;
  document.getElementById('modal-description').textContent = item.overview;
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2));
  changeServer();
  document.getElementById('modal').style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === "movie" ? "movie" : "tv";
  let embedURL = "";

  if (server === "vidsrc.cc") {
    embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
  } else if (server === "vidsrc.me") {
    embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
  } else if (server === "player.videasy.net") {
    embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.getElementById('modal-video').src = ''; // Stop video
}

function openSearchModal() {
  document.getElementById('search-modal').style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  document.getElementById('search-modal').style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value;
  if (!query.trim()) {
    document.getElementById('search-results').innerHTML = '';
    return;
  }

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();

  const container = document.getElementById('search-results');
  container.innerHTML = '';
  data.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    container.appendChild(img);
  });
}

async function loadMoreMovies() {
  pageMovies++;
  const movies = await fetchTrending('movie', pageMovies);
  displayList(movies, 'movies-carousel');
}

async function loadMoreTVShows() {
  pageTVShows++;
  const tvShows = await fetchTrending('tv', pageTVShows);
  displayList(tvShows, 'tv-carousel');
}

async function loadMoreAnime() {
  pageAnime++;
  const anime = await fetchTrendingAnime(pageAnime);
  displayList(anime, 'anime-carousel');
}

async function init() {
  const movies = await fetchTrending('movie', pageMovies);
  const tvShows = await fetchTrending('tv', pageTVShows);
  const anime = await fetchTrendingAnime(pageAnime);

  displayBanner(movies[Math.floor(Math.random() * movies.length)]);
  displayList(movies, 'movies-carousel');
  displayList(tvShows, 'tv-carousel');
  displayList(anime, 'anime-carousel');
}

init();

// Event listeners for closing modal
document.querySelector('#modal .close').addEventListener('click', closeModal);

window.addEventListener('click', function (e) {
  const modal = document.getElementById('modal');
  if (e.target === modal) {
    closeModal();
  }
});

window.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    const modal = document.getElementById('modal');
    if (modal.style.display === 'flex') {
      closeModal();
    }
  }
});

// Event listeners for Load More buttons
document.querySelector('.load-more[data-category="movies"]').addEventListener('click', loadMoreMovies);
document.querySelector('.load-more[data-category="tv"]').addEventListener('click', loadMoreTVShows);
document.querySelector('.load-more[data-category="anime"]').addEventListener('click', loadMoreAnime);
