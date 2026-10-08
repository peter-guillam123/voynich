/* The script: glyph table, transliteration demo, EVA typing box and the word builder. */
(function () {
  // EVA letters. Shapes come from Landini's EVA Hand 1 font; notes are from the statistics in this page and the literature cited in the text.
  const GLYPHS = [
    { e: 'a', k: 'vowel-like', n: 'One of the commonest letters. Very often followed by one or more "i" strokes, giving the famous ending "aiin".' },
    { e: 'o', k: 'vowel-like', n: 'Begins about a fifth of all words. Almost always what follows a "q".' },
    { e: 'e', k: 'vowel-like', n: 'A small c-shape. Appears singly, doubled or tripled ("e", "ee", "eee") in the middle of words.' },
    { e: 'ch', k: 'bench', n: 'Two c-shapes joined by a bar, called the "bench". Found in more than a quarter of all words.' },
    { e: 'sh', k: 'bench', n: 'The bench with a plume on top. In one word in eight.' },
    { e: 'i', k: 'stroke', n: 'A short vertical stroke, a minim. Never on its own: it comes in runs of one to three before "n", "r" or "l".' },
    { e: 'n', k: 'final', n: 'A stroke with a flourish, almost always closing a word. One word in six ends "in" or "iin".' },
    { e: 'r', k: 'final', n: 'A stroke with a hook. Mostly at the end of words.' },
    { e: 'l', k: 'final', n: 'A looped letter. Common at the end of words, as in "ol" and "al".' },
    { e: 's', k: 'final', n: 'Looks like a c with a hook. Can begin a word (often as the first word of a line) or end one.' },
    { e: 'd', k: 'crust', n: 'Looks like a figure 8. The commonest word in the book, "daiin", begins with it.' },
    { e: 'y', k: 'crust', n: 'Looks like a figure 9. Two words in five end with it. Also opens words, especially at the start of a line.' },
    { e: 'q', k: 'prefix', n: 'Looks like a 4. Almost always the first letter of a word (99% of the time) and almost always followed by "o" (98%).' },
    { e: 'k', k: 'gallows', g: true, n: 'A "gallows" letter: a tall stem with a loop. Gallows begin paragraphs far more often than chance would allow.' },
    { e: 't', k: 'gallows', g: true, n: 'Gallows with two loops. Rare at the start of a line except as a paragraph opener.' },
    { e: 'p', k: 'gallows', g: true, n: 'Gallows with a loop at the foot. Nine per cent of first words on a line start with it; half a per cent of other words do.' },
    { e: 'f', k: 'gallows', g: true, n: 'The rarest gallows. Like "p", it clusters in the first line of paragraphs.' },
    { e: 'cth', k: 'pedestal', g: true, n: 'A gallows sitting on the bench: "cth", "ckh", "cph", "cfh". Scholars disagree whether this is one letter or three.' },
    { e: 'm', k: 'final', n: 'A stroke with a long tail. Almost always (95%) the last letter of a word, and that word is often the last on its line.' }
  ];
  const host = document.getElementById('glyph-table');
  if (host) {
    const note = document.getElementById('glyph-note');
    host.innerHTML = GLYPHS.map((g, i) => `<button type="button" class="glyph${g.g ? ' gallows' : ''}" aria-pressed="false" data-i="${i}" aria-label="EVA ${g.e}, ${g.k}"><span class="g" aria-hidden="true">${g.e}</span><span class="e">${g.e}</span><span class="k">${g.k}</span></button>`).join('');
    host.querySelectorAll('.glyph').forEach(b => b.addEventListener('click', () => {
      host.querySelectorAll('.glyph').forEach(x => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      const g = GLYPHS[+b.dataset.i];
      note.innerHTML = `<span class="g" aria-hidden="true">${g.e}</span><b>EVA "${g.e}"</b> · ${g.k}. ${g.n}`;
    }));
  }

  // Transliteration demo: the first three lines of folio 1r
  const lines = [
    ['fachys', 'ykal', 'ar', 'ataiin', 'shol', 'shory', 'cthres', 'y', 'kor', 'sholdy'],
    ['sory', 'ckhar', 'or', 'y', 'kair', 'chtaiin', 'shar', 'ase', 'cthar', 'cthar', 'dan'],
    ['syaiir', 'sheky', 'or', 'ykaiin', 'shod', 'cthoary', 'cthes', 'daraiin', 'sy']
  ];
  const tr = document.getElementById('translit');
  if (tr) {
    tr.innerHTML = lines.map((ws, li) => `<div class="line"><div class="ev" aria-hidden="true">${ws.map((w, wi) => `<span class="w" data-l="${li}" data-w="${wi}">${w}</span>`).join(' ')}</div><div class="tr"><span class="visually-hidden">Line ${li + 1}, transliterated: </span>${ws.map((w, wi) => `<span class="w" data-l="${li}" data-w="${wi}" tabindex="0">${w}</span>`).join(' ')}</div></div>`).join('');
    const sync = (el, on) => tr.querySelectorAll(`.w[data-l="${el.dataset.l}"][data-w="${el.dataset.w}"]`).forEach(x => x.classList.toggle('hl', on));
    tr.querySelectorAll('.w').forEach(w => { ['mouseenter', 'focus'].forEach(ev => w.addEventListener(ev, () => sync(w, true))); ['mouseleave', 'blur'].forEach(ev => w.addEventListener(ev, () => sync(w, false))); });
  }

  // Type in EVA
  const inp = document.getElementById('eva-input'), out = document.getElementById('eva-output');
  if (inp && out) {
    const clean = s => s.toLowerCase().replace(/[^a-z .]/g, '');
    const upd = () => { out.textContent = clean(inp.value) || ' '; };
    inp.addEventListener('input', upd); upd();
  }

  // Word builder: assemble a word from the slots analysts describe, then check whether it exists
  const wb = document.getElementById('wordbuild');
  if (wb) {
    const PRE = [['', 55], ['q', 20], ['y', 8], ['s', 8], ['d', 9]];
    const START = [['o', 40], ['ch', 25], ['sh', 12], ['a', 8], ['', 15]];
    const MID = [['k', 14], ['t', 12], ['ke', 10], ['te', 8], ['kee', 6], ['tee', 5], ['l', 8], ['e', 8], ['ee', 6], ['', 23]];
    const END = [['dy', 22], ['y', 18], ['aiin', 16], ['ol', 10], ['ar', 7], ['or', 6], ['al', 6], ['ain', 5], ['in', 4], ['am', 2], ['s', 4]];
    const pick = arr => { const tot = arr.reduce((a, b) => a + b[1], 0); let r = Math.random() * tot; for (const [v, w] of arr) { r -= w; if (r <= 0) return v; } return arr[0][0]; };
    const words = (window.VOYNICH && window.VOYNICH.words) || null;
    const slots = wb.querySelectorAll('.slot'), res = wb.querySelector('.result'), verdict = wb.querySelector('.verdict');
    function roll() {
      let parts = [pick(PRE), pick(START), pick(MID), pick(END)];
      if (parts[0] === 'q') parts[1] = 'o';
      if (parts[0] === '' && parts[1] === '') parts[1] = 'ch';
      parts.forEach((p, i) => { slots[i].querySelector('.val').textContent = p || '·'; slots[i].querySelector('.ev').textContent = p || '(none)'; });
      const w = parts.join('');
      res.innerHTML = `<span aria-hidden="true">${w}</span><small>${w}</small>`;
      if (!words) { verdict.textContent = 'Checking the manuscript…'; return; }
      const c = words[w];
      verdict.innerHTML = c ? `<b>"${w}" is real.</b> It appears ${c.toLocaleString('en-GB')} time${c === 1 ? '' : 's'} in the manuscript.` : `<b>"${w}" never appears</b> in the manuscript, though it follows the rules. About 7,400 distinct words do.`;
    }
    wb.querySelector('[data-roll]').addEventListener('click', roll);
    roll();
  }
})();
