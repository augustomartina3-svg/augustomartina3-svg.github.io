if (/[?&]pared\b/.test(location.search)) document.body.classList.add('wall');
if (!/[?&]negro\b/.test(location.search)) document.body.classList.add('azul');
'use strict';
/* ============================================================
   Martina Augusto — Portfolio
   Todo se pinta con el mismo pincel: entrada, transiciones, textos, portadas.
   Los proyectos se cargan en projects.js.
   ============================================================ */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeIO = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const DATA = window.PORTFOLIO || { categories: [], projects: [] };
const PROJECTS = DATA.projects.filter((p) => !p.hidden);
const MODE = new URLSearchParams(location.search).get('scroll') === 'cartas' ? 'cartas' : 'bandas';

const home = $('#home'), intro = $('#intro');

/* ---------- utilidades ---------- */
function loadBar() { const lb = $('#loadbar'); lb.classList.remove('run'); void lb.offsetWidth; lb.classList.add('run'); }

// texto con gravedad: cada letra cae y rebota
function dropText(el, text, delay = 0) {
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'l'; s.textContent = ch === ' ' ? ' ' : ch;
    s.style.setProperty('--i', i); s.style.setProperty('--d', delay + 's'); s.style.setProperty('--r', (Math.random() * 40 - 20).toFixed(1) + 'deg');
    el.appendChild(s);
  });
  el.setAttribute('aria-label', text);
}

// texto que se pinta de a poco con un barrido de pincel (no choca con otras animaciones del elemento)
function paintIn(els, base = 250, step = 150, dur = 900) {
  els.forEach((e, i) => {
    if (e.__pa) e.__pa.cancel();
    e.classList.add('paint');
    e.__pa = e.animate([{ '--p': 0 }, { '--p': 122 }], { duration: e.tagName === 'IMG' ? dur * 1.4 : dur, delay: base + i * step, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'both' });
  });
}

function shade(hex, amt) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
  if (!m) return '#1700fe';
  const n = parseInt(m[1], 16), f = (v) => clamp(Math.round(v + 255 * amt), 0, 255);
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join('');
}

/* ============================================================
   Transición: una lámina del color de la sección cae con gravedad y tapa la pantalla, se cambia lo de abajo
   y la lámina sigue cayendo hasta salir. Borde inferior difuso, con grano de papel.
   ============================================================ */
let wiping = false;
function brushWipe(swap, o = {}) {
  return new Promise((resolve) => {
    wiping = true;
    const color = (o.colors && o.colors[0]) || '#171717';
    const el = document.createElement('div');
    el.className = 'curtain'; el.style.setProperty('--c', color); el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    const H = innerHeight, edge = 140, dur = o.dur || 620, hold = o.hold ?? 140;
    const down = el.animate([{ transform: `translateY(${-(H + edge)}px)` }, { transform: 'translateY(0px)' }], { duration: dur, easing: 'cubic-bezier(.55,.05,.9,.55)', fill: 'forwards' });
    down.onfinish = () => {
      swap();
      setTimeout(() => {
        const out = el.animate([{ transform: 'translateY(0px)' }, { transform: `translateY(${H + edge}px)` }], { duration: dur, easing: 'cubic-bezier(.5,.05,.85,.5)', fill: 'forwards' });
        out.onfinish = () => { el.remove(); wiping = false; resolve(); };
      }, hold);
    };
  });
}

/* ============================================================
   Cursor: punto + luz suave
   ============================================================ */
(() => {
  const dot = $('#cursorDot'), halo = $('#cursorHalo');
  let x = 0, y = 0, hx = 0, hy = 0, on = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (!on) { on = true; hx = x; hy = y; dot.classList.add('on'); halo.classList.add('on'); }
  }, { passive: true });
  document.addEventListener('pointerover', (e) => dot.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button, .pf, .it, .cover, .card, .chip, .play .it'))));
  document.documentElement.addEventListener('mouseleave', () => { on = false; dot.classList.remove('on'); halo.classList.remove('on'); });
  (function loop() {
    hx += (x - hx) * 0.09; hy += (y - hy) * 0.09;
    halo.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
    requestAnimationFrame(loop);
  })();
})();

/* ============================================================
   Emojis con gravedad: caen, rebotan, chocan entre ellos y el cursor los empuja
   ============================================================ */
const EMOJIS = ['star', 'sparkle', 'bolt', 'heart', 'smile', 'cool', 'book'].map((n) => `img/sobre-mi/emoji-${n}.svg`);
function EmojiPhys(layer, o = {}) {
  const count = o.count || 6, min = o.min || 50, max = o.max || 90, delay = o.delay || 0, bounce = o.bounce ?? 0.55;
  let items = [], raf = 0, W = 0, H = 0, last = 0, t0 = 0, ptr = null, released = false;
  window.addEventListener('pointermove', (e) => { ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });
  function spawn() {
    W = layer.clientWidth; H = layer.clientHeight;
    layer.innerHTML = ''; items = [];
    for (let i = 0; i < count; i++) {
      const pool = o.pool || EMOJIS;
      const el = new Image(); el.src = pool[(i + (o.offset || 0)) % pool.length]; el.alt = ''; el.draggable = false;
      const s = min + Math.random() * (max - min); el.style.width = s + 'px'; el.style.opacity = '0';
      layer.appendChild(el);
      items.push({ el, s, x: s + Math.random() * Math.max(1, W - 2 * s), y: -s * 2, vx: (Math.random() - 0.5) * 3, vy: 0, rot: Math.random() * 40 - 20, vr: (Math.random() - 0.5) * 5, t: delay + i * 260 });
    }
  }
  function step(now) {
    const dt = Math.min(2, (now - (last || now)) / 16.67); last = now;
    const el0 = now - t0, lb = layer.getBoundingClientRect();
    for (const it of items) {
      if (el0 < it.t) continue;
      if (it.el.style.opacity === '0') it.el.style.opacity = '1';
      // la gravedad apunta un poco hacia donde está el cursor (mayormente hacia abajo)
      const G = o.g ?? 0.42; let gx = 0, gy = G; if (released) gy = 1.2;
      if (o.attract && ptr) { const cx = ptr.x - lb.left - it.x, cy = ptr.y - lb.top - it.y, cd = Math.hypot(cx, cy) || 1, w = Math.min(1, cd / 240) * 0.45; gx = (cx / cd) * 0.5 * w; gy = G * (1 - w) + (cy / cd) * 0.5 * w; }
      it.vx += gx * dt; it.vy += gy * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
      const floor = H - it.s * 0.5 - 8;
      if (it.y > floor && !released) { it.y = floor; if (Math.abs(it.vy) > 2.2) { it.vy = -it.vy * bounce; it.vr += (Math.random() - 0.5) * 4; } else it.vy = 0; it.vx *= Math.pow(0.92, dt); it.vr *= Math.pow(0.9, dt); }
      const half = it.s * 0.5;
      if (it.x < half) { it.x = half; it.vx = Math.abs(it.vx) * 0.6; } if (it.x > W - half) { it.x = W - half; it.vx = -Math.abs(it.vx) * 0.6; }
      if (ptr && !o.attract) { const dx = it.x - (ptr.x - lb.left), dy = it.y - (ptr.y - lb.top), d = Math.hypot(dx, dy) || 1, R = it.s * 0.9 + 60; if (d < R) { const f = (1 - d / R) * 1.6 * dt; it.vx += (dx / d) * f; it.vy -= Math.abs(dy / d) * f * 0.6; } }
    }
    for (let k = 0; k < 2; k++) for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, m = (a.s + b.s) * 0.4;
      if (d < m) { const p = (m - d) / 2, nx = dx / d, ny = dy / d; a.x -= nx * p; a.y -= ny * p; b.x += nx * p; b.y += ny * p; a.vx -= nx * 0.2; b.vx += nx * 0.2; }
    }
    for (const it of items) it.el.style.transform = `translate(${(it.x - it.s / 2).toFixed(1)}px, ${(it.y - it.s / 2).toFixed(1)}px) rotate(${it.rot.toFixed(1)}deg)`;
    raf = requestAnimationFrame(step);
  }
  return {
    release() { released = true; },
    start() { released = false; cancelAnimationFrame(raf); spawn(); last = 0; t0 = performance.now(); raf = requestAnimationFrame(step); },
    stop() { cancelAnimationFrame(raf); },
  };
}

/* ============================================================
   Cursor con compañero: un emojito chico lo sigue con inercia y cambia según la sección
   ============================================================ */
const CursorEmoji = (() => {
  const el = new Image(); el.className = 'cursor-emoji'; el.alt = ''; el.setAttribute('aria-hidden', 'true'); el.src = EMOJIS[1];
  document.body.appendChild(el);
  let x = 0, y = 0, ex = 0, ey = 0, vx = 0, vy = 0, on = false;
  window.addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; x = e.clientX; y = e.clientY; if (!on) { on = true; ex = x; ey = y; el.classList.add('on'); } }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { on = false; el.classList.remove('on'); });
  (function loop() {
    vx += (x + 20 - ex) * 0.06; vy += (y + 20 - ey) * 0.06; vx *= 0.82; vy *= 0.82; ex += vx; ey += vy;
    el.style.transform = `translate3d(${ex.toFixed(1)}px, ${ey.toFixed(1)}px, 0) rotate(${(vx * 2.5).toFixed(1)}deg)`;
    requestAnimationFrame(loop);
  })();
  return { set(name) { const s = `img/sobre-mi/emoji-${name}.svg`; if (!el.src.endsWith(s)) { el.src = s; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } } };
})();

/* ============================================================
   Carpetas vectoriales: degradé de aerógrafo, brillos y grano; nítidas en cualquier pantalla
   ============================================================ */
const KITS = {
  black: { g: ['#565656', '#1b1b1b', '#000000'], tab: ['#3c3c3c', '#0b0b0b'], mot: ['#8d8d8d', '#000000'], moA: 0.26, ink: '#ffffff' },
  blue: { g: ['#8090ff', '#1700fe', '#000a8a'], tab: ['#4a5aee', '#000a8a'], mot: ['#dfe3ff', '#00045c'], moA: 0.38, ink: '#ffffff' },
  neon: { g: ['#f5ffa4', '#b4ff1a', '#5cb000'], tab: ['#e0ff5c', '#7ccc00'], mot: ['#ffffff', '#3c8600'], moA: 0.45, ink: '#101010' },
};
const FRONT = 'M14 78Q14 62 30 62L232 62Q248 62 248 78L248 186Q248 204 230 204L32 204Q14 204 14 186Z';
const TAB = 'M14 78L14 44Q14 24 34 24L94 24Q108 24 115 35Q122 46 138 46L212 46Q230 46 230 62L230 78Z';
function folderSVG(kind, label, u) {
  const k = KITS[kind];
  return `<svg class="fsvg" viewBox="0 0 262 218" aria-hidden="true">
<defs>
<radialGradient id="g${u}" cx=".24" cy=".14" r="1.12"><stop offset="0" stop-color="${k.g[0]}"/><stop offset=".48" stop-color="${k.g[1]}"/><stop offset="1" stop-color="${k.g[2]}"/></radialGradient>
<linearGradient id="t${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k.tab[0]}"/><stop offset="1" stop-color="${k.tab[1]}"/></linearGradient>
<linearGradient id="d${u}" gradientUnits="userSpaceOnUse" x1="6" y1="84" x2="256" y2="184"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".43" stop-color="#fff" stop-opacity=".42"/><stop offset=".56" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="h${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="k${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
<filter id="s${u}" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="b${u}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="11"/></filter>
<filter id="c${u}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.4"/></filter>
<filter id="n${u}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="8"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.7 -.62"/></filter>
<filter id="m${u}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="2"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.5 -.78"/></filter>
<clipPath id="f${u}"><path d="${FRONT}"/></clipPath><clipPath id="p${u}"><path d="${TAB}"/></clipPath>
</defs>
<ellipse cx="131" cy="209" rx="104" ry="5" fill="#101030" opacity=".14" filter="url(#c${u})"/>
<g filter="url(#s${u})"><path d="${TAB}" fill="url(#t${u})"/><path d="${FRONT}" fill="url(#g${u})"/></g>
<g clip-path="url(#p${u})"><path d="M30 25.2L96 25.2" stroke="#fff" stroke-opacity=".7" stroke-width="1.4" stroke-linecap="round"/></g>
<g clip-path="url(#f${u})">
<ellipse cx="96" cy="116" rx="80" ry="34" fill="${k.mot[0]}" opacity="${k.moA}" filter="url(#b${u})"/>
<ellipse cx="206" cy="166" rx="62" ry="30" fill="${k.mot[1]}" opacity=".4" filter="url(#b${u})"/>
<rect x="14" y="140" width="234" height="64" fill="url(#k${u})"/>
<rect x="14" y="62" width="234" height="142" fill="url(#d${u})"/>
<rect x="14" y="62" width="234" height="44" fill="url(#h${u})"/>
<path d="M28 63.4L234 63.4" stroke="#fff" stroke-opacity=".9" stroke-width="1.6" stroke-linecap="round"/>
<path d="M30 203.3L232 203.3" stroke="#fff" stroke-opacity=".24" stroke-width="1.2" stroke-linecap="round"/>
<rect width="262" height="218" filter="url(#n${u})" opacity=".5" style="mix-blend-mode:soft-light"/>
<rect width="262" height="218" filter="url(#m${u})" opacity=".3" style="mix-blend-mode:multiply"/>
<path d="${FRONT}" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.2"/>
</g>
<path class="fstroke" pathLength="1" d="${TAB}"/><path class="fstroke" pathLength="1" d="${FRONT}"/>
<text class="lbl" x="131" y="140" text-anchor="middle" transform="rotate(-6 131 140)" fill="${k.ink}" stroke="${k.ink}"></text>
</svg>`;
}
const FOLDER_ASPECT = { silver: '1000 / 695', blue: '1000 / 691', orange: '1000 / 648', behance: '1000 / 648' };
$$('.pf').forEach((a) => {
  const k = a.dataset.kind;
  a.insertAdjacentHTML('afterbegin', `<div class="fbox" style="aspect-ratio:${FOLDER_ASPECT[k]}"><img class="fimg" src="img/ui/folder-${k}.png" alt="" width="1000"><img class="fopen" src="img/ui/folder-${k}-open.png" alt="" width="1000"></div>`);
  a.insertAdjacentHTML('afterbegin', '<span class="fclip" aria-hidden="true" style="--ft:' + ({ silver: '16.9%', blue: '14.8%', orange: '15.5%', behance: '15.5%' }[k] || '16%') + '"><span class="fslip"><b class="fname"></b></span></span>');
  dropText($('.fname', a), a.dataset.label, 0);
});

// pestaña de carpetas como carrusel: una principal centrada, se elige con flechas, con el dedo o con el mouse
(() => {
  const stage = $('#stage'), prev = $('#stagePrev'), next = $('#stageNext'), dotsBox = $('#stageDots');
  if (!stage) return;
  const cards = $$('.pf', stage);
  cards.forEach(() => dotsBox.insertAdjacentHTML('beforeend', '<i></i>'));
  const dots = $$('i', dotsBox);
  let idx = 0, cool = 0;
  const goTo = (i, smooth = true) => {
    idx = clamp(i, 0, cards.length - 1);
    const c = cards[idx];
    stage.scrollTo({ left: c.offsetLeft - (stage.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
  };
  const mark = () => {
    cards.forEach((c, i) => c.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    prev.disabled = idx === 0; next.disabled = idx === cards.length - 1;
  };
  const closest = () => {
    const cx = stage.scrollLeft + stage.clientWidth / 2;
    let bi = 0, bd = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - cx); if (d < bd) { bd = d; bi = i; } });
    return bi;
  };
  let sTimer = 0;
  stage.addEventListener('scroll', () => { clearTimeout(sTimer); sTimer = setTimeout(() => { idx = closest(); mark(); }, 90); }, { passive: true });
  prev.addEventListener('click', () => goTo(idx - 1));
  next.addEventListener('click', () => goTo(idx + 1));
  cards.forEach((c, i) => {
    c.addEventListener('click', (e) => {
      if (i !== idx) { e.preventDefault(); e.stopImmediatePropagation(); goTo(i); }
    }, true);
  });
  mark();
  addEventListener('resize', () => goTo(idx, false));
  new ResizeObserver(() => goTo(idx, false)).observe(stage);
})();

// la luz del cursor recorre la carpeta que se estÃ¡ por elegir
document.addEventListener('pointermove', (e) => {
  const f = e.target.closest && e.target.closest('.pf, .cover, .card, .chip, .close, .pnav');
  if (!f) return;
  const b = (f.classList.contains('pf') ? $('.fbox', f) : f).getBoundingClientRect();
  f.style.setProperty('--mx', (((e.clientX - b.left) / b.width) * 100).toFixed(1) + '%');
  f.style.setProperty('--my', (((e.clientY - b.top) / b.height) * 100).toFixed(1) + '%');
}, { passive: true });
/* ============================================================
   1 · Entrada: HOLA en su tipografía (Mrs Sheppards). Se dibuja el contorno letra por letra,
       se rellena con el degradé de aerógrafo, y al click se desintegra.
   ============================================================ */
(() => {
  const cv = $('#holaCv'), btn = $('#bigFile'), ctx = cv.getContext('2d');
  const TEXT = 'Hola', FONT = "'Mrs Sheppards'";
  let W = 0, H = 0, dpr = 1, size = 100, baseX = 0, baseY = 0, xs = [], fin = null, t0 = 0, state = 'wait', raf = 0, parts = null;
  const clamp01 = (v) => clamp(v, 0, 1);

  function layout() {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    W = Math.round(innerWidth * dpr); H = Math.round(innerHeight * dpr);
    cv.width = W; cv.height = H;
    ctx.font = `100px ${FONT}`;
    const m = ctx.measureText(TEXT), target = Math.min(W * 0.5, H * 0.9);
    size = 100 * target / m.width;
    ctx.font = `${size}px ${FONT}`;
    const mm = ctx.measureText(TEXT);
    baseX = (W - mm.width) / 2;
    baseY = H / 2 + (mm.actualBoundingBoxAscent - mm.actualBoundingBoxDescent) / 2;
    xs = [...TEXT].map((_, i) => baseX + ctx.measureText(TEXT.slice(0, i)).width);
    fin = buildFill();
    buildLetters();
  }

  // el HOLA terminado: degradé lila-blanco con manchas suaves y grano de aerógrafo
  function buildFill() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.font = `${size}px ${FONT}`; g.textBaseline = 'alphabetic';
    const gr = g.createLinearGradient(baseX, baseY - size * 0.6, baseX + size * 2.4, baseY + size * 0.2);
    if (document.body.classList.contains('azul')) { gr.addColorStop(0, '#05003a'); gr.addColorStop(0.3, '#0a0078'); gr.addColorStop(0.55, '#3320e8'); gr.addColorStop(0.8, '#0a0078'); gr.addColorStop(1, '#05003a'); }
    else { gr.addColorStop(0, '#1100cc'); gr.addColorStop(0.28, '#1700fe'); gr.addColorStop(0.55, '#2a14ff'); gr.addColorStop(0.8, '#1700fe'); gr.addColorStop(1, '#1100cc'); }
    g.fillStyle = gr; g.fillText(TEXT, baseX, baseY);
    g.globalCompositeOperation = 'source-atop';
    [[0.16, 0.62, 0.34, '#0e00a8', 0.5], [0.5, 0.2, 0.22, '#0e00a8', 0.4], [0.88, 0.7, 0.3, '#0e00a8', 0.5], [0.3, 0.5, 0.26, '#3f2cff', 0.6], [0.66, 0.46, 0.24, '#3f2cff', 0.5], [0.96, 0.74, 0.17, '#f2f3ff', 0.85]].forEach(([fx, fy, fr, col, al]) => {
      const x = baseX + fx * size * 2.4, y = baseY - size * 0.5 + fy * size * 0.75, r = fr * size;
      const rg = g.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.globalAlpha = al; g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
    });
    g.globalAlpha = 1;
    const tile = document.createElement('canvas'); tile.width = tile.height = 256;
    const tg = tile.getContext('2d'), id = tg.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random(); id.data[i] = v < 0.5 ? 14 : 110; id.data[i + 1] = v < 0.5 ? 0 : 96; id.data[i + 2] = v < 0.5 ? 168 : 255; id.data[i + 3] = Math.random() < 0.5 ? 0 : 70; }
    tg.putImageData(id, 0, 0);
    g.fillStyle = g.createPattern(tile, 'repeat'); g.fillRect(0, 0, W, H);
    return c;
  }

  const tmp = document.createElement('canvas'), tctx = tmp.getContext('2d');
  const T_END = 3.3, HOLD = 0.7;

  // dibuja el HOLA en el instante t (0 → T_END): contorno letra por letra y después el relleno; con t decreciente se "desescribe"
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${size}px ${FONT}`; ctx.textBaseline = 'alphabetic';
    const L = size * 30;
    ctx.lineWidth = Math.max(1.5, 2.2 * dpr); ctx.lineJoin = 'round';
    [...TEXT].forEach((ch, i) => {
      const p = clamp01((t - 0.15 - i * 0.32) / 1.25);
      if (p <= 0) return;
      const fade = 1 - clamp01((t - 1.0 - i * 0.32) / 1.2) * 0.85;
      ctx.setLineDash([L, L]); ctx.lineDashOffset = L * (1 - easeIO(p));
      ctx.strokeStyle = `rgba(255,255,255,${0.9 * fade})`; ctx.strokeText(ch, xs[i], baseY);
    });
    ctx.setLineDash([]);
    const g = clamp01((t - 0.55) / 2.5), feather = size * 0.55;
    if (g > 0) {
      if (t >= T_END) { ctx.drawImage(fin, 0, 0); if (phase === 'hold') sheen(); return; }
      const edge = baseX - feather + g * (size * 2.5 + feather * 2);
      tmp.width = W; tmp.height = H;
      tctx.globalCompositeOperation = 'source-over'; tctx.drawImage(fin, 0, 0);
      tctx.globalCompositeOperation = 'destination-in';
      const mk = tctx.createLinearGradient(edge - feather, 0, edge, 0); mk.addColorStop(0, 'rgba(0,0,0,1)'); mk.addColorStop(1, 'rgba(0,0,0,0)');
      tctx.fillStyle = mk; tctx.fillRect(0, 0, W, H);
      ctx.drawImage(tmp, 0, 0);
    }
  }

  // brillo perlado: una luz que sigue al cursor; se mueve mas cuanto mas rapido lo mueves y cambia de tono segun donde cae
  let px = 0.5, py = 0.5, shX = 0.5, shY = 0.5, spd = 0, moved = false;
  addEventListener('pointermove', (e) => { const nx = e.clientX / innerWidth, ny = e.clientY / innerHeight; spd = Math.min(1, spd + Math.hypot(nx - px, ny - py) * 6); px = nx; py = ny; moved = true; }, { passive: true });
  function sheen() {
    const now = performance.now() / 1000;
    const tx = moved ? px : .5 + Math.sin(now * .5) * .22, ty = moved ? py : .5 + Math.cos(now * .37) * .1;
    shX += (tx - shX) * .09; shY += (ty - shY) * .09; spd *= .94;
    const x = shX * W, y = shY * H, hue = 225 + shX * 45, r = size * (.5 + spd * .3), a = .1 + spd * .3;
    ctx.save(); ctx.globalCompositeOperation = 'source-atop';
    let g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsla(${hue},90%,90%,${a + .12})`); g.addColorStop(.35, `hsla(${hue + 20},85%,78%,${a * .7})`); g.addColorStop(1, `hsla(${hue + 40},80%,70%,0)`);
    const bx0 = baseX - size * .2, by0 = baseY - size * 1.05, bw = size * 3, bh = size * 1.6;
    ctx.fillStyle = g; ctx.fillRect(bx0, by0, bw, bh);
    const ang = Math.atan2(shY - .5, shX - .5) + 1.2, dx = Math.cos(ang) * size * .5, dy = Math.sin(ang) * size * .5;
    g = ctx.createLinearGradient(x - dx, y - dy, x + dx, y + dy);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, `hsla(${hue + 20},100%,96%,${.07 + spd * .25})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(bx0, by0, bw, bh);
    ctx.restore();
  }

  // JUEGO: cada letra es un objeto con gravedad. Se agarran y se tiran, rebotan en el piso y despues vuelven solas a su lugar.
  let letters = [], grab = null, grabbed = false;
  function buildLetters() {
    ctx.font = `${size}px ${FONT}`;
    letters = [...TEXT].map((ch, i) => {
      const m = ctx.measureText(ch), pad = size * .12;
      const bx = Math.floor(xs[i] - m.actualBoundingBoxLeft - pad), by = Math.floor(baseY - m.actualBoundingBoxAscent - pad);
      const w = Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight + pad * 2), h = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + pad * 2);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.font = `${size}px ${FONT}`; g.textBaseline = 'alphabetic'; g.fillText(ch, xs[i] - bx, baseY - by);
      g.globalCompositeOperation = 'source-in'; g.drawImage(fin, -bx, -by);
      return { c, g, w, h, hx: bx, hy: by, x: bx, y: by, vx: 0, vy: 0, rot: 0, vr: 0, st: 'home', rest: 0, gx: 0, gy: 0 };
    });
  }
  function stepLetters(dt) {
    const gr = H * 2.7;
    letters.forEach((L) => {
      if (L.st === 'drag' || L.st === 'home') return;
      if (L.st === 'fly') {
        L.vy += gr * dt; L.x += L.vx * dt; L.y += L.vy * dt; L.rot += L.vr * dt;
        if (L.y + L.h > H) {
          if (L.vy > H * .55) thud();
          L.y = H - L.h; if (Math.abs(L.vy) < H * .22) { L.st = 'rest'; L.rest = 0; L.vy = L.vx = L.vr = 0; } else { L.vy *= -.55; L.vx *= .86; L.vr *= .7; }
        }
        if (L.x < 0) { L.x = 0; L.vx = Math.abs(L.vx) * .7; } else if (L.x + L.w > W) { L.x = W - L.w; L.vx = -Math.abs(L.vx) * .7; }
      } else if (L.st === 'rest') { L.rest += dt; if (L.rest > 1.2) { L.st = 'back'; L.bvx = L.bvy = L.bvr = 0; } }
      else if (L.st === 'back') {
        // vuelve de un tiron, como con gravedad propia hacia su lugar (resorte con un poquito de rebote)
        const stiff = 70, damp = 2 * Math.sqrt(stiff) * .62, tr = Math.round(L.rot / 6.2832) * 6.2832;
        const ax = (L.hx - L.x) * stiff - L.bvx * damp, ay = (L.hy - L.y) * stiff - L.bvy * damp, ar = (tr - L.rot) * stiff - L.bvr * damp;
        L.bvx += ax * dt; L.bvy += ay * dt; L.bvr += ar * dt;
        L.x += L.bvx * dt; L.y += L.bvy * dt; L.rot += L.bvr * dt;
        if (Math.abs(L.hx - L.x) + Math.abs(L.hy - L.y) < 1 && Math.abs(L.bvx) + Math.abs(L.bvy) < 24) { L.x = L.hx; L.y = L.hy; L.rot = 0; L.st = 'home'; }
      }
    });
    // las letras chocan entre si: una que vuela despierta a las que estan quietas y las empuja
    for (let i = 0; i < letters.length; i++) for (let j = i + 1; j < letters.length; j++) {
      const A = letters[i], B = letters[j];
      if (A.st === 'back' || B.st === 'back' || (A.st === 'home' && B.st === 'home')) continue;
      const ax = A.x + A.w / 2, ay = A.y + A.h / 2, bx = B.x + B.w / 2, by = B.y + B.h / 2, dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 1;
      const min = Math.min(A.w, A.h) * .4 + Math.min(B.w, B.h) * .4; if (d >= min) continue;
      const nx = dx / d, ny = dy / d, ov = min - d;
      const av = A.st === 'drag' ? [A.dvx || 0, A.dvy || 0] : [A.vx, A.vy], bv = B.st === 'drag' ? [B.dvx || 0, B.dvy || 0] : [B.vx, B.vy];
      const rv = (bv[0] - av[0]) * nx + (bv[1] - av[1]) * ny; if (rv > 0 && ov < 2) continue;
      [A, B].forEach((L) => { if (L.st === 'home' || L.st === 'rest') { L.st = 'fly'; } });
      const fixA = A.st === 'drag', fixB = B.st === 'drag';
      if (!fixA && !fixB) { A.x -= nx * ov / 2; A.y -= ny * ov / 2; B.x += nx * ov / 2; B.y += ny * ov / 2; }
      else if (fixA) { B.x += nx * ov; B.y += ny * ov; } else { A.x -= nx * ov; A.y -= ny * ov; }
      const imp = Math.max(0, -rv) * 1.5 + 60;
      if (!fixA) { A.vx -= nx * imp * (fixB ? 1.6 : .8); A.vy -= ny * imp * (fixB ? 1.6 : .8); A.vr -= nx * .8; }
      if (!fixB) { B.vx += nx * imp * (fixA ? 1.6 : .8); B.vy += ny * imp * (fixA ? 1.6 : .8); B.vr += nx * .8; }
    }
  }
  let thudAt = 0;
  function thud() { const n = performance.now(); if (n - thudAt < 260) return; thudAt = n; cv.animate([{ translate: '0 0' }, { translate: '0 5px' }, { translate: '0 0' }], { duration: 240, easing: 'ease-out' }); }
  function drawLetters() {
    ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
    // en reposo (nadie la toco, o ya volvieron todas) se dibuja el HOLA entero y sin costuras;
    // recien cuando se agarra o vuela alguna letra se arma con los recortes individuales
    if (letters.every((L) => L.st === 'home')) { ctx.drawImage(fin, 0, 0); return; }
    letters.filter((L) => L !== grab).concat(grab ? [grab] : []).forEach((L) => { ctx.save(); ctx.translate(L.x + L.w / 2, L.y + L.h / 2); ctx.rotate(L.rot); ctx.drawImage(L.c, -L.w / 2, -L.h / 2); ctx.restore(); });
  }
  function hitLetter(cx, cy) {
    for (let i = letters.length - 1; i >= 0; i--) {
      const L = letters[i], dx = cx - (L.x + L.w / 2), dy = cy - (L.y + L.h / 2), co = Math.cos(-L.rot), si = Math.sin(-L.rot);
      const u = dx * co - dy * si + L.w / 2, v = dx * si + dy * co + L.h / 2;
      if (u < 0 || v < 0 || u >= L.w || v >= L.h) continue;
      if (L.g.getImageData(u | 0, v | 0, 1, 1).data[3] > 40) return L;
    }
    return null;
  }
  const trail = [];
  btn.addEventListener('pointerdown', (e) => {
    grabbed = false; if (phase !== 'hold') return;
    const L = hitLetter(e.clientX * dpr, e.clientY * dpr); if (!L) return;
    grab = L; grabbed = true; L.st = 'drag'; L.dvx = L.dvy = 0; L.gx = e.clientX * dpr - L.x; L.gy = e.clientY * dpr - L.y; trail.length = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!grab) return; const X = e.clientX * dpr, Y = e.clientY * dpr;
    grab.x = clamp(X - grab.gx, 0, W - grab.w); grab.y = clamp(Y - grab.gy, 0, H - grab.h);
    trail.push([performance.now(), X, Y]); while (trail.length > 5) trail.shift();
    const a = trail[0], b = trail[trail.length - 1];
    if (b[0] - a[0] > 8) { grab.dvx = (b[1] - a[1]) / (b[0] - a[0]) * 1000; grab.dvy = (b[2] - a[2]) / (b[0] - a[0]) * 1000; }
  }, { passive: true });
  const letGo = () => {
    if (!grab) return; const L = grab; grab = null; const a = trail[0], b = trail[trail.length - 1]; let vx = 0, vy = 0;
    if (a && b && b[0] - a[0] > 8) { vx = (b[1] - a[1]) / (b[0] - a[0]) * 1000; vy = (b[2] - a[2]) / (b[0] - a[0]) * 1000; }
    L.dvx = L.dvy = 0; L.vx = vx * .8; L.vy = vy * .8; L.vr = vx / W * 4; L.st = 'fly';
  };
  addEventListener('pointerup', letGo); addEventListener('pointercancel', letGo);
  // secuencia sola: se escribe → pausa → se desescribe → scroll hacia el costado hasta las carpetas (sin click)
  let phase = 'wait', tt = 0, last = 0, holdT = 0, speed = 1, startAt = 0;
  function loop(now) {
    if (phase === 'slide') return;
    lean();
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    if (phase === 'wait') { if (now >= startAt) { phase = 'write'; intro.classList.add('writing'); } }
    else if (phase === 'write') { tt += dt * speed; draw(Math.min(tt, T_END)); if (tt >= T_END) { phase = 'hold'; holdT = 0; intro.classList.add('ready'); } }
    else if (phase === 'hold') { stepLetters(dt); drawLetters(); sheen(); }
    else if (phase === 'unwrite') { tt -= dt * speed * 1.7; draw(Math.max(tt, 0)); if (tt <= 0) { phase = 'slide'; slide(); return; } }
    raf = requestAnimationFrame(loop);
  }
  function slide() {
    ctx.clearRect(0, 0, W, H);
    document.body.classList.remove('booting');
    loadBar();
    requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('slide')));
    setTimeout(() => {
      intro.classList.add('leave'); home.classList.add('show');
      const h = location.hash; if (h === '#trabajos') showPanel('projects'); else if (h === '#sobre-mi') showPanel('about');
    }, 1050);
  }  // el HOLA hace un zoom con un brillo perlado que lo cruza, vuelve a su tamaño y cae con gravedad
  function fall() {
    const D = 2700, t0s = performance.now();
    cv.style.animation = 'none';
    cv.animate([
      { transform: 'scale(1) translateY(0) rotate(0deg)', filter: 'blur(0)', opacity: 1, offset: 0, easing: 'cubic-bezier(.2,.7,.2,1)' },
      { transform: 'scale(1.075) translateY(0) rotate(0deg)', filter: 'blur(0)', opacity: 1, offset: .3, easing: 'cubic-bezier(.5,0,.3,1)' },
      { transform: 'scale(1) translateY(0) rotate(0deg)', filter: 'blur(0)', opacity: 1, offset: .5, easing: 'linear' },
      { transform: 'scale(1) translateY(-1.4vh) rotate(-.6deg)', filter: 'blur(0)', opacity: 1, offset: .58, easing: 'cubic-bezier(.6,0,.95,.55)' },
      { transform: 'scale(1) translateY(130vh) rotate(7deg)', filter: 'blur(2px)', opacity: 1, offset: 1 }
    ], { duration: D, fill: 'both' });
    const tick = () => {
      const p = clamp01((performance.now() - t0s) / (D * .5));
      drawLetters();
      if (p < 1) {
        const k = -.35 + p * 1.7, w = .3, g = ctx.createLinearGradient(W * (k - w), 0, W * (k + w), H * .5);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.42, 'rgba(226,228,255,.42)'); g.addColorStop(.5, 'rgba(255,255,255,.7)'); g.addColorStop(.58, 'rgba(226,228,255,.42)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        requestAnimationFrame(tick);
      }
      ctx.globalCompositeOperation = 'source-over';
    };
    tick();
  }  // un click (o Enter) solo sirve para saltear la entrada
  const skip = () => { if (phase === 'wait' || phase === 'write' || phase === 'hold') { phase = 'out'; intro.classList.remove('ready'); grab = null; drawLetters(); fall(); setTimeout(() => { phase = 'slide'; slide(); }, 2500); } };
  btn.addEventListener('click', () => { if (grabbed) { grabbed = false; return; } skip(); });
  addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); } });
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (phase === 'slide') return; layout(); draw(clamp(tt, 0, T_END)); }, 200); });

  const emoIntro = EmojiPhys($('#introEmo'), { count: 5, min: 46, max: 78, delay: 1300, attract: true, pool: ['img/sobre-mi/emoji-smile.svg'] });
  let lx = 0, ly = 0, ptx = 0, pty = 0;
  addEventListener('pointermove', (e) => { ptx = (e.clientX / innerWidth - 0.5) * 2; pty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
  const lean = () => { lx += (ptx - lx) * 0.06; ly += (pty - ly) * 0.06; cv.style.transform = `translate3d(${(lx * 14).toFixed(1)}px, ${(ly * 9).toFixed(1)}px, 0) rotate(${(lx * 0.8).toFixed(2)}deg)`; };
  const start = () => { layout(); startAt = performance.now() + 500; raf = requestAnimationFrame(loop); };
  (document.fonts && document.fonts.load ? document.fonts.load(`100px ${FONT}`, TEXT) : Promise.resolve()).then(start, start);

  // precarga en segundo plano: fondo y primeras portadas
  ['img/ui/bg.jpg', ...PROJECTS.slice(0, 3).map((p) => p.cover)].forEach((s) => { const i = new Image(); i.src = s; });
})();

/* ============================================================
   Carpetas con física (como en Sobre mí): cuando terminan de armarse flotan alrededor de su lugar,
   se inclinan hacia el cursor, chocan entre sí, giran según cómo se muevan y se pueden agarrar y tirar.
   ============================================================ */
const HomePhys = (() => {
  let items = [], raf = 0, started = false, ptr = null, drag = null, last = 0;
  addEventListener('pointermove', (e) => { ptr = { x: e.clientX, y: e.clientY }; }, { passive: true });
  const num = (s, i) => parseFloat((s || '').split(' ')[i]) || 0;

  function start(force) {
    if (started || (reduced && !force)) return; started = true;
    items = $$('.pf').map((el, i) => {
      const cs = getComputedStyle(el), r0 = parseFloat(cs.rotate) || 0;
      const it = { el, ox: num(cs.translate, 0), oy: num(cs.translate, 1), vx: 0, vy: 0, r0, rot: r0, ph: Math.random() * 6.28, fx: 0.00028 + i * 0.00006, fy: 0.00033 + i * 0.00005, noClick: false };
      el.style.animation = 'none'; el.style.opacity = '1';
      el.addEventListener('pointerdown', (e) => {
        if (e.button) return;
        drag = { it, sx: e.clientX, sy: e.clientY, ox: it.ox, oy: it.oy, lx: e.clientX, ly: e.clientY, moved: false };
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* nada */ }
      });
      el.addEventListener('click', (e) => { if (it.noClick) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
      return it;
    });
    resume();
  }
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
    if (drag.moved) { const it = drag.it; it.ox = drag.ox + dx; it.oy = drag.oy + dy; it.vx = (e.clientX - drag.lx) * 0.6; it.vy = (e.clientY - drag.ly) * 0.6; drag.lx = e.clientX; drag.ly = e.clientY; }
  });
  const up = () => { if (!drag) return; if (drag.moved) { const it = drag.it; it.noClick = true; setTimeout(() => { it.noClick = false; }, 80); } drag = null; };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);

  function step(now) {
    const dt = Math.min(2, (now - (last || now)) / 16.67); last = now;
    const W = innerWidth, H = innerHeight;
    const rects = items.map((it) => it.el.getBoundingClientRect());
    items.forEach((it, i) => {
      if (drag && drag.it === it && drag.moved) { apply(it); return; }
      // deambula alrededor de su lugar y se inclina hacia el cursor
      let tx = Math.cos(now * it.fx + it.ph) * W * 0.075, ty = Math.sin(now * it.fy + it.ph * 1.7) * H * 0.05;
      if (ptr) { const r = rects[i], dx = ptr.x - (r.left + r.width / 2), dy = ptr.y - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, w = Math.min(1, d / 300); tx += (dx / d) * 40 * w; ty += (dy / d) * 40 * w; }
      it.vx = (it.vx + (tx - it.ox) * 0.008 * dt) * Math.pow(0.9, dt); it.vy = (it.vy + (ty - it.oy) * 0.008 * dt) * Math.pow(0.9, dt);
      it.ox += it.vx * dt; it.oy += it.vy * dt;
      // que no se salgan de la pantalla
      const r = rects[i], m = 10;
      if (r.left < m) it.ox += m - r.left; if (r.right > W - m) it.ox -= r.right - (W - m);
      if (r.top < m) it.oy += m - r.top; if (r.bottom > H - m) it.oy -= r.bottom - (H - m);
    });
    // chocan entre sí
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = rects[i], b = rects[j];
      const dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2), d = Math.hypot(dx, dy) || 1, min = (a.width + b.width) * 0.36;
      if (d < min) { const p = (min - d) / 2, nx = dx / d, ny = dy / d; if (!(drag && drag.it === items[i] && drag.moved)) { items[i].ox -= nx * p; items[i].oy -= ny * p; items[i].vx -= nx * 0.3; items[i].vy -= ny * 0.3; } if (!(drag && drag.it === items[j] && drag.moved)) { items[j].ox += nx * p; items[j].oy += ny * p; items[j].vx += nx * 0.3; items[j].vy += ny * 0.3; } }
    }
    items.forEach(apply);
    raf = requestAnimationFrame(step);
  }
  function apply(it) {
    const nw = performance.now();
    it.rot += ((it.r0 + clamp(it.vx * 2.4, -9, 9) + Math.sin(nw * 0.0006 + it.ph) * 3) - it.rot) * 0.1;
    it.el.style.scale = (1 + Math.sin(nw * 0.0009 + it.ph * 1.4) * 0.018).toFixed(4);
    if (!it.nextPeek) it.nextPeek = nw + 3000 + Math.random() * 6000;
    if (nw > it.nextPeek) { it.nextPeek = nw + 6500 + Math.random() * 6000; it.el.classList.add('peek'); setTimeout(() => it.el.classList.remove('peek'), 1300); }
    it.el.style.translate = `${it.ox.toFixed(1)}px ${it.oy.toFixed(1)}px`;
    it.el.style.rotate = `${it.rot.toFixed(2)}deg`;
  }
  function resume() { if (!started) return; cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(step); }
  function pause() { cancelAnimationFrame(raf); }
  return { start, pause, resume };
})();

/* ============================================================
   2 · Home: los emojis de cada carpeta siguen al cursor con inercia
   ============================================================ */
(() => {
  $$('.pf').forEach((f) => {
    const imgs = $$('.pops img', f);
    if (!imgs.length) return;
    const st = imgs.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const offs = [[-64, -44], [-8, -76], [50, -66], [104, -40]];
    let raf = 0, active = false, mx = 0, my = 0;
    f.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; });
    function loop() {
      if (!active) return;
      const r = f.getBoundingClientRect();
      imgs.forEach((im, i) => {
        const s = st[i], w = im.offsetWidth || 30;
        s.vx += (mx + offs[i][0] - s.x) * 0.05; s.vy += (my + offs[i][1] - s.y) * 0.05;
        s.vx *= 0.84; s.vy *= 0.84; s.x += s.vx; s.y += s.vy;
        const bx = r.left + r.width * 0.36 + w / 2, by = r.top + r.width * 0.3 + w / 2;
        im.style.translate = `${(s.x - bx).toFixed(1)}px ${(s.y - by).toFixed(1)}px`;
        im.style.rotate = `${(s.vx * 2.2).toFixed(1)}deg`;
      });
      raf = requestAnimationFrame(loop);
    }
    f.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch' || reduced) return;
      mx = e.clientX; my = e.clientY; active = true; f.classList.add('magnet');
      const r = f.getBoundingClientRect();
      st.forEach((s) => { s.x = r.left + r.width * 0.45; s.y = r.top + r.width * 0.4; s.vx = s.vy = 0; });
      cancelAnimationFrame(raf); loop();
    });
    f.addEventListener('pointerleave', () => {
      active = false; f.classList.remove('magnet'); cancelAnimationFrame(raf);
      imgs.forEach((im) => { im.style.translate = ''; im.style.rotate = ''; });
    });
  });
})();

/* ============================================================
   3 · Paneles: cada carpeta abre una pestaña; el cambio se pinta con el pincel
   ============================================================ */
const panels = { projects: $('#projects'), about: $('#about') };
let current = null;

function showPanel(name, defer) {
  if (current) hidePanel();
  current = name;
  const p = panels[name];
  p.classList.add('open'); p.setAttribute('aria-hidden', 'false'); CursorEmoji.set(name === 'projects' ? 'star' : 'heart'); HomePhys.pause();
  document.body.classList.add('panel-open');
  history.replaceState(null, '', name === 'projects' ? '#trabajos' : '#sobre-mi');
  if (defer) { p.classList.add('pre'); return; }   // la pestaña se abre vacía; se construye desde cero cuando la cortina ya se fue
  buildPanel(name);
}
function buildPanel(name) {
  const p = panels[name];
  if (!p || current !== name) return;
  p.classList.remove('pre');
  const title = $('.ptitle', p);
  dropText(title, name === 'projects' ? 'Trabajos' : 'Sobre mí', 0.2);
  if (name === 'projects') Work.open();
  if (name === 'about') { paintIn($$('[data-paint]', p), 350, 170); Gravity.start(); }
}
function hidePanel() {
  if (!current) return;
  const p = panels[current];
  p.classList.remove('open'); p.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('panel-open');
  if (current === 'about') Gravity.stop();
  if (current === 'projects') Work.close();
  CursorEmoji.set('sparkle'); HomePhys.resume();
  history.replaceState(null, '', location.pathname + location.search);
  current = null;
}
function openPanel(name) { if (wiping) return; loadBar(); brushWipe(() => showPanel(name, true), { colors: [name === 'projects' ? '#171717' : '#1700fe'], dur: 600, hold: 120 }).then(() => buildPanel(name)); }
function closePanel() { if (wiping || !current) return; brushWipe(hidePanel, { colors: [current === 'projects' ? '#171717' : '#1700fe'], dur: 600, hold: 120 }); }

$$('[data-open]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openPanel(a.dataset.open); }));
$$('[data-close]').forEach((b) => b.addEventListener('click', closePanel));
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (Viewer.isOpen()) Viewer.close(); else closePanel();
});

/* ============================================================
   4 · Trabajos: el scroll pinta cada portada con bandas de pincel; el índice gira como un tambor
   ============================================================ */
const EmojiWork = EmojiPhys($('#workEmo'), { count: 2, min: 30, max: 42, delay: 1000, offset: 2, attract: true });
const Work = (() => {
  const ps = $('#pscroll'), stage = $('#pstage'), sticky = $('#sticky'), index = $('#index'), cover = $('#cover'), deck = $('#deck');
  const metaTags = $('#metaTags'), cta = $('#cta'), hint = $('#scrollhint'), count = $('#pcount'), filters = $('#filters');
  const metaTitle = document.createElement('h3'); metaTitle.className = 'meta-title'; $('#meta').prepend(metaTitle);
  sticky.dataset.mode = MODE;
  deck.hidden = MODE !== 'cartas'; cover.hidden = MODE === 'cartas';
  const NB = 10;
  let cat = 'all', items = [], n = 0, baseI = -1, nextI = -1, activeI = -1, ih = 90, cardW = 0, cards = [], snapT = 0, snapping = false, ticking = false;

  // capas de portada: una base y otra con bandas que la va cubriendo
  const base = document.createElement('div'); base.className = 'lyr';
  const nextL = document.createElement('div'); nextL.className = 'lyr';
  const slices = Array.from({ length: NB }, (_, k) => { const s = document.createElement('i'); s.className = 'sl'; s.style.setProperty('--k', k); s.style.setProperty('--n', NB); nextL.appendChild(s); return s; });
  cover.append(base, nextL);

  const catsPresent = DATA.categories.filter((c) => PROJECTS.some((p) => p.cat === c.id));
  if (catsPresent.length > 1) {
    [{ id: 'all', name: 'Todos' }, ...catsPresent].forEach((c) => {
      const b = document.createElement('button'); b.className = 'chip'; b.textContent = c.name; b.dataset.cat = c.id; b.setAttribute('aria-pressed', c.id === 'all');
      b.addEventListener('click', () => setCat(c.id));
      filters.appendChild(b);
    });
  }

  function build() {
    index.innerHTML = '';
    items.forEach((p, i) => {
      const li = document.createElement('li'), b = document.createElement('button');
      li.style.setProperty('--i', i); b.className = 'it'; b.dataset.i = i; b.innerHTML = `<span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t"></span>`; $('.t', b).textContent = p.title;
      b.addEventListener('click', () => goTo(i));
      li.appendChild(b); index.appendChild(li);
    });
    deck.innerHTML = ''; cards = [];
    if (MODE === 'cartas') items.forEach((p, i) => {
      const c = document.createElement('button'); c.className = 'card'; c.setAttribute('aria-label', p.title);
      const im = new Image(); im.src = p.cover; im.alt = p.title; im.decoding = 'async'; c.appendChild(im);
      c.addEventListener('click', () => (i === activeI ? Viewer.open(items[i]) : goTo(i)));
      deck.appendChild(c); cards.push(c);
    });
  }
  function size() {
    const h = ps.clientHeight;
    sticky.style.setProperty('--ph', h + 'px');
    stage.style.height = h + Math.max(0, n - 1) * h * 0.9 + 'px';
    ih = index.firstElementChild ? index.firstElementChild.offsetHeight || 90 : 90;
    cardW = deck.offsetWidth || 300;
    baseI = nextI = activeI = -1;
    render();
  }
  const range = () => Math.max(1, stage.offsetHeight - ps.clientHeight);
  const goTo = (i) => ps.scrollTo({ top: (n > 1 ? i / (n - 1) : 0) * range(), behavior: reduced ? 'auto' : 'smooth' });

  function render() {
    ticking = false;
    if (!n) return;
    const prog = n > 1 ? clamp(ps.scrollTop / range(), 0, 1) : 0, p = prog * (n - 1);
    const i = Math.min(n - 1, Math.floor(p + 1e-6)), t = clamp(p - i, 0, 1);
    if (MODE === 'bandas') {
      if (i !== baseI) { baseI = i; base.style.backgroundImage = `url("${items[i].cover}")`; }
      const j = Math.min(n - 1, i + 1);
      if (j !== nextI) { nextI = j; nextL.style.backgroundImage = `url("${items[j].cover}")`; }
      nextL.style.setProperty('--t', (easeIO(t) * 100).toFixed(2));
      index.style.transform = `translateY(${(-(p * ih + ih / 2)).toFixed(1)}px)`;
      cover.style.setProperty('--prog', ((p + 1) / n).toFixed(3));
    } else {
      cards.forEach((c, k) => {
        const d = k - p, a = Math.abs(d);
        c.style.transform = `translateX(${(d * cardW * 1.04).toFixed(1)}px) scale(${(1 - 0.12 * Math.min(a, 2)).toFixed(3)}) rotate(${(d * 3).toFixed(2)}deg)`;
        c.style.opacity = a > 2.2 ? 0 : 1 - 0.45 * Math.min(a, 1);
        c.style.zIndex = 100 - Math.round(a * 10);
      });
    }
    const a = Math.round(p);
    if (a !== activeI) {
      activeI = a;
      const pr = items[a];
      $$('.it', index).forEach((b, k) => b.classList.toggle('active', k === a));
      metaTags.textContent = [pr.tags, pr.year].filter(Boolean).join(' · ');
      metaTitle.textContent = pr.title;
      sticky.style.setProperty('--pc', pr.color || '#1700fe');
      count.textContent = `${String(a + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    }
    hint.style.opacity = p > 0.05 ? 0 : 1;
  }

  const assemble = () => { index.classList.remove('assemble'); void index.offsetWidth; index.classList.add('assemble'); paintIn([filters, cover, $('#meta')], 250, 170, 900); };
  function setCat(c) {
    cat = c;
    $$('.chip', filters).forEach((b) => b.setAttribute('aria-pressed', b.dataset.cat === c));
    const apply = () => { items = PROJECTS.filter((p) => c === 'all' || p.cat === c); n = items.length; build(); ps.scrollTop = 0; size(); assemble(); };
    if (!sticky.animate || reduced) { apply(); return; }
    sticky.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = () => { apply(); sticky.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' }); };
  }

  ps.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
    // al terminar de scrollear, la portada se asienta en la más cercana
    clearTimeout(snapT);
    snapT = setTimeout(() => {
      if (snapping || reduced || n < 2 || !panels.projects.classList.contains('open')) return;
      const target = Math.round(ps.scrollTop / range() * (n - 1)) / (n - 1) * range();
      if (Math.abs(ps.scrollTop - target) > 3) { snapping = true; ps.scrollTo({ top: target, behavior: 'smooth' }); setTimeout(() => { snapping = false; }, 700); }
    }, 170);
  }, { passive: true });
  const openActive = () => { if (items[activeI]) Viewer.open(items[activeI]); };
  cover.addEventListener('click', openActive);
  cta.addEventListener('click', openActive);
  addEventListener('resize', () => { if (panels.projects.classList.contains('open')) size(); });

  addEventListener('keydown', (e) => {
    if (!panels.projects.classList.contains('open') || Viewer.isOpen() || !n) return;
    if (e.target && e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); goTo(Math.min(n - 1, Math.max(0, activeI) + 1)); }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); goTo(Math.max(0, activeI - 1)); }
    if (e.key === 'Enter' && document.activeElement === document.body) openActive();
  });
  return { open() { cat = 'all'; requestAnimationFrame(() => { setCat('all'); EmojiWork.start(); }); }, close() { EmojiWork.stop(); } };
})();

/* ============================================================
   5 · Vista de proyecto (con el color del proyecto en la transición)
   ============================================================ */
const Viewer = (() => {
  const box = $('#pview'), track = $('#track'), title = $('#pvTitle'), tags = $('#pvTags'), pn = $('#pvN'), fill = $('#pvFill'), prev = $('#pvPrev'), next = $('#pvNext');
  let isOpen = false, n = 0, loader = null, seen = null, cool = 0, cur = null;

  const idx = () => clamp(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)), 0, Math.max(0, n - 1));
  function update() {
    const i = idx(), cw = Math.max(1, track.clientWidth);
    pn.textContent = `${i + 1} / ${n}`;
    fill.style.width = n ? ((i + 1) / n) * 100 + '%' : '0';
    prev.disabled = i === 0; next.disabled = i >= n - 1;
    for (const s of track.children) s.style.setProperty('--p', clamp((s.offsetLeft - track.scrollLeft) / cw, -1, 1).toFixed(3));
  }
  const go = (d) => track.scrollBy({ left: d * track.clientWidth, behavior: 'smooth' });

  function render(pr) {
    cur = pr;
    if (loader) loader.disconnect(); if (seen) seen.disconnect();
    track.innerHTML = '';
    track.style.scrollBehavior = 'auto'; track.scrollLeft = 0; track.style.scrollBehavior = '';
    dropText(title, pr.title); tags.textContent = [pr.tags, pr.year].filter(Boolean).join(' · ');
    loader = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const im = $('img', e.target);
      if (im && !im.src) { im.onload = () => { im.classList.add('loaded'); const sk = $('.sk', e.target); if (sk) sk.remove(); }; im.src = im.dataset.src; }
      loader.unobserve(e.target);
    }), { root: track, rootMargin: '0px 150% 0px 150%' });
    seen = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('in', e.isIntersecting)), { root: track, threshold: 0.55 });
    const slides = [];
    const inf = pr.info;
    if (inf && (inf.text || inf.role || inf.tools)) {
      const s = document.createElement('div'); s.className = 'slide info in';
      s.innerHTML = '<p class="kicker">Sobre el proyecto</p><p class="big"></p><dl></dl>';
      $('.big', s).textContent = inf.text || pr.title;
      [['Rol', inf.role], ['Herramientas', inf.tools], ['Año', pr.year]].forEach(([k, v]) => { if (!v) return; const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; $('dl', s).append(dt, dd); });
      slides.push(s);
    }
    (pr.slides || []).forEach((src, i) => {
      const isGif = /\.gif($|\?)/i.test(src);
      const s = document.createElement('div'); s.className = isGif ? 'slide gif' : 'slide';
      const sk = document.createElement('i'); sk.className = 'sk';
      const im = new Image(); im.alt = `${pr.title} — ${i + 1}`; im.decoding = 'async'; im.dataset.src = src;
      s.append(sk, im);
      if (isGif) { const b = document.createElement('span'); b.className = 'gif-badge'; b.textContent = '.GIF'; s.append(b); }
      slides.push(s);
    });
    n = slides.length;
    slides.forEach((s) => { track.appendChild(s); loader.observe(s); seen.observe(s); });
    update();
  }

  function open(pr) {
    if (wiping || isOpen) return;
    loadBar();
    const c = pr.color || '#1700fe';
    brushWipe(() => { CursorEmoji.set('bolt'); isOpen = true; track.innerHTML = ''; box.classList.add('open', 'pre'); box.setAttribute('aria-hidden', 'false'); },
      { colors: [c, shade(c, 0.07), shade(c, -0.08)], dur: 460, stag: 36, hold: 120 }).then(() => { if (!isOpen) return; render(pr); box.classList.remove('pre'); track.focus({ preventScroll: true }); });
  }
  function close() {
    if (wiping || !isOpen) return;
    const c = (cur && cur.color) || '#1700fe';
    brushWipe(() => { CursorEmoji.set('star'); isOpen = false; box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); },
      { colors: [c, shade(c, 0.07), shade(c, -0.08)], dur: 400, stag: 30, hold: 100 });
  }

  track.addEventListener('scroll', update, { passive: true });
  $('#pvClose').addEventListener('click', close);
  prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
  track.addEventListener('wheel', (e) => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;
    e.preventDefault();
    const now = performance.now(); if (now - cool < 550) return;
    cool = now; go(d > 0 ? 1 : -1);
  }, { passive: false });
  addEventListener('keydown', (e) => { if (!isOpen) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  addEventListener('resize', () => { if (isOpen) update(); });

  return { open, close, isOpen: () => isOpen };
})();

/* ============================================================
   6 · Sobre mí: los emojis y el sticker flotan con gravedad, el cursor los empuja y se pueden agarrar
   ============================================================ */
const PNGS = [
  'img/sobre-mi/emoji-smile.svg', 'img/sobre-mi/emoji-heart.svg', 'img/sobre-mi/emoji-star.svg',
  'img/sobre-mi/emoji-bolt.svg', 'img/sobre-mi/emoji-cool.svg', 'img/sobre-mi/emoji-sparkle.svg',
];
const Gravity = (() => {
  const play = $('#play');
  let items = [], raf = 0, W = 0, H = 0, ptr = null, drag = null;
  const measure = () => { W = play.clientWidth; H = play.clientHeight; };

  function build() {
    const STICKER = 'img/sobre-mi/passion-sticker.svg';
    const base = clamp(Math.min(W, H) * 0.14, 56, 100);
    items = [...PNGS, STICKER].map((src) => {
      const el = new Image(), big = src === STICKER;
      el.className = big ? 'it sticker' : 'it emoji'; el.src = src; el.alt = ''; el.draggable = false;
      const s = big ? clamp(Math.min(W * 0.8, H * 1.1), 200, 560) : base * (0.85 + Math.random() * 0.4);
      const it = { ph: Math.random() * 6.28, fx: 0.00025 + Math.random() * 0.0003, fy: 0.0003 + Math.random() * 0.00035, el, w: s, h: s, r: s * 0.45, x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, rot: 0 };
      el.style.width = s + 'px';
      el.onload = () => { it.h = s * el.naturalHeight / el.naturalWidth; it.r = Math.max(it.w, it.h) * 0.34; };
      el.__it = it; play.appendChild(el);
      return it;
    });
  }

  function step() {
    const tx = ptr ? ptr.x : W / 2, ty = ptr ? ptr.y : H / 2, now = performance.now();
    if (!W || !H) measure();
    for (const it of items) {
      if (it === drag) { it.x += (tx - it.x) * 0.4; it.y += (ty - it.y) * 0.4; it.vx = it.vy = 0; continue; }
      const big = it.el.classList.contains('sticker'), amp = big ? 0.24 : 0.42;
      const ax = W / 2 + Math.cos(now * it.fx + it.ph) * W * amp, ay = H / 2 + Math.sin(now * it.fy + it.ph * 1.7) * H * (big ? 0.2 : 0.38);
      it.vx = (it.vx + (ax - it.x) * 0.010 + (Math.random() - 0.5) * 0.06) * 0.9;
      it.vy = (it.vy + (ay - it.y) * 0.010 + (Math.random() - 0.5) * 0.06) * 0.9;
      if (ptr) { const dx = it.x - ptr.x, dy = it.y - ptr.y, d = Math.hypot(dx, dy) || 0.01, R = 150 + it.r; if (d < R) { const f = (1 - d / R) * 1.4; it.vx += (dx / d) * f; it.vy += (dy / d) * f; } }
      it.x += it.vx; it.y += it.vy;
    }
    for (let k = 0; k < 3; k++) for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.r + b.r;
      if (d < min) { const push = (min - d) / 2, nx = dx / d, ny = dy / d; if (a !== drag) { a.x -= nx * push; a.y -= ny * push; } if (b !== drag) { b.x += nx * push; b.y += ny * push; } }
    }
    for (const it of items) {
      const whole = it.el.classList.contains('sticker'), mx = whole ? it.w / 2 : it.r * 0.6, my = whole ? it.h / 2 : it.r * 0.6;
      it.x = clamp(it.x, mx, Math.max(mx, W - mx)); it.y = clamp(it.y, my, Math.max(my, H - my));
      it.rot += ((whole ? 0 : clamp(it.vx * 4, -30, 30)) - it.rot) * 0.1;
      it.el.style.transform = `translate(${it.x - it.w / 2}px, ${it.y - it.h / 2}px) rotate(${it.rot}deg)`;
    }
    raf = requestAnimationFrame(step);
  }

  const local = (e) => { const b = play.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  play.addEventListener('pointermove', (e) => { ptr = local(e); });
  play.addEventListener('pointerleave', () => { if (!drag) ptr = null; });
  play.addEventListener('pointerdown', (e) => { ptr = local(e); const el = e.target.closest('.it'); if (el) { drag = el.__it; play.classList.add('grabbing'); play.setPointerCapture(e.pointerId); } });
  const release = (e) => { drag = null; play.classList.remove('grabbing'); if (e.pointerType === 'touch') ptr = null; };
  play.addEventListener('pointerup', release); play.addEventListener('pointercancel', release);
  addEventListener('resize', measure);

  return {
    start() {
      measure(); if (!items.length) build();
      $$('.sticker', play).forEach((el) => { el.classList.remove('drop'); void el.offsetWidth; el.classList.add('drop'); });
      cancelAnimationFrame(raf); raf = requestAnimationFrame(step);
    },
    stop() { cancelAnimationFrame(raf); },
  };
})();

/* ============================================================
   Todos los elementos con el efecto de los emojis: flotan, se inclinan hacia el cursor, giran con el movimiento,
   se pueden agarrar y tirar, y vuelven a su lugar como con un resorte.
   ============================================================ */
const CursorGravity = (() => {
  if (matchMedia('(hover: none), (pointer: coarse)').matches || reduced) return { refresh() {} };
  const SEL = [['.corner', 8], ['.ptitle', 7], ['.chip', 9], ['.close', 9], ['.pnav', 9], ['.cta', 8], ['.meta-tags', 6], ['.cover', 6], ['.pcount', 7], ['.about-text .lead', 6], ['.about-text .kicker', 6], ['.facts', 5], ['.pmicro', 6], ['.fcap', 8], ['.pv-title', 6]];
  let items = [], mx = -1e4, my = -1e4, drag = null, last = 0;
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!drag) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.hypot(dx, dy) > 6) drag.moved = true;
    if (drag.moved) { const it = drag.it; it.vx = (e.clientX - drag.lx) * 0.7; it.vy = (e.clientY - drag.ly) * 0.7; it.x = drag.ox + dx; it.y = drag.oy + dy; drag.lx = e.clientX; drag.ly = e.clientY; }
  }, { passive: true });
  const up = () => { if (!drag) return; if (drag.moved) { const it = drag.it; it.noClick = true; setTimeout(() => { it.noClick = false; }, 90); } drag = null; };
  addEventListener('pointerup', up); addEventListener('pointercancel', up);

  function bind(el, it) {
    if (el.__phys) return; el.__phys = it;
    el.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      drag = { it, sx: e.clientX, sy: e.clientY, ox: it.x, oy: it.y, lx: e.clientX, ly: e.clientY, moved: false };
    });
    el.addEventListener('click', (e) => { if (it.noClick) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  }
  const refresh = () => {
    items = [];
    SEL.forEach(([s, k]) => $$(s).forEach((el) => {
      el.classList.add('grav');
      const it = el.__phys || { el, k, x: 0, y: 0, vx: 0, vy: 0, rot: 0, ph: Math.random() * 6.28, fx: 0.0004 + Math.random() * 0.0004, fy: 0.0005 + Math.random() * 0.0004, noClick: false };
      items.push(it); bind(el, it);
    }));
  };
  function loop(now) {
    const dt = Math.min(2, (now - (last || now)) / 16.67); last = now;
    for (const it of items) {
      const r = it.el.getBoundingClientRect();
      if (!r.width || r.bottom < -120 || r.top > innerHeight + 120) continue;
      if (drag && drag.it === it && drag.moved) { apply(it); continue; }
      const cx = r.left + r.width / 2 - it.x, cy = r.top + r.height / 2 - it.y, dx = mx - cx, dy = my - cy, d = Math.hypot(dx, dy) || 1, w = Math.max(0, 1 - d / 300);
      // flota un poquito sola y se inclina hacia el cursor
      const tx = Math.sin(now * it.fx + it.ph) * 3 + (dx / d) * it.k * w, ty = Math.cos(now * it.fy + it.ph * 1.3) * 3 + (dy / d) * it.k * w;
      it.vx = (it.vx + (tx - it.x) * 0.07 * dt) * Math.pow(0.84, dt); it.vy = (it.vy + (ty - it.y) * 0.07 * dt) * Math.pow(0.84, dt);
      it.x += it.vx * dt; it.y += it.vy * dt;
      apply(it);
    }
    requestAnimationFrame(loop);
  }
  function apply(it) {
    it.rot += ((Math.max(-9, Math.min(9, it.vx * 2.2))) - it.rot) * 0.12;
    const e = it.el.style;
    e.setProperty('--gx', it.x.toFixed(2) + 'px'); e.setProperty('--gy', it.y.toFixed(2) + 'px'); e.setProperty('--gr', it.rot.toFixed(2) + 'deg');
  }
  refresh(); requestAnimationFrame(loop);
  return { refresh };
})();

// pista de la home: se va apenas la persona toca o pasa por una carpeta
(() => { const h = document.getElementById('homeHint'); if (!h) return; const hide = () => h.classList.add('gone'); addEventListener('pointerdown', hide, { once: true }); $$('.pf').forEach((f) => f.addEventListener('pointerenter', hide, { once: true })); })();

/* brillo perlado en las carpetas: una luz que sigue al cursor sobre cada carpeta, con el tono cambiando y mas fuerza si el cursor va rapido */
(() => {
  const items = [];
  const build = () => {
    document.querySelectorAll('.pf > .fbox').forEach((box) => {
      if (box.querySelector('.fsheen')) return;
      const s = document.createElement('i'); s.className = 'fsheen'; s.setAttribute('aria-hidden', 'true'); box.appendChild(s);
      items.push({ box, s, pf: box.parentElement, x: .3, y: .2, a: 0 });
    });
  };
  build(); setTimeout(build, 400); setTimeout(build, 1500);
  let mx = -1, my = -1, spd = 0, run = false, lastX = 0, lastY = 0;
  const tick = () => {
    spd *= .93; let moving = spd > .01;
    items.forEach((it) => {
      const r = it.box.getBoundingClientRect(); if (!r.width) return;
      const inside = mx >= r.left - r.width * .2 && mx <= r.right + r.width * .2 && my >= r.top - r.height * .2 && my <= r.bottom + r.height * .2;
      const tx = inside ? (mx - r.left) / r.width : .3, ty = inside ? (my - r.top) / r.height : .2;
      const ta = inside ? .55 + Math.min(.4, spd * .5) : .22;
      if (Math.abs(tx - it.x) < .002 && Math.abs(ty - it.y) < .002 && Math.abs(ta - it.a) < .004) return;
      it.x += (tx - it.x) * .12; it.y += (ty - it.y) * .12; it.a += (ta - it.a) * .1;
      it.s.style.setProperty('--sx', (it.x * 100).toFixed(1) + '%'); it.s.style.setProperty('--sy', (it.y * 100).toFixed(1) + '%');
      it.s.style.setProperty('--sa', it.a.toFixed(3)); it.s.style.setProperty('--sh', Math.round(205 + it.x * 130));
      moving = true;
    });
    if (moving) requestAnimationFrame(tick); else run = false;
  };
  addEventListener('pointermove', (e) => {
    spd = Math.min(1, spd + Math.hypot(e.clientX - lastX, e.clientY - lastY) / 400); lastX = mx = e.clientX; lastY = my = e.clientY;
    if (!run) { run = true; requestAnimationFrame(tick); }
  }, { passive: true });
  if (!run) { run = true; requestAnimationFrame(tick); }
})();