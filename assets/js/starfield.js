/* ==========================================================================
   Starfield — fixed celestial dome
   A deterministic sky that rotates as one layer: stars, gold dust, and
   constellation lines all share the same slow sidereal motion.
   ========================================================================== */
(function () {
  "use strict";

  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  let W = 0;
  let H = 0;
  let DPR = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let links = [];
  let rotation = 0;
  let last = 0;
  let rafId = 0;

  const SKY_SEED = 27092001;
  const ROT_SPEED = 0.000012;

  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedSky();
    last = 0;
    if (rafId) cancelAnimationFrame(rafId);
    draw(performance.now());
  }

  function seedSky() {
    const rand = mulberry32(SKY_SEED);
    const radius = Math.hypot(W, H) * 0.72 + 160;
    const centerX = W * 0.5;
    const centerY = H * 0.52;
    const baseCount = Math.min(Math.floor((W * H) / 7000), 300);
    stars = [];
    links = [];

    for (let i = 0; i < baseCount; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * radius;
      stars.push({
        x: centerX + Math.cos(a) * d,
        y: centerY + Math.sin(a) * d,
        r: 0.25 + rand() * 1.15,
        baseA: 0.22 + rand() * 0.55,
        twk: 0.0015 + rand() * 0.005,
        phase: rand() * Math.PI * 2,
        warm: rand() > 0.82,
        dust: false,
      });
    }

    const clusters = [
      [[0.14, 0.22], [0.21, 0.18], [0.29, 0.23], [0.36, 0.17], [0.43, 0.23]],
      [[0.58, 0.30], [0.64, 0.22], [0.72, 0.25], [0.78, 0.35], [0.69, 0.42], [0.61, 0.39]],
      [[0.22, 0.66], [0.30, 0.58], [0.40, 0.62], [0.48, 0.72], [0.36, 0.77]],
      [[0.72, 0.66], [0.80, 0.60], [0.87, 0.68], [0.82, 0.78], [0.73, 0.76]],
    ];

    clusters.forEach((cluster) => {
      const nodes = cluster.map(([nx, ny], idx) => {
        const star = {
          x: nx * W + (rand() - 0.5) * 22,
          y: ny * H + (rand() - 0.5) * 22,
          r: idx === 0 ? 1.75 : 1.1 + rand() * 0.55,
          baseA: 0.62 + rand() * 0.24,
          twk: 0.001 + rand() * 0.002,
          phase: rand() * Math.PI * 2,
          warm: true,
          dust: false,
        };
        stars.push(star);
        return star;
      });

      for (let i = 0; i < nodes.length - 1; i++) {
        links.push({ a: nodes[i], b: nodes[i + 1], strength: 0.18 });
      }
      if (nodes.length > 4) links.push({ a: nodes[1], b: nodes[nodes.length - 1], strength: 0.09 });
    });

    const dustCount = Math.min(Math.floor((W * H) / 36000), 42);
    for (let i = 0; i < dustCount; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * radius;
      stars.push({
        x: centerX + Math.cos(a) * d,
        y: centerY + Math.sin(a) * d,
        r: 0.7 + rand() * 1.8,
        baseA: 0.06 + rand() * 0.16,
        twk: 0.0008 + rand() * 0.002,
        phase: rand() * Math.PI * 2,
        warm: true,
        dust: true,
      });
    }
  }

  function rotatePoint(star) {
    const cx = W * 0.5;
    const cy = H * 0.52;
    const dx = star.x - cx;
    const dy = star.y - cy;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  }

  function draw(now) {
    if (!last) last = now;
    const delta = Math.min(48, now - last);
    last = now;
    if (!reduce) rotation += delta * ROT_SPEED;

    root.style.setProperty("--sky-rotation", `${rotation}rad`);
    ctx.clearRect(0, 0, W, H);

    ctx.lineWidth = 0.65;
    links.forEach((link) => {
      const a = rotatePoint(link.a);
      const b = rotatePoint(link.b);
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const alpha = Math.max(0.045, link.strength - distance / 2200);
      ctx.strokeStyle = `rgba(216,182,118,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    stars.forEach((star) => {
      const p = rotatePoint(star);
      const twinkle = reduce ? 1 : Math.sin(now * star.twk + star.phase) * 0.22 + 0.78;
      const alpha = star.baseA * twinkle;
      ctx.beginPath();
      ctx.arc(p.x, p.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = star.warm
        ? `rgba(236,213,160,${alpha})`
        : `rgba(232,230,224,${alpha})`;
      ctx.fill();

      if (!star.dust && star.r > 1.2 && alpha > 0.48) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, star.r * 3.4, 0, Math.PI * 2);
        ctx.fillStyle = star.warm
          ? `rgba(236,213,160,${alpha * 0.07})`
          : `rgba(232,230,224,${alpha * 0.05})`;
        ctx.fill();
      }
    });

    if (!reduce) rafId = requestAnimationFrame(draw);
  }

  let rTimer;
  window.addEventListener("resize", () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(resize, 160);
  });

  resize();
})();
