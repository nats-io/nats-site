// "Powering Industry Leaders": seven industry tabs plus "All", in one tablist. Industry tabs show the
// top five logos by rank; "All" shows every logo. Auto-rotation cycles the industries only, every 4s,
// until any interaction, and never runs under reduced motion, off screen or in a hidden tab.
(() => {
  const list = document.getElementById('ind-tabs'); if (!list) return;
  const scroller = document.getElementById('ind-scroll'), allTab = document.getElementById('tab-all');
  const panel = document.getElementById('logo-panel'), dotsEl = document.getElementById('ind-dots');
  const section = document.getElementById('leaders');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const INDUSTRIES = [['ai', 'AI'], ['automotive', 'Automotive & Industrial'], ['energy', 'Energy'], ['financial', 'Financial Services'], ['tech', 'Tech & Cloud'], ['telecom', 'Telecom & Media'], ['retail', 'Retail & Consumer']];
  const ALL = INDUSTRIES.length;
  const companies = JSON.parse(document.getElementById('companies-data').textContent);
  const logoBase = panel.dataset.logoBase;
  let current = 0, stopped = false, visible = false, timer = null;

  scroller.innerHTML = INDUSTRIES.map(([id, name]) => `<button type="button" role="tab" id="tab-${id}" aria-controls="logo-panel" aria-selected="false" tabindex="-1">${name}</button>`).join('');
  dotsEl.innerHTML = INDUSTRIES.map(([, name]) => `<button type="button" tabindex="-1" aria-label="${name}"></button>`).join('');
  const tabs = [...scroller.children, allTab], dots = [...dotsEl.children];

  const cell = c => `<a href="${c.h}" title="${c.n}"><img src="${logoBase}${c.l}" alt="${c.n}"></a>`;
  const ind = document.getElementById('tab-ind');
  let grid = null, finishing = null;

  // The underline is one element that slides to the selected tab, clipped to the visible part of the scroller.
  function placeIndicator(instant) {
    const t = tabs[current], wrap = list.getBoundingClientRect(), r = t.getBoundingClientRect();
    let left = r.left, right = r.right;
    if (current < ALL) { const sr = scroller.getBoundingClientRect(); left = Math.max(left, sr.left); right = Math.min(right, sr.right); }
    ind.classList.toggle('instant', !!instant || reduce.matches);
    ind.style.transform = `translateX(${(left - wrap.left).toFixed(1)}px)`;
    ind.style.width = Math.max(0, right - left).toFixed(1) + 'px';
  }

  function buildGrid(items, showAll) {
    const g = document.createElement('div');
    g.className = 'logo-grid' + (showAll ? ' all' : '');
    g.innerHTML = items.map(cell).join('');
    return g;
  }
  function padGrid(g, count) {
    const cols = getComputedStyle(g).gridTemplateColumns.split(' ').length;
    g.insertAdjacentHTML('beforeend', '<span aria-hidden="true"></span>'.repeat((cols - count % cols) % cols));
    return cols;
  }
  const preload = g => Promise.race([
    Promise.all([...g.querySelectorAll('img')].slice(0, 30).map(i => i.decode ? i.decode().catch(() => {}) : null)),
    new Promise(r => setTimeout(r, 400)),
  ]);

  function syncTabs() {
    panel.setAttribute('aria-labelledby', tabs[current].id);
    tabs.forEach((t, i) => { t.setAttribute('aria-selected', i === current); t.tabIndex = i === current ? 0 : -1; });
    dots.forEach((d, i) => d.classList.toggle('on', i === current));
  }

  // Cross-fade: the incoming grid sits over the outgoing one with transparent cells, each cell's
  // new logo fades in while the logo under it fades out, staggered left to right. The stage height
  // animates between the two grids, then the incoming grid takes over the hairlines and the old one goes.
  async function render(animate) {
    const showAll = current === ALL, token = {};
    const items = showAll ? companies : companies.filter(c => c.i === INDUSTRIES[current][0]).slice(0, 5);
    render.token = token;
    syncTabs(); placeIndicator(!animate);
    if (finishing) finishing();
    const next = buildGrid(items, showAll);
    if (!grid || !animate || reduce.matches) {
      panel.innerHTML = ''; panel.appendChild(next); padGrid(next, items.length);
      panel.style.height = ''; panel.classList.remove('sizing'); grid = next; return;
    }
    const prev = grid;
    next.classList.add('incoming');
    next.querySelectorAll('a').forEach(a => a.classList.add('pre'));
    panel.appendChild(next);
    const cols = padGrid(next, items.length);
    await preload(next);
    // A newer render took over while this one waited on images; its grid must not linger as an invisible overlay.
    if (render.token !== token) { next.remove(); return; }
    const h0 = prev.offsetHeight, h1 = next.offsetHeight;
    panel.style.height = h0 + 'px'; panel.offsetHeight; // commit the start height
    if (h0 !== h1) { panel.classList.add('sizing'); panel.style.height = h1 + 'px'; }
    const oldCells = [...prev.children], newCells = [...next.children];
    const delay = i => Math.min(i % cols, 5) * 50 + Math.min(Math.floor(i / cols), 6) * 20;
    newCells.forEach((c, i) => { const img = c.querySelector('img'); if (img) img.style.transitionDelay = delay(i) + 'ms'; c.classList.remove('pre'); });
    oldCells.forEach((c, i) => { const img = c.querySelector('img'); if (img) img.style.transitionDelay = delay(i) + 'ms'; c.classList.add('out'); });
    let done = false;
    const finish = () => {
      if (done) return; done = true; finishing = null;
      prev.remove();
      next.classList.remove('incoming', 'settled');
      newCells.forEach(c => { const img = c.querySelector('img'); if (img) img.style.transitionDelay = ''; });
      panel.classList.remove('sizing'); panel.style.height = '';
      if (grid === prev) grid = next;
    };
    finishing = finish;
    grid = next;
    setTimeout(() => { if (!done) next.classList.add('settled'); }, 450);
    setTimeout(finish, 760);
  }
  function select(i, fromUser) {
    if (fromUser) stop();
    current = i;
    render(true);
    // Scroll only the tab strip. scrollIntoView would also scroll every scrollable ancestor, including the
    // page and, inside an embedding frame, the host page, which reads as the page sliding sideways.
    if (fromUser && i < ALL && scroller.scrollWidth > scroller.clientWidth) {
      const t = tabs[i], left = t.offsetLeft - (scroller.clientWidth - t.offsetWidth) / 2;
      scroller.scrollTo({ left: Math.max(0, Math.min(left, scroller.scrollWidth - scroller.clientWidth)), behavior: reduce.matches ? 'auto' : 'smooth' });
    }
  }
  function stop() { stopped = true; clearInterval(timer); timer = null; }
  function sync() {
    const run = visible && !stopped && !reduce.matches && !document.hidden;
    if (run && !timer) timer = setInterval(() => select((current + 1) % INDUSTRIES.length, false), 4000);
    if (!run && timer) { clearInterval(timer); timer = null; }
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i, true));
    t.addEventListener('keydown', e => {
      const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      let to = null;
      if (k) to = (i + k + tabs.length) % tabs.length; else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = tabs.length - 1;
      if (to === null) return;
      e.preventDefault(); select(to, true); tabs[to].focus();
    });
  });
  dots.forEach((d, i) => d.addEventListener('click', () => select(i, true)));
  section.addEventListener('focusin', stop);
  section.addEventListener('pointerdown', stop);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, { threshold: .3 }).observe(section);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  addEventListener('resize', () => render(false));
  scroller.addEventListener('scroll', () => placeIndicator(true), { passive: true });
  document.fonts && document.fonts.ready.then(() => placeIndicator(true));
  render(false);
})();
