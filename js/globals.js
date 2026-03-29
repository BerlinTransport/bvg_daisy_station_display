let currentId = null;
let timer = null;
let currentVariant = 'daisy';
let currentStationName = '';
let currentLines = 7;

const MIN_FONT_PX = 16;

const TEXT_COL_RATIO       = { daisy: 0.65, tft: 0.75, zza: 0.60 };
const CONTAINER_PADDING_VW = { daisy: 0.06, tft: 0.03, zza: 0.02 };
const CHAR_FACTOR          = { daisy: 0.47, tft: 0.47, zza: 0.45 };

// ── Zieltext kürzen ──────────────────────────────────────────────────────────

const GENERIC_SUFFIXES = [
  'Bahnhof', 'Hauptbahnhof', 'Bhf', 'Bf',
  'Straßenbahnschleife', 'Schleife',
  'Busbahnhof', 'ZOB',
  'Markt', 'Dorfplatz', 'Rathaus'
];

function shortenDestination(text, threshold, product) {
  let t = text.replace(/\s*[\(\[].*?[\)\]]/g, '').trim();
  t = t.replace(/,?\s*\b(Hauptbahnhof|Bahnhof|Bhf\.?|Bf\.?)\s*$/i, '').trim();
  t = t.replace(/\s+via\s+.*/i, '').trim();

  if (product === 'suburban' || product === 'regional' || product === 'express')
  t = t.replace(/^S\+U\s+|^S\s+/i, '').trim();

  if (t.length <= threshold) return t;

  const commaIdx = t.indexOf(',');
  if (commaIdx !== -1) {
    const before = t.slice(0, commaIdx).trim();
    const after  = t.slice(commaIdx + 1).trim();
    const afterClean = after.replace(/[\/\s]*(ZOB|Busbahnhof|Schleife|Dorfplatz|Markt|Rathaus)\s*$/i, '').trim();
    const isGeneric = afterClean === '' || GENERICSUFFIXES.some(s => afterClean.toLowerCase() === s.toLowerCase());
    t = isGeneric ? before : after;
  }
  if (t.length <= threshold) return t;

  return t.slice(0, threshold - 1) + '…';
}

// ── DOM & Loader ─────────────────────────────────────────────────────────────

const loaderOverlay = document.getElementById('loader-overlay');
const searchErrorEl  = document.getElementById('search-error');
const searchLoaderEl = document.getElementById('search-loader');

function showLoader()        { loaderOverlay.style.display = 'flex'; }
function hideLoader()        { setTimeout(() => loaderOverlay.style.display = 'none', 400); }
function setSearchError(msg) { searchErrorEl.textContent = msg; }
function showSearchLoader()  { searchLoaderEl.style.display = 'inline-block'; }
function hideSearchLoader()  { searchLoaderEl.style.display = 'none'; }

// ── Line Filter ───────────────────────────────────────────────────────────────

function getLineFilter() {
  const input = document.getElementById('cfg-line-filter')?.value ?? '';
  if (!input.trim()) return null;
  return input.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
}

// ── Fernverkehr-Erkennung ─────────────────────────────────────────────

const EXPRESS_PREFIXES = ['ICE', 'IC', 'EC', 'RJ', 'RJX', 'NJ', 'EN', 'TGV', 'EST', 'FLX'];

function isExpressTrain(dep) {
  if (!dep.line?.name) return false;
  const name = dep.line.name.toUpperCase();
  return EXPRESS_PREFIXES.some(prefix => name.startsWith(prefix));
}

// ── Linienname normalisieren ──────────────────────────────────────────────────

function getLineName(dep) {
  let name = dep.line?.name ?? '';

  // Bei Fernzügen nur die Zahl anzeigen (ICE 685 → 685)
  if (isExpressTrain(dep)) {
    const match = name.match(/\d+/);
    return match ? match[0] : name;
  }

  return name;
}

let currentZzaMode = 'su'; // 'su' oder 'regio'

function getFullLineName(dep) {
  let name = dep.line?.name ?? '';
  const isFlix = dep.remarks?.some(r => r.type === 'hint' && r.code === 'OPERATOR' && r.text === 'FLX');
  if (isFlix && !name.startsWith('FLX')) name = 'FLX ' + name;
  return name; // ICE 685, FLX 1321 etc. – kein Kürzen
}