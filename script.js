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
  if (track) makeDraggable(track, 1.6, 'horizontal');

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
      const absX = Math.abs(e.deltaX), absY = Math.abs(e.deltaY);
      if (overflows && absX > absY * 1.5) {
        el.scrollLeft += e.deltaX;
        e.preventDefault();
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

  // Per-expertise portfolio data — each discipline has named cases.
  // Case names are used as tab labels. A case may omit `ba` when no
  // before/after pair is available.
  const PORTFOLIOS = {
    implant: {
      title: 'Implantology — Surgical Portfolio',
      meta: 'Computer-guided · Immediate Loading · Ridge Augmentation',
      extraImages: [
        { src: 'assets/Implantology/Implantology.jpg' },
      ],
      cases: {
        'Case 1': {
          gallery: [
            { src: 'assets/Implantology/Case1/before.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Implantology/Case1/Trial.jpg', cap: 'Trial Prosthetic' },
            { src: 'assets/Implantology/Case1/Final.jpg', cap: 'Final Prosthesis' },
          ],
          ba: { before: 'assets/Implantology/Case1/before.jpg', after: 'assets/Implantology/Case1/Final.jpg', label: 'Single-tooth implant restoration' },
        },
        'Case 2': {
          gallery: [
            { src: 'assets/Implantology/Case2/Before.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Implantology/Case2/Trial.jpg', cap: 'Impression Workflow' },
            { src: 'assets/Implantology/Case2/Impression.jpg', cap: 'Trial Prosthetic' },
            { src: 'assets/Implantology/Case2/Final.jpg', cap: 'Final Prosthesis' },
          ],
          ba: { before: 'assets/Implantology/Case2/Before.jpg', after: 'assets/Implantology/Case2/Final.jpg', label: 'Multi-unit implant restoration' },
        },
        'Case 3': {
          gallery: [
            { src: 'assets/Implantology/Case3/Before.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Implantology/Case3/Impression.jpg', cap: 'Trial Prosthesis' },
            { src: 'assets/Implantology/Case3/Trial.jpg', cap: 'Impression Workflow' },
          ],
          ba: { before: 'assets/Implantology/Case3/Before.jpg', after: 'assets/Implantology/Case3/Impression.jpg', label: 'Implant restoration — impression workflow' },
        },
        'Case 4': {
          gallery: [
            { src: 'assets/Implantology/Case4/Before.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Implantology/Case4/Trial.jpg', cap: 'Trial Prosthetic' },
            { src: 'assets/Implantology/Case4/Final.jpg', cap: 'Final Prosthesis' },
          ],
          ba: { before: 'assets/Implantology/Case4/Before.jpg', after: 'assets/Implantology/Case4/Final.jpg', label: 'Full-arch implant restoration' },
        },
        'Case 5': {
          gallery: [
            { src: 'assets/Implantology/Case5/Before.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Implantology/Case5/Trial.jpg', cap: 'Trial Prosthetic' },
            { src: 'assets/Implantology/Case5/Final.jpg', cap: 'Final Prosthesis' },
          ],
          ba: { before: 'assets/Implantology/Case5/Before.jpg', after: 'assets/Implantology/Case5/Final.jpg', label: 'Implant-supported restoration' },
        },
        'Case 6': {
          gallery: [
            { src: 'assets/Implantology/Case6/Before.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Implantology/Case6/Trial.jpg', cap: 'Trial Prosthetic' },
            { src: 'assets/Implantology/Case6/Final.jpg', cap: 'Final Prosthesis' },
          ],
          ba: { before: 'assets/Implantology/Case6/Before.jpg', after: 'assets/Implantology/Case6/Final.jpg', label: 'Complex implant rehabilitation' },
        },
      },
    },
    biomimetic: {
      title: 'Biomimetic & Restorative — Portfolio',
      meta: 'Adhesive Dentistry · Conservative Reconstruction',
      cases: {
        Case: {
          gallery: [
            { src: 'assets/Biomimetic & Restorative/Bio-1.jpg', cap: 'Pre-operative Assessment' },
            { src: 'assets/Biomimetic & Restorative/Bio-7.jpg', cap: 'Caries Removal' },
            { src: 'assets/Biomimetic & Restorative/Bio-4.jpg', cap: 'Preparation of Enamel' },
            { src: 'assets/Biomimetic & Restorative/Bio-6.jpg', cap: 'Final Restoration' },
          ],
          ba: { before: 'assets/Biomimetic & Restorative/Bio-1.jpg', after: 'assets/Biomimetic & Restorative/Bio-6.jpg', label: 'Fractured premolar — biomimetic onlay restoration' },
        },
      },
    },
    fmr: {
      title: 'Full Mouth Rehabilitation — Cases',
      meta: 'Occlusion · Function · Aesthetics',
      cases: {
        'Case 1': {
          gallery: [
            { src: 'assets/Full Mouth Rehabilitation/Case1/Before.jpg', cap: 'Pre-operative' },
            { src: 'assets/Full Mouth Rehabilitation/Case1/Trial.jpg', cap: 'Trial Evaluation' },
            { src: 'assets/Full Mouth Rehabilitation/Case1/Final.jpg', cap: 'Final Result' },
          ],
          ba: { before: 'assets/Full Mouth Rehabilitation/Case1/Before.jpg', after: 'assets/Full Mouth Rehabilitation/Case1/Final.jpg', label: 'Worn dentition — full-arch rehabilitation' },
        },
        'Case 2': {
          gallery: [
            { src: 'assets/Full Mouth Rehabilitation/Case2/Before.jpg', cap: 'Pre-operative' },
            { src: 'assets/Full Mouth Rehabilitation/Case2/Trial.jpg', cap: 'Trial Evaluation' },
            { src: 'assets/Full Mouth Rehabilitation/Case2/Final.jpg', cap: 'Final Result' },
          ],
          ba: { before: 'assets/Full Mouth Rehabilitation/Case2/Before.jpg', after: 'assets/Full Mouth Rehabilitation/Case2/Final.jpg', label: 'Complete rehabilitation — Case 2' },
        },
      },
    },
    ortho: {
      title: 'Orthodontics — Treatment Portfolio',
      meta: 'Clear Aligners · Fixed Appliances · Surgical Ortho',
      cases: {
        'Case 1': {
          gallery: [
            { src: 'assets/Orthodontics/Case1/Before.jpg', cap: 'Pre-treatment' },
            { src: 'assets/Orthodontics/Case1/Midtreatment-1.jpg', cap: 'Early Alignment' },
            { src: 'assets/Orthodontics/Case1/Midtreatment-2.jpg', cap: 'Mid-treatment' },
            { src: 'assets/Orthodontics/Case1/Midtreatment-3.jpg', cap: 'Final Alignment' },
          ],
          ba: { before: 'assets/Orthodontics/Case1/Before.jpg', after: 'assets/Orthodontics/Case1/Midtreatment-3.jpg', label: 'Crowded anterior — orthodontic alignment' },
        },
        'Case 2': {
          gallery: [
            { src: 'assets/Orthodontics/Case2 (Ortho Surgery)/Before.jpg', cap: 'Pre-surgical' },
            { src: 'assets/Orthodontics/Case2 (Ortho Surgery)/After-Surgery.jpg', cap: 'Post-operative' },
            { src: 'assets/Orthodontics/Case2 (Ortho Surgery)/After-1montn.jpg', cap: '1 Month Follow-up' },
          ],
          ba: { before: 'assets/Orthodontics/Case2 (Ortho Surgery)/Before.jpg', after: 'assets/Orthodontics/Case2 (Ortho Surgery)/After-Surgery.jpg', label: 'Surgical orthodontic correction' },
        },
      },
    },
    bps: {
      title: 'Bps Dentures — Prosthetic Portfolio',
      meta: 'BPS · Biofunctional · Complete Dentures',
      extraImages: [
        { src: 'assets/Bps Dentures/image3-1.jpg' },
        { src: 'assets/Bps Dentures/image3-2.jpg' },
        { src: 'assets/Bps Dentures/image3-4.jpg' },
        { src: 'assets/Bps Dentures/image3-5.jpg' },
        { src: 'assets/Bps Dentures/image3-6.jpg' },
      ],
      cases: {
        'Case 1': {
          gallery: [
            { src: 'assets/Bps Dentures/Case1/Before.jpg', cap: 'Pre-treatment' },
            { src: 'assets/Bps Dentures/Case1/Trial.jpg', cap: 'Trial Denture' },
          ],
          ba: { before: 'assets/Bps Dentures/Case1/Before.jpg', after: 'assets/Bps Dentures/Case1/Trial.jpg', label: 'Edentulous arch — BPS denture rehabilitation' },
        },
        'Case 2': {
          gallery: [
            { src: 'assets/Bps Dentures/Case2/Before.jpg', cap: 'Pre-treatment', rotate: true },
            { src: 'assets/Bps Dentures/Case2/Trial.jpg', cap: 'Trial Denture' },
          ],
          ba: { before: 'assets/Bps Dentures/Case2/Before.jpg', after: 'assets/Bps Dentures/Case2/Trial.jpg', label: 'BPS complete denture — Case 2' },
        },
      },
    },
  };

  // ── Template helpers ────────────────────────

  function buildGalleryItems(gallery) {
    return gallery.map(g =>
      `<div class="gallery__item${g.rotate ? ' gallery__item--rotate' : ''}"
         data-src="${g.src}"${g.rotate ? ' data-rotate' : ''}
         role="img" aria-label="${g.cap}">
         <span class="gallery__item-cap">${g.cap}</span>
       </div>`
    ).join('');
  }

  // ── Case switcher ────────────────────────────

  function renderCase(exp, caseName) {
    const mod = exp.closest('.module[data-key]');
    const key = mod.dataset.key;
    const caseData = PORTFOLIOS[key].cases[caseName];
    if (!caseData) return;

    // Toggle active tab
    $$('.case-tab', exp).forEach(t => t.classList.toggle('is-active', t.dataset.case === caseName));

    // Rebuild gallery rail (replace element to drop stale listeners)
    const oldRail = exp.querySelector('.gallery__rail');
    const newRail = document.createElement('div');
    newRail.className = 'gallery__rail js-drag-rail';
    newRail.innerHTML = buildGalleryItems(caseData.gallery);
    oldRail.replaceWith(newRail);
    setupGalleryItems(newRail);
    makeDraggable(newRail, 1.4, 'horizontal');

    // Lightbox navigation for new items
    const navItems = $$('.gallery__item', newRail).map(g => ({
      src: g.dataset.src,
      cap: g.querySelector('.gallery__item-cap')?.textContent || '',
    })).filter(g => g.src);
    $$('.gallery__item', newRail).forEach((item, i) => {
      const src = item.dataset.src;
      const cap = item.querySelector('.gallery__item-cap')?.textContent || '';
      if (src) item.addEventListener('click', () => openLightbox(src, cap, navItems, i));
    });

    // Update or hide BA section
    const baWrapper = exp.querySelector('.js-ba-wrapper');
    if (caseData.ba) {
      baWrapper.hidden = false;
      const ba = baWrapper.querySelector('.js-ba');
      ba.dataset.before = caseData.ba.before;
      ba.dataset.after  = caseData.ba.after;
      const beforeEl = ba.querySelector('.js-ba-before');
      const afterEl  = ba.querySelector('.js-ba-after');
      beforeEl.style.backgroundImage = `url('${caseData.ba.before}')`;
      afterEl.style.backgroundImage  = `url('${caseData.ba.after}')`;
      ba.style.setProperty('--ba-pos', '50%');
      // Update label
      const label = baWrapper.querySelector('.ba-label');
      if (label) label.textContent = caseData.ba.label;
      // Re-init click preview
      beforeEl.onclick = () => openLightbox(caseData.ba.before, 'Before');
      afterEl.onclick  = () => openLightbox(caseData.ba.after, 'After');
    } else {
      baWrapper.hidden = true;
    }
  }

  // ── Gallery item setup (backgrounds + rotate) ──

  function setupGalleryItems(container) {
    $$('.gallery__item', container).forEach(item => {
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
    });
  }

  // ── Build expand template ────────────────────

  const buildExpand = (key) => {
    const data = PORTFOLIOS[key];
    if (!data) return '';
    const caseNames = Object.keys(data.cases);
    const firstCase = caseNames[0];
    const firstData = data.cases[firstCase];

    const caseTabs = caseNames.length > 1
      ? caseNames.map(n =>
          `<button class="case-tab${n === firstCase ? ' is-active' : ''}" data-case="${n}">${n}</button>`
        ).join('')
      : '';

    return `
      <div class="expand">
        <div class="expand__head">
          <div>
            <p class="expand__pre">Portfolio</p>
            <h4 class="expand__sec-title" style="display:inline-flex;margin-top:4px;">${data.title}</h4>
          </div>
          <span class="expand__meta">${data.meta}</span>
          ${data.extraImages ? `<div class="expand__extra-imgs">${data.extraImages.map((r, i) =>
            `<img src="${r.src}" alt="" class="js-extra-zoom" data-src="${r.src}" data-index="${i}">`
          ).join('')}</div>` : ''}
        </div>

        <div>
          <div class="expand__section-head">
            <h5 class="expand__sec-title">Procedure Visuals</h5>
            ${caseTabs ? `<div class="case-tabs">${caseTabs}</div>` : ''}
          </div>
          <div class="gallery">
            <div class="gallery__rail js-drag-rail"></div>
          </div>
        </div>

        <div class="js-ba-wrapper"${firstData.ba ? '' : ' hidden'}>
          <h5 class="expand__sec-title">Before &amp; After</h5>
          <div class="ba js-ba"
               data-before="${firstData.ba ? firstData.ba.before : ''}"
               data-after="${firstData.ba ? firstData.ba.after : ''}">
            <div class="ba__img ba__before js-ba-before"></div>
            <div class="ba__img ba__after  js-ba-after"></div>
            <span class="ba__label ba__label--before">Before</span>
            <span class="ba__label ba__label--after">After</span>
            <div class="ba__handle js-ba-handle" tabindex="0" role="slider"
                 aria-label="Before / After comparison" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>
          </div>
          <p class="ba-label" style="margin-top:14px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-mute);">${firstData.ba ? firstData.ba.label : ''}</p>
        </div>
      </div>
    `;
  };

  // NOTE: the inline-style HTML in buildExpand violates
  // CSP unsafe-inline if set in source HTML. At runtime, innerHTML
  // is parsed as a newly-inserted element, so browsers treat these
  // as parsed attributes. To be fully CSP-safe under style-src 'self'
  // we strip them in buildOnce and re-apply via DOM.

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
      // Strip inline styles and re-apply via DOM (CSP safety)
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
      if (isOpening) {
        mod.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        buildOnce();
        exp.hidden = false;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            mod.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        });
      } else {
        mod.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  /* ── Hydrate gallery, ba slider, case tabs ── */
  const hydrateExpand = (exp) => {
    const key  = exp.closest('.module[data-key]').dataset.key;
    const data = PORTFOLIOS[key];
    const caseNames = Object.keys(data.cases);
    const firstCase = caseNames[0];

    // Render first case into the empty rail
    renderCase(exp, firstCase);

    // Case tab switching
    $$('.case-tab', exp).forEach(tab => {
      tab.addEventListener('click', () => renderCase(exp, tab.dataset.case));
    });

    // Before/after slider
    $$('.js-ba', exp).forEach((ba) => {
      const before = ba.querySelector('.js-ba-before');
      const after  = ba.querySelector('.js-ba-after');
      const handle = ba.querySelector('.js-ba-handle');
      ba.style.setProperty('--ba-pos', '50%');

      const setPos = (clientX) => {
        const r = ba.getBoundingClientRect();
        const pct = Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
        ba.style.setProperty('--ba-pos', pct + '%');
        handle.setAttribute('aria-valuenow', Math.round(pct));
      };

      let dragging = false;
      handle.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
      handle.addEventListener('touchstart', (e) => { dragging = true; }, { passive: false });
      ba.addEventListener('click', (e) => setPos(e.clientX));

      const move = (e) => {
        if (!dragging) return;
        setPos(e.touches ? e.touches[0].clientX : e.clientX);
      };
      const end = () => { dragging = false; };
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

    // Lightbox triggers for js-zoom elements
    $$('.js-zoom', exp).forEach((el) => {
      el.addEventListener('click', () => openLightbox(el.dataset.src, el.dataset.cap || ''));
    });

    // Extra images lightbox with prev/next navigation
    const extraItems = $$('.js-extra-zoom', exp).map(el => ({
      src: el.dataset.src,
      cap: '',
    }));
    $$('.js-extra-zoom', exp).forEach((el) => {
      const idx = parseInt(el.dataset.index, 10);
      el.addEventListener('click', () => openLightbox(el.dataset.src, '', extraItems, idx));
    });
  };

  /* ── Lightbox ──────────────────────────── */
  const lb   = $('#lightbox');
  const lbI  = $('#lightboxImg');
  const lbC  = $('#lightboxCap');
  const lbX  = $('#lightboxClose');
  const lbP  = $('#lightboxPrev');
  const lbN  = $('#lightboxNext');

  let lbItems = [];      // array of {src, cap} for gallery navigation
  let lbIndex = 0;

  const openLightbox = (src, cap, items, index) => {
    lbItems = items || [];
    lbIndex = typeof index === 'number' ? index : 0;
    lbI.src = src;
    lbI.alt = cap || '';
    lbC.textContent = cap || '';
    lbP.style.display = lbItems.length > 1 ? '' : 'none';
    lbN.style.display = lbItems.length > 1 ? '' : 'none';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const navigateLightbox = (dir) => {
    if (lbItems.length < 2) return;
    lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
    const item = lbItems[lbIndex];
    lbI.src = item.src;
    lbI.alt = item.cap || '';
    lbC.textContent = item.cap || '';
  };

  const closeLightbox = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbItems = [];
  };

  lbX.addEventListener('click', closeLightbox);
  lbP.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(-1); });
  lbN.addEventListener('click', (e) => { e.stopPropagation(); navigateLightbox(1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  // Global lightbox trigger for js-zoom elements outside modules
  document.addEventListener('click', (e) => {
    const zoom = e.target.closest('.js-zoom');
    if (zoom) openLightbox(zoom.dataset.src, zoom.dataset.cap || '');
  });

  // Dental gallery — click to play/pause video
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.dgallery__item');
    if (!item) return;
    const video = item.querySelector('.dgallery__media');
    if (!video) return;
    if (video.paused) {
      video.muted = false;
      video.play().catch(() => {});
      item.classList.add('is-playing');
    } else {
      video.pause();
      item.classList.remove('is-playing');
    }
  });
})();
