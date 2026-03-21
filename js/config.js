const lineColors = {
    'U1': '#7dad4c', 'U2': '#da421e', 'U3': '#00a191', 'U4': '#f9d205',
    'U5': '#7e4d25', 'U6': '#6c6c95', 'U7': '#7599cc', 'U8': '#003380', 'U9': '#f0d722',
    'S1': '#f46a94', 'S2': '#006131', 'S25': '#006131', 'S26': '#006131', 'S3': '#00538f',
    'S41': '#a3301a', 'S42': '#cc6633', 'S45': '#cc6633', 'S46': '#cc6633', 'S47': '#cc6633',
    'S5': '#ff8a00', 'S7': '#7b107d', 'S75': '#7b107d', 'S8': '#5d9222', 'S85': '#5d9222', 'S9': '#8d2341',
    'default-bus': '#95276e', 'default-tram': '#be140e', 'default-regio': '#da251d'
};

function getLineColor(dep) {
    if (lineColors[dep.line.name]) return lineColors[dep.line.name];
    if (dep.line.product === 'bus') return lineColors['default-bus'];
    if (dep.line.product === 'tram') return lineColors['default-tram'];
    if (dep.line.product === 'regional') return lineColors['default-regio'];
    return '#444444';
}

// Display-Variante
document.querySelectorAll('#variant-selector .variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#variant-selector .variant-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentVariant = btn.dataset.variant;
    });
});

// Skalierung
document.querySelectorAll('#scale-selector .variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#scale-selector .variant-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentScale = btn.dataset.scale;
    });
});

// Lauftext
const tickerBtn = document.getElementById('cfg-show-ticker');
tickerBtn.addEventListener('click', () => {
    const isActive = tickerBtn.dataset.active === 'true';
    tickerBtn.dataset.active = (!isActive).toString();
    tickerBtn.classList.toggle('active', !isActive);
    tickerBtn.textContent = !isActive ? 'An' : 'Aus';
});
