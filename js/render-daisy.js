function renderDaisy(departures, totalLines, threshold, showTicker) {
    const container = document.getElementById('led-container-daisy');
    container.innerHTML = '';

    const trainBudget = showTicker ? (totalLines - 1) : totalLines;
    const fontSize = Math.floor(82 / totalLines);
    let usedLines = 0;

    for (let dep of departures) {
        const isCancelled = dep.cancelled === true;
        const directionText = dep.direction || '';

        // Bei Ausfall nie umbrechen — Zieltext wird per CSS abgeschnitten
        const isLong = isCancelled ? false : directionText.length > threshold;
        const cost = isLong ? 2 : 1;

        if (usedLines + cost > trainBudget) break;
        usedLines += cost;

        const diff = Math.round((new Date(dep.when || dep.plannedWhen) - new Date()) / 60000);
        const min = diff <= 0 ? 0 : diff;

        const row = document.createElement('div');
        row.className = `row-daisy ${min === 0 && !isCancelled ? 'is-blinking' : ''} ${isLong ? 'long-text' : ''}`;
        row.style.fontSize = fontSize + 'vh';

        if (isCancelled) {
            row.innerHTML = `
                <span>${dep.line.name}</span>
                <span class="swap-container">
                    <span class="swap-text">${directionText}</span>
                    <span class="swap-text">Fahrt fällt aus</span>
                </span>
                <span class="time-cell-daisy">--</span>
            `;
        } else {
            row.innerHTML = `
                <span>${dep.line.name}</span>
                <span>${directionText}</span>
                <span class="time-cell-daisy">${min}</span>
            `;
        }

        container.appendChild(row);
    }

    if (showTicker) {
        const tick = document.createElement('div');
        tick.className = 'ticker';
        tick.innerHTML = `<div class="ticker-content" style="font-size:${fontSize}vh">+++ Herzlich Willkommen +++ Nächste Abfahrten für ${currentStationName} +++ Bitte achten Sie auf die Ansagen +++</div>`;
        container.appendChild(tick);
    }

    hideLoader();
}
