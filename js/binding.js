/* Two ways to bind a book: nested quire versus stacked singulions.
   Leaves slide from their sheet positions to their reading-order positions. */
(function () {
  const host = document.getElementById('binding'); if (!host) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Two datasets: a model quire of four sheets, and the real quire 13.
  const SETS = {
    model: {
      name: 'A model quire of four sheets',
      sheets: [['A1', 'A2'], ['B1', 'B2'], ['C1', 'C2'], ['D1', 'D2']],
      stream: ['B1', 'B2'],
      stacked: null, // natural sheet order
      text: {
        flat: 'Four sheets of parchment, each folded once down the middle to make two leaves. A scribe draws a stream across the fold of sheet <b>B</b>, so it runs from leaf B1 on to leaf B2.',
        nested: 'The normal way to make a book: fold the sheets <b>inside one another</b>, then sew through the fold. Read in order, the stream\'s two halves are now <b>{gap} leaves apart</b>. The picture is broken.',
        stacked: 'The other way: fold each sheet on its own and <b>stack</b> them, one after another. Each sheet is a tiny booklet of its own, a "singulion". The stream\'s two halves sit <b>side by side</b>. Layfield and Davis argue this is how the Voynich was meant to be read.'
      }
    },
    q13: {
      name: 'Quire 13, the bathing section (real folio numbers)',
      sheets: [['75', '84'], ['76', '83'], ['77', '82'], ['78', '81'], ['79', '80']],
      stream: ['78', '81'],
      stacked: [['77', '82'], ['78', '81'], ['75', '84'], ['76', '83'], ['79', '80']],
      text: {
        flat: 'Quire 13 is five sheets. Each sheet carries two folios: 75 with 84, 76 with 83, and so on. On the sheet carrying folios <b>78 and 81</b>, two water channels leave a tub on the back of folio 78 and reappear on the front of folio 81.',
        nested: 'As the book is bound today, the sheets are nested. Folio 78 and folio 81 are separated by folios 79 and 80: the channels vanish for <b>four pages</b> and come back.',
        stacked: 'Layfield and Davis\'s proposed order stacks the sheets as singulions: 77 with 82, then 78 with 81, then 75 with 84, 76 with 83, and 79 with 80. The channels now flow straight from folio 78 on to folio 81.'
      }
    }
  };
  let set = 'model', mode = 'flat';

  host.innerHTML = `
    <div class="title" style="font-family:var(--display);font-size:1.35rem;margin-bottom:4px">Two ways to fold a book</div>
    <div class="sub" style="font-family:var(--ui);font-size:.84rem;color:var(--ink-2);margin-bottom:14px;max-width:72ch;line-height:1.5">Each rectangle is a leaf; each pair of leaves is one folded sheet. Step through the three buttons to see how the same sheets give two different page orders, and what that does to a drawing that crosses a fold. Then try it with the real folio numbers of the bathing section.</div>
    <div class="modes" role="group" aria-label="Choose an arrangement">
      <button class="btn" data-mode="flat" aria-pressed="true">1. Lay the sheets flat</button>
      <button class="btn" data-mode="nested" aria-pressed="false">2. Nest them (as bound today)</button>
      <button class="btn" data-mode="stacked" aria-pressed="false">3. Stack them (the new theory)</button>
    </div>
    <div class="modes" role="group" aria-label="Choose an example">
      <button class="btn small" data-set="model" aria-pressed="true">Model quire</button>
      <button class="btn small" data-set="q13" aria-pressed="false">Quire 13 (the real one)</button>
    </div>
    <div class="stage"><svg viewBox="0 0 800 230" aria-labelledby="binding-title" role="img"><title id="binding-title">Leaves of a quire moving between flat, nested and stacked arrangements</title></svg></div><p class="scroll-hint">Scroll the diagram sideways on a small screen.</p>
    <div class="order" aria-label="Reading order"></div>
    <div class="explain" aria-live="polite"></div>`;
  const svg = host.querySelector('svg'), order = host.querySelector('.order'), explain = host.querySelector('.explain');
  const NS = 'http://www.w3.org/2000/svg';
  const leaves = new Map();

  function build() {
    svg.querySelectorAll('g.leaf, g.sheet, path.fold, path.streamline, text.lbl').forEach(n => n.remove()); leaves.clear();
    const S = SETS[set]; const n = S.sheets.length * 2;
    S.sheets.forEach((sh, si) => {
      sh.forEach((id, li) => {
        const g = document.createElementNS(NS, 'g'); g.classList.add('leaf'); g.dataset.id = id;
        const r = document.createElementNS(NS, 'rect');
        r.setAttribute('width', 70); r.setAttribute('height', 100); r.setAttribute('rx', 3);
        r.setAttribute('fill', ['#e9dcc2', '#dccfb2', '#e2d5b9', '#d5c7a8', '#ead9bd'][si % 5]);
        r.setAttribute('stroke', 'rgba(36,26,18,.45)');
        g.appendChild(r);
        const t = document.createElementNS(NS, 'text'); t.setAttribute('x', 35); t.setAttribute('y', 58); t.setAttribute('text-anchor', 'middle'); t.classList.add('pg'); t.textContent = id; t.setAttribute('fill', '#241a12'); g.appendChild(t);
        if (S.stream.includes(id)) {
          const p = document.createElementNS(NS, 'path');
          const left = li === 0;
          p.setAttribute('d', left ? 'M 22 76 C 40 68, 50 84, 70 78' : 'M 0 78 C 22 72, 30 90, 48 82');
          p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#2f6fb5'); p.setAttribute('stroke-width', 4); p.setAttribute('stroke-linecap', 'round');
          g.appendChild(p);
          const p2 = p.cloneNode(); p2.setAttribute('d', left ? 'M 26 87 C 44 80, 52 95, 70 89' : 'M 0 89 C 20 84, 28 99, 44 93'); g.appendChild(p2);
        }
        svg.appendChild(g); leaves.set(id, g);
      });
    });
    layout(true);
  }

  function positions() {
    const S = SETS[set]; const n = S.sheets.length * 2;
    const pos = new Map(); const pad = 8, lw = 70;
    if (mode === 'flat') {
      const sheetW = lw * 2 + 6, total = S.sheets.length * sheetW + (S.sheets.length - 1) * 26;
      const x0 = (800 - total) / 2;
      S.sheets.forEach((sh, si) => { pos.set(sh[0], [x0 + si * (sheetW + 26), 60]); pos.set(sh[1], [x0 + si * (sheetW + 26) + lw + 6, 60]); });
      return { pos, seq: null };
    }
    let seq = [];
    if (mode === 'nested') { seq = S.sheets.map(s => s[0]).concat(S.sheets.map(s => s[1]).reverse()); }
    else { const sh = S.stacked || S.sheets; sh.forEach(s => seq.push(s[0], s[1])); }
    const total = n * lw + (n - 1) * pad, x0 = (800 - total) / 2;
    seq.forEach((id, i) => pos.set(id, [x0 + i * (lw + pad), 60]));
    return { pos, seq };
  }

  function layout(first) {
    const S = SETS[set]; const { pos, seq } = positions();
    leaves.forEach((g, id) => { const [x, y] = pos.get(id); g.style.transform = `translate(${x}px, ${y}px)`; if (first && reduced) g.style.transition = 'none'; });
    // fold lines between the leaves of each sheet in flat mode
    svg.querySelectorAll('path.fold').forEach(n => n.remove());
    if (mode === 'flat') S.sheets.forEach(sh => {
      const [x] = pos.get(sh[1]); const p = document.createElementNS(NS, 'path');
      p.classList.add('fold'); p.setAttribute('d', `M ${x - 3} 54 L ${x - 3} 160`); p.setAttribute('stroke', 'rgba(36,26,18,.5)'); p.setAttribute('stroke-dasharray', '4 4'); svg.appendChild(p);
    });
    // reading order strip
    let gap = 0;
    if (seq) {
      const a = seq.indexOf(S.stream[0]), b = seq.indexOf(S.stream[1]); gap = Math.abs(a - b) - 1;
      order.innerHTML = '<span class="arrow">Read →</span>' + seq.map(id => `<span class="${S.stream.includes(id) ? 'a' : ''}">${id}</span>`).join('<span class="arrow">›</span>');
    } else {
      order.innerHTML = '<span class="arrow">Sheets:</span>' + S.sheets.map(sh => `<span class="${S.stream.includes(sh[0]) ? 'a' : ''}">${sh[0]} | ${sh[1]}</span>`).join(' ');
    }
    explain.innerHTML = S.text[mode].replace('{gap}', gap);
    host.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    host.querySelectorAll('[data-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.set === set)));
  }

  host.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => { mode = b.dataset.mode; layout(); }));
  host.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => { set = b.dataset.set; mode = 'flat'; build(); }));
  build();
})();
