/* ============================================================
   NARESH ADHE — GSAP Animation Engine
   Zero-lag, GPU-accelerated. Only animates transform + opacity.
   Uses ScrollTrigger for all scroll-based reveals.

   ARCHITECTURE GUARANTEES:
   • Every animation uses GSAP transform shorthand (x, y, scale,
     rotation) and opacity — GPU-composited, zero layout thrash.
   • ScrollTrigger handles all viewport detection — no manual
     scroll-position math on the main thread.
   • passive event listeners + rAF via gsap.ticker for 60fps.
   ============================================================ */
;(function gsapEngine() {
  'use strict';

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const bootSeen = sessionStorage.getItem('na_booted');
  const INTRO_DELAY = bootSeen ? 0.2 : 2.8;

  gsap.config({ force3D: true });

  // ── Override the CSS hide: set every .reveal to visible + full opacity
  //    GSAP's from() calls will then animate FROM hidden states TO this
  //    cleared state. This is the critical bridge between CSS initial-hide
  //    and GSAP-driven entrance. ──
  gsap.set('.reveal', { visibility: 'visible', opacity: 1 });

  // Also clear feature child elements that had old CSS opacity:0
  gsap.set([
    '.feature.reveal .feature__kicker',
    '.feature.reveal .feature__title',
    '.feature.reveal .feature__sub',
    '.feature.reveal .feature__text',
    '.feature.reveal .feature__metrics',
    '.feature.reveal .feature__tagline',
    '.feature.reveal .pub'
  ].join(','), { opacity: 1 });

  /* ============================================================
     1. SCROLL PROGRESS BAR — scrub-linked scaleX
     ============================================================ */
  const progressBar = document.querySelector('.scroll-progress__bar');
  const progressWrap = document.querySelector('.scroll-progress');
  if (progressBar) {
    let scrollTimeout;
    gsap.to(progressBar, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3
      }
    });
    if (progressWrap) {
      window.addEventListener('scroll', () => {
        progressWrap.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => progressWrap.classList.remove('is-scrolling'), 150);
      }, { passive: true });
    }
  }

  /* ============================================================
     2. HERO ENTRANCE TIMELINE — sequenced with boot
     ============================================================ */
  const heroTL = gsap.timeline({
    delay: INTRO_DELAY,
    defaults: { ease: 'power3.out', duration: 0.8 }
  });

  heroTL
    .from('.hero__h1 .l', {
      y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out'
    })
    .from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6')
    .from('.hero__type', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
    .from('.hero__quote', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero__desc', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
    .from('.hero__cta .btn', {
      y: 24, opacity: 0, duration: 0.7,
      stagger: 0.1, ease: 'back.out(1.4)'
    }, '-=0.4')
    .from('.hero__chips .chip', {
      scale: 0.6, opacity: 0, duration: 0.5,
      stagger: 0.06, ease: 'back.out(2)'
    }, '-=0.5')
    .from('.idwrap', {
      y: 50, opacity: 0, duration: 1.1, ease: 'power3.out'
    }, '-=0.9')
    .from('.scrollcue', { y: 10, opacity: 0, duration: 0.6 }, '-=0.3');

  // Hero swoosh stroke draw-in
  gsap.timeline({ delay: INTRO_DELAY + 1.0 })
    .to('.hero-swoosh .sw', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' })
    .to('.hero-swoosh .sw--glow', { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }, '<');

  /* ============================================================
     3. REVEAL FACTORY — reusable ScrollTrigger helper
     ============================================================ */
  function revealFrom(selector, fromVars, triggerOpts) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;
    const cfg = Object.assign({ start: 'top 88%' }, triggerOpts);
    els.forEach((el) => {
      gsap.from(el, Object.assign({
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: cfg.start,
          toggleActions: 'play none none none',
          once: true
        }
      }, fromVars));
    });
  }

  /* ── Labels — slide from left + spring ── */
  revealFrom('.label.reveal', {
    x: -24, opacity: 0, scale: 0.92, duration: 0.8, ease: 'back.out(1.7)'
  });

  /* ── Section titles — clip-path wipe ── */
  gsap.utils.toArray('.section-title.reveal, .contact__title.reveal, .vision__big.reveal').forEach((el) => {
    gsap.from(el, {
      clipPath: 'inset(100% 0 0 0)',
      y: 20, opacity: 0, duration: 1.1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ── Section title underline draw-ins ── */
  document.querySelectorAll('.section-title').forEach((t) => {
    t.insertAdjacentHTML(
      'beforeend',
      '<svg class="title-line" viewBox="0 0 170 10" aria-hidden="true">' +
        '<path d="M4 7 C 45 2, 120 2, 166 5"/></svg>'
    );
  });
  gsap.utils.toArray('.section-title .title-line path').forEach((path) => {
    const parent = path.closest('.section-title');
    if (!parent) return;
    gsap.from(path, {
      strokeDashoffset: 175, duration: 0.9, ease: 'power2.out', delay: 0.5,
      scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
    });
  });

  /* ── Paragraphs ── */
  revealFrom('.about__story p.reveal, .vision__coda.reveal, .section-sub.reveal', {
    y: 22, opacity: 0, duration: 0.9, ease: 'power2.out'
  });

  /* ── Lead text ── */
  revealFrom('.lead.reveal', { y: 18, opacity: 0, duration: 0.8 });

  /* ── Premium Terminal Widget Reveal (with Typewriter) ── */
  gsap.utils.toArray('.term-widget').forEach((term) => {
    // 1. Text splitter for terminal typing effect
    const chars = [];
    term.querySelectorAll('.term__cmd, .term__json').forEach(target => {
      const walk = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null, false);
      const textNodes = [];
      let n;
      while ((n = walk.nextNode())) textNodes.push(n);
      
      textNodes.forEach(node => {
        const text = node.nodeValue;
        if (!text.trim() && !text.includes('\n')) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < text.length; i++) {
          if (/\s/.test(text[i])) {
            frag.appendChild(document.createTextNode(text[i]));
          } else {
            const span = document.createElement('span');
            span.style.opacity = '0';
            span.textContent = text[i];
            chars.push(span);
            frag.appendChild(span);
          }
        }
        node.parentNode.replaceChild(frag, node);
      });
    });

    // 2. Main Terminal Timeline
    const tl = gsap.timeline({
      scrollTrigger: { trigger: term, start: 'top 85%', once: true }
    });

    // Window float-in
    tl.from(term, {
      y: 40, opacity: 0, scale: 0.96, rotationX: -8,
      transformOrigin: "bottom center", filter: 'blur(12px)',
      duration: 1.2, ease: 'expo.out'
    });

    // Letter-by-letter typing
    if (chars.length > 0) {
      tl.to(chars, {
        opacity: 1,
        duration: 0.01,
        stagger: 0.015,
        ease: 'none'
      }, "-=0.4");
    }
  });

  /* ── About photo — clip reveal ── */
  gsap.utils.toArray('.about__photo').forEach((el) => {
    gsap.from(el, {
      clipPath: 'inset(8% 8% 8% 8%)', scale: 0.92, opacity: 0,
      duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  /* ============================================================
     4. ARSENAL TILES — staggered cascade
     ============================================================ */
  revealFrom('.ars-filters.reveal', {
    y: 20, opacity: 0, duration: 0.7, ease: 'power3.out'
  }, { start: 'top 90%' });

  gsap.from('.ars-tile', {
    y: 45, 
    opacity: 0, 
    scale: 0.92, 
    rotationX: -15,
    filter: 'blur(10px)',
    duration: 1.1, 
    stagger: {
      amount: 0.8,
      grid: 'auto',
      from: 'start'
    },
    ease: 'expo.out', 
    clearProps: 'all',
    scrollTrigger: {
      trigger: '.ars-tiles',
      start: 'top 85%',
      once: true
    },
    onComplete: () => {
      document.querySelectorAll('.ars-tile').forEach((t) => t.classList.add('is-ready'));
    }
  });

  // Re-animate tiles on filter click
  document.querySelectorAll('.ars-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.cat;
      let idx = 0;
      document.querySelectorAll('.ars-tile').forEach((tile) => {
        const keep = cat === 'all' || tile.dataset.cat === cat || tile.classList.contains('ars-tile--more');
        if (keep) {
          gsap.fromTo(tile,
            { y: 20, opacity: 0, scale: 0.96, filter: 'blur(5px)' },
            { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, delay: idx * 0.04, ease: 'expo.out', overwrite: true, clearProps: 'filter' }
          );
          idx++;
        }
      });
    });
  });

  /* ============================================================
     5. MISSIONS — project cards
     ============================================================ */
  gsap.utils.toArray('.mission').forEach((mission) => {
    const media = mission.querySelector('.mission__media');
    const body = mission.querySelector('.mission__body');

    if (media) {
      gsap.from(media, {
        clipPath: 'inset(8% 8% 8% 8%)', scale: 0.92, opacity: 0,
        duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: mission, start: 'top 82%', once: true }
      });
    }

    if (body) {
      const children = body.querySelectorAll(
        '.mission__no, .mission__title, .mission__tag, .mission__desc, .mission__stack, .mission__links'
      );
      gsap.from(children, {
        x: 40, opacity: 0, duration: 0.8, stagger: 0.08,
        ease: 'power3.out', delay: 0.2,
        scrollTrigger: { trigger: mission, start: 'top 80%', once: true }
      });
    }
  });

  /* ============================================================
     6. JOURNEY — feature blocks (cinematic unbundled cascade)
     ============================================================ */
  gsap.utils.toArray('.feature.reveal').forEach((feature) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: feature, start: 'top 85%', once: true }
    });

    const parts = {
      kicker:  feature.querySelector('.feature__kicker'),
      title:   feature.querySelector('.feature__title'),
      sub:     feature.querySelector('.feature__sub'),
      text:    feature.querySelector('.feature__text'),
      metrics: feature.querySelector('.feature__metrics'),
      tagline: feature.querySelector('.feature__tagline'),
      pub:     feature.querySelector('.pub'),
      media:   feature.querySelector('.feature__media .frame')
    };

    if (parts.kicker)  tl.from(parts.kicker,  { y: 20, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0);
    if (parts.title)   tl.from(parts.title,   { clipPath: 'inset(100% 0 0 0)', y: 30, opacity: 0, duration: 1.2, ease: 'expo.out' }, 0.1);
    if (parts.sub)     tl.from(parts.sub,     { y: 20, opacity: 0, filter: 'blur(4px)', duration: 1, ease: 'expo.out' }, 0.25);
    if (parts.text)    tl.from(parts.text,    { y: 30, opacity: 0, filter: 'blur(10px)', duration: 1.4, ease: 'expo.out' }, 0.35);
    if (parts.metrics) tl.from(parts.metrics, { x: 40, opacity: 0, filter: 'blur(6px)', duration: 1.2, ease: 'expo.out' }, 0.45);
    if (parts.tagline) tl.from(parts.tagline, { y: 15, opacity: 0, duration: 0.8, ease: 'expo.out' }, 0.55);
    if (parts.pub)     tl.from(parts.pub,     { y: 20, opacity: 0, filter: 'blur(5px)', duration: 1, ease: 'expo.out' }, 0.45);
    if (parts.media)   tl.from(parts.media,   { clipPath: 'inset(12% 12% 12% 12%)', scale: 0.85, opacity: 0, filter: 'blur(8px)', duration: 1.4, ease: 'expo.out' }, 0.15);
  });

  /* ============================================================
     7. VISION SECTION — elastic domain pills
     ============================================================ */
  gsap.utils.toArray('.vision__domain.reveal').forEach((el, i) => {
    gsap.from(el, {
      y: 12, opacity: 0, scale: 0.5, duration: 0.65,
      ease: 'back.out(2)', delay: i * 0.06,
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* ============================================================
     8. CONTACT — staggered card pop-in
     ============================================================ */
  gsap.utils.toArray('.clink.reveal').forEach((el, i) => {
    gsap.from(el, {
      y: 30, opacity: 0, scale: 0.88, rotateX: 8,
      duration: 0.75, ease: 'back.out(1.4)', delay: i * 0.06,
      scrollTrigger: { trigger: el, start: 'top 92%', once: true }
    });
  });

  revealFrom('.contact__sub.reveal', { y: 20, opacity: 0, duration: 0.8 });
  revealFrom('.contact__cta.reveal', { y: 20, opacity: 0, duration: 0.7 });

  /* ============================================================
     9. PARALLAX — scrub-linked depth (GPU only: y transform)
     ============================================================ */
  if (!prefersReduced) {
    gsap.utils.toArray('.mission__media').forEach((media) => {
      gsap.to(media, {
        y: -30, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    });

    gsap.utils.toArray('.feature__media .frame').forEach((frame) => {
      gsap.to(frame, {
        y: -25, ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
      });
    });

    const aboutPhoto = document.querySelector('.about__photo');
    if (aboutPhoto) {
      gsap.to(aboutPhoto, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: aboutPhoto, start: 'top bottom', end: 'bottom top', scrub: 2 }
      });
    }
  }

  /* ============================================================
     10. CUSTOM CURSOR — lerped with gsap.ticker
     ============================================================ */
  if (!isTouch && !prefersReduced) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (dot && ring) {
      let mx = innerWidth / 2, my = innerHeight / 2;
      let ringX = mx, ringY = my;

      document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
      }, { passive: true });

      const hoverSel = 'a, button, .btn, .ars-pill, .ars-tile, .chip, .nav__link, .nav__cta, .clink, .mission__link, .nav__theme, .idcard, .frame.is-tilt';
      document.addEventListener('mouseover', (e) => {
        const isHover = !!e.target.closest(hoverSel);
        dot.classList.toggle('is-hover', isHover);
        ring.classList.toggle('is-hover', isHover);
      }, { passive: true });

      document.addEventListener('mouseleave', () => {
        dot.classList.add('is-hidden');
        ring.classList.add('is-hidden');
      });
      document.addEventListener('mouseenter', () => {
        dot.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
      });

      // Lerped cursor on GSAP's ticker — synced with rAF, zero drift
      gsap.ticker.add(() => {
        // Dot follows instantly
        gsap.set(dot, {
          x: mx, y: my,
          xPercent: -50, yPercent: -50
        });
        // Ring trails with lerp
        ringX += (mx - ringX) * 0.12;
        ringY += (my - ringY) * 0.12;
        gsap.set(ring, {
          x: ringX, y: ringY,
          xPercent: -50, yPercent: -50
        });
      });
    }
  }

  /* ============================================================
     11. MAGNETIC BUTTONS — elastic spring-back
     ============================================================ */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('.btn, .nav__cta, .nav__theme').forEach((el) => {
      const strength = el.classList.contains('btn--primary') ? 0.35 : 0.25;

      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) * strength;
        const dy = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(el, { x: dx, y: dy, duration: 0.3, ease: 'power2.out', overwrite: true });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: true });
      });
    });
  }

  /* ============================================================
     12. NAV AUTO-HIDE — GSAP ScrollTrigger direction detection
     ============================================================ */
  const nav = document.getElementById('nav');
  let isProgrammaticScroll = false;
  let programmaticScrollTimeout;

  if (nav) {
    ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        if (self.scroll() > 200 && self.direction === 1 && !isProgrammaticScroll) {
          nav.classList.add('nav--hidden');
        } else if (self.direction === -1 || isProgrammaticScroll) {
          nav.classList.remove('nav--hidden');
        }
      }
    });
  }

  /* ============================================================
     13. CARD GLOW FOLLOW — cursor-tracked radial highlight
     ============================================================ */
  if (!isTouch) {
    document.querySelectorAll('.ars-tile, .clink').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  }

  /* ============================================================
     14. SMOOTH ANCHOR SCROLLING — native scrollTo (no plugin needed)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      // Mobile menu links have their own delayed scroll logic in main.js
      if (a.closest('.nav__mobile')) return;

      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      
      // Pause nav auto-hide during programmatic scroll
      isProgrammaticScroll = true;
      const checkScrollStop = () => {
        clearTimeout(programmaticScrollTimeout);
        programmaticScrollTimeout = setTimeout(() => {
          isProgrammaticScroll = false;
          window.removeEventListener('scroll', checkScrollStop);
        }, 150);
      };
      window.addEventListener('scroll', checkScrollStop, { passive: true });
      // Force nav to show when clicking an anchor
      nav.classList.remove('nav--hidden');

      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.pushState(null, '', id);
    });
  });

  /* ============================================================
     15. IMAGE LAZY LOAD FADE-IN
     ============================================================ */
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
    if (img.complete) { img.classList.add('is-loaded'); return; }
    img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
  });

  /* ── Refresh ScrollTrigger after all images load ── */
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

})();
