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
  document.addEventListener('pointerover', (e) => dot.classList.toggle('big', !!(e.target.closest && e.target.closest('a, button, .pf, .it, .cover, .card, .chip, .play .it, .slide img, .lb-img'))));
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

// la luz del cursor recorre el botón o la tarjeta que se está por elegir
document.addEventListener('pointermove', (e) => {
  const f = e.target.closest && e.target.closest('.chip, .close, .pnav, .pcard');
  if (!f) return;
  const b = f.getBoundingClientRect();
  f.style.setProperty('--mx', (((e.clientX - b.left) / b.width) * 100).toFixed(1) + '%');
  f.style.setProperty('--my', (((e.clientY - b.top) / b.height) * 100).toFixed(1) + '%');
}, { passive: true });

/* ============================================================
   Inicio: una sola página. Los proyectos son lo primero que se ve, en una grilla con filtros;
   un click abre el proyecto. Más abajo, Sobre mí y el contacto.
   ============================================================ */
const Site = (() => {
  const grid = $('#grid'), filters = $('#filters'), count = $('#workCount');
  let cat = 'all';
  const cats = DATA.categories.filter((c) => PROJECTS.some((p) => p.cat === c.id));
  if (cats.length > 1) [{ id: 'all', name: 'Todos' }, ...cats].forEach((c) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = c.name; b.dataset.cat = c.id; b.setAttribute('aria-pressed', c.id === 'all');
    b.addEventListener('click', () => { cat = c.id; $$('.chip', filters).forEach((x) => x.setAttribute('aria-pressed', x.dataset.cat === cat)); render(); });
    filters.appendChild(b);
  });
  function render() {
    const list = PROJECTS.filter((p) => cat === 'all' || p.cat === cat);
    count.textContent = String(list.length).padStart(2, '0');
    grid.innerHTML = '';
    list.forEach((p, i) => {
      const li = document.createElement('li'); li.style.setProperty('--i', i);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard'; b.style.setProperty('--c', p.color || '#1a00ff');
      b.setAttribute('aria-label', `${p.title}${p.tags ? ' — ' + p.tags : ''}`);
      b.innerHTML = '<span class="pcard-img"><img alt="" loading="lazy" decoding="async"></span><span class="pcard-meta"><strong></strong><em></em></span>';
      const im = $('img', b); im.onload = () => im.classList.add('loaded'); im.src = p.cover;
      $('strong', b).textContent = p.title; $('em', b).textContent = [p.tags, p.year].filter(Boolean).join(' · ');
      b.addEventListener('click', () => Viewer.open(p));
      li.appendChild(b); grid.appendChild(li);
    });
  }
  render();
  // Sobre mí: los emojis empiezan a flotar cuando la sección aparece en pantalla
  const about = $('#sobre-mi');
  if (about && 'IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { paintIn($$('[data-paint]', about), 100, 120); Gravity.start(); } else Gravity.stop();
  }), { threshold: 0.2 }).observe(about);
  // link directo a un proyecto: …/#abu abre abu
  const fromHash = () => { const slug = decodeURIComponent(location.hash.slice(1)); const p = PROJECTS.find((x) => x.slug === slug); if (p && !Viewer.isOpen()) Viewer.open(p); };
  addEventListener('hashchange', fromHash);
  setTimeout(fromHash, 60);
  return { render };
})();

addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (Zoom.isOpen()) Zoom.close(); else if (Viewer.isOpen()) Viewer.close();
});

/* ============================================================
   5 · Vista de proyecto (con el color del proyecto en la transición)
   ============================================================ */
const Viewer = (() => {
  const box = $('#pview'), track = $('#track'), title = $('#pvTitle'), tags = $('#pvTags'), pn = $('#pvN'), fill = $('#pvFill'), prev = $('#pvPrev'), next = $('#pvNext');
  let isOpen = false, n = 0, loader = null, seen = null, cool = 0, cur = null, bh = true;

  const idx = () => {
    if (bh) { const mid = track.scrollTop + track.clientHeight * 0.4; let k = 0; [...track.children].forEach((c, j) => { if (c.offsetTop <= mid) k = j; }); return clamp(k, 0, Math.max(0, n - 1)); }
    return clamp(Math.round(track.scrollLeft / Math.max(1, track.clientWidth)), 0, Math.max(0, n - 1));
  };
  function update() {
    if (bh) { const max = Math.max(1, track.scrollHeight - track.clientHeight); fill.style.width = clamp(track.scrollTop / max, 0, 1) * 100 + '%'; pn.textContent = ''; return; }
    const i = idx(), cw = Math.max(1, track.clientWidth);
    pn.textContent = `${i + 1} / ${n}`;
    fill.style.width = n ? ((i + 1) / n) * 100 + '%' : '0';
    prev.disabled = i === 0; next.disabled = i >= n - 1;
    for (const s of track.children) s.style.setProperty('--p', clamp((s.offsetLeft - track.scrollLeft) / cw, -1, 1).toFixed(3));
  }
  const go = (d) => {
    if (!bh) return track.scrollBy({ left: d * track.clientWidth, behavior: 'smooth' });
    const t = track.children[clamp(idx() + d, 0, track.children.length - 1)]; if (t) track.scrollTo({ top: t.offsetTop - 16, behavior: 'smooth' });
  };

  function render(pr) {
    cur = pr;
    if (location.hash !== '#' + pr.slug) history.replaceState(null, '', '#' + pr.slug);   // cada proyecto tiene su link
    if (loader) loader.disconnect(); if (seen) seen.disconnect();
    track.innerHTML = '';
    bh = pr.layout !== 'slides'; box.classList.toggle('bh', bh);
    if (pr.gap != null) box.style.setProperty('--bh-gap', typeof pr.gap === 'number' ? pr.gap + 'px' : pr.gap); else box.style.removeProperty('--bh-gap');
    track.style.scrollBehavior = 'auto'; track.scrollLeft = 0; track.scrollTop = 0; track.style.scrollBehavior = '';
    dropText(title, pr.title); tags.textContent = [pr.tags, pr.year].filter(Boolean).join(' · ');
    loader = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      $$('img', e.target).forEach((im) => {
        if (im.src) return;
        const sk = im.previousElementSibling && im.previousElementSibling.classList.contains('sk') ? im.previousElementSibling : $('.sk', e.target);
        im.onload = () => { im.classList.add('loaded'); if (sk) sk.remove(); };
        im.src = im.dataset.src;
      });
      $$('video', e.target).forEach((v) => {
        if (v.src) return;
        const sk = $('.sk', e.target);
        v.onloadeddata = () => { v.classList.add('loaded'); if (sk) sk.remove(); v.play().catch(() => {}); };
        v.src = v.dataset.src;
      });
      loader.unobserve(e.target);
    }), { root: track, rootMargin: bh ? '120% 0px 120% 0px' : '0px 150% 0px 150%' });
    seen = new IntersectionObserver((es) => es.forEach((e) => { if (bh) { if (e.isIntersecting) e.target.classList.add('in'); } else e.target.classList.toggle('in', e.isIntersecting); }), { root: track, threshold: bh ? 0.01 : 0.55 });
    const slides = [];
    const inf = pr.info;
    if (inf && (inf.text || inf.role || inf.tools)) {
      const s = document.createElement('div'); s.className = 'slide info in';
      s.innerHTML = '<p class="kicker">Sobre el proyecto</p><p class="big"></p><dl></dl>';
      $('.big', s).textContent = inf.text || pr.title;
      [['Producto', inf.product], ['Rol', inf.role], ['Herramientas', inf.tools], ['Año', pr.year]].forEach(([k, v]) => { if (!v) return; const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; $('dl', s).append(dt, dd); });
      // imagen opcional al lado del texto (por ejemplo, el moodboard): image: 'img/<slug>/moodboard.jpg', imageLabel: 'Moodboard'
      if (inf.image) {
        const txt = document.createElement('div'); txt.className = 'info-text'; txt.append(...s.children);
        const fig = document.createElement('figure'); fig.className = 'info-fig';
        const im = new Image(); im.alt = `${pr.title} — ${inf.imageLabel || 'imagen'}`; im.decoding = 'async'; im.dataset.src = inf.image;
        const cap = document.createElement('figcaption'); cap.textContent = inf.imageLabel || '';
        fig.append(im, cap);
        // en pantallas angostas no entran juntos: la imagen pasa a su propia lámina, justo después del texto
        if (!bh && matchMedia('(max-width: 720px)').matches) { s.append(txt); slides.push(s); const sf = document.createElement('div'); sf.className = 'slide info-solo'; sf.append(fig); slides.push(sf); }
        else { s.classList.add('with-img'); s.append(txt, fig); slides.push(s); }
      } else slides.push(s);
    }
    const pic = (src, alt, cls) => { const sk = document.createElement('i'); sk.className = 'sk'; const im = new Image(); im.alt = alt; im.decoding = 'async'; im.dataset.src = src; if (cls) im.className = cls; return [sk, im]; };
    (pr.slides || []).forEach((src, i) => {
      // PLANTILLAS (ver el encabezado de projects.js)
      // texto: { title: 'Título', text: 'Párrafo…' }
      if (src && typeof src === 'object' && !Array.isArray(src) && (src.text || src.title) && !src.image && !src.grid && !src.full) {
        const s = document.createElement('div'); s.className = 'slide bh-text';
        if (src.title) { const h = document.createElement('h4'); h.textContent = src.title; s.append(h); }
        if (src.text) String(src.text).split(/\n\s*\n/).forEach((t) => { const pp = document.createElement('p'); pp.textContent = t; s.append(pp); });
        slides.push(s); return;
      }
      // grilla con columnas fijas: { grid: ['a.jpg', 'b.jpg', 'c.jpg'], cols: 3 }
      if (src && src.grid) {
        const s = document.createElement('div'); s.className = 'slide row grid'; const cols = src.cols || Math.min(src.grid.length, 3);
        s.style.setProperty('--cols', cols); s.style.setProperty('--rows', Math.ceil(src.grid.length / 2));
        src.grid.forEach((g, gi) => { const ri = document.createElement('span'); ri.className = 'ri'; ri.append(...pic(g, `${pr.title} — ${i + 1}.${gi + 1}`)); s.append(ri); });
        if (src.caption) { const c = document.createElement('p'); c.className = 'bh-cap'; c.textContent = src.caption; s.append(c); }
        slides.push(s); return;
      }
      // imagen con epígrafe: { image: 'a.jpg', caption: 'Texto' } · imagen a todo el ancho de la pantalla: { full: 'a.jpg' }
      if (src && (src.image || src.full)) {
        const s = document.createElement('div'); s.className = 'slide' + (src.full ? ' bh-full' : '');
        s.append(...pic(src.image || src.full, src.caption || `${pr.title} — ${i + 1}`));
        if (src.caption) { const c = document.createElement('p'); c.className = 'bh-cap'; c.textContent = src.caption; s.append(c); }
        slides.push(s); return;
      }
      // un video propio (.mp4): se reproduce solo, sin sonido y en loop, como un GIF pero más liviano
      if (typeof src === 'string' && /\.mp4($|\?)/i.test(src)) {
        const s = document.createElement('div'); s.className = 'slide';
        const sk = document.createElement('i'); sk.className = 'sk';
        const v = document.createElement('video'); v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.preload = 'none'; v.dataset.src = src; v.setAttribute('aria-label', `${pr.title} — ${i + 1}`);
        s.append(sk, v); slides.push(s); return;
      }
      // un diseño embebido de otra plataforma (Adobe Express, etc.): { embed: '<url del iframe>', ratio: '16/9' }
      if (src && src.embed) {
        const s = document.createElement('div'); s.className = 'slide reel embed';
        const fr = document.createElement('iframe'); fr.src = src.embed; fr.title = `${pr.title} — ${i + 1}`; fr.loading = 'lazy'; fr.allow = 'clipboard-write; fullscreen'; fr.setAttribute('allowfullscreen', ''); fr.referrerPolicy = 'strict-origin-when-cross-origin';
        const ar = src.ratio || '16/9'; fr.style.aspectRatio = ar; fr.style.setProperty('--ar', ar.replace('/', ' / '));
        const a = document.createElement('a'); a.href = src.embed; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Ver en pantalla completa ↗';
        s.append(fr, a); slides.push(s); return;
      }
      // un reel o post de Instagram: { reel: 'https://www.instagram.com/reel/<id>/' } o { ig: 'https://www.instagram.com/p/<id>/' } se muestra embebido, con un link de respaldo
      if (src && (src.reel || src.ig)) {
        const s = document.createElement('div'); s.className = 'slide reel';
        const url = (src.reel || src.ig).split('?')[0].replace(/\/?$/, '/');
        const fr = document.createElement('iframe'); fr.src = url + 'embed/'; fr.title = `${pr.title} — ${src.reel ? 'reel' : 'post'} de Instagram`; fr.loading = 'lazy'; fr.allow = 'autoplay; encrypted-media; picture-in-picture'; fr.setAttribute('allowfullscreen', '');
        const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = src.reel ? 'Ver el reel en Instagram ↗' : 'Ver en Instagram ↗';
        s.append(fr, a); slides.push(s); return;
      }
      // una lamina puede ser una sola imagen, o un grupo (array) que se muestra en fila, como las filas de un caso de Behance
      const group = Array.isArray(src) ? src : [src];
      const isGif = group.some((g) => /\.gif($|\?)/i.test(g));
      const s = document.createElement('div'); s.className = group.length > 1 ? 'slide row' : (isGif ? 'slide gif' : 'slide');
      if (group.length > 1) { s.style.setProperty('--rows', Math.ceil(group.length / 2)); s.style.setProperty('--cols', group.length); }
      if (group.length > 1) {
        group.forEach((g, gi) => {
          const ri = document.createElement('span'); ri.className = 'ri';
          const sk = document.createElement('i'); sk.className = 'sk';
          const im = new Image(); im.alt = `${pr.title} — ${i + 1}.${gi + 1}`; im.decoding = 'async'; im.dataset.src = g;
          // fotos horizontales: en celular van una debajo de otra (las verticales, en grilla de 2)
          if (gi === 0) im.addEventListener('load', () => { if (im.naturalWidth > im.naturalHeight) { s.classList.add('wide'); s.style.setProperty('--rows', group.length); } });
          ri.append(sk, im); s.append(ri);
        });
      } else {
        const sk = document.createElement('i'); sk.className = 'sk';
        const im = new Image(); im.alt = `${pr.title} — ${i + 1}`; im.decoding = 'async'; im.dataset.src = src;
        s.append(sk, im);
        if (isGif) { const b = document.createElement('span'); b.className = 'gif-badge'; b.textContent = '.GIF'; s.append(b); }
      }
      slides.push(s);
    });
    if (bh) {
      const list = window.PORTFOLIO.projects.filter((x) => !x.hidden), nx = list[(list.indexOf(pr) + 1) % list.length];
      if (nx && nx !== pr) {
        const s = document.createElement('div'); s.className = 'slide bh-next';
        const b = document.createElement('button'); b.type = 'button'; b.style.setProperty('--c', nx.color || '#1700fe');
        b.innerHTML = '<span class="bh-next-k">Siguiente proyecto →</span><strong></strong><em></em>';
        $('strong', b).textContent = nx.title; $('em', b).textContent = nx.tags || '';
        if (nx.cover) { const [sk, im] = pic(nx.cover, nx.title, 'bh-next-cover'); b.prepend(im); }
        b.addEventListener('click', () => { render(nx); });
        s.append(b); slides.push(s);
      }
    }
    n = slides.length;
    slides.forEach((s) => { track.appendChild(s); loader.observe(s); seen.observe(s); });
    update();
  }

  function open(pr) {
    if (wiping || isOpen) return;
    loadBar();
    const c = pr.color || '#1700fe';
    brushWipe(() => { CursorEmoji.set('bolt'); isOpen = true; document.body.classList.add('viewing'); track.innerHTML = ''; box.classList.add('open', 'pre'); box.setAttribute('aria-hidden', 'false'); },
      { colors: [c, shade(c, 0.07), shade(c, -0.08)], dur: 460, stag: 36, hold: 120 }).then(() => { if (!isOpen) return; render(pr); box.classList.remove('pre'); track.focus({ preventScroll: true }); });
  }
  function close() {
    if (wiping || !isOpen) return;
    const c = (cur && cur.color) || '#1700fe';
    brushWipe(() => { CursorEmoji.set('star'); isOpen = false; document.body.classList.remove('viewing'); box.classList.remove('open'); box.setAttribute('aria-hidden', 'true'); history.replaceState(null, '', '#trabajos'); },
      { colors: [c, shade(c, 0.07), shade(c, -0.08)], dur: 400, stag: 30, hold: 100 });
  }

  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('click', (e) => {
    const im = e.target.closest && e.target.closest('.slide img');
    if (!im || !im.dataset.src || im.classList.contains('bh-next-cover')) return;
    const all = $$('.slide img', track).filter((x) => x.dataset.src && !x.classList.contains('bh-next-cover'));
    Zoom.open(all.map((x) => ({ src: x.dataset.src, alt: x.alt })), all.indexOf(im));
  });
  $('#pvClose').addEventListener('click', close);
  prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
  track.addEventListener('wheel', (e) => {
    if (bh) return;
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    if (Math.abs(d) < 8) return;
    e.preventDefault();
    const now = performance.now(); if (now - cool < 550) return;
    cool = now; go(d > 0 ? 1 : -1);
  }, { passive: false });
  addEventListener('keydown', (e) => { if (!isOpen || Zoom.isOpen()) return; if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  addEventListener('resize', () => { if (isOpen) update(); });

  return { open, close, isOpen: () => isOpen };
})();

/* ============================================================
   5b · Zoom: click en una imagen la abre entera a pantalla completa; otro click (o tocar) amplía donde apuntás,
   la rueda, las flechas o deslizar pasan de foto, Esc o × cierra
   ============================================================ */
const Zoom = (() => {
  const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Imagen ampliada'); lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = '<img class="lb-img" alt=""><button class="lb-close" aria-label="Cerrar">×</button><button class="lb-nav lb-prev" aria-label="Anterior">←</button><button class="lb-nav lb-next" aria-label="Siguiente">→</button><span class="lb-n"></span><span class="lb-hint">Click para ampliar</span>';
  document.body.append(lb);
  const img = $('.lb-img', lb), num = $('.lb-n', lb);
  let list = [], i = 0, open = false, zoomed = false, cool = 0, down = null;
  const origin = (x, y) => { const r = img.getBoundingClientRect(); if (!r.width) return; img.style.transformOrigin = `${clamp((x - r.left) / r.width * 100, 0, 100)}% ${clamp((y - r.top) / r.height * 100, 0, 100)}%`; };
  const setZoom = (z, x, y) => { zoomed = z; if (z && x != null) origin(x, y); lb.classList.toggle('zoomed', z); };
  function show(k) {
    i = (k + list.length) % list.length; setZoom(false);
    img.classList.remove('loaded'); img.onload = () => img.classList.add('loaded');
    img.src = list[i].src; img.alt = list[i].alt || '';
    num.textContent = list.length > 1 ? `${i + 1} / ${list.length}` : '';
    lb.classList.toggle('single', list.length < 2);
  }
  function openZ(l, k) { if (!l.length) return; list = l; open = true; lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.classList.add('lb-open'); show(Math.max(0, k)); }
  function close() { open = false; setZoom(false); lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lb-open'); }
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', () => show(i - 1));
  $('.lb-next', lb).addEventListener('click', () => show(i + 1));
  img.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
  img.addEventListener('pointerup', (e) => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
    if (!zoomed && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { show(i + (dx < 0 ? 1 : -1)); return; }
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) setZoom(!zoomed, e.clientX, e.clientY);
  });
  lb.addEventListener('pointermove', (e) => { if (zoomed) origin(e.clientX, e.clientY); });
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  lb.addEventListener('wheel', (e) => {
    e.preventDefault(); if (zoomed || list.length < 2) return;
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX; if (Math.abs(d) < 8) return;
    const now = performance.now(); if (now - cool < 450) return; cool = now; show(i + (d > 0 ? 1 : -1));
  }, { passive: false });
  addEventListener('keydown', (e) => { if (!open) return; if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
  return { open: openZ, close, isOpen: () => open };
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
