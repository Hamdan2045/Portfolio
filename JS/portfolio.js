export function initPortfolio() {
  /* ---- Carousel ---- */
  const root = document.querySelector('.proj-carousel');
  if (!root) return;

  const track = root.querySelector('.car-track');
  const slides = Array.from(root.querySelectorAll('.car-slide'));
  const prevBtn = root.querySelector('.car-btn.prev');
  const nextBtn = root.querySelector('.car-btn.next');
  const dotsWrap = root.querySelector('.car-dots');
  const viewport = root.querySelector('.car-viewport');

  // Check if carousel is buildable
  if (!slides.length || !viewport || !track) {
    console.warn("Carousel missing essential elements (slides, viewport, or track).");
  } else {
    
    // Build dots (only if not already built)
    if (dotsWrap.children.length === 0) { 
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'car-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i+1}`);
        dotsWrap.appendChild(dot);
      });
    }
    
    const dots = Array.from(dotsWrap.children);
    const getSlideW = () => viewport.clientWidth;
    let index = 0;
    let slideW = getSlideW();

    function markActive() { slides.forEach((s, i) => s.classList.toggle('is-active', i === index)); }

    function update() {
      const maxShift = Math.max(0, track.scrollWidth - slideW);
      const desired = index * slideW;
      const tx = Math.min(desired, maxShift);
      track.style.transform = `translateX(${-tx}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      markActive();
    }
    
    function goTo(i) { index = (i + slides.length) % slides.length; update(); }
    function onResize() { slideW = getSlideW(); update(); }
    
    window.addEventListener('resize', onResize);
    
    // --- THIS IS THE FIX ---
    // Add button listeners (if buttons exist)
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); goTo(index - 1); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); goTo(index + 1); });
    }
    // --- END FIX ---

    dots.forEach((d, i) => d.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); goTo(i); }));

    let timer = null;
    function startAuto() { stopAuto(); timer = setInterval(() => goTo(index + 1), 1800); }
    function stopAuto() { if (timer) clearInterval(timer); timer = null; }
    root.addEventListener('mouseenter', stopAuto);
    root.addEventListener('mouseleave', startAuto);
    document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

    onResize(); update(); startAuto();
  }

  /* ---- Glass Modal with Gallery ---- */
  const modal = document.getElementById('projectGlassModal');
  if (!modal) return;

  const pgmBackdrop = modal.querySelector('.pgm-backdrop');
  const closeBtn = modal.querySelector('.pgm-close');
  const elImg = modal.querySelector('#pgmImg');
  const elNoImg = modal.querySelector('.pgm-noimg');
  const elTitle = modal.querySelector('#pgmTitle');
  const elDesc = modal.querySelector('#pgmDesc');
  const elTech = modal.querySelector('#pgmTech');
  const elFeat = modal.querySelector('#pgmFeat');
  const elDemo = modal.querySelector('#pgmDemo');
  const elCode = modal.querySelector('#pgmCode');
  const navPrev = modal.querySelector('.pgm-mnav.prev');
  const navNext = modal.querySelector('.pgm-mnav.next');
  const thumbs = modal.querySelector('#pgmThumbs');
  const mediaPane = modal.querySelector('.pgm-media');

  let gallery = []; 
  let gIndex = 0;
  let gTimer = null; 

  function renderMedia() {
    if (!gallery.length) {
      elImg.removeAttribute('src'); elImg.style.display = 'none'; elNoImg.style.display = 'grid';
      navPrev.hidden = navNext.hidden = true; thumbs.innerHTML = ''; return;
    }
    elNoImg.style.display = 'none'; elImg.style.display = 'block'; elImg.src = gallery[gIndex];

    const multi = gallery.length > 1;
    navPrev.hidden = navNext.hidden = !multi;

    thumbs.innerHTML = '';
    gallery.forEach((src, i) => {
      const t = document.createElement('button');
      t.className = 'pgm-thumb' + (i === gIndex ? ' active' : '');
      const img = document.createElement('img'); img.src = src; img.alt = '';
      t.appendChild(img);
      t.addEventListener('click', () => { gIndex = i; renderMedia(); });
      thumbs.appendChild(t);
    });
  }

  function stopGalleryAuto() {
    if (gTimer) clearInterval(gTimer);
    gTimer = null;
  }
  
  function next() { 
    if (!gallery.length) return; 
    gIndex = (gIndex + 1) % gallery.length; 
    renderMedia(); 
  }

  function startGalleryAuto() {
    stopGalleryAuto();
    if (gallery.length > 1) { 
      gTimer = setInterval(next, 3000); // 3 seconds per slide
    }
  }

  function prev() { 
    if (!gallery.length) return; 
    gIndex = (gIndex - 1 + gallery.length) % gallery.length; 
    renderMedia(); 
  }

  navPrev.addEventListener('click', prev);
  navNext.addEventListener('click', next);

  mediaPane.addEventListener('mouseenter', stopGalleryAuto);
  mediaPane.addEventListener('mouseleave', startGalleryAuto);

  let startX = null, startY = null, moving = false;
  mediaPane.addEventListener('pointerdown', (e) => { 
    stopGalleryAuto();
    startX = e.clientX; 
    startY = e.clientY; 
    moving = true; 
    mediaPane.setPointerCapture(e.pointerId); 
  });
  mediaPane.addEventListener('pointermove', (e) => {
    if (!moving || startX == null) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { 
      dx > 0 ? prev() : next(); 
      moving = false; 
      startX = startY = null; 
    }
  });
  mediaPane.addEventListener('pointerup', () => { 
    moving = false; 
    startX = startY = null; 
    startGalleryAuto();
  });
  mediaPane.addEventListener('pointercancel', () => { 
    moving = false; 
    startX = startY = null; 
    startGalleryAuto();
  });

  function openFromCard(card) {
    const title = card.dataset.title || 'Project';
    const desc = card.dataset.desc || 'Details coming soon.';
    const techs = (card.dataset.tech || '').split(';').map(s => s.trim()).filter(Boolean);
    const feats = (card.dataset.features || card.dataset.feat || '').split('||').map(s => s.trim()).filter(Boolean);
    const gal = (card.dataset.gallery || '').split('||').map(s => s.trim()).filter(Boolean);
    const img = card.dataset.img || '';

    elTitle.textContent = title;
    elDesc.textContent = desc;

    elTech.innerHTML = '';
    techs.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'pgm-chip';
      chip.textContent = t;
      elTech.appendChild(chip);
    });

    elFeat.innerHTML = '';
    feats.forEach(f => { const li = document.createElement('li'); li.textContent = f; elFeat.appendChild(li); });

    gallery = gal.length ? gal : (img ? [img] : []);
    gIndex = 0; renderMedia();

    const demo = card.dataset.demo || '';
    const code = card.dataset.code || '';
    elDemo.textContent = 'Live Demo';
    if (demo) { elDemo.href = demo; elDemo.removeAttribute('aria-disabled'); }
    else { elDemo.removeAttribute('href'); elDemo.setAttribute('aria-disabled', 'true'); }

    elCode.textContent = 'GitHub';
    elCode.classList.add('pgm-btn--gh');
    if (code) { elCode.href = code; elCode.removeAttribute('aria-disabled'); }
    else { elCode.removeAttribute('href'); elCode.setAttribute('aria-disabled', 'true'); }

    modal.hidden = false;
    setTimeout(() => closeBtn.focus(), 0);

    startGalleryAuto(); 
  }

  function closeGlass() { 
    stopGalleryAuto();
    modal.hidden = true; 
  }

  root.addEventListener('click', (e) => {
    if (e.target.closest('.car-btn') || e.target.closest('.car-dot')) return;
    const card = e.target.closest('.project-card');
    if (card) { e.preventDefault(); openFromCard(card); }
  });

  pgmBackdrop && pgmBackdrop.addEventListener('click', closeGlass);
  closeBtn && closeBtn.addEventListener('click', closeGlass);
  document.addEventListener('keydown', (e) => {
    if (!modal.hidden) {
      if (e.key === 'Escape') closeGlass();
      if (e.key === 'ArrowLeft') { prev(); stopGalleryAuto(); }
      if (e.key === 'ArrowRight') { next(); stopGalleryAuto(); }
    }
  });
}