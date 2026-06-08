/* ═══════════════════════════════════════════
   SRI ANANDHA POLY CLINIC — interactions
   ═══════════════════════════════════════════ */

(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ── Theme ─────────────────────────────── */
  const root   = document.documentElement;
  const toggle = $('#themeToggle');
  const label  = toggle.querySelector('.theme-toggle__label');
  const saved  = localStorage.getItem('sapc-theme');
  const apply  = (t) => {
    root.setAttribute('data-theme', t);
    label.textContent = t === 'dark' ? label.dataset.dark : label.dataset.light;
    localStorage.setItem('sapc-theme', t);
  };
  apply(saved || 'light');
  toggle.addEventListener('click', () => {
    apply(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ── Loader ────────────────────────────── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      $('#loader').classList.add('is-done');
      document.body.classList.add('is-loaded');
    }, 650);
  });

  /* ── Year ──────────────────────────────── */
  $('#yr').textContent = new Date().getFullYear();

  /* ── Unified scroll handler (rAF-throttled) ─ */
  const nav = $('.nav');
  const meshLayers = $$('.mesh');
  const streaks    = $$('.streaks i');
  const heroSec    = $('.hero');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enableParallax =
    !reduceMotion &&
    matchMedia('(hover: hover) and (pointer: fine)').matches &&
    window.innerWidth > 900;

  let lastY = window.scrollY;
  let scrollScheduled = false;
  let heroVisible = true;
  const heroObserver = new IntersectionObserver((e) => { heroVisible = e[0].isIntersecting; }, { threshold: 0 });
  if (heroSec) heroObserver.observe(heroSec);

  const onScrollFrame = () => {
    scrollScheduled = false;
    const y = lastY;
    const sh = window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 40);
    if (enableParallax && heroVisible && y < sh) {
      for (let i = 0; i < meshLayers.length; i++) {
        meshLayers[i].style.transform = `translate3d(0, ${(y * (0.03 + i * 0.015)).toFixed(1)}px, 0)`;
      }
      for (let i = 0; i < streaks.length; i++) {
        streaks[i].style.transform = `translate3d(${(y * (0.05 + i * 0.025)).toFixed(1)}px, 0, 0) rotate(-${10 + i * 2}deg)`;
      }
    }
  };
  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(onScrollFrame);
    }
  }, { passive: true });
  onScrollFrame();

  /* ── Cursor halo ───────────────────────── */
  const halo = $('.cursor-halo');
  let hx = 0, hy = 0, tx = 0, ty = 0, haloActive = false, haloTimeout = null;
  if (halo && !reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      clearTimeout(haloTimeout);
      haloTimeout = setTimeout(() => { haloActive = false; }, 2000);
      if (!haloActive) { haloActive = true; requestAnimationFrame(haloTick); }
    }, { passive: true });
    const haloTick = () => {
      if (!haloActive) return;
      hx += (tx - hx) * 0.18;
      hy += (ty - hy) * 0.18;
      halo.style.transform = `translate3d(${hx}px, ${hy}px, 0) translate(-50%, -50%)`;
      if (Math.abs(tx - hx) < 0.5 && Math.abs(ty - hy) < 0.5) { return; }
      requestAnimationFrame(haloTick);
    };
  }



  /* ── Reveal observer ───────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  $$('.reveal, .phrase, .module, .cred, .trust__panel, .contact__card, .human__title')
    .forEach((el) => io.observe(el));

  /* ── Hero portrait tilt ────────────────── */
  const tilt = $('[data-tilt]');
  if (tilt && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    tilt.addEventListener('mousemove', (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      tilt.style.transform =
        `translateY(0) scale(1) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;
    });
    tilt.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
  }

  /* ── Contact card spotlight ────────────── */
  $$('.contact__card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top)  / r.height) * 100}%`);
    });
  });

  /* ── Mastery drag scroll ───────────────── */
  const track = $('#masteryTrack');
  if (track) makeDraggable(track, 1.6);

  function makeDraggable(el, mult = 1.4, wheelMode = 'convert') {
    let down = false, startX = 0, startLeft = 0;
    el.addEventListener('mousedown', (e) => {
      down = true; startX = e.pageX; startLeft = el.scrollLeft;
      el.classList.add('is-dragging');
    });
    ['mouseup','mouseleave'].forEach(ev => el.addEventListener(ev, () => {
      down = false; el.classList.remove('is-dragging');
    }));
    el.addEventListener('mousemove', (e) => {
      if (!down) return;
      e.preventDefault();
      el.scrollLeft = startLeft - (e.pageX - startX) * mult;
    });
    el.addEventListener('wheel', (e) => {
      const overflows = el.scrollWidth > el.clientWidth;
      if (wheelMode === 'horizontal') {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          el.scrollLeft += e.deltaX;
          e.preventDefault();
        }
      } else {
        if (overflows && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }
    }, { passive: false });
  }

  document.addEventListener('keydown', (e) => {
    if (!track) return;
    const r = track.getBoundingClientRect();
    if (!(r.top < innerHeight && r.bottom > 0)) return;
    if (e.key === 'ArrowRight') track.scrollBy({ left: 340, behavior: 'smooth' });
    if (e.key === 'ArrowLeft')  track.scrollBy({ left: -340, behavior: 'smooth' });
  });

  /* ── Magnetic buttons ──────────────────── */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.btn').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top  - r.height / 2;
        b.style.transform = `translate(${x*0.18}px, ${y*0.25}px)`;
      });
      b.addEventListener('mouseleave', () => { b.style.transform = ''; });
    });
  }

  /* ═════════════════════════════════════════
     Interactive Clinical Expertise Modules
     ═════════════════════════════════════════ */

  // Per-expertise portfolio data. Replace image paths with real
  // patient/certificate uploads as they become available.
  const PORTFOLIOS = {
    implant: {
      title: 'Implantology — Surgical Portfolio',
      meta: 'Computer-guided · Immediate Loading · Ridge Augmentation',
      gallery: [
        { src: 'assets/Implantology/Implantology.jpg', cap: 'Surgical Overview' },
        { src: 'assets/Implantology/Case1/before.jpg', cap: 'Pre-operative Assessment' },
        { src: 'assets/Implantology/Case2/Impression.jpg', cap: 'Impression Workflow' },
        { src: 'assets/Implantology/Case1/Trial.jpg', cap: 'Trial Prosthetic' },
        { src: 'assets/Implantology/Case4/Final.jpg', cap: 'Final Restoration' },
      ],
      ba: { before: 'assets/Implantology/Case1/before.jpg', after: 'assets/Implantology/Case1/Final.jpg', label: 'Missing mandibular molar — single-tooth implant restoration' },
    },
    biomimetic: {
      title: 'Biomimetic & Restorative — Portfolio',
      meta: 'Adhesive Dentistry · Conservative Reconstruction',
      gallery: [
        { src: 'assets/Biomimetic & Restorative/Bio-1.jpg', cap: 'Pre-operative Assessment' },
        { src: 'assets/Biomimetic & Restorative/Bio-7.jpg', cap: 'Caries Removal' },
        { src: 'assets/Biomimetic & Restorative/Bio-4.jpg', cap: 'Preparation of Enamel' },
        { src: 'assets/Biomimetic & Restorative/Bio-6.jpg', cap: 'Final Restoration' },
      ],
      ba: { before: 'assets/Biomimetic & Restorative/Bio-1.jpg', after: 'assets/Biomimetic & Restorative/Bio-7.jpg', label: 'Fractured premolar — biomimetic onlay restoration' },
    },
    fmr: {
      title: 'Full Mouth Rehabilitation — Cases',
      meta: 'Occlusion · Function · Aesthetics',
      gallery: [
        { src: 'assets/Full Mouth Rehabilitation/Case1/Before.jpg', cap: 'Case 1 — Pre-operative' },
        { src: 'assets/Full Mouth Rehabilitation/Case1/Trial.jpg', cap: 'Case 1 — Trial Evaluation' },
        { src: 'assets/Full Mouth Rehabilitation/Case1/Final.jpg', cap: 'Case 1 — Final Result' },
        { src: 'assets/Full Mouth Rehabilitation/Case2/Before.jpg', cap: 'Case 2 — Pre-operative' },
        { src: 'assets/Full Mouth Rehabilitation/Case2/Final.jpg', cap: 'Case 2 — Final Result' },
      ],
      ba: { before: 'assets/Full Mouth Rehabilitation/Case1/Before.jpg', after: 'assets/Full Mouth Rehabilitation/Case1/Final.jpg', label: 'Worn dentition — full-arch rehabilitation' },
    },
    ortho: {
      title: 'Orthodontics — Treatment Portfolio',
      meta: 'Clear Aligners · Fixed Appliances · Surgical Ortho',
      gallery: [
        { src: 'assets/Orthodontics/Case1/Before.jpg', cap: 'Case 1 — Pre-treatment' },
        { src: 'assets/Orthodontics/Case1/Midtreatment-1.jpg', cap: 'Case 1 — Early Alignment' },
        { src: 'assets/Orthodontics/Case1/Midtreatment-2.jpg', cap: 'Case 1 — Mid-treatment' },
        { src: 'assets/Orthodontics/Case1/Midtreatment-3.jpg', cap: 'Case 1 — Final Alignment' },
        { src: 'assets/Orthodontics/Case2 (Ortho Surgery)/After-Surgery.jpg', cap: 'Surgical Case — Post-operative' },
      ],
      ba: { before: 'assets/Orthodontics/Case1/Before.jpg', after: 'assets/Orthodontics/Case2 (Ortho Surgery)/After-Surgery.jpg', label: 'Crowded anterior — orthodontic alignment result' },
    },
    bps: {
      title: 'Bps Dentures — Prosthetic Portfolio',
      meta: 'BPS · Biofunctional · Complete Dentures',
      gallery: [
        { src: 'assets/Bps Dentures/Case1/Before.jpg', cap: 'Case 1 — Pre-treatment' },
        { src: 'assets/Bps Dentures/Case1/Trial.jpg', cap: 'Case 1 — Trial Denture' },
        { src: 'assets/Bps Dentures/Case2/Before.jpg', cap: 'Case 2 — Pre-treatment', rotate: true },
        { src: 'assets/Bps Dentures/Case2/Trial.jpg', cap: 'Case 2 — Trial Denture' },
        { src: 'assets/Bps Dentures/image3-1.jpg', cap: 'Prosthetic Work-up', rotate: true },
      ],
      ba: { before: 'assets/Bps Dentures/Case1/Before.jpg', after: 'assets/Bps Dentures/Case1/Trial.jpg', label: 'Edentulous arch — BPS denture rehabilitation' },
    },
  };

  // Build expandable content
  const buildExpand = (key) => {
    const data = PORTFOLIOS[key];
    if (!data) return '';
    const galleryItems = data.gallery.map(g =>
      `<div class="gallery__item${g.rotate ? ' gallery__item--rotate' : ''}"
         data-src="${g.src}"${g.rotate ? ' data-rotate' : ''}
         role="img" aria-label="${g.cap}">
         <span class="gallery__item-cap">${g.cap}</span>
       </div>`
    ).join('');
    return `
      <div class="expand">
        <div class="expand__head">
          <div>
            <p class="expand__pre">Portfolio</p>
            <h4 class="expand__sec-title" style="display:inline-flex;margin-top:4px;">${data.title}</h4>
          </div>
          <span class="expand__meta">${data.meta}</span>
        </div>

        <div>
          <h5 class="expand__sec-title">Procedure Visuals</h5>
          <div class="gallery">
            <div class="gallery__rail js-drag-rail">
              ${galleryItems}
            </div>
          </div>
        </div>

        <div>
          <h5 class="expand__sec-title">Before &amp; After</h5>
          <div class="ba js-ba"
               data-before="${data.ba.before}"
               data-after="${data.ba.after}">
            <div class="ba__img ba__before js-ba-before"></div>
            <div class="ba__img ba__after  js-ba-after"></div>
            <span class="ba__label ba__label--before">Before</span>
            <span class="ba__label ba__label--after">After</span>
            <div class="ba__handle js-ba-handle" tabindex="0" role="slider"
                 aria-label="Before / After comparison" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>
          </div>
          <p style="margin-top:14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute);">${data.ba.label}</p>
        </div>
      </div>
    `;
  };

  // NOTE: the inline style attributes above in template strings would
  // violate CSP unsafe-inline restrictions if set in source HTML. Because
  // we insert via innerHTML at runtime, browsers treat these as parsed
  // attributes — but to remain strictly CSP-safe even under
  // style-src 'self', we strip them and apply via DOM .style after mount.

  const modules = $$('.module[data-key]');
  modules.forEach((mod) => {
    const key  = mod.dataset.key;
    const exp  = mod.querySelector('.module__expand');
    const btn  = mod.querySelector('.module__toggle');
    let built = false;

    const buildOnce = () => {
      if (built) return;
      exp.innerHTML = buildExpand(key);
      built = true;
      hydrateExpand(exp);
      // Strip inline style attrs from the template above and re-apply via DOM
      $$('[style]', exp).forEach((el) => {
        const css = el.getAttribute('style');
        el.removeAttribute('style');
        css.split(';').forEach(pair => {
          const [p, v] = pair.split(':').map(s => s && s.trim());
          if (p && v) el.style.setProperty(p, v);
        });
      });
    };

    btn.addEventListener('click', () => {
      const isOpening = !mod.classList.contains('is-open');
      // Close all other modules
      modules.forEach((other) => {
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.module__toggle');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });
      // Open only this one
      if (isOpening) {
        mod.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        buildOnce();
        exp.hidden = false;
        setTimeout(() => {
          exp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    });
  });

  /* ── Hydrate gallery, ba slider, certs ─── */
  const hydrateExpand = (exp) => {
    // Draggable rail
    $$('.js-drag-rail', exp).forEach((rail) => makeDraggable(rail, 1.4, 'horizontal'));

    // Before/after
    $$('.js-ba', exp).forEach((ba) => {
      const before = ba.querySelector('.js-ba-before');
      const after  = ba.querySelector('.js-ba-after');
      const handle = ba.querySelector('.js-ba-handle');
      before.style.backgroundImage = `url('${ba.dataset.before}')`;
      after .style.backgroundImage = `url('${ba.dataset.after}')`;
      ba.style.setProperty('--ba-pos', '50%');

      const setPos = (clientX) => {
        const r = ba.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
        ba.style.setProperty('--ba-pos', pct + '%');
        handle.setAttribute('aria-valuenow', Math.round(pct));
      };

      let dragging = false;
      const start = (e) => { dragging = true; e.preventDefault(); };
      const move  = (e) => {
        if (!dragging) return;
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        setPos(cx);
      };
      const end   = () => { dragging = false; };

      handle.addEventListener('mousedown', start);
      handle.addEventListener('touchstart', start, { passive: false });
      ba.addEventListener('click', (e) => setPos(e.clientX));
      window.addEventListener('mousemove', move);
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('mouseup', end);
      window.addEventListener('touchend', end);

      handle.addEventListener('keydown', (e) => {
        const cur = parseFloat(ba.style.getPropertyValue('--ba-pos')) || 50;
        if (e.key === 'ArrowLeft')  { ba.style.setProperty('--ba-pos', Math.max(0, cur - 4) + '%'); e.preventDefault(); }
        if (e.key === 'ArrowRight') { ba.style.setProperty('--ba-pos', Math.min(100, cur + 4) + '%'); e.preventDefault(); }
      });
    });

    // Gallery items — apply bg via DOM (CSP-safe)
    $$('.gallery__item', exp).forEach((item) => {
      const src = item.dataset.src;
      if (!src) return;
      if (item.dataset.rotate) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = item.querySelector('.gallery__item-cap')?.textContent || '';
        img.style.cssText = 'position:absolute;inset:-10%;width:120%;height:120%;object-fit:cover;transform:rotate(90deg);display:block;pointer-events:none;z-index:0';
        item.prepend(img);
      } else {
        item.style.backgroundImage = `url('${src}')`;
      }
      item.addEventListener('click', () => openLightbox(src, item.querySelector('.gallery__item-cap')?.textContent || ''));
    });

    // BA images — click to preview full image
    const baBefore = exp.querySelector('.ba__before');
    const baAfter  = exp.querySelector('.ba__after');
    if (baBefore) baBefore.addEventListener('click', () => openLightbox(baBefore.closest('.js-ba').dataset.before, 'Before'));
    if (baAfter)  baAfter.addEventListener('click',  () => openLightbox(baAfter.closest('.js-ba').dataset.after, 'After'));

    // Lightbox triggers
    $$('.js-zoom', exp).forEach((el) => {
      el.addEventListener('click', () => openLightbox(el.dataset.src, el.dataset.cap || ''));
    });
  };

  /* ── Lightbox ──────────────────────────── */
  const lb   = $('#lightbox');
  const lbI  = $('#lightboxImg');
  const lbC  = $('#lightboxCap');
  const lbX  = $('#lightboxClose');

  const openLightbox = (src, cap) => {
    lbI.src = src;
    lbI.alt = cap || '';
    lbC.textContent = cap || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  lbX.addEventListener('click', closeLightbox);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  // Global lightbox trigger for js-zoom elements outside modules
  document.addEventListener('click', (e) => {
    const zoom = e.target.closest('.js-zoom');
    if (zoom) openLightbox(zoom.dataset.src, zoom.dataset.cap || '');
  });
})();
