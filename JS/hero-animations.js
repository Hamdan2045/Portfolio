export function initHeroAnimations() {
  
  // --- Orb Text Cycling ---
  const words = [
    "Aspiring Data Scientist",
    "Oracle Apex Developer",
    "Passionate ML Student",
    "Neural Network Learner",
    "Building Smarter Models",
    "Learning the AI Way"
  ];

  let index = 0;
  const textContainer = document.querySelector(".text-container");
  const orb = document.querySelector(".orb");

  if (textContainer && orb) {
    // Style adjustments for text inside the orb
    textContainer.style.position = "absolute";
    textContainer.style.top = "50%";
    textContainer.style.left = "50%";
    textContainer.style.transform = "translate(-50%, -50%)";
    textContainer.style.color = "#fff";
    textContainer.style.fontFamily = "Orbitron, sans-serif";
    textContainer.style.textAlign = "center";
    textContainer.style.fontSize = "2rem"; // Decreased font size
    textContainer.style.textShadow = "0 0 15px #ff7700, 0 0 30px #ff5500";
    textContainer.style.opacity = "0";
    textContainer.style.transition = "opacity 1.5s ease-in-out";

    function changeText() {
      textContainer.style.opacity = "0"; // Fade out text
      orb.style.animation = 'none'; // Stop glow
      
      setTimeout(() => {
        textContainer.textContent = words[index]; // Change text
        index = (index + 1) % words.length; // Loop through words
        textContainer.style.opacity = "1"; // Fade in text
        orb.style.animation = 'pulse 2s infinite alternate'; // Restart glow
      }, 1500); // Adjusted timing to match fade
    }

    setInterval(changeText, 4000); // Adjusted timing
    changeText(); // Initial call
  }

  // --- Ambient Sparks Overlay ---
  (() => {
    if (window.__sparksInit) return; window.__sparksInit = true;

    const COUNT = innerWidth < 900 ? 55 : 95;
    const STREAK_MS = 3600;
    const CORE_ALPHA = 0.28;
    const EDGE_ALPHA = 0.042;
    const RADIUS_MULT = 22;

    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d', { alpha: true });
    Object.assign(cvs.style, {
      position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483646'
    });
    cvs.id = 'ambientSparksCanvas';
    document.body.appendChild(cvs);

    let DPR = Math.min(2, devicePixelRatio || 1);
    function resize() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      cvs.width = Math.max(1, Math.floor(innerWidth * DPR));
      cvs.height = Math.max(1, Math.floor(innerHeight * DPR));
      cvs.style.width = innerWidth + 'px';
      cvs.style.height = innerHeight + 'px';
      ctx.scale(DPR, DPR);
    }
    resize();
    addEventListener('resize', () => { DPR = Math.min(2, devicePixelRatio || 1); resize(); });

    const rand = (a, b) => a + Math.random() * (b - a);
    const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
    const ORANGE = [255, 145, 77], TEAL = [0, 160, 150];

    const sparks = [];
    function makeSpark(spawnBottom = false) {
      const c = Math.random() < 0.65 ? ORANGE : TEAL;
      return {
        x: rand(-40, innerWidth + 40),
        y: spawnBottom ? rand(innerHeight * 0.75, innerHeight + 30) : rand(-30, innerHeight + 30),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.28, -0.10),
        r: rand(0.9, 1.7),
        life: rand(4.8, 7.2),
        t: Math.random() * Math.PI * 2,
        tw: rand(0.6, 1.2),
        c
      };
    }
    for (let i = 0; i < COUNT; i++) sparks.push(makeSpark(false));

    const streaks = [];
    let nextStreak = performance.now() + rand(STREAK_MS * 0.6, STREAK_MS * 1.6);
    function addStreak() {
      const fromLeft = Math.random() < 0.5;
      streaks.push({
        x: fromLeft ? -120 : innerWidth + 120,
        y: rand(innerHeight * 0.2, innerHeight * 0.8),
        vx: fromLeft ? rand(1.0, 1.6) : -rand(1.0, 1.6),
        vy: rand(-0.14, 0.14),
        len: rand(80, 140),
        life: 1,
        c: Math.random() < 0.6 ? ORANGE : TEAL
      });
    }

    let last = performance.now();
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = 'screen';

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx; p.y += p.vy; p.t += p.tw * dt * 6.283;
        p.life -= dt / 5.8;
        if (p.y < -40 || p.x < -60 || p.x > innerWidth + 60 || p.life <= 0) {
          sparks[i] = makeSpark(true);
          continue;
        }
        const tw = 0.45 + 0.35 * Math.sin(p.t);
        const aCore = CORE_ALPHA * tw;
        const aEdge = EDGE_ALPHA * tw;
        const R = p.r * RADIUS_MULT;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
        g.addColorStop(0.00, rgba(p.c[0], p.c[1], p.c[2], aCore));
        g.addColorStop(0.60, rgba(p.c[0], p.c[1], p.c[2], aEdge));
        g.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2); ctx.fill();
      }

      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.02;
        if (s.life <= 0 || s.x < -s.len * 2 || s.x > innerWidth + s.len * 2) { streaks.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(s.x, s.y, s.x + (s.vx > 0 ? s.len : -s.len), s.y);
        grad.addColorStop(0.00, rgba(s.c[0], s.c[1], s.c[2], 0.14 * s.life));
        grad.addColorStop(1.00, 'rgba(0,0,0,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x + (s.vx > 0 ? s.len : -s.len), s.y); ctx.stroke();
      }

      if (now >= nextStreak) { addStreak(); nextStreak = now + rand(STREAK_MS * 0.6, STREAK_MS * 1.6); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();
}