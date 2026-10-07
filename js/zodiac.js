/* Zodiac wheel: which signs survive, which are split, which are lost. */
(function () {
  const host = document.getElementById('zodiac'); if (!host) return;
  // Order as the manuscript has it: it starts with Pisces, not Aries.
  const SIGNS = [
    { s: 'Pisces', folio: 'f70v2', month: 'March', figures: 29, emblem: 'Two fishes, joined by a line. The figures stand in tubs or baskets.', status: 'present', img: 'img/f70v2.jpg' },
    { s: 'Aries', folio: 'f70v1 and f71r', month: 'April', figures: '15 + 15', emblem: 'A skinny sheep or goat eating from a bush, drawn twice on two pages, with 15 figures each. Together they make the usual 30.', status: 'split' },
    { s: 'Taurus', folio: 'f71v and f72r1', month: 'May', figures: '15 + 15', emblem: 'A bull eating from a manger, again drawn twice with 15 figures each.', status: 'split' },
    { s: 'Gemini', folio: 'f72r2', month: 'June', figures: 30, emblem: 'A clothed couple, the woman on the right and the man on the left.', status: 'present' },
    { s: 'Cancer', folio: 'f72r3', month: 'July', figures: 30, emblem: 'Two lobster-like creatures with a line joining their mouths.', status: 'present' },
    { s: 'Leo', folio: 'f72v3', month: 'August', figures: 30, emblem: 'A lion without a mane, tail curling between its hind legs.', status: 'present' },
    { s: 'Virgo', folio: 'f72v2', month: 'September', figures: 30, emblem: 'A clothed woman in a blue gown with very wide sleeves.', status: 'present' },
    { s: 'Libra', folio: 'f72v1', month: 'October', figures: 30, emblem: 'A balance in equilibrium, held by no one.', status: 'present' },
    { s: 'Scorpio', folio: 'f73r', month: 'November', figures: 30, emblem: 'A four-legged animal with a curly tail that looks more like a lizard than a scorpion.', status: 'present' },
    { s: 'Sagittarius', folio: 'f73v', month: 'December', figures: 30, emblem: 'A man with a crossbow, not a centaur with a bow. The crossbow and his clothes are among the best clues to where and when the book was made.', status: 'present', img: 'img/f73v.jpg' },
    { s: 'Capricorn', folio: 'f74 (lost)', month: '', figures: '', emblem: 'Folio 74 was cut out of the bound book; only a stub remains. Capricorn and Aquarius were probably on it.', status: 'lost' },
    { s: 'Aquarius', folio: 'f74 (lost)', month: '', figures: '', emblem: 'Lost with Capricorn on the missing folio 74.', status: 'lost' }
  ];
  host.innerHTML = `<div><svg viewBox="0 0 400 400" role="group" aria-label="Zodiac wheel, in the order the manuscript gives the signs"></svg><div class="wheel-note">Reading clockwise from the top, in the manuscript's own order. Dashed segments are lost.</div></div><div class="info" aria-live="polite"><h4>Tap a sign</h4><p>The book's zodiac begins with Pisces and ends, as far as it survives, with Sagittarius.</p></div>`;
  const svg = host.querySelector('svg'), info = host.querySelector('.info'); const NS = 'http://www.w3.org/2000/svg';
  const cx = 200, cy = 200, r0 = 92, r1 = 190, n = SIGNS.length;
  const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  SIGNS.forEach((z, i) => {
    const a0 = -Math.PI / 2 + i * 2 * Math.PI / n, a1 = a0 + 2 * Math.PI / n;
    const [x0, y0] = pt(r1, a0), [x1, y1] = pt(r1, a1), [x2, y2] = pt(r0, a1), [x3, y3] = pt(r0, a0);
    const g = document.createElementNS(NS, 'g'); g.classList.add('seg', z.status === 'lost' ? 'lost' : 'present'); g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-pressed', 'false'); g.setAttribute('aria-label', `${z.s}, ${z.status === 'lost' ? 'lost' : z.status === 'split' ? 'split over two pages' : 'present'}`);
    const p = document.createElementNS(NS, 'path'); p.setAttribute('d', `M ${x0} ${y0} A ${r1} ${r1} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 0 0 ${x3} ${y3} Z`); g.appendChild(p);
    const am = (a0 + a1) / 2, [tx, ty] = pt((r0 + r1) / 2, am);
    const t = document.createElementNS(NS, 'text'); t.setAttribute('x', tx); t.setAttribute('y', ty + 4); t.textContent = z.s; g.appendChild(t);
    if (z.status === 'split') { const t2 = document.createElementNS(NS, 'text'); t2.setAttribute('x', tx); t2.setAttribute('y', ty + 16); t2.setAttribute('font-size', '8'); t2.textContent = '×2 pages'; g.appendChild(t2); }
    const go = () => {
      svg.querySelectorAll('.seg').forEach(s => s.setAttribute('aria-pressed', 'false')); g.setAttribute('aria-pressed', 'true');
      info.innerHTML = `<h4>${z.s}</h4><p><b>Folio:</b> ${z.folio}${z.month ? `<br><b>Month written in the centre (later hand):</b> ${z.month}` : ''}${z.figures ? `<br><b>Figures holding stars:</b> ${z.figures}` : ''}</p><p>${z.emblem}</p>${z.img ? `<img src="${z.img}" alt="${z.s} page of the Voynich manuscript, folio ${z.folio}" loading="lazy">` : ''}`;
    };
    g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    svg.appendChild(g);
  });
  const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r0 - 6); c.setAttribute('fill', 'var(--paper-2)'); c.setAttribute('stroke', 'var(--rule)'); svg.appendChild(c);
  const ct = document.createElementNS(NS, 'text'); ct.setAttribute('x', cx); ct.setAttribute('y', cy + 5); ct.setAttribute('text-anchor', 'middle'); ct.setAttribute('font-size', '11'); ct.setAttribute('fill', 'var(--ink-2)'); ct.setAttribute('font-family', 'var(--ui)'); ct.textContent = '10 of 12 survive'; svg.appendChild(ct);
})();
