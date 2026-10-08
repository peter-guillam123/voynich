/* Page plumbing: theme, nav, progress, reveal, citations, annotated images. */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  // Theme toggle (remembered per browser; fails quietly if storage is blocked)
  const themeBtn = document.getElementById('theme-toggle');
  function applyTheme(t) {
    if (t) root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
    const dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (themeBtn) { themeBtn.textContent = dark ? 'Light' : 'Dark'; themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme'); }
  }
  let saved = null; try { saved = localStorage.getItem('voynich-theme'); } catch (e) {}
  applyTheme(saved);
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const dark = root.getAttribute('data-theme') === 'dark' || (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = dark ? 'light' : 'dark';
    applyTheme(next); try { localStorage.setItem('voynich-theme', next); } catch (e) {}
  });

  // Hero drift
  const heroImg = document.querySelector('.hero-img');
  if (heroImg && !reduced) heroImg.classList.add('animate');

  // Reading progress and current chapter
  const bar = document.querySelector('.progress');
  const chapters = [...document.querySelectorAll('section.chapter[id]')];
  const links = new Map([...document.querySelectorAll('.chapnav a')].map(a => [a.getAttribute('href').slice(1), a]));
  function onScroll() {
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(a => a.removeAttribute('aria-current'));
          const a = links.get(en.target.id);
          if (a) { a.setAttribute('aria-current', 'true'); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' }); }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    chapters.forEach(c => io.observe(c));

    const rv = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rv.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => rv.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }

  // Citation popovers: show the source's title on hover or focus
  const pop = document.createElement('div'); pop.className = 'cite-pop'; pop.setAttribute('role', 'tooltip'); pop.id = 'cite-pop';
  document.body.appendChild(pop);
  let hideT;
  function showPop(a) {
    const id = a.getAttribute('href').slice(1);
    const li = document.getElementById(id); if (!li) return;
    const t = li.querySelector('.t'); const u = li.querySelector('a[href^="http"]');
    let host = ''; try { host = u ? new URL(u.href).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    pop.innerHTML = '<b>' + a.textContent + '</b> ' + (t ? t.textContent : li.textContent.slice(0, 140)) + (host ? ' <span style="opacity:.7">· ' + host + '</span>' : '');
    const r = a.getBoundingClientRect();
    pop.style.left = Math.max(8, Math.min(window.innerWidth - 8 - 340, r.left + window.scrollX - 20)) + 'px';
    pop.style.top = (r.bottom + window.scrollY + 8) + 'px';
    clearTimeout(hideT); pop.classList.add('show'); a.setAttribute('aria-describedby', 'cite-pop');
  }
  function hidePop() { hideT = setTimeout(() => pop.classList.remove('show'), 120); }
  document.querySelectorAll('sup.cite a').forEach(a => {
    a.addEventListener('mouseenter', () => showPop(a));
    a.addEventListener('mouseleave', hidePop);
    a.addEventListener('focus', () => showPop(a));
    a.addEventListener('blur', hidePop);
  });

  // Annotated images: numbered pins that open notes
  document.querySelectorAll('.annot').forEach(box => {
    const wrap = box.closest('.walk') || box.parentElement;
    const notes = wrap.querySelectorAll('.pin-notes li');
    const pins = box.querySelectorAll('.pin');
    function activate(pin, scroll) {
      const open = pin.getAttribute('aria-expanded') === 'true';
      pins.forEach(p => p.setAttribute('aria-expanded', 'false'));
      notes.forEach(n => n.classList.remove('active'));
      if (!open) {
        pin.setAttribute('aria-expanded', 'true');
        const n = document.getElementById(pin.getAttribute('aria-controls'));
        if (n) { n.classList.add('active'); if (scroll) n.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); }
      }
    }
    pins.forEach(pin => pin.addEventListener('click', () => activate(pin, true)));
    notes.forEach(n => n.addEventListener('click', () => { const pin = box.querySelector(`.pin[aria-controls="${n.id}"]`); if (pin) activate(pin, false); }));
  });

  // Chart table toggles (charts.js builds the tables)
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-toggle-table]'); if (!b) return;
    const t = document.getElementById(b.getAttribute('data-toggle-table')); if (!t) return;
    const show = t.hidden; t.hidden = !show; b.setAttribute('aria-expanded', String(show)); b.textContent = show ? 'Hide table' : 'Show as table';
  });
})();
