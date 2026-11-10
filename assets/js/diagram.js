// One small animation per capability band in the hero, then one per "What is NATS" mini-diagram,
// all on one 15.6s timeline (played at 0.8x, so 19.5s) so only one diagram on the page moves at a time. Each SVG as authored is its
// static frame; under reduced motion nothing here runs.
(() => {
  const svg = document.getElementById('sys');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  if (!svg || still.matches) return;
  const NS = 'http://www.w3.org/2000/svg';
  const $ = id => svg.getElementById ? svg.getElementById(id) : document.getElementById(id);

  // A clock that only advances while the diagram is on screen, so everything pauses together.
  const seen = new Map(); // svg -> currently on screen
  const visible = () => [...seen.values()].some(Boolean);
  const onScreen = el => seen.get(el) === true;
  let clock = 0, last = performance.now();
  const tasks = [], tweens = [];
  const at = (delay, fn) => tasks.push({ t: clock + delay, fn });
  const tween = (dur, step, done) => tweens.push({ t0: clock, dur, step, done });
  // Sine in-out peaks at 1.57x the average speed (quadratic peaks at 2x), so dots glide rather than surge.
  const ease = t => (1 - Math.cos(Math.PI * t)) / 2;
  // Everything below is authored in timeline ms; the timeline plays at this fraction of real time.
  const PACE = .8;

  function dot(path, dur, done) {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('r', '2.6'); c.setAttribute('class', 'sx-dot');
    path.ownerSVGElement.appendChild(c);
    const len = path.getTotalLength();
    tween(dur, k => { const p = path.getPointAtLength(len * k); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); },
      () => { c.remove(); if (done) done(); });
  }
  function flash(el, hold = 700) { const els = [].concat(el); els.forEach(e => e.classList.add('hit')); at(hold, () => els.forEach(e => e.classList.remove('hit'))); }

  // Messaging: one publish, three deliveries.
  const subs = [...svg.querySelectorAll('.m-sub')];
  function messaging() {
    dot($('m-in'), 900, () => ['m-b0', 'm-b1', 'm-b2'].forEach((id, i) => dot($(id), 1200, () => flash(subs[i]))));
  }

  // Streaming: append to the log, then the consumer cursor steps forward; reset when full.
  const cells = [...svg.querySelectorAll('.s-cell')], cur = $('s-cur');
  let filled = 6, pos = 3;
  const cellX = i => i * 16;
  function moveCursor(to, dur) {
    const from = pos; pos = to;
    tween(dur, k => cur.setAttribute('transform', `translate(${(cellX(from) + (cellX(to) - cellX(from)) * k - cellX(3)).toFixed(2)} 0)`));
  }
  function streaming() {
    if (filled < cells.length) {
      cells[filled++].classList.add('on');
      at(700, () => { if (pos < filled - 1) moveCursor(pos + 1, 900); });
    } else {
      // replay: the cursor rewinds while the newest entries age out of the demo
      for (let i = 6; i < cells.length; i++) cells[i].classList.remove('on');
      filled = 6; moveCursor(3, 1400);
    }
  }

  // Key-value: the same key updates in place and its revision ticks up.
  const val = $('kv-val'), rev = $('kv-rev'), box = $('kv-box');
  let v = 30, r = 3;
  function kv() {
    tween(350, k => { val.style.opacity = 1 - k; rev.style.opacity = 1 - k; }, () => {
      if (v >= 34) { v = 30; r = 3; } else { v += 1; r += 1; }
      val.textContent = v; rev.textContent = `rev ${r}`;
      flash(box, 600);
      tween(450, k => { val.style.opacity = k; rev.style.opacity = k; });
    });
  }

  // Services: each request goes to the next instance.
  const insts = [...svg.querySelectorAll('.v-inst')];
  let next = 0;
  function services() {
    const i = next; next = (next + 1) % insts.length;
    dot($('v-in'), 800, () => dot($('v-b' + i), 1000, () => flash(insts[i], 800)));
  }

  // ---- "What is NATS" mini-diagrams ----
  const m1 = document.getElementById('mini-subj'), m2 = document.getElementById('mini-topo'), m3 = document.getElementById('mini-fab');
  const byId = id => document.getElementById(id);
  // A message hops straight from stop to stop; a stop's third entry is what lights when it arrives.
  function chain(host, stops, dur, done) {
    if (stops.length < 2) { if (done) done(); return; }
    const [a, b] = stops, p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`); p.setAttribute('fill', 'none');
    host.appendChild(p);
    dot(p, dur, () => { p.remove(); if (b[2]) flash(b[2], 600); chain(host, stops.slice(1), dur, done); });
  }

  // 1: a publisher's server forwards to whichever servers the subscribers are on; alternate publishers.
  const n1 = [...m1.querySelectorAll('.mx-node')], c1 = [...m1.querySelectorAll('.mx-chip')];
  const P1 = { bi: [76, 35], ch: [76, 115], sh: [244, 35, c1[2]], an: [244, 115, c1[3]], s1: [136, 64, n1[0]], s2: [184, 64, n1[1]], s3: [160, 98, n1[2]] };
  let pub = 0;
  function miniSubjects() {
    if (pub++ % 2 === 0) {
      flash(c1[0], 900);
      chain(m1, [P1.bi, P1.s1], 520, () => { chain(m1, [P1.s1, P1.s2, P1.sh], 520); chain(m1, [P1.s1, P1.s3, P1.an], 520); });
    } else {
      flash(c1[1], 900);
      chain(m1, [P1.ch, P1.s3], 520, () => { chain(m1, [P1.s3, P1.s2, P1.sh], 520); chain(m1, [P1.s3, P1.an], 520); });
    }
  }
  // 2: alternately, a device's message travels edge -> region -> region, or the newest region
  // detaches and attaches again. At rest it is attached.
  const aNodes = [...m2.querySelectorAll('.m2-a')], bNodes = [...m2.querySelectorAll('.m2-b')];
  let topo = 0;
  function miniTopology() {
    if (topo++ % 2) { m2.classList.add('detached'); at(1700, () => m2.classList.remove('detached')); return; }
    flash(byId('m2-d1'));
    chain(m2, [[40, 24], [118, 40, byId('m2-l1')], [210, 39, aNodes], [286, 71, bNodes]], 560);
  }
  // 3: one language's client reaches another through the cluster.
  const n3 = [...m3.querySelectorAll('.mx-node')], c3 = [...m3.querySelectorAll('.mx-chip')];
  const P3 = { go: [84, 25, c3[0]], rust: [84, 75, c3[1]], py: [84, 125, c3[2]], js: [236, 25, c3[3]], java: [236, 75, c3[4]], cs: [236, 125, c3[5]], s1: [160, 50, n3[0]], s2: [138, 92, n3[1]], s3: [182, 92, n3[2]] };
  const routes = [['go', 's1', 's3', 'cs'], ['py', 's2', 's1', 'js'], ['rust', 's2', 's3', 'java'], ['js', 's1', 's2', 'py'], ['java', 's3', 's2', 'rust']];
  let ri = 0;
  function miniFabric() {
    const r = routes[ri++ % routes.length].map(k => P3[k]);
    flash(r[0][2], 1600);
    chain(m3, r, 480);
  }

  // Slots cover each animation's longest run plus its highlight: services clears at 8.6s, subjects
  // takes 2.2s, topology 2.6s (detach and fade back), fabric 2.1s.
  const CYCLE = 15600;
  const when = (el, fn) => () => { if (onScreen(el)) fn(); };
  function cycle() {
    at(0, when(svg, messaging)); at(2000, when(svg, streaming)); at(4000, when(svg, kv)); at(6000, when(svg, services));
    at(8600, when(m1, miniSubjects)); at(10800, when(m2, miniTopology)); at(13400, when(m3, miniFabric));
    at(CYCLE, cycle);
  }
  at(500, cycle);

  // Frames are scheduled only while a diagram is on screen; the clock resumes where it stopped.
  let raf = 0;
  const live = () => visible() && !document.hidden && !still.matches;
  function wake() { if (!raf && live()) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function frame(now) {
    raf = 0;
    if (!live()) return;
    clock += Math.min(64, now - last) * PACE; last = now;
    for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].t <= clock) { const t = tasks.splice(i, 1)[0]; t.fn(); }
    for (let i = tweens.length - 1; i >= 0; i--) {
      const w = tweens[i], k = Math.min(1, (clock - w.t0) / w.dur);
      w.step(ease(k));
      if (k >= 1) { tweens.splice(i, 1); if (w.done) w.done(); }
    }
    raf = requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver(es => { es.forEach(e => seen.set(e.target, e.isIntersecting)); wake(); }, { threshold: .3 });
  [svg, m1, m2, m3].forEach(el => { seen.set(el, false); io.observe(el); });
  document.addEventListener('visibilitychange', wake);
  still.addEventListener('change', wake);
})();
