let currentId = null;
let timer = null;
let currentVariant = 'daisy';
let currentStationName = '';

const SCALE_PRESETS = {
    XS: { lines: 12, threshold: 35 },
    S:  { lines: 10, threshold: 30 },
    M:  { lines: 7,  threshold: 22 },
    L:  { lines: 5,  threshold: 18 },
    XL: { lines: 3,  threshold: 14 }
};

let currentScale = 'M';

function getScaleValues() {
    return SCALE_PRESETS[currentScale];
}

const loaderOverlay = document.getElementById('loader-overlay');
const searchErrorEl  = document.getElementById('search-error');
const searchLoaderEl = document.getElementById('search-loader');

function showLoader()       { loaderOverlay.style.display = 'flex'; }
function hideLoader()       { setTimeout(() => { loaderOverlay.style.display = 'none'; }, 400); }
function setSearchError(msg){ searchErrorEl.textContent = msg || ''; }
function showSearchLoader() { searchLoaderEl.style.display = 'inline-block'; }
function hideSearchLoader() { searchLoaderEl.style.display = 'none'; }
