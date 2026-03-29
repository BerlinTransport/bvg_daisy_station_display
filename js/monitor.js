// ── Scale-Berechnung ─────────────────────────────────────────────────────────

function calcScale(containerId) {
  const container = document.getElementById(containerId);
  const h = container.clientHeight;
  const w = container.clientWidth;

  let fontSizePx = (h / currentLines) * 0.75;
  if (fontSizePx < MIN_FONT_PX) fontSizePx = MIN_FONT_PX;

  const actualLines = Math.floor(h / (fontSizePx / 0.75));

  const usableWidth = w * (1 - CONTAINER_PADDING_VW[currentVariant]);
  const textColWidth = usableWidth * TEXT_COL_RATIO[currentVariant];
  const threshold = Math.floor(textColWidth / (fontSizePx * CHAR_FACTOR[currentVariant]));

  return { totalLines: actualLines, threshold };
}

// ── Navigation ───────────────────────────────────────────────────────────────

function goToMenu() {
  showLoader();
  document.getElementById('search-overlay').style.display = 'flex';
  document.getElementById('monitor-daisy').style.display = 'none';
  document.getElementById('monitor-tft').style.display = 'none';
  document.getElementById('monitor-zza').style.display = 'none';
  document.getElementById('global-station-name').textContent = '';
  document.getElementById('global-clock').style.display = 'none';
  document.getElementById('gf-sep').style.display = 'none';
  document.getElementById('fullscreen-btn').style.display = 'none';
  document.getElementById('footer-fs-sep').style.display = 'none';
  document.getElementById('footer-back-btn').style.display = 'none';
  document.getElementById('footer-back-sep').style.display = 'none';
  document.exitFullscreen?.();
  clearInterval(timer);
  clearInterval(clockTimer);
  clockTimer = null;
  hideLoader();
}

window.addEventListener('keydown', e => { if (e.key === 'Escape') goToMenu(); });
document.getElementById('footer-back-btn').addEventListener('click', goToMenu);

// ── API-Abfrage & Render ─────────────────────────────────────────────────────

async function update() {
  if (!currentId) return;

  const containerId = currentVariant === 'daisy' ? 'led-container-daisy'
    : currentVariant === 'tft' ? 'led-container-tft'
    : 'led-container-zza';

  const { totalLines, threshold } = calcScale(containerId);

  const showTicker = document.getElementById('cfg-show-ticker')?.dataset.active === 'true';

  const cfgFilters = {
    suburban: document.getElementById('f-suburban'),
    subway:   document.getElementById('f-subway'),
    tram:     document.getElementById('f-tram'),
    bus:      document.getElementById('f-bus'),
    regional: document.getElementById('f-regional'),
    express:  document.getElementById('f-express')
  };

  const filters = {
    suburban: cfgFilters.suburban?.checked ?? true,
    subway:   cfgFilters.subway?.checked   ?? true,
    tram:     cfgFilters.tram?.checked     ?? true,
    bus:      cfgFilters.bus?.checked      ?? true,
    regional: cfgFilters.regional?.checked ?? true,
    express:  cfgFilters.express?.checked  ?? true
  };

  const params = new URLSearchParams({
    duration: currentVariant === 'daisy' ? 60 : 90,
    results:  currentVariant === 'daisy' ? 40 : 50,
    suburban: filters.suburban,
    subway:   filters.subway,
    tram:     filters.tram,
    bus:      filters.bus,
    // regional muss true sein wenn Regio ODER Fernverkehr aktiv ist
    regional: filters.regional || filters.express
  });

  try {
    const res  = await fetch(`https://v6.vbb.transport.rest/stops/${currentId}/departures?${params.toString()}`);
    const data = await res.json();
    if (!data.departures) { hideLoader(); return; }

    const lineFilter = getLineFilter();

    const departures = data.departures
      .filter(dep => !lineFilter || lineFilter.includes(dep.line.name.toUpperCase()))
      .filter(dep => {
        if (isExpressTrain(dep)) return filters.express;
        switch (dep.line.product) {
          case 'suburban': return filters.suburban;
          case 'subway':   return filters.subway;
          case 'tram':     return filters.tram;
          case 'bus':      return filters.bus;
          case 'regional': return filters.regional;
          default:         return true;
        }
      })
      .sort((a, b) => new Date(a.when ?? a.plannedWhen) - new Date(b.when ?? b.plannedWhen));

    if (currentVariant === 'daisy')    renderDaisy(departures, totalLines, threshold, showTicker);
    else if (currentVariant === 'tft') renderTFT(departures, totalLines, threshold);
    else                               renderZZA(departures, totalLines, threshold);

  } catch (e) {
    console.error(e);

    const errorContainerId = currentVariant === 'daisy' ? 'led-container-daisy'
      : currentVariant === 'tft' ? 'led-container-tft'
      : 'led-container-zza';

    const container = document.getElementById(errorContainerId);
    if (container) {
      container.innerHTML = '';
      const { totalLines: tl } = calcScale(errorContainerId);
      const msg = document.createElement('div');

      if (currentVariant === 'daisy') {
        const fontSize = Math.floor(82 / tl);
        msg.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:var(--led-orange);font-family:"Archivo Narrow",sans-serif;font-size:${fontSize}vh;`;
      } else if (currentVariant === 'tft') {
        const rowHeight = 90 / tl;
        msg.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:var(--lcd-text);font-family:"Roboto",sans-serif;font-size:${rowHeight * 0.7}vh;font-weight:bold;`;
      } else {
        const rowHeight = 90 / tl;
        msg.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:#ffffff;font-family:"Roboto",sans-serif;font-size:${rowHeight * 0.7}vh;font-weight:bold;`;
      }

      msg.textContent = 'API nicht erreichbar – Neuladen in 20 Sekunden';
      container.appendChild(msg);
    }

    hideLoader();
  }
}

// ── Uhr starten ──────────────────────────────────────────────────────────────

let clockTimer = null;

function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('global-clock').textContent =
      now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
  tick();
  clockTimer = setInterval(tick, 1000);
  document.getElementById('global-clock').style.display = 'inline';
  document.getElementById('gf-sep').style.display = 'inline';
}

// ── Monitor starten ───────────────────────────────────────────────────────────

function startMonitor() {
  if (!clockTimer) startClock();
  update();
  if (timer) clearInterval(timer);
  timer = setInterval(update, currentVariant === 'daisy' ? 20000 : 30000);
  document.getElementById('fullscreen-btn').style.display = 'inline';
  document.getElementById('footer-fs-sep').style.display = 'inline';
  document.getElementById('footer-back-btn').style.display = 'inline';
  document.getElementById('footer-back-sep').style.display = 'inline';
}