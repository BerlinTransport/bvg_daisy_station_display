function renderTFT(departures, totalLines, threshold) {
  const container = document.getElementById('led-container-tft');
  container.innerHTML = '';

  // Keine Abfahrten
  if (departures.length === 0) {
        const rowHeight = 90 / totalLines;
        const msg = document.createElement('div');
        msg.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:var(--lcd-text);font-family:"Roboto",sans-serif;font-size:${rowHeight * 0.7}vh;font-weight:bold;`;
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
    const bgColor = getLineColor(dep);
    const directionText = shortenDestination(dep.direction, threshold, dep.line.product);

    const row = document.createElement('div');
    row.className = 'row-tft' + (isCancelled ? ' is-cancelled' : '');
    row.style.height = rowHeight + 'vh';
    row.style.fontSize = (rowHeight * 0.7) + 'vh';

    if (isCancelled) {
      row.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100%">
          <div class="line-number" style="background-color:${bgColor};opacity:0.5">${getLineName(dep)}</div>
        </div>
        <div class="destination-container">
          <div class="swap-container-tft">
            <span class="swap-text-tft">${directionText}</span>
            <span class="swap-text-tft">Fahrt fällt aus</span>
          </div>
        </div>
        <div class="time-cell-tft cancelled-time">--</div>`;
    } else {
      row.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;height:100%">
          <div class="line-number" style="background-color:${bgColor}">${getLineName(dep)}</div>
        </div>
        <div class="destination-container">
          <div class="destination">${directionText}</div>
        </div>
        <div class="time-cell-tft${min === 0 ? ' is-now' : ''}">${min === 0 ? 'jetzt' : min + "'"}</div>`;
    }

    container.appendChild(row);
  });

  hideLoader();
}
