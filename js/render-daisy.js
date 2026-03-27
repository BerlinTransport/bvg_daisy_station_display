function renderDaisy(departures, totalLines, threshold, showTicker) {
    const container = document.getElementById('led-container-daisy');
    container.innerHTML = '';

    // Keine Abfahrten
    if (departures.length === 0) {
        const fontSize = Math.floor(82 / totalLines);
        const msg = document.createElement('div');
        msg.style.cssText = `flex:1;display:flex;align-items:center;justify-content:center;color:var(--led-orange);font-family:"Archivo Narrow",sans-serif;font-size:${fontSize}vh;`;
        msg.textContent = 'Derzeit keine Abfahrten';
        container.appendChild(msg);
        hideLoader();
        return;
    }

    const trainBudget = showTicker ? (totalLines - 1) : totalLines;
    const fontSize = Math.floor(82 / totalLines);
    let usedLines = 0;

    for (let dep of departures) {
        const isCancelled = dep.cancelled === true;
        const directionText = shortenDestination(dep.direction, threshold, dep.line.product);

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
                <span>${getLineName(dep)}</span>
                <span class="swap-container">
                    <span class="swap-text">${directionText}</span>
                    <span class="swap-text">Fahrt fällt aus</span>
                </span>
                <span class="time-cell-daisy">--</span>
            `;
        } else {
            row.innerHTML = `
                <span>${getLineName(dep)}</span>
                <span>${directionText}</span>
                <span class="time-cell-daisy">${min}</span>
            `;
        }

        container.appendChild(row);
    }

    if (showTicker) {
        const now = new Date();
        const time = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

        const remarks = [];
        for (let dep of departures) {
            if (dep.remarks && Array.isArray(dep.remarks)) {
                for (let r of dep.remarks) {
                    if (r.type === 'warning' || r.type === 'status') {
                        const text = `${dep.line.name} Richtung ${dep.direction}: ${r.text}`;
                        if (!remarks.includes(text)) remarks.push(text);
                    }
                }
            }
        }

        let tickerParts = [`+++ ${time} Uhr`];
        if (remarks.length > 0) remarks.forEach(r => tickerParts.push(`⚠ ${r}`));
        tickerParts.push('Bitte achten Sie auf die Ansagen +++');
        const tickerText = tickerParts.join(' +++ ');

        const tick = document.createElement('div');
        tick.className = 'ticker';

        const inner = document.createElement('div');
        inner.className = 'ticker-content';
        inner.style.fontSize = fontSize + 'vh';
        inner.textContent = tickerText;

        tick.appendChild(inner);
        container.appendChild(tick);

        // Pixel pro Sekunde — konstante Geschwindigkeit egal wie lang der Text ist
        const PX_PER_SEC = 200;

        let startTime = null;
        let textWidth = 0;
        let containerWidth = 0;
        let animFrameId = null;

        function tickerLoop(ts) {
            if (!startTime) {
                textWidth = inner.scrollWidth;
                containerWidth = tick.offsetWidth;
                startTime = ts;
            }

            const elapsed = (ts - startTime) / 1000;
            const totalDistance = textWidth + containerWidth;
            const progress = (elapsed * PX_PER_SEC) % totalDistance;

            inner.style.transform = `translateX(${containerWidth - progress}px)`;
            animFrameId = requestAnimationFrame(tickerLoop);
        }

        animFrameId = requestAnimationFrame(tickerLoop);

        // Animation stoppen wenn Container neu gerendert wird
        const observer = new MutationObserver(() => {
            if (!container.contains(tick)) {
                cancelAnimationFrame(animFrameId);
                observer.disconnect();
            }
        });
        observer.observe(container, { childList: true });
    }



    hideLoader();
}
