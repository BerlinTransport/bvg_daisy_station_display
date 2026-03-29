function renderZZA(departures, totalLines, threshold) {
  const container = document.getElementById('led-container-zza');
  document.getElementById('monitor-zza').classList.toggle('zza-regio-mode', currentZzaMode === 'regio');
  container.innerHTML = '';

  if (departures.length === 0) {
    const rowHeight = 90 / totalLines;
    const msg = document.createElement('div');
    msg.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:#ffffff;font-family:Roboto,sans-serif;font-size:${rowHeight * 0.7}vh;font-weight:bold`;
    msg.textContent = 'Derzeit keine Abfahrten';
    container.appendChild(msg);
    hideLoader();
    return;
  }

  const rowHeight = 90 / totalLines;

  departures.slice(0, totalLines).forEach(dep => {
    const isCancelled = dep.cancelled === true;
    const plannedTime = new Date(dep.plannedWhen);
    const actualTime  = new Date(dep.when ?? dep.plannedWhen);
    const diff = Math.round((actualTime - new Date()) / 60000);
    const min  = diff < 0 ? 0 : diff;
    const directionText = shortenDestination(dep.direction, threshold, dep.line.product);
    const bgColor = getLineColor(dep);

    // Gleis-Anzeige
    let trackDisplay = '';
    if (!isCancelled) {
      if (!['bus','tram','subway'].includes(dep.line.product)) {
        trackDisplay = dep.stop?.platform ?? dep.platform ?? '';
      }
    }

    const row = document.createElement('div');
    row.className = 'row-zza' + (isCancelled ? ' is-cancelled' : '');
    row.style.height = `${rowHeight}vh`;
    row.style.fontSize = `${rowHeight * 0.60}vh`;

    // ── S+U Modus ──
    if (currentZzaMode === 'su') {
      const showDot = min <= 1;
      const dotClass = min === 0 ? 'zza-dot is-now' : 'zza-dot';
      const minLabel = min <= 0 ? '0' : `${min}`;

      row.innerHTML = `
        <div class="zza-cell-dot">${showDot ? `<span class="${dotClass}"></span>` : ''}</div>
        <div class="zza-cell-line">
          <span class="zza-line-badge" style="background:${bgColor}">${getLineName(dep)}</span>
        </div>
        <div class="zza-cell-dest">
          ${isCancelled
            ? `<span class="zza-dest-cancelled">${directionText}</span>`
            : `<span>${directionText}</span>`}
        </div>
        <div class="zza-cell-track">${trackDisplay}</div>
        <div class="zza-cell-time">${isCancelled ? '' : minLabel}</div>`;

    // ── Regio+Express Modus ──
    } else {
      const showDot = min <= 1;
      const dotClass = min === 0 ? 'zza-dot is-now' : 'zza-dot';
      const delayMin = Math.round((actualTime - plannedTime) / 60000);
      const plannedStr = plannedTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

      // Zeitfarbe: gelb bis +5 Min, rot ab +6 Min
      let timeColor = '#ffffff';
      if (!isCancelled && delayMin >= 1 && delayMin <= 5) timeColor = '#f5c400';
      if (!isCancelled && delayMin >= 6) timeColor = '#ff3b3b';

      // Gleisfarbe: rot bei Gleisänderung
      const plannedTrack = dep.plannedPlatform ?? dep.stop?.plannedPlatform ?? '';
      const actualTrack = trackDisplay ? (dep.platform ?? dep.stop?.platform ?? trackDisplay): '';
      const trackChanged = trackDisplay && plannedTrack && actualTrack && plannedTrack !== actualTrack;
      const trackColor = trackChanged ? '#ff3b3b' : '#ffffff';

      row.innerHTML = `
        <div class="zza-cell-dot">${showDot ? `<span class="${dotClass}"></span>` : ''}</div>
        <div class="zza-cell-line zza-cell-line--regio">
          <span class="zza-line-regio">${getFullLineName(dep)}</span>
        </div>
        <div class="zza-cell-dest">
          ${isCancelled
            ? `<span class="zza-dest-cancelled">${directionText}</span>`
            : `<span>${directionText}</span>`}
        </div>
        <div class="zza-cell-track" style="color:${trackColor}">${actualTrack}</div>
        <div class="zza-cell-time" style="color:${timeColor}">
          ${isCancelled ? '<span style="color:#ff3b3b">Fällt aus</span>' : plannedStr}
        </div>`;
    }

    container.appendChild(row);
  });
  hideLoader();
}