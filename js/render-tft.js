function renderTFT(departures, totalLines, threshold) {
    const container = document.getElementById('led-container-tft');
    container.innerHTML = '';

    const rowHeight = 90 / totalLines;

    departures.slice(0, totalLines).forEach(dep => {
        const diff = Math.round((new Date(dep.when || dep.plannedWhen) - new Date()) / 60000);
        const min = diff <= 0 ? 0 : diff;
        const bgColor = getLineColor(dep);
        const directionText = dep.direction || '';

        let scaleX = 1;
        if (directionText.length > threshold) {
            scaleX = threshold / directionText.length;
            if (scaleX < 0.55) scaleX = 0.55;
        }

        const row = document.createElement('div');
        row.className = 'row-tft';
        row.style.height = rowHeight + 'vh';
        row.style.fontSize = (rowHeight * 0.7) + 'vh';

        row.innerHTML = `
            <div style="display:flex;justify-content:center;align-items:center;height:100%;">
                <div class="line-number" style="background-color:${bgColor}">${dep.line.name}</div>
            </div>
            <div class="destination-container">
                <div class="destination" style="transform:scaleX(${scaleX})">${directionText}</div>
            </div>
            <div class="time-cell-tft ${min === 0 ? 'is-now' : ''}">${min === 0 ? 'jetzt' : min}</div>
        `;
        container.appendChild(row);
    });

    hideLoader();
}
