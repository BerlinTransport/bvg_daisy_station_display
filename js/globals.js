let currentId = null;
let timer = null;
let currentVariant = 'daisy';
let currentStationName = '';

const loaderOverlay = document.getElementById('loader-overlay');
const searchErrorEl = document.getElementById('search-error');
const searchLoaderEl = document.getElementById('search-loader');

function showLoader() { loaderOverlay.style.display = 'flex'; }
function hideLoader() { setTimeout(() => { loaderOverlay.style.display = 'none'; }, 400); }
function setSearchError(msg) { searchErrorEl.textContent = msg || ''; }
function showSearchLoader() { searchLoaderEl.style.display = 'inline-block'; }
function hideSearchLoader() { searchLoaderEl.style.display = 'none'; }
