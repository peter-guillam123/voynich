/* Book map: every surviving page as a tile, coloured by section, language or scribe. */
(async function () {
  const host = document.getElementById('bookmap'); if (!host) return;
  let data; try { data = await (await fetch('data/folios.json')).json(); } catch (e) { host.innerHTML = '<p class="small">The page map could not load its data.</p>'; return; }

  const SECTIONS = { herbal: 'Herbal', astronomical: 'Astronomical', zodiac: 'Zodiac', cosmological: 'Cosmological', biological: 'Biological', pharmaceutical: 'Pharmaceutical', recipes: 'Recipes (stars)', text: 'Text only' };
  const MODES = {
    section: { label: 'Section', cls: d => 'sec-' + d.section, legend: Object.entries(SECTIONS).map(([k, v]) => ({ key: k, cls: 'sec-' + k, label: v })) },
    language: { label: 'Currier language', cls: d => 'lang-' + (d.language || 'none'), legend: [{ key: 'A', cls: 'lang-A', label: 'Language A' }, { key: 'B', cls: 'lang-B', label: 'Language B' }, { key: 'none', cls: 'lang-none', label: 'Not classified' }] },
    hand: { label: 'Scribe', cls: d => 'hand-' + d.hand, legend: [1, 2, 3, 4, 5].map(n => ({ key: String(n), cls: 'hand-' + n, label: 'Scribe ' + n })) }
  };
  let mode = 'section', filter = null;

  host.innerHTML = `
    <div class="controls" role="group" aria-label="Colour the pages by">
      ${Object.entries(MODES).map(([k, m]) => `<button class="btn small" data-mode="${k}" aria-pressed="${k === mode}">${m.label}</button>`).join('')}
    </div>
    <div class="legend" aria-label="Legend"></div>
    <div class="grid" role="list" aria-label="Pages of the manuscript in order"></div>
    <div class="readout" aria-live="polite">Hover over or tab to a page. Dashed tiles are leaves that have been lost; a pale bar marks a panel of a fold-out sheet.</div>`;
  const grid = host.querySelector('.grid'), legend = host.querySelector('.legend'), readout = host.querySelector('.readout');

  function keyOf(d) { return mode === 'section' ? d.section : mode === 'language' ? (d.language || 'none') : String(d.hand); }
  function render() {
    const m = MODES[mode];
    legend.innerHTML = m.legend.map(l => `<button type="button" class="btn small" style="border-color:transparent;padding-left:4px" data-key="${l.key}" aria-pressed="${filter === l.key}"><span class="${l.cls}" style="display:inline-block;width:12px;height:12px;border-radius:2px;background:var(--c);margin-right:6px;vertical-align:-1px"></span>${l.label}</button>`).join('');
    legend.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { filter = filter === b.dataset.key ? null : b.dataset.key; render(); }));
    grid.innerHTML = '';
    data.forEach((d, i) => {
      const el = document.createElement(d.missing ? 'div' : 'button');
      el.className = 'tile ' + (d.missing ? 'missing' : m.cls(d)) + (d.foldout ? ' fold' : '');
      el.setAttribute('role', 'listitem');
      if (!d.missing) { el.type = 'button'; el.setAttribute('aria-label', label(d)); }
      else el.setAttribute('aria-label', d.folio + ', lost');
      if (filter && !d.missing && keyOf(d) !== filter) el.classList.add('dim');
      el.addEventListener('mouseenter', () => show(d)); el.addEventListener('focus', () => show(d)); el.addEventListener('click', () => show(d));
      grid.appendChild(el);
    });
    host.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
  }
  function label(d) {
    return `${d.folio}: ${SECTIONS[d.section] || d.section}${d.language ? ', language ' + d.language : ''}${d.hand ? ', scribe ' + d.hand : ''}`;
  }
  function show(d) {
    if (d.missing) { readout.innerHTML = `<b>${d.folio}</b> is one of the 14 leaves that have gone missing since the folio numbers were written.`; return; }
    readout.innerHTML = `<b>${d.folio}</b> <span class="tag">${SECTIONS[d.section] || d.section}</span><span class="tag">Quire ${d.quire}</span>${d.language ? `<span class="tag">Currier ${d.language}</span>` : '<span class="tag">No Currier label</span>'}${d.hand ? `<span class="tag">Scribe ${d.hand}</span>` : ''}${d.foldout ? '<span class="tag">Fold-out</span>' : ''}<br>${d.note || ''}`;
  }
  host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; filter = null; render(); }));
  render();
})();
