// ── Letzte Station beim Start anzeigen ───────────────────────────────────────

function showLastStation() {
  const raw = localStorage.getItem('lastStation');
  if (!raw) return;
  const { id, name } = JSON.parse(raw);
  const list = document.getElementById('results-list');
  const li = document.createElement('li');
  li.textContent = '⟳ ' + name;
  li.onclick = () => selectStation(id, name);
  list.appendChild(li);
}

// ── Station auswählen ────────────────────────────────────────────────────────

function selectStation(id, name) {
  currentId = id;
  currentStationName = name;

  localStorage.setItem('lastStation', JSON.stringify({ id, name }));

  document.getElementById('global-station-name').textContent = name;

  showLoader();
  document.getElementById('search-overlay').style.display = 'none';

  if (currentVariant === 'daisy') {
    document.getElementById('monitor-daisy').style.display = 'flex';
    document.getElementById('monitor-tft').style.display = 'none';
  } else {
    document.getElementById('monitor-daisy').style.display = 'none';
    document.getElementById('monitor-tft').style.display = 'flex';
  }

  startMonitor();
}

// ── Suche ────────────────────────────────────────────────────────────────────

document.getElementById('station-query').addEventListener('input', async (e) => {
  const q = e.target.value;
  const list = document.getElementById('results-list');
  list.innerHTML = '';
  setSearchError('');
  hideSearchLoader();

  if (q.length < 3) {
    showLastStation(); // letzte Station wieder anzeigen wenn Feld geleert wird
    return;
  }

  showSearchLoader();

  try {
    const r = await fetch(`https://v6.vbb.transport.rest/locations?query=${encodeURIComponent(q)}&results=5&stops=true`);
    if (!r.ok) {
      hideSearchLoader();
      setSearchError('Die Auskunft ist aktuell nicht erreichbar. Bitte später erneut versuchen.');
      return;
    }
    const data = await r.json();
    hideSearchLoader();

    if (!Array.isArray(data) || data.length === 0) {
      setSearchError('Keine Haltestelle gefunden. Bitte Suchbegriff anpassen.');
      return;
    }

    data.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s.name;
      li.onclick = () => selectStation(s.id, s.name);
      list.appendChild(li);
    });

  } catch (e) {
    console.error(e);
    hideSearchLoader();
    setSearchError('Fehler bei der Verbindung zur Auskunft. Bitte Internetverbindung prüfen.');
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────

showLastStation();
