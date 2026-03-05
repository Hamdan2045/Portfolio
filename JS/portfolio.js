export function initPortfolio() {

  /* ================================================================
     1. OUTER CAROUSEL (slides between projects)
     ================================================================ */
  const root = document.querySelector('.proj-carousel');
  if (!root) return;

  const track    = root.querySelector('.car-track');
  const slides   = Array.from(root.querySelectorAll('.car-slide'));
  const prevBtn  = root.querySelector('.car-btn.prev');
  const nextBtn  = root.querySelector('.car-btn.next');
  const dotsWrap = root.querySelector('.car-dots');
  const viewport = root.querySelector('.car-viewport');

  if (slides.length && viewport && track) {

    if (dotsWrap.children.length === 0) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'car-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dotsWrap.appendChild(dot);
      });
    }

    const dots = Array.from(dotsWrap.children);
    let index = 0;
    const getW = () => viewport.clientWidth;

    function markActive() {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    }

    function update() {
      const tx = index * getW();
      track.style.transform = `translateX(${-tx}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      markActive();
    }

    function goTo(i) { index = (i + slides.length) % slides.length; update(); }

    window.addEventListener('resize', update);
    prevBtn && prevBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goTo(index - 1); });
    nextBtn && nextBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goTo(index + 1); });
    dots.forEach((d, i) => d.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); goTo(i); }));

    let outerTimer = null;
    const startOuter = () => { stopOuter(); outerTimer = setInterval(() => goTo(index + 1), 4000); };
    const stopOuter  = () => { if (outerTimer) clearInterval(outerTimer); outerTimer = null; };
    root.addEventListener('mouseenter', stopOuter);
    root.addEventListener('mouseleave', startOuter);
    document.addEventListener('visibilitychange', () => document.hidden ? stopOuter() : startOuter());

    update(); markActive(); startOuter();
  }

  /* ================================================================
     2. CARD THUMBNAIL MINI-SLIDESHOWS
        Each project card cycles through its gallery images in place
     ================================================================ */
  slides.forEach(slide => {
    const card = slide.querySelector('.project-card');
    if (!card) return;

    const galleryStr = card.dataset.gallery || '';
    const images = galleryStr.split('||').map(s => s.trim()).filter(Boolean);
    if (!images.length) return;

    const thumb = card.querySelector('.project-thumb');
    if (!thumb) return;

    // Build image elements inside the thumb
    const wrap = document.createElement('div');
    wrap.className = 'thumb-slides';

    images.forEach((src, i) => {
      const img = document.createElement('img');
      img.className = 'thumb-slide-img' + (i === 0 ? ' active' : '');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      wrap.appendChild(img);
    });

    // Insert behind overlay
    thumb.insertBefore(wrap, thumb.firstChild);

    // Progress bar
    const prog = document.createElement('div');
    prog.className = 'thumb-progress';
    const fill = document.createElement('div');
    fill.className = 'thumb-progress-fill';
    prog.appendChild(fill);
    thumb.appendChild(prog);

    const imgs = Array.from(wrap.querySelectorAll('.thumb-slide-img'));
    let ti = 0;

    function advanceThumb() {
      imgs[ti].classList.remove('active');
      ti = (ti + 1) % imgs.length;
      imgs[ti].classList.add('active');
      fill.style.width = ((ti + 1) / imgs.length * 100) + '%';
    }

    fill.style.width = (1 / imgs.length * 100) + '%';

    let cardTimer = null;
    const startCard = () => { stopCard(); cardTimer = setInterval(advanceThumb, 1800); };
    const stopCard  = () => { if (cardTimer) clearInterval(cardTimer); cardTimer = null; };

    // Auto-start on active slide, stop on inactive
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? startCard() : stopCard());
    }, { threshold: 0.3 });
    observer.observe(card);

    card.addEventListener('mouseenter', stopCard);
    card.addEventListener('mouseleave', startCard);
  });

  /* ================================================================
     3. GLASS MODAL with BIG auto-sliding image carousel
     ================================================================ */
  const modal = document.getElementById('projectGlassModal');
  if (!modal) return;

  const backdrop  = modal.querySelector('.pgm-backdrop');
  const closeBtn  = modal.querySelector('.pgm-close');
  const elTitle   = modal.querySelector('#pgmTitle');
  const elDesc    = modal.querySelector('#pgmDesc');
  const elTech    = modal.querySelector('#pgmTech');
  const elFeat    = modal.querySelector('#pgmFeat');
  const elDemo    = modal.querySelector('#pgmDemo');
  const elCode    = modal.querySelector('#pgmCode');
  const navPrev   = modal.querySelector('.pgm-mnav.prev');
  const navNext   = modal.querySelector('.pgm-mnav.next');
  const thumbsEl  = modal.querySelector('#pgmThumbs');
  const mediaPane = modal.querySelector('.pgm-media');
  const noImg     = modal.querySelector('.pgm-noimg');
  const counter   = modal.querySelector('.pgm-counter');
  const dotsPane  = modal.querySelector('.pgm-img-dots');

  // We'll build the image slides dynamically
  let imgWrap = modal.querySelector('.pgm-img-wrap');
  if (!imgWrap) {
    imgWrap = document.createElement('div');
    imgWrap.className = 'pgm-img-wrap';
    mediaPane.insertBefore(imgWrap, mediaPane.firstChild);
  }

  let gallery = [];
  let gIdx    = 0;
  let gTimer  = null;

  function stopGAuto()  { if (gTimer) clearInterval(gTimer); gTimer = null; }
  function startGAuto() { stopGAuto(); if (gallery.length > 1) gTimer = setInterval(gNext, 3200); }

  function gNext() { if (!gallery.length) return; gGo((gIdx + 1) % gallery.length); }
  function gPrev() { if (!gallery.length) return; gGo((gIdx - 1 + gallery.length) % gallery.length); }

  function gGo(i) {
    if (!gallery.length) return;
    gIdx = i;
    renderGallery();
  }

  function renderGallery() {
    // Clear old slides
    imgWrap.innerHTML = '';

    if (!gallery.length) {
      noImg && noImg.classList.add('visible');
      navPrev.hidden = navNext.hidden = true;
      thumbsEl.innerHTML = '';
      counter && (counter.textContent = '');
      dotsPane && (dotsPane.innerHTML = '');
      return;
    }

    noImg && noImg.classList.remove('visible');
    const multi = gallery.length > 1;
    navPrev.hidden = navNext.hidden = !multi;

    // Build image slides
    gallery.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'pgm-img-slide' + (i === gIdx ? ' active' : '');
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = i === 0 ? 'eager' : 'lazy';
      div.appendChild(img);
      imgWrap.appendChild(div);
    });

    // Counter
    if (counter) counter.textContent = `${gIdx + 1} / ${gallery.length}`;

    // Dots (show up to 11 dots)
    if (dotsPane) {
      dotsPane.innerHTML = '';
      if (multi && gallery.length <= 15) {
        gallery.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.className = 'pgm-img-dot' + (i === gIdx ? ' active' : '');
          dot.setAttribute('aria-label', `Image ${i + 1}`);
          dot.addEventListener('click', () => { gGo(i); stopGAuto(); });
          dotsPane.appendChild(dot);
        });
      }
    }

    // Thumbnails
    thumbsEl.innerHTML = '';
    if (multi) {
      gallery.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.className = 'pgm-thumb' + (i === gIdx ? ' active' : '');
        const img = document.createElement('img');
        img.src = src; img.alt = '';
        btn.appendChild(img);
        btn.addEventListener('click', () => { gGo(i); stopGAuto(); });
        thumbsEl.appendChild(btn);
      });
      // Scroll active thumb into view
      setTimeout(() => {
        const active = thumbsEl.querySelector('.pgm-thumb.active');
        if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }

  navPrev.addEventListener('click', () => { gPrev(); stopGAuto(); });
  navNext.addEventListener('click', () => { gNext(); stopGAuto(); });

  // Pause on hover
  mediaPane.addEventListener('mouseenter', stopGAuto);
  mediaPane.addEventListener('mouseleave', startGAuto);

  // Swipe support
  let sx = null, sy = null, dragging = false;
  mediaPane.addEventListener('pointerdown', e => {
    stopGAuto(); sx = e.clientX; sy = e.clientY; dragging = true;
    mediaPane.setPointerCapture(e.pointerId);
  });
  mediaPane.addEventListener('pointermove', e => {
    if (!dragging || sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx > 0 ? gPrev() : gNext();
      dragging = false; sx = sy = null;
    }
  });
  mediaPane.addEventListener('pointerup',     () => { dragging = false; sx = sy = null; startGAuto(); });
  mediaPane.addEventListener('pointercancel', () => { dragging = false; sx = sy = null; startGAuto(); });

  /* --- Open modal from card click --- */
  function openFromCard(card) {
    const title  = card.dataset.title    || 'Project';
    const desc   = card.dataset.desc     || '';
    const techs  = (card.dataset.tech    || '').split(';').map(s => s.trim()).filter(Boolean);
    const feats  = (card.dataset.features || card.dataset.feat || '').split('||').map(s => s.trim()).filter(Boolean);
    const gal    = (card.dataset.gallery || '').split('||').map(s => s.trim()).filter(Boolean);
    const demo   = card.dataset.demo     || '';
    const code   = card.dataset.code     || '';

    elTitle.textContent = title;
    elDesc.textContent  = desc;

    elTech.innerHTML = '';
    techs.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'pgm-chip'; chip.textContent = t;
      elTech.appendChild(chip);
    });

    elFeat.innerHTML = '';
    feats.forEach(f => {
      const li = document.createElement('li'); li.textContent = f;
      elFeat.appendChild(li);
    });

    gallery = gal; gIdx = 0;
    renderGallery();
    startGAuto();

    // Demo button
    elDemo.textContent = 'Live Demo';
    elDemo.classList.remove('pgm-btn--gh');
    if (demo) { elDemo.href = demo; elDemo.removeAttribute('aria-disabled'); }
    else       { elDemo.removeAttribute('href'); elDemo.setAttribute('aria-disabled', 'true'); }

    // GitHub button
    elCode.textContent = 'GitHub';
    elCode.classList.add('pgm-btn--gh');
    if (code) { elCode.href = code; elCode.removeAttribute('aria-disabled'); }
    else       { elCode.removeAttribute('href'); elCode.setAttribute('aria-disabled', 'true'); }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal() {
    stopGAuto();
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  // Open on card click (ignore carousel nav clicks)
  root.addEventListener('click', e => {
    if (e.target.closest('.car-btn') || e.target.closest('.car-dot')) return;
    const card = e.target.closest('.project-card');
    if (card) { e.preventDefault(); openFromCard(card); }
  });

  backdrop  && backdrop.addEventListener('click', closeModal);
  closeBtn  && closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (!modal.hidden) {
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowLeft')  { gPrev(); stopGAuto(); }
      if (e.key === 'ArrowRight') { gNext(); stopGAuto(); }
    }
  });
}
