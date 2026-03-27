function renderZZA(departures, totalLines, threshold) {
  const container = document.getElementById('led-container-zza');
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
    const diff = Math.round((new Date(dep.when ?? dep.plannedWhen) - new Date()) / 60000);
    const min = diff < 0 ? 0 : diff;
    const minLabel = min === 0 ? '' : `${min} min`;
    const directionText = shortenDestination(dep.direction, threshold, dep.line.product);

    const showDot = min <= 1;
    const dotClass = min === 0 ? 'zza-dot is-now' : 'zza-dot';
    const bgColor = getLineColor(dep);

    // Gleis-Anzeige-Logik: Nur S-Bahn (suburban) und Regio (regional) zeigen das Gleis unverändert
    let trackDisplay = '–';
    if (!isCancelled) {
      if (dep.line.product === 'bus' || dep.line.product === 'tram' || dep.line.product === 'subway') {
        trackDisplay = ''; 
      } else {
        trackDisplay = dep.stop?.platform ?? dep.platform ?? '';
      }
    }

    const row = document.createElement('div');
    row.className = `row-zza${isCancelled ? ' is-cancelled' : ''}`;
    row.style.height = `${rowHeight}vh`;
    row.style.fontSize = `${rowHeight * 0.60}vh`;

        row.innerHTML = `
      <div class="zza-cell-dot">
        ${showDot ? `<span class="${dotClass}"></span>` : ''}
      </div>
      <div class="zza-cell-line">
        <span class="zza-line-badge" style="background:${bgColor}">${getLineName(dep)}</span>
      </div>
      <div class="zza-cell-dest">
        ${isCancelled
          ? `<span class="zza-dest-cancelled">${directionText}</span>`
          : `<span>${directionText}</span>`
        }
      </div>
      <div class="zza-cell-track">${trackDisplay}</div>
      <div class="zza-cell-time">${isCancelled ? '–' : minLabel}</div>
    `;
    
    container.appendChild(row);
  });

  hideLoader();
}
