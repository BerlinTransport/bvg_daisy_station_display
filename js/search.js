document.getElementById('station-query').addEventListener('input', async (e) => {
    const q = e.target.value;
    const list = document.getElementById('results-list');
    list.innerHTML = '';
    setSearchError('');
    hideSearchLoader();

    if (q.length < 3) return;

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
            li.onclick = () => {
                currentId = s.id;

                showLoader();
                document.getElementById('search-overlay').style.display = 'none';
                document.querySelector('.config-footer').style.display = 'none';

                if (currentVariant === 'daisy') {
                    document.getElementById('monitor-daisy').style.display = 'flex';
                    document.getElementById('monitor-tft').style.display = 'none';
                } else {
                    document.getElementById('monitor-daisy').style.display = 'none';
                    document.getElementById('monitor-tft').style.display = 'flex';
                }

                startMonitor();
            };
            list.appendChild(li);
        });
    } catch (e) {
        console.error(e);
        hideSearchLoader();
        setSearchError('Fehler bei der Verbindung zur Auskunft. Bitte Internetverbindung prüfen.');
    }
});
