// Hero background: points drift and link when they come close; every few seconds a message enters
// beside the system diagram and fans out three hops along whatever links exist when it arrives at each
// point. Messages never travel behind the diagram, where they would compete with its own animation.
// Under reduced motion it draws one still frame. It only animates while on screen.
(() => {
  const cv = document.getElementById('hero-net');
  if (!cv || !cv.getContext) return;
  const ctx = cv.getContext('2d');
  const root = document.documentElement;
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const dark = matchMedia('(prefers-color-scheme: dark)');

  const LINK = 120;          // px within which two points are linked
  const SPEED = .07;         // px per ms for a message along a link
  const DENSITY = 9000;      // px² of hero per point
  const HOPS = 3;
  const EVERY = 5000;        // ms between messages (each one lasts about 6s at this speed)
  const FADE = 1400;         // ms a delivered hop stays lit
  const CLEAR = 24;          // px kept free of messages around the system diagram

  let W = 0, H = 0, pts = [], hops = [], col = {}, onScreen = false, lastT = 0, Z = null;
  // Animation time only advances while frames run, so a pause resumes mid-message instead of skipping ahead.
  let clock = 0, lastSpawn = 800 - EVERY;

  const rand = seed => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const rgb = v => {
    v = v.trim();
    if (v[0] === '#') { if (v.length === 4) v = '#' + [...v.slice(1)].map(x => x + x).join(''); return [1, 3, 5].map(i => parseInt(v.slice(i, i + 2), 16)); }
    const m = v.match(/\d+/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
  };
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : dark.matches;

  function colours() {
    const s = getComputedStyle(root);
    col = { line: rgb(s.getPropertyValue('--stroke')), msg: rgb(s.getPropertyValue('--l-blue')), dk: isDark() };
    paint(clock);
  }

  // The system diagram's box in canvas coordinates, padded.
  const fig = document.querySelector('.hero2 figure.sys');
  function zone() {
    if (!fig) { Z = null; return; }
    const c = cv.getBoundingClientRect(), f = fig.getBoundingClientRect();
    Z = { x0: f.left - c.left - CLEAR, y0: f.top - c.top - CLEAR, x1: f.right - c.left + CLEAR, y1: f.bottom - c.top + CLEAR };
  }
  const inZone = (x, y) => Z && x > Z.x0 && x < Z.x1 && y > Z.y0 && y < Z.y1;
  // a hop is clear when its ends and three points along it are outside the zone
  const clear = (a, b) => [0, .25, .5, .75, 1].every(t => !inZone(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t));

  function build() {
    zone();
    const r = cv.getBoundingClientRect();
    if (Math.abs(r.width - W) < 1 && Math.abs(r.height - H) < 1 && pts.length) return;
    W = r.width; H = r.height;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rand(11);
    pts = Array.from({ length: Math.round(W * H / DENSITY) }, () => ({ x: R() * W, y: R() * H, vx: (R() - .5) * .016, vy: (R() - .5) * .016 }));
    hops = [];
    paint(clock);
  }

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function hopFrom(i, depth, t, seen) {
    const near = [];
    for (let j = 0; j < pts.length; j++) if (j !== i && !seen.has(j) && dist(pts[i], pts[j]) < LINK * .9 && clear(pts[i], pts[j])) near.push(j);
    near.sort(() => Math.random() - .5).slice(0, depth ? 2 : 3).forEach(j => {
      seen.add(j);
      hops.push({ i, j, t0: t, dur: dist(pts[i], pts[j]) / SPEED, depth, seen, arrived: false });
    });
  }
  function spawn(now) {
    // Re-measure each time: web fonts landing after the first build can move the diagram.
    zone();
    // start outside the diagram; on wide layouts also right of the headline, where the mask is strongest
    const pool = [], minX = W > 960 ? W * .45 : 20;
    pts.forEach((p, i) => { if (p.x > minX && p.x < W - 20 && p.y > 20 && p.y < H - 20 && !inZone(p.x, p.y)) pool.push(i); });
    if (!pool.length) return;
    const o = pool[(Math.random() * pool.length) | 0];
    hopFrom(o, 0, now, new Set([o]));
  }

  function paint(now) {
    ctx.clearRect(0, 0, W, H);
    if (!col.line) return;
    const eA = col.dk ? .34 : .32, nA = col.dk ? .7 : .65;
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = dist(pts[i], pts[j]);
      if (d < LINK) { ctx.strokeStyle = rgba(col.line, eA * (1 - d / LINK)); ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
    ctx.fillStyle = rgba(col.line, nA);
    for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill(); }

    ctx.lineWidth = 1.25;
    for (let k = hops.length - 1; k >= 0; k--) {
      const h = hops[k], a = pts[h.i], b = pts[h.j], u = (now - h.t0) / h.dur;
      if (u < 0) continue;
      if (u <= 1) {
        const x = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u;
        ctx.strokeStyle = rgba(col.msg, .38); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = rgba(col.msg, .55); ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 7); ctx.fill();
        continue;
      }
      if (!h.arrived) { h.arrived = true; if (h.depth < HOPS - 1) hopFrom(h.j, h.depth + 1, now, h.seen); }
      const f = 1 - (now - h.t0 - h.dur) / FADE;
      if (f <= 0) { hops.splice(k, 1); continue; }
      ctx.strokeStyle = rgba(col.msg, .3 * f); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.fillStyle = rgba(col.msg, .4 * f); ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, 7); ctx.fill();
    }
  }

  // No frames are scheduled while the hero is off screen, the tab is hidden, or motion is reduced.
  let raf = 0;
  const active = () => onScreen && !document.hidden && !still.matches;
  function wake() { if (!raf && active()) { lastT = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(now) {
    raf = 0;
    if (!active()) return;
    const dt = Math.min(64, now - lastT); lastT = now;
    clock += dt;
    if (clock - lastSpawn > EVERY) { lastSpawn = clock; spawn(clock); }
    for (const p of pts) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;
    }
    paint(clock);
    raf = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(build);
  ro.observe(cv);
  if (fig) ro.observe(fig);
  new IntersectionObserver(es => es.forEach(e => { onScreen = e.isIntersecting; wake(); })).observe(cv);
  new MutationObserver(colours).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  dark.addEventListener('change', colours);
  document.addEventListener('visibilitychange', wake);
  still.addEventListener('change', () => { hops = []; paint(clock); wake(); });
  build();
  colours();
})();
