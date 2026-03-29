const lineColors = {
    'U1': '#7dad4c', 'U2': '#da421e', 'U3': '#00a191', 'U4': '#f9d205',
    'U5': '#7e4d25', 'U6': '#6c6c95', 'U7': '#7599cc', 'U8': '#003380', 'U9': '#f0d722',
    'S1': '#f46a94', 'S2': '#006131', 'S25': '#006131', 'S26': '#006131', 'S3': '#00538f',
    'S41': '#a3301a', 'S42': '#cc6633', 'S45': '#cc6633', 'S46': '#cc6633', 'S47': '#cc6633',
    'S5': '#ff8a00', 'S7': '#7b107d', 'S75': '#7b107d', 'S8': '#5d9222', 'S85': '#5d9222', 'S9': '#8d2341',
    'default-bus': '#95276e', 'default-tram': '#be140e', 'default-regio': '#da251d', // Fernverkehr
    'default-ice': '#ee1c25',  // DB Rot
    'default-ic':  '#ee1c25',
    'default-ec':  '#ee1c25',
    'default-fv':  '#ee1c25',
    'FLX':         '#51a537',  // Flixtrain Grün
    'NJ':          '#282559',  // Nightjet Dunkelblau
    'EN':          '#282559',
};

function getLineColor(dep) {
  if (lineColors[dep.line.name]) return lineColors[dep.line.name];
  if (dep.line.product === 'bus')      return lineColors['default-bus'];
  if (dep.line.product === 'tram')     return lineColors['default-tram'];
  if (dep.line.product === 'regional') return lineColors['default-regio'];
  if (isExpressTrain(dep)) {
    if (dep.line.name?.startsWith('FLX')) return lineColors['FLX'];
    if (dep.line.name?.startsWith('NJ') || dep.line.name?.startsWith('EN')) return lineColors['NJ'];
    return lineColors['default-ice'];
  }
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

// Zeilenanzahl per Dropdown
const linesSelect = document.getElementById('lines-select');
linesSelect.addEventListener('change', () => {
  currentLines = parseInt(linesSelect.value);
});

// Lauftext
const tickerBtn = document.getElementById('cfg-show-ticker');
tickerBtn.addEventListener('click', () => {
  const isActive = tickerBtn.dataset.active === 'true';
  tickerBtn.dataset.active = (!isActive).toString();
  tickerBtn.classList.toggle('active', !isActive);
  tickerBtn.textContent = !isActive ? 'An' : 'Aus';
});

// Display-Variante — erweitert um Sichtbarkeitssteuerung
document.querySelectorAll('#variant-selector .variant-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#variant-selector .variant-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentVariant = btn.dataset.variant;

    const isDaisy = currentVariant === 'daisy';
    const isZZA   = currentVariant === 'zza';
    document.getElementById('cfg-group-ticker').style.display = isDaisy ? 'flex' : 'none';
    document.getElementById('cfg-group-darkmode').style.display = (currentVariant === 'tft') ? 'flex' : 'none';
    document.getElementById('cfg-group-fliplinemode').style.display = (currentVariant === 'flip') ? 'flex' : 'none'; //
  });
});

// Dunkler Modus
const darkBtn = document.getElementById('cfg-dark-mode');
darkBtn.addEventListener('click', () => {
  const isActive = darkBtn.dataset.active === 'true';
  darkBtn.dataset.active = (!isActive).toString();
  darkBtn.classList.toggle('active', !isActive);
  darkBtn.textContent = !isActive ? 'An' : 'Aus';
  document.getElementById('monitor-tft').classList.toggle('dark-mode', !isActive);
});

// ZZA-Modus Sichtbarkeit bei Variant-Wechsel
document.querySelectorAll('#variant-selector .variant-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('cfg-group-zzamode').style.display =
      currentVariant === 'zza' ? 'flex' : 'none';
  });
});

// ZZA-Modus Buttons
document.querySelectorAll('#zzamode-selector .variant-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#zzamode-selector .variant-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentZzaMode = btn.dataset.zzamode;
  });
});

const fsBtn = document.getElementById('fullscreen-btn');

fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fsBtn.textContent = '✕ Vollbild';
  } else {
    document.exitFullscreen();
    fsBtn.textContent = '⛶ Vollbild';
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fsBtn.textContent = '⛶ Vollbild';
  }
});

// Flip Linienmodus
document.querySelectorAll('[data-fliplinemode]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-fliplinemode]')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFlipLineMode = btn.dataset.fliplinemode;
  });
});