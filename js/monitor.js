async function update() {
    if (!currentId) return;

    const totalLines = parseInt(document.getElementById('cfg-max-lines').value) || 7;
    const threshold = parseInt(document.getElementById('cfg-threshold').value) || 22;
    const showTicker = document.getElementById('cfg-show-ticker').checked;

    const filters = {
        suburban: document.getElementById('f-suburban').checked,
        subway: document.getElementById('f-subway').checked,
        tram: document.getElementById('f-tram').checked,
        bus: document.getElementById('f-bus').checked,
        regional: document.getElementById('f-regional').checked
    };

    const params = new URLSearchParams({
        duration: currentVariant === 'daisy' ? 60 : 90,
        results: currentVariant === 'daisy' ? 40 : 50,
        suburban: filters.suburban,
        subway: filters.subway,
        tram: filters.tram,
        bus: filters.bus,
        regional: filters.regional
    });

    try {
        const res = await fetch(`https://v6.vbb.transport.rest/stops/${currentId}/departures?${params.toString()}`);
        const data = await res.json();

        if (!data.departures) { hideLoader(); return; }

        const departures = data.departures.sort((a, b) =>
            new Date(a.when || a.plannedWhen) - new Date(b.when || b.plannedWhen)
        );

        if (currentVariant === 'daisy') {
            renderDaisy(departures, totalLines, threshold, showTicker);
        } else {
            renderTFT(departures, totalLines, threshold);
        }
    } catch (e) {
        console.error(e);
        hideLoader();
    }
}

function startMonitor() {
    update();
    if (timer) clearInterval(timer);
    timer = setInterval(update, currentVariant === 'daisy' ? 20000 : 30000);
}

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        showLoader();
        document.getElementById('search-overlay').style.display = 'flex';
        document.getElementById('monitor-daisy').style.display = 'none';
        document.getElementById('monitor-tft').style.display = 'none';
        document.querySelector('.config-footer').style.display = 'flex';
        clearInterval(timer);
        hideLoader();
    }
});
