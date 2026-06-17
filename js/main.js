/* ============================================================
   NARESH ADHE — core interactions (non-animation logic)
   Animation engine is fully handled by GSAP in gsap-engine.js
   ============================================================ */

/* ---------- FAILSAFE: never let content stay hidden ---------- */
(function failsafe() {
  function revealChrome() {
    var hero = document.querySelector('.hero');
    if (hero) hero.classList.add('lit');
    var nav = document.getElementById('nav');
    if (nav) nav.classList.add('show');
    var boot = document.getElementById('boot');
    if (boot) { boot.classList.add('done'); boot.style.display = 'none'; }
  }
  setTimeout(revealChrome, 4200);
})();

/* ---------- image frames: load real file, fallback to placeholder ---------- */
(function initFrames() {
  document.querySelectorAll('.frame[data-img]').forEach((frame) => {
    const img = frame.querySelector('img');
    const src = frame.getAttribute('data-img');
    if (!img || !src) return;
    img.addEventListener('load', () => {
      if (img.naturalWidth > 1) frame.classList.remove('is-empty');
    });
    img.addEventListener('error', () => frame.classList.add('is-empty'));
    img.src = src;
  });
})();

/* ---------- BOOT SEQUENCE ---------- */
(function boot() {
  const boot = document.getElementById('boot');
  const linesBox = document.getElementById('bootLines');
  const nameEl = document.getElementById('bootName');
  const bar = document.getElementById('bootBar');
  const hero = document.querySelector('.hero');
  const nav = document.getElementById('nav');

  const steps = [
    'Initializing systems…',
    'Loading dev modules…',
    'Compiling ambition…',
    'Online.'
  ];

  const seen = sessionStorage.getItem('na_booted');
  if (seen) {
    boot.classList.add('done');
    boot.style.display = 'none';
    hero.classList.add('lit');
    nav.classList.add('show');
    document.querySelector('.boot__name').classList.add('show');
    return;
  }

  nameEl.classList.add('show');
  bar.style.transition = 'width 2.2s cubic-bezier(0.22,1,0.36,1)';
  requestAnimationFrame(() => { bar.style.width = '100%'; });

  let i = 0;
  const line = linesBox.querySelector('.boot__line');
  function nextLine() {
    line.classList.remove('show');
    void line.offsetWidth;
    line.textContent = steps[i];
    line.classList.add('show');
    i++;
    if (i < steps.length) setTimeout(nextLine, 560);
  }
  nextLine();

  setTimeout(() => {
    boot.classList.add('done');
    hero.classList.add('lit');
    nav.classList.add('show');
    sessionStorage.setItem('na_booted', '1');
    setTimeout(() => { boot.style.display = 'none'; }, 1200);
  }, 2600);
})();

/* ---------- TYPING EFFECT (hero subtitle) ---------- */
(function typing() {
  const el = document.getElementById('typed');
  const cursor = document.getElementById('cursor');
  if (!el) return;
  const phrases = [
    'MERN & PERN Stack Developer',
    'Cloud & DevOps Engineer',
    'Knight on LeetCode',
    'I cannot stop building.'
  ];
  let p = 0, c = 0, deleting = false;

  function tick() {
    const word = phrases[p];
    if (!deleting) {
      el.textContent = word.slice(0, ++c);
      if (c === word.length) { deleting = true; return setTimeout(tick, 1600); }
    } else {
      el.textContent = word.slice(0, --c);
      if (c === 0) { deleting = false; p = (p + 1) % phrases.length; }
    }
    setTimeout(tick, deleting ? 42 : 70);
  }
  setTimeout(tick, sessionStorage.getItem('na_booted') ? 600 : 2800);
  setInterval(() => { cursor.style.opacity = cursor.style.opacity === '0' ? '1' : '0'; }, 530);
})();

/* ---------- NAVBAR: scroll state + active section + mobile ---------- */
(function navbar() {
  const nav = document.getElementById('nav');
  const links = [...document.querySelectorAll('.nav__link')];
  const burger = document.getElementById('burger');
  const mobile = document.getElementById('navMobile');
  const sections = ['home', 'about', 'arsenal', 'missions', 'journey', 'contact'];

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
    let current = 'home';
    for (const id of sections) {
      const s = document.getElementById(id);
      if (!s) continue;
      const r = s.getBoundingClientRect();
      if (r.top <= 160 && r.bottom >= 160) { current = id; break; }
    }
    links.forEach((l) => l.classList.toggle('active', l.dataset.sec === current));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  burger.addEventListener('click', () => mobile.classList.toggle('open'));
  mobile.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => mobile.classList.remove('open'))
  );
})();

/* ---------- ID CARD TILT ---------- */
(function tilt() {
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  const card = document.getElementById('idcard');
  if (!card) return;
  const wrap = card.parentElement;
  const MAX = 12;

  function move(e) {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * MAX * 2;
    const ry = (px - 0.5) * MAX * 2;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.setProperty('--mx', (px * 100) + '%');
    card.style.setProperty('--my', (py * 100) + '%');
  }
  function reset() {
    card.style.transform = 'rotateX(0) rotateY(0)';
  }
  wrap.addEventListener('mousemove', move);
  wrap.addEventListener('mouseleave', reset);
})();

/* ---------- IMAGE FRAME TILT ---------- */
(function frameTilt() {
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  const frames = document.querySelectorAll('.frame.mission__media, .about__photo, .feature__media .frame');
  frames.forEach((frame) => {
    frame.classList.add('is-tilt');
    const MAX = 12;
    function move(e) {
      const r = frame.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const rx = (0.5 - py) * MAX * 2;
      const ry = (px - 0.5) * MAX * 2;
      frame.style.transform =
        `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      frame.style.setProperty('--mx', (px * 100) + '%');
      frame.style.setProperty('--my', (py * 100) + '%');
    }
    frame.addEventListener('mousemove', move);
    frame.addEventListener('mouseleave', () => {
      frame.style.transform = 'rotateX(0) rotateY(0)';
    });
  });
})();

/* ---------- INTERACTIVE BACKGROUND ---------- */
(function bgInteractive() {
  const layer = document.querySelector('.bg-layer');
  if (!layer) return;

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const field = document.getElementById('bgParticles');
  if (field && !reduce) {
    const COUNT = window.innerWidth < 700 ? 14 : 26;
    let html = '';
    for (let i = 0; i < COUNT; i++) {
      const left = Math.random() * 100;
      const size = 1.5 + Math.random() * 2.5;
      const dur  = 14 + Math.random() * 18;
      const delay = -Math.random() * dur;
      const op = 0.25 + Math.random() * 0.45;
      html += '<span class="mote" style="left:' + left + '%;width:' + size + 'px;height:' + size +
              'px;opacity:' + op + ';animation-duration:' + dur + 's;animation-delay:' + delay + 's"></span>';
    }
    field.innerHTML = html;
  }

  if (reduce) return;

  const W = () => window.innerWidth, H = () => window.innerHeight;
  let tx = W() / 2, ty = H() * 0.32;
  let cx = tx, cy = ty;
  let tpx = 0, tpy = 0, px = 0, py = 0;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    tpx = (e.clientX / W() - 0.5) * 36;
    tpy = (e.clientY / H() - 0.5) * 36;
  }, { passive: true });

  function raf() {
    cx += (tx - cx) * 0.12;  cy += (ty - cy) * 0.12;
    px += (tpx - px) * 0.06; py += (tpy - py) * 0.06;
    layer.style.setProperty('--cx', cx.toFixed(1) + 'px');
    layer.style.setProperty('--cy', cy.toFixed(1) + 'px');
    layer.style.setProperty('--px', px.toFixed(2) + 'px');
    layer.style.setProperty('--py', py.toFixed(2) + 'px');
    requestAnimationFrame(raf);
  }
  raf();
})();

/* ---------- ARSENAL: category highlight filter ---------- */
(function arsenal() {
  const pills = [...document.querySelectorAll('.ars-pill')];
  const tiles = [...document.querySelectorAll('.ars-tile')];
  if (!pills.length || !tiles.length) return;
  pills.forEach((pill) =>
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.toggle('is-on', p === pill));
      const cat = pill.dataset.cat;
      tiles.forEach((t) => {
        const keep =
          cat === 'all' || t.dataset.cat === cat || t.classList.contains('ars-tile--more');
        t.classList.toggle('is-dim', !keep);
      });
    })
  );
})();

/* ---------- JOURNEY CIRCUIT LINE (scroll-driven draw) ---------- */
(function circuit() {
  const sec = document.getElementById('journey');
  const box = sec && sec.querySelector('.circuit');
  const path = document.getElementById('circuitPath');
  if (!sec || !box || !path) return;

  const feats = [...sec.querySelectorAll('.feature')];

  function layout() {
    const br = box.getBoundingClientRect();
    if (br.height < 10) return;
    box.querySelectorAll('.circuit-node').forEach((n) => n.remove());
    feats.forEach((f) => {
      const fr = f.getBoundingClientRect();
      const n = document.createElement('span');
      n.className = 'circuit-node';
      n.style.top = (fr.top - br.top + fr.height / 2) + 'px';
      box.appendChild(n);
    });
  }
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);

  let len = 0;
  function measure() {
    len = Math.max(box.offsetHeight, 1);
    path.style.strokeDasharray = len;
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);

  const head = document.getElementById('circuitHead');

  function onScroll() {
    const br = box.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.8 - br.top) / br.height));
    path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
    if (head) {
      head.style.top = (p * br.height) + 'px';
      head.classList.toggle('on', p > 0.005 && p < 0.998);
    }
    box.querySelectorAll('.circuit-node').forEach((n, i) => {
      const nodeP = (parseFloat(n.style.top) || 0) / Math.max(br.height, 1);
      n.classList.toggle('lit', p >= nodeP);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- THEME & COLOR SWITCHER ---------- */
(function theme() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;

  if (btn) {
    function applyMode(mode) {
      if (mode === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      btn.setAttribute('aria-pressed', mode === 'light');
      window.dispatchEvent(new Event('resize'));
    }

    let saved = 'dark';
    try { saved = localStorage.getItem('na_theme') || 'dark'; } catch (e) {}
    applyMode(saved);

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('na_theme', next); } catch (e) {}
      applyMode(next);
    });
  }

  // Color Switcher Logic
  const colorToggle = document.getElementById('colorToggle');
  const colorPopover = document.getElementById('colorPopover');
  if (!colorToggle || !colorPopover) return;

  const palettes = {
    amber:   { base: '#f2a93b', bright: '#ffc163', deep: '#c9821f', glow: 'rgba(242, 169, 59, 0.32)', dim: 'rgba(242, 169, 59, 0.12)', rgb: '242, 169, 59', hue: '0deg' },
    emerald: { base: '#10b981', bright: '#34d399', deep: '#059669', glow: 'rgba(16, 185, 129, 0.32)', dim: 'rgba(16, 185, 129, 0.12)', rgb: '16, 185, 129', hue: '124deg' },
    blue:    { base: '#3b82f6', bright: '#60a5fa', deep: '#2563eb', glow: 'rgba(59, 130, 246, 0.32)', dim: 'rgba(59, 130, 246, 0.12)', rgb: '59, 130, 246', hue: '181deg' },
    rose:    { base: '#f43f5e', bright: '#fb7185', deep: '#e11d48', glow: 'rgba(244, 63, 94, 0.32)', dim: 'rgba(244, 63, 94, 0.12)', rgb: '244, 63, 94', hue: '314deg' }
  };

  function applyColor(id) {
    const pal = palettes[id] || palettes.amber;
    document.body.classList.add('theme-transition');
    
    // Slight delay to allow transition class to apply before changing properties
    requestAnimationFrame(() => {
      root.style.setProperty('--accent', pal.base);
      root.style.setProperty('--accent-bright', pal.bright);
      root.style.setProperty('--accent-deep', pal.deep);
      root.style.setProperty('--accent-glow', pal.glow);
      root.style.setProperty('--accent-dim', pal.dim);
      root.style.setProperty('--accent-rgb', pal.rgb);
      root.style.setProperty('--theme-hue', pal.hue);

      // Dynamically update SimpleIcons SVGs
      const hex = pal.base.replace('#', '');
      document.querySelectorAll('img[src*="cdn.simpleicons.org"]').forEach(img => {
        img.src = img.src.replace(/\/[a-f0-9]{6}$/i, '/' + hex);
      });
    });

    colorPopover.querySelectorAll('.color-swatch').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.color === id);
    });

    setTimeout(() => document.body.classList.remove('theme-transition'), 450);
  }

  let savedColor = 'amber';
  try { savedColor = localStorage.getItem('na_color') || 'amber'; } catch (e) {}
  
  // Apply initially without transition
  const pal = palettes[savedColor] || palettes.amber;
  root.style.setProperty('--accent', pal.base);
  root.style.setProperty('--accent-bright', pal.bright);
  root.style.setProperty('--accent-deep', pal.deep);
  root.style.setProperty('--accent-glow', pal.glow);
  root.style.setProperty('--accent-dim', pal.dim);
  root.style.setProperty('--accent-rgb', pal.rgb);
  root.style.setProperty('--theme-hue', pal.hue);
  
  // Update SimpleIcons initially
  const initialHex = pal.base.replace('#', '');
  document.querySelectorAll('img[src*="cdn.simpleicons.org"]').forEach(img => {
    img.src = img.src.replace(/\/[a-f0-9]{6}$/i, '/' + initialHex);
  });
  colorPopover.querySelectorAll('.color-swatch').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.color === savedColor);
  });

  colorToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    colorPopover.classList.toggle('is-open');
  });

  colorPopover.addEventListener('click', (e) => {
    if (e.target.classList.contains('color-swatch')) {
      const id = e.target.dataset.color;
      try { localStorage.setItem('na_color', id); } catch (err) {}
      applyColor(id);
      colorPopover.classList.remove('is-open');
    }
  });

  document.addEventListener('click', (e) => {
    if (!colorToggle.contains(e.target) && !colorPopover.contains(e.target)) {
      colorPopover.classList.remove('is-open');
    }
  });
})();
