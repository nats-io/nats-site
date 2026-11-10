(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, mq = matchMedia('(prefers-color-scheme: dark)');

  // Three modes: system (follow the OS; nothing stored), light and dark. Each click moves to the next
  // mode that looks different from the current one, then back to system.
  const tb = $('#theme');
  if (tb) {
    const svg = d => `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const icon = {
      system: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
      light: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
      dark: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    };
    const name = { system: 'System', light: 'Light', dark: 'Dark' };
    const os = () => (mq.matches ? 'dark' : 'light');
    const flip = t => (t === 'dark' ? 'light' : 'dark');
    const mode = () => root.dataset.theme || 'system';
    const next = () => { const m = mode(); return m === 'system' ? flip(os()) : m === flip(os()) ? os() : 'system'; };
    const paint = () => {
      const m = mode(), n = next();
      tb.innerHTML = icon[m];
      tb.setAttribute('aria-label', `Theme: ${name[m]}. Switch to ${name[n].toLowerCase()}`);
      tb.title = `Theme: ${name[m]}`;
    };
    tb.addEventListener('click', () => {
      const n = next();
      if (n === 'system') delete root.dataset.theme; else root.dataset.theme = n;
      try { if (n === 'system') localStorage.removeItem('nats-theme'); else localStorage.setItem('nats-theme', n); } catch (e) {}
      paint();
    });
    mq.addEventListener('change', paint);
    paint();
  }

  const top = $('.top'), mb = $('.top .menu');
  if (mb) mb.addEventListener('click', () => mb.setAttribute('aria-expanded', top.classList.toggle('open')));

  // Newsletter sign-up, posted straight to the HubSpot form.
  $$('form[data-newsletter]').forEach(form => {
    const msg = $('.newsletter-msg', form), input = $('input[type=email]', form), btn = $('button', form);
    const say = (text, ok) => { msg.textContent = text; msg.classList.toggle('bad', !ok); msg.hidden = false; };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      btn.disabled = true;
      try {
        const res = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/47270392/46b2e433-14b9-4aef-8754-cdd173a9535c', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: [{ name: 'email', value: input.value }], context: { pageUri: location.href, pageName: document.title } }),
        });
        if (res.ok) { say('Thanks for subscribing.', true); form.reset(); }
        else say('That didn’t go through. Check the address and try again.', false);
      } catch (err) {
        say('That didn’t go through. Check your connection and try again.', false);
      } finally { btn.disabled = false; }
    });
  });

  // "On this page": mark the section currently in view.
  const toc = $$('.toc a[href^="#"]');
  if (toc.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) toc.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
    }), { rootMargin: '-20% 0px -70% 0px' });
    toc.forEach(a => { const t = document.getElementById(decodeURIComponent(a.hash.slice(1))); if (t) io.observe(t); });
  }
})();
