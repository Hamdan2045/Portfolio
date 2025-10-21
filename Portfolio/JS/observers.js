export function initObservers() {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Timeline Card Observer ---
  (() => {
    if (reduceMotion) return;

    const groups = document.querySelectorAll('.col .contents');
    if (!groups.length) return;

    const BASE = 360; // ms before first card
    const STEP = 360; // ms per subsequent card

    groups.forEach(group => {
      Array.from(group.querySelectorAll('.box')).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.setProperty('--delay', `${BASE + i * STEP}ms`);
      });
    });

    const boxes = document.querySelectorAll('.col .contents .box');
    if (!boxes.length) return;

    function sweepOnce(el) {
      if (!el) return;
      el.classList.remove('entering');
      requestAnimationFrame(() => {
        el.classList.add('entering');
        if (el.__sweepT) clearTimeout(el.__sweepT);
        el.__sweepT = setTimeout(() => el.classList.remove('entering'), 1200);
      });
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (isIntersecting) {
          target.classList.add('show');
          target.classList.remove('leaving');
          if (target.__leaveT) clearTimeout(target.__leaveT);
          sweepOnce(target);
        } else {
          if (target.__leaveT) clearTimeout(target.__leaveT);
          target.classList.add('leaving');
          target.__leaveT = setTimeout(() => {
            target.classList.remove('leaving');
            target.classList.remove('show');
          }, 920);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    });

    boxes.forEach(el => io.observe(el));
  })();

  // --- About Section Observer ---
  (() => {
    if (reduceMotion) return;

    const about = document.querySelector('.about-section') || document.getElementById('about');
    if (!about) return;

    const para = about.querySelector('.description-text');
    const btn = about.querySelector('.resume-btn');
    if (!para && !btn) return;

    if (para) { para.classList.add('reveal-about'); para.style.setProperty('--about-para-delay', '80ms'); }
    if (btn) { btn.classList.add('reveal-btn'); btn.style.setProperty('--about-btn-delay', '260ms'); }

    function sweepOnce(el) {
      if (!el) return;
      el.classList.remove('entering');
      requestAnimationFrame(() => {
        el.classList.add('entering');
        if (el.__sweepT) clearTimeout(el.__sweepT);
        el.__sweepT = setTimeout(() => el.classList.remove('entering'), 1200);
      });
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          if (para) { para.classList.add('show'); para.classList.remove('leaving'); if (para.__leaveT) clearTimeout(para.__leaveT); sweepOnce(para); }
          if (btn) { btn.classList.add('show'); btn.classList.remove('leaving'); if (btn.__leaveT) clearTimeout(btn.__leaveT); }
        } else {
          if (para) {
            if (para.__leaveT) clearTimeout(para.__leaveT);
            para.classList.add('leaving');
            para.__leaveT = setTimeout(() => {
              para.classList.remove('leaving');
              para.classList.remove('show');
            }, 920);
          }
          if (btn) {
            if (btn.__leaveT) clearTimeout(btn.__leaveT);
            btn.classList.add('leaving');
            btn.__leaveT = setTimeout(() => {
              btn.classList.remove('leaving');
              btn.classList.remove('show');
            }, 920);
          }
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    });

    io.observe(about);
  })();

  // --- Skills Bar Observer ---
  (() => {
    const section = document.querySelector('.skills-section');
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.skill-card'));

    cards.forEach(card => {
      const bars = card.querySelectorAll('.progress-bar > span');
      bars.forEach(span => {
        // Read from `data-width` attribute (set in HTML)
        const pct = span.dataset.width || '0%';
        span.dataset.targetPct = pct.replace('%', '');
        span.style.width = '0%'; // start from zero
      });
      card.dataset.filled = '0';
    });

    if (reduceMotion) {
      // Reduced motion: snap to targets immediately
      cards.forEach(card => {
        const bars = card.querySelectorAll('.progress-bar > span');
        bars.forEach(span => {
          span.style.width = span.dataset.targetPct + '%';
        });
        card.dataset.filled = '1';
      });
      return; // Don't set up observer
    }

    // Full animation
    function animateBar(span, toPct, duration) {
      const start = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 3); // easeOutCubic

      function tick(now) {
        const p = Math.min(1, (now - start) / duration);
        const e = ease(p);
        const cur = toPct * e;
        span.style.width = cur.toFixed(2) + '%';
        if (p < 1) {
          requestAnimationFrame(tick);
        } else {
          span.style.width = toPct + '%';
        }
      }
      requestAnimationFrame(tick);
    }

    function sweepCardOnce(card) {
      card.classList.remove('entering');
      void card.offsetWidth;
      card.classList.add('entering');
      if (card.__sheenT) clearTimeout(card.__sheenT);
      card.__sheenT = setTimeout(() => card.classList.remove('entering'), 1100);
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target: card }) => {
        if (!isIntersecting) return;
        sweepCardOnce(card);
        if (card.dataset.filled !== '1') {
          const bars = card.querySelectorAll('.progress-bar > span');
          bars.forEach((span, i) => {
            const target = parseFloat(span.dataset.targetPct || '0');
            const dur = 1100 + i * 80;
            animateBar(span, target, dur);
          });
          card.dataset.filled = '1';
        }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

    cards.forEach(c => io.observe(c));
  })();

  // --- Contact Form Reveal ---
  (() => {
    const section = document.querySelector('#contact');
    if (!section) return;
    const card = section.querySelector('.contact-card');
    if (!card) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          card.classList.add('reveal-show');
        } else {
          card.classList.remove('reveal-show');
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });
    io.observe(card);
  })();
}