/* Charts drawn from data/stats.json. Plain SVG, one axis each, legend plus direct labels,
   hover tooltips and a table view for every chart. */
(function () {
  const hosts = document.querySelectorAll('[data-chart]'); if (!hosts.length) return;
  const S = window.VOYNICH && window.VOYNICH.stats; if (!S) { hosts.forEach(h => h.innerHTML = '<p class="small">Chart data could not load.</p>'); return; }
  const NS = 'http://www.w3.org/2000/svg';
  const series = [
    { key: 'voynich', name: 'Voynichese', cls: 's1', color: 'var(--series-1)' },
    { key: 'english', name: 'English', cls: 's2', color: 'var(--series-2)' },
    { key: 'italian', name: 'Italian', cls: 's3', color: 'var(--series-3)' },
    { key: 'latin', name: 'Latin', cls: 's4', color: 'var(--series-4)' }
  ];
  const el = (n, a = {}, parent) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  const fmt = (v, d = 1) => Number(v).toLocaleString('en-GB', { maximumFractionDigits: d });

  function frame(host, title, sub, source) {
    host.innerHTML = `<div class="title">${title}</div><div class="sub">${sub}</div><div class="chart-wrap"></div><div class="legend"></div><button class="btn small toggle" data-toggle-table="${host.id}-table" aria-expanded="false">Show as table</button><div class="table-view" id="${host.id}-table" hidden></div><div class="source">${source}</div>`;
    return { wrap: host.querySelector('.chart-wrap'), legend: host.querySelector('.legend'), table: host.querySelector('.table-view') };
  }
  function tip(wrap) { const t = document.createElement('div'); t.className = 'tip'; wrap.appendChild(t); return t; }
  function placeTip(t, wrap, x, y, html) { t.innerHTML = html; t.classList.add('show'); const r = wrap.getBoundingClientRect(); t.style.left = Math.min(x + 12, r.width - t.offsetWidth - 4) + 'px'; t.style.top = Math.max(0, y - 34) + 'px'; }

  // 1. Word length distribution
  (function () {
    const host = document.getElementById('chart-wordlen'); if (!host) return;
    const { wrap, legend, table } = frame(host, 'How long are the words?', 'Share of all words by length in letters. Voynichese words cluster tightly around five letters; the comparison languages spread out more.', 'Computed from the ZL transliteration (v3b, May 2025), paragraph text only, in the EVA alphabet; English, Italian and Latin from Project Gutenberg texts (see sources).');
    const W = 720, H = 320, m = { t: 16, r: 90, b: 40, l: 44 };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Line chart of word-length distribution for Voynichese, English, Italian and Latin' }, wrap);
    const maxL = 12, maxY = 0.3;
    const x = i => m.l + (i - 1) / (maxL - 1) * (W - m.l - m.r), y = v => m.t + (1 - v / maxY) * (H - m.t - m.b);
    const g = el('g', { class: 'grid' }, svg);
    for (let v = 0; v <= maxY + 1e-9; v += 0.05) { el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v) }, g); el('text', { x: m.l - 6, y: y(v) + 4, 'text-anchor': 'end', class: 'axis-t', fill: 'var(--ink-2)', 'font-size': 11 }, svg).textContent = Math.round(v * 100) + '%'; }
    const ax = el('g', { class: 'axis' }, svg);
    for (let i = 1; i <= maxL; i++) el('text', { x: x(i), y: H - m.b + 18, 'text-anchor': 'middle', fill: 'var(--ink-2)', 'font-size': 11 }, ax).textContent = i;
    el('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle', fill: 'var(--ink-2)', 'font-size': 11 }, ax).textContent = 'Letters per word';
    series.forEach(s => {
      const d = S[s.key].wordlen.slice(0, maxL);
      const path = el('path', { d: d.map((v, i) => (i ? 'L' : 'M') + x(i + 1) + ' ' + y(v)).join(' '), fill: 'none', stroke: s.color, 'stroke-width': s.key === 'voynich' ? 3 : 2, 'stroke-linejoin': 'round' }, svg);
      d.forEach((v, i) => el('circle', { cx: x(i + 1), cy: y(v), r: 3.5, fill: s.color, stroke: 'var(--paper)', 'stroke-width': 1.5 }, svg));
      // direct label near the peak
      let pi = d.indexOf(Math.max(...d));
      const lbl = el('text', { x: x(pi) + (s.key === 'voynich' ? 8 : 10), y: y(d[pi]) - (s.key === 'latin' ? -14 : 8), fill: s.color, 'font-size': 11, 'font-weight': 600 }, svg); lbl.textContent = s.name;
    });
    // hover crosshair
    const t = tip(wrap), vline = el('line', { y1: m.t, y2: H - m.b, stroke: 'var(--rule-strong)', opacity: 0 }, svg);
    svg.addEventListener('mousemove', e => {
      const r = svg.getBoundingClientRect(); const px = (e.clientX - r.left) * W / r.width; const i = Math.max(1, Math.min(maxL, Math.round((px - m.l) / (W - m.l - m.r) * (maxL - 1) + 1)));
      vline.setAttribute('x1', x(i)); vline.setAttribute('x2', x(i)); vline.setAttribute('opacity', 1);
      placeTip(t, wrap, e.clientX - r.left, e.clientY - r.top, `<b>${i} letters</b><br>` + series.map(s => `${s.name}: ${fmt(S[s.key].wordlen[i - 1] * 100)}%`).join('<br>'));
    });
    svg.addEventListener('mouseleave', () => { t.classList.remove('show'); vline.setAttribute('opacity', 0); });
    legend.innerHTML = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
    table.innerHTML = '<table><thead><tr><th>Letters</th>' + series.map(s => `<th class="num">${s.name}</th>`).join('') + '</tr></thead><tbody>' + Array.from({ length: maxL }, (_, i) => `<tr><td>${i + 1}</td>` + series.map(s => `<td class="num">${fmt(S[s.key].wordlen[i] * 100)}%</td>`).join('') + '</tr>').join('') + '</tbody></table>';
  })();

  // 2. Bars: entropy, repeats
  function bars(hostId, title, sub, source, getter, unit, maxV, note) {
    const host = document.getElementById(hostId); if (!host) return;
    const { wrap, legend, table } = frame(host, title, sub, source);
    const W = 720, rowH = 40, m = { t: 8, r: 70, b: 8, l: 90 }, H = m.t + m.b + series.length * rowH;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title }, wrap);
    const x = v => m.l + v / maxV * (W - m.l - m.r);
    const t = tip(wrap);
    series.forEach((s, i) => {
      const v = getter(S[s.key]); const yy = m.t + i * rowH + 8;
      el('text', { x: m.l - 10, y: yy + 17, 'text-anchor': 'end', fill: 'var(--ink)', 'font-size': 12, 'font-weight': 600 }, svg).textContent = s.name;
      const r = el('rect', { x: m.l, y: yy, width: Math.max(2, x(v) - m.l), height: 24, rx: 4, fill: s.color }, svg);
      el('text', { x: x(v) + 8, y: yy + 17, fill: 'var(--ink)', 'font-size': 12 }, svg).textContent = fmt(v, 2) + unit;
      r.addEventListener('mousemove', e => { const b = wrap.getBoundingClientRect(); placeTip(t, wrap, e.clientX - b.left, e.clientY - b.top, `<b>${s.name}</b> ${fmt(v, 2)}${unit}`); });
      r.addEventListener('mouseleave', () => t.classList.remove('show'));
    });
    legend.innerHTML = note ? `<span>${note}</span>` : '';
    table.innerHTML = '<table><thead><tr><th>Text</th><th class="num">Value</th></tr></thead><tbody>' + series.map(s => `<tr><td>${s.name}</td><td class="num">${fmt(getter(S[s.key]), 2)}${unit}</td></tr>`).join('') + '</tbody></table>';
  }
  bars('chart-entropy', 'How predictable is the next letter?', 'Conditional entropy of the next character given the one before, in bits. Lower means more predictable. Voynichese sits far below the natural languages.', 'Our calculation on the same four texts, treating each EVA letter as one symbol (26 symbols including the space). Published studies using other alphabets get similar gaps.', d => d.h2, ' bits', 4, 'A fair coin is 1 bit; the lower the bar, the easier the next letter is to guess');
  bars('chart-repeats', 'How often does a word repeat itself straight away?', 'Identical words written twice in a row, per 1,000 words. "qokedy qokedy" is normal in Voynichese and almost unheard of in prose.', 'Our calculation on the same texts. Near-repeats (one letter different) are commoner still: about 33 per 1,000 in Voynichese against 7 in English.', d => d.repeat_rate, ' per 1,000', 10, '');

  // 3. Zipf log-log
  (function () {
    const host = document.getElementById('chart-zipf'); if (!host) return;
    const { wrap, legend, table } = frame(host, 'Zipf\'s law: rank against frequency', 'Every language forms a straight-ish downward line on these log scales. So does Voynichese. That rules nothing in, but it is one hurdle a hoax has to clear.', 'Our calculation; first 1,000 word types of each text.');
    const W = 720, H = 320, m = { t: 12, r: 20, b: 40, l: 50 };
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Log-log plot of word rank against frequency' }, wrap);
    const lx = v => m.l + Math.log10(v) / 3 * (W - m.l - m.r), ly = v => m.t + (1 - Math.log10(v) / 3.2) * (H - m.t - m.b);
    [1, 10, 100, 1000].forEach(v => { el('line', { x1: lx(v), x2: lx(v), y1: m.t, y2: H - m.b, stroke: 'var(--rule)', 'stroke-dasharray': '2 3' }, svg); el('text', { x: lx(v), y: H - m.b + 16, 'text-anchor': 'middle', fill: 'var(--ink-2)', 'font-size': 11 }, svg).textContent = v; });
    [1, 10, 100, 1000].forEach(v => { el('line', { x1: m.l, x2: W - m.r, y1: ly(v), y2: ly(v), stroke: 'var(--rule)', 'stroke-dasharray': '2 3' }, svg); el('text', { x: m.l - 6, y: ly(v) + 4, 'text-anchor': 'end', fill: 'var(--ink-2)', 'font-size': 11 }, svg).textContent = v; });
    el('text', { x: (m.l + W) / 2, y: H - 4, 'text-anchor': 'middle', fill: 'var(--ink-2)', 'font-size': 11 }, svg).textContent = 'Rank of word (1 = commonest)';
    el('text', { x: 12, y: (H - m.b) / 2, 'text-anchor': 'middle', fill: 'var(--ink-2)', 'font-size': 11, transform: `rotate(-90 12 ${(H - m.b) / 2})` }, svg).textContent = 'Times it occurs';
    series.forEach(s => {
      const z = S[s.key].zipf.slice(0, 1000);
      el('path', { d: z.map((f, i) => (i ? 'L' : 'M') + lx(i + 1) + ' ' + ly(Math.max(1, f))).join(' '), fill: 'none', stroke: s.color, 'stroke-width': s.key === 'voynich' ? 3 : 2, opacity: s.key === 'voynich' ? 1 : 0.85 }, svg);
      const lab = el('text', { x: lx(1) + 10, y: ly(z[0]) + (s.key === 'voynich' ? -4 : s.key === 'english' ? 14 : s.key === 'italian' ? 28 : 42), fill: s.color, 'font-size': 11, 'font-weight': 600 }, svg); lab.textContent = s.name + ' (top word: ' + S[s.key].top[0][0] + ')';
    });
    legend.innerHTML = series.map(s => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('');
    table.innerHTML = '<table><thead><tr><th>Rank</th>' + series.map(s => `<th class="num">${s.name}</th>`).join('') + '</tr></thead><tbody>' + [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000].map(r => `<tr><td>${r}</td>` + series.map(s => `<td class="num">${S[s.key].zipf[r - 1] || ''}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
  })();

  // 4. Currier A vs B: paired horizontal bars
  (function () {
    const host = document.getElementById('chart-ab'); if (!host) return;
    const { wrap, legend, table } = frame(host, 'Two "languages" in one book', 'How often common words occur, per 1,000 words, in the pages Currier called language A and language B. Some words all but vanish from one half.', 'Our calculation from the ZL transliteration using its Currier labels: 10,709 words labelled A and 22,827 labelled B.');
    const words = S.AB_words.filter(w => ['daiin', 'chol', 'chor', 'cthy', 'sho', 's', 'chedy', 'shedy', 'qokeedy', 'qokedy', 'qokain', 'qokal', 'lchedy', 'ol', 'aiin'].includes(w[0]));
    const W = 720, rowH = 30, m = { t: 28, r: 20, b: 8, l: 80 }, H = m.t + m.b + words.length * rowH, mid = m.l + (W - m.l - m.r) / 2, half = (W - m.l - m.r) / 2 - 30, maxV = 45;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Paired bar chart of word frequencies in Currier A and B' }, wrap);
    el('text', { x: mid - 30, y: 16, 'text-anchor': 'end', fill: 'var(--series-2)', 'font-size': 12, 'font-weight': 700 }, svg).textContent = '← Language A';
    el('text', { x: mid + 30, y: 16, fill: 'var(--series-1)', 'font-size': 12, 'font-weight': 700 }, svg).textContent = 'Language B →';
    const t = tip(wrap);
    words.forEach(([w, a, b], i) => {
      const yy = m.t + i * rowH;
      el('text', { x: mid, y: yy + 16, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 12, 'font-family': 'ui-monospace, Menlo, monospace' }, svg).textContent = w;
      const wa = a / maxV * half, wb = b / maxV * half;
      const ra = el('rect', { x: mid - 32 - wa, y: yy + 4, width: Math.max(1, wa), height: 18, rx: 3, fill: 'var(--series-2)' }, svg);
      const rb = el('rect', { x: mid + 32, y: yy + 4, width: Math.max(1, wb), height: 18, rx: 3, fill: 'var(--series-1)' }, svg);
      el('text', { x: mid - 36 - wa, y: yy + 17, 'text-anchor': 'end', fill: 'var(--ink-2)', 'font-size': 11 }, svg).textContent = fmt(a, 1);
      el('text', { x: mid + 36 + wb, y: yy + 17, fill: 'var(--ink-2)', 'font-size': 11 }, svg).textContent = fmt(b, 1);
      [ra, rb].forEach(r => { r.addEventListener('mousemove', e => { const bb = wrap.getBoundingClientRect(); placeTip(t, wrap, e.clientX - bb.left, e.clientY - bb.top, `<b>${w}</b> A: ${fmt(a, 1)} · B: ${fmt(b, 1)} per 1,000`); }); r.addEventListener('mouseleave', () => t.classList.remove('show')); });
    });
    legend.innerHTML = `<span><i style="background:var(--series-2)"></i>Language A (mostly herbal pages)</span><span><i style="background:var(--series-1)"></i>Language B (bathing, stars, some herbal)</span>`;
    table.innerHTML = '<table><thead><tr><th>Word</th><th class="num">A per 1,000</th><th class="num">B per 1,000</th></tr></thead><tbody>' + words.map(([w, a, b]) => `<tr><td class="mono">${w}</td><td class="num">${fmt(a, 2)}</td><td class="num">${fmt(b, 2)}</td></tr>`).join('') + '</tbody></table>';
  })();

  // 5. Line-start effect
  (function () {
    const host = document.getElementById('chart-linestart'); if (!host) return;
    const { wrap, legend, table } = frame(host, 'The first word of a line is different', 'Share of words beginning with each letter, comparing the first word on a line with every other word. In a normal text the line break is invisible to the words. Here it is not.', 'Our calculation from the ZL transliteration, paragraph text.');
    const keys = [['p', 'p (gallows)'], ['t', 't (gallows)'], ['y', 'y'], ['d', 'd'], ['s', 's'], ['c', 'c (ch, sh…)'], ['o', 'o'], ['q', 'q']];
    const W = 720, rowH = 34, m = { t: 26, r: 60, b: 8, l: 100 }, H = m.t + m.b + keys.length * rowH, maxV = 25;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Paired bars comparing first words of lines with other words' }, wrap);
    const x = v => m.l + v / maxV * (W - m.l - m.r);
    const t = tip(wrap);
    keys.forEach(([k, label], i) => {
      const [a, b] = S.line_start_vs_other[k]; const yy = m.t + i * rowH;
      el('text', { x: m.l - 10, y: yy + 16, 'text-anchor': 'end', fill: 'var(--ink)', 'font-size': 12, 'font-family': 'ui-monospace, Menlo, monospace' }, svg).textContent = label;
      const r1 = el('rect', { x: m.l, y: yy + 2, width: Math.max(1, x(a) - m.l), height: 10, rx: 3, fill: 'var(--series-1)' }, svg);
      const r2 = el('rect', { x: m.l, y: yy + 15, width: Math.max(1, x(b) - m.l), height: 10, rx: 3, fill: 'var(--ink-3)' }, svg);
      el('text', { x: x(a) + 6, y: yy + 11, fill: 'var(--ink-2)', 'font-size': 10 }, svg).textContent = a + '%';
      el('text', { x: x(b) + 6, y: yy + 24, fill: 'var(--ink-2)', 'font-size': 10 }, svg).textContent = b + '%';
      [[r1, 'first word of line', a], [r2, 'other words', b]].forEach(([r, n, v]) => { r.addEventListener('mousemove', e => { const bb = wrap.getBoundingClientRect(); placeTip(t, wrap, e.clientX - bb.left, e.clientY - bb.top, `<b>${label}</b> ${n}: ${v}%`); }); r.addEventListener('mouseleave', () => t.classList.remove('show')); });
    });
    legend.innerHTML = `<span><i style="background:var(--series-1)"></i>First word of a line</span><span><i style="background:var(--ink-3)"></i>All other words</span>`;
    table.innerHTML = '<table><thead><tr><th>Starts with</th><th class="num">First word of line</th><th class="num">Other words</th></tr></thead><tbody>' + keys.map(([k, l]) => `<tr><td>${l}</td><td class="num">${S.line_start_vs_other[k][0]}%</td><td class="num">${S.line_start_vs_other[k][1]}%</td></tr>`).join('') + '</tbody></table>';
  })();

  // 6. Stat tiles with live numbers
  document.querySelectorAll('[data-stat]').forEach(n => {
    const k = n.getAttribute('data-stat'); const v = k.split('.').reduce((o, p) => (o ? o[p] : undefined), S);
    if (v !== undefined) n.textContent = typeof v === 'number' ? fmt(v, 0) : v;
  });
})();
