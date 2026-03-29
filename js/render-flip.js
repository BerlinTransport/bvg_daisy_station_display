const FLIP_CHARS  = ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ+-:/().';
const FLIP_TIME   = ' 0123456789';
const LINE_CHARS  = [
  ' ',
  'S1','S2','S3','S5','S7','S8','S9',
  'S25','S26','S41','S42','S45','S46','S47','S75','S85',
  'U1','U2','U3','U4','U5','U6','U7','U8','U9',
  'RE1','RE2','RE3','RE4','RE5','RE6','RE7','RE8','RE9','RE20',
  'RB10','RB11','RB12','RB13','RB14','RB20','RB21','RB22','RB24','RB33',
  'ICE','IC','EC','RJ','RJX','NJ','EN','TGV','EST','FLX'
];

// ── Hilfsfunktionen ───────────────────────────────────────

function flipCharIndex(ch, charset) {
  const idx = charset.indexOf(ch.toUpperCase());
  return idx === -1 ? 0 : idx;
}

function formatTrack(track) {
  const digits = String(track).replace(/[^0-9]/g, '');
  return digits.slice(0, 2);
}

function _guessProduct(name) {
  if (name.startsWith('S'))                            return 'suburban';
  if (name.startsWith('U'))                            return 'subway';
  if (name.startsWith('RE') || name.startsWith('RB')) return 'regional';
  return 'express';
}

// ── Animationen ───────────────────────────────────────────

function animateChar(el, toChar, charset, stepMs) {
  const from = flipCharIndex(el.textContent || ' ', charset);
  const to   = flipCharIndex(toChar, charset);
  if (from === to) return;
  const len  = charset.length;
  const dist = (to - from + len) % len;
  let step = 0;
  const iv = setInterval(() => {
    step++;
    el.textContent = charset[(from + step) % len];
    if (step >= dist) clearInterval(iv);
  }, stepMs);
}

function updateFlipCell(cell, newText, charset, stepMs, staggerMs, maxChars) {
  const upper = newText.toUpperCase().slice(0, maxChars);

  while (cell.querySelectorAll('.flip-char').length < maxChars) {
    const s = document.createElement('span');
    s.className = 'flip-char';
    s.textContent = ' ';
    cell.appendChild(s);
  }

  const chars = cell.querySelectorAll('.flip-char');
  for (let i = 0; i < maxChars; i++) {
    chars[i].style.display = '';
    const target = upper[i] || ' ';
    setTimeout(() => animateChar(chars[i], target, charset, stepMs), i * staggerMs);
  }
}

function updateLineCell(cell, lineName, bgColor, fontSize, stepMs) {
  let badge = cell.querySelector('.flip-line-block');
  if (!badge) {
    cell.innerHTML = '';
    badge = document.createElement('span');
    badge.className = 'flip-line-block';
    badge.textContent = ' ';
    badge.dataset.current = ' ';
    badge.style.fontSize = `${fontSize}vh`;
    cell.appendChild(badge);
  }

  const fromName = badge.dataset.current || ' ';
  const from = Math.max(LINE_CHARS.indexOf(fromName), 0);
  const to   = LINE_CHARS.indexOf(lineName);

  if (to === -1) {
    badge.textContent     = lineName;
    badge.dataset.current = lineName;
    badge.style.background = `#${bgColor}`;
    return;
  }

  if (from === to) return;

  const len  = LINE_CHARS.length;
  const dist = (to - from + len) % len;
  let step = 0;

  const iv = setInterval(() => {
    step++;
    const cur = LINE_CHARS[(from + step) % len];
    badge.textContent     = cur;
    badge.dataset.current = cur;
    const curBg = getLineColor({
      line: { name: cur, product: _guessProduct(cur) }
    }).replace('#', '');
    badge.style.background = `#${curBg}`;
    if (step >= dist) clearInterval(iv);
  }, stepMs);
}

function updateTimeCell(cell, timeStr) {
  const digits = timeStr.replace(':', '');

  if (!cell.querySelector('.flip-time-sep')) {
    cell.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      if (i === 2) {
        const sep = document.createElement('span');
        sep.className = 'flip-time-sep';
        sep.textContent = ':';
        cell.appendChild(sep);
      }
      const s = document.createElement('span');
      s.className = 'flip-char';
      s.textContent = ' ';
      cell.appendChild(s);
    }
  }

  const dEls = cell.querySelectorAll('.flip-char');
  dEls.forEach((el, i) => {
    setTimeout(() => animateChar(el, digits[i] || '0', FLIP_TIME, 150), i * 80);
  });
}

// ── Render ────────────────────────────────────────────────

function renderFlip(departures, totalLines, threshold) {
  const container = document.getElementById('led-container-flip');

  const rowHeightVh = 90 / totalLines;
  const rowHeight   = rowHeightVh;
  const fontSize    = rowHeight * 0.48;

  const tileH  = rowHeightVh * 0.72;
  const tileW  = tileH * 0.65;
  const tileFs = tileH * 0.78;

  container.style.setProperty('--tile-h',  `${tileH}vh`);
  container.style.setProperty('--tile-w',  `${tileW}vh`);
  container.style.setProperty('--tile-fs', `${tileFs}vh`);

  if (departures.length === 0) {
    container.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:#f0c040;font-size:${fontSize}vh">Derzeit keine Abfahrten</div>`;
    hideLoader();
    return;
  }

  const slice = departures.slice(0, totalLines);

  while (container.children.length > slice.length) container.removeChild(container.lastChild);
  while (container.children.length < slice.length) {
    const row = document.createElement('div');
    row.className = 'row-flip';

    const lineCell  = document.createElement('div'); lineCell.className  = 'flip-cell-line';
    const destCell  = document.createElement('div'); destCell.className  = 'flip-cell-dest';
    const trackCell = document.createElement('div'); trackCell.className = 'flip-cell-track';
    const timeCell  = document.createElement('div'); timeCell.className  = 'flip-cell-time';

    row.appendChild(lineCell);
    row.appendChild(destCell);
    row.appendChild(trackCell);
    row.appendChild(timeCell);
    container.appendChild(row);
  }

  slice.forEach((dep, i) => {
    const row = container.children[i];
    if (!row) return;

    const lineCell  = row.querySelector('.flip-cell-line');
    const destCell  = row.querySelector('.flip-cell-dest');
    const trackCell = row.querySelector('.flip-cell-track');
    const timeCell  = row.querySelector('.flip-cell-time');

    if (!lineCell || !destCell || !trackCell || !timeCell) {
      container.removeChild(row);
      return;
    }

    const isCancelled = dep.cancelled === true;
    const timeStr   = new Date(dep.when ?? dep.plannedWhen)
      .toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const direction = shortenDestination(dep.direction, threshold, dep.line.product);
    const bgColor   = getLineColor(dep).replace('#', '');
    const isFV      = isExpressTrain(dep);

    let lineName;
    if (!isFV) {
      lineName = dep.line?.name ?? '';
    } else {
      const operatorPrefix = getOperatorPrefix(dep);
      if (operatorPrefix === 'FLX') {
        lineName = 'FLX';
      } else {
        lineName = (dep.line?.name ?? '').replace(/\s*\d+.*$/, '').trim();
      }
    }

    let track = '';
    if (!isCancelled && !['bus','tram','subway'].includes(dep.line.product)) {
      track = dep.platform ?? dep.stop?.platform ?? '';
    }

    row.style.height     = `${rowHeight}vh`;
    row.style.maxHeight  = `${rowHeight}vh`;
    row.style.fontSize   = `${fontSize}vh`;
    row.style.lineHeight = '1';
    row.className = 'row-flip' + (isCancelled ? ' is-cancelled' : '');

    if (lineCell.dataset.line !== lineName) {
      lineCell.dataset.line = lineName;
      if (currentFlipLineMode === 'chars') {
        lineCell.innerHTML = '';
        updateFlipCell(lineCell, lineName, FLIP_CHARS, 120, 60, 4);
      } else {
        updateLineCell(lineCell, lineName, bgColor, fontSize * 0.9, 120);
      }
    }

    updateFlipCell(destCell,  direction,          FLIP_CHARS, 150, 60, threshold);
    updateFlipCell(trackCell, formatTrack(track), FLIP_CHARS, 150, 60, 2);
    updateTimeCell(timeCell,  timeStr);
  });

  hideLoader();
}