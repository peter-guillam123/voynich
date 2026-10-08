/* Zodiac ring: the twelve signs as the manuscript draws them, in the manuscript's own order. */
(function () {
  const host = document.getElementById('zodiac'); if (!host) return;
  const SIGNS = [
    { s: 'Pisces', folio: 'f70v2', page: 'img/f70v2.jpg', img: 'img/zodiac/pisces.jpg', month: 'mars', figures: '29', emblem: 'Two fishes joined by a line. The first sign in the book, which is odd: zodiacs normally begin with Aries. The figures stand in tubs or baskets.' },
    { s: 'Aries', folio: 'f70v1', page: 'img/f70v1.jpg', img: 'img/zodiac/aries1.jpg', month: 'aberil', figures: '15', emblem: 'A thin goat or sheep eating from a bush, painted dark green. Only 15 figures: the sign is split across two pages.' },
    { s: 'Aries, again', folio: 'f71r', page: 'img/f71r.jpg', img: 'img/zodiac/aries2.jpg', month: 'aberil', figures: '15', emblem: 'The second half of Aries, with the other 15 figures. Nobody knows why the scribe split this sign and the next.' },
    { s: 'Taurus', folio: 'f71v', page: 'img/f71v-72r.jpg', img: 'img/zodiac/taurus1.jpg', month: 'may', figures: '15', emblem: 'A bull eating from a manger. Fifteen figures, again in tubs.' },
    { s: 'Taurus, again', folio: 'f72r1', page: 'img/f71v-72r.jpg', img: 'img/zodiac/taurus2.jpg', month: 'may', figures: '15', emblem: 'The second Taurus, a red bull, with the other 15 figures. From here on the figures stand free of tubs.' },
    { s: 'Gemini', folio: 'f72r2', page: 'img/f71v-72r.jpg', img: 'img/zodiac/gemini.jpg', month: 'jong', figures: '30', emblem: 'A clothed couple holding hands, the woman on the right in blue and the man on the left in green.' },
    { s: 'Cancer', folio: 'f72r3', page: 'img/f71v-72r.jpg', img: 'img/zodiac/cancer.jpg', month: 'iollet', figures: '30', emblem: 'Two red lobster-like creatures with a line joining their mouths.' },
    { s: 'Leo', folio: 'f72v3', page: 'img/f72v-1.jpg', img: 'img/zodiac/leo.jpg', month: 'augst', figures: '30', emblem: 'A lion without a mane, its tail curling between its hind legs.' },
    { s: 'Virgo', folio: 'f72v2', page: 'img/f72v-1.jpg', img: 'img/zodiac/virgo.jpg', month: 'septembre', figures: '30', emblem: 'A woman in a blue gown with very wide sleeves. Her dress is one of the clues used to date the drawings.' },
    { s: 'Libra', folio: 'f72v1', page: 'img/f72v-2.jpg', img: 'img/zodiac/libra.jpg', month: 'octembre', figures: '30', emblem: 'A balance in equilibrium, held by no one.' },
    { s: 'Scorpio', folio: 'f73r', page: 'img/f73r.jpg', img: 'img/zodiac/scorpio.jpg', month: 'novembre', figures: '30', emblem: 'A four-legged animal with a curly tail that looks more like a lizard than a scorpion.' },
    { s: 'Sagittarius', folio: 'f73v', page: 'img/f73v.jpg', img: 'img/zodiac/sagittarius.jpg', month: 'decembre', figures: '30', emblem: 'A man with a crossbow, not a centaur with a bow. His weapon and his clothes are the best clues to where the book was made.' },
    { s: 'Capricorn', lost: true, emblem: 'Folio 74 was cut out of the bound book; only a stub remains. Capricorn was almost certainly on it.' },
    { s: 'Aquarius', lost: true, emblem: 'Lost with Capricorn on the missing folio 74.' }
  ];
  const n = SIGNS.length;
  host.innerHTML = `<div class="ring" role="group" aria-label="The zodiac pages, in the manuscript's order, clockwise from the top">${SIGNS.map((z, i) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n, r = 41.5;
    const x = (Math.cos(a) * r).toFixed(1), y = (Math.sin(a) * r).toFixed(1);
    if (z.lost) return `<button type="button" class="sign lost" style="--x:${x / 17 * 100}%;--y:${y / 17 * 100}%" data-i="${i}" aria-pressed="false" aria-label="${z.s}, lost">${z.s}<br>lost</button>`;
    return `<button type="button" class="sign" style="--x:${x / 17 * 100}%;--y:${y / 17 * 100}%" data-i="${i}" aria-pressed="false" aria-label="${z.s}, folio ${z.folio}"><img src="${z.img}" alt="" loading="lazy"><span class="lab" aria-hidden="true">${z.s.replace(', again', ' ii')}</span></button>`;
  }).join('')}<div class="centre"><div class="empty">Tap a sign</div></div></div>
  <div><div class="info" aria-live="polite"><h4>The book's own zodiac</h4><p>Ten signs survive on twelve pages. It starts with Pisces, splits Aries and Taurus in two, and lost Capricorn and Aquarius when someone cut out folio 74. Around each emblem stand rings of figures, each holding a star and each with a word of Voynichese beside it.</p><div class="nav"><button class="btn small" type="button" data-step="1">Start with Pisces →</button></div></div><p class="wheel-note">Clockwise from the top, in the order the pages come. Each circle is cut from the real page.</p></div>`;
  const centre = host.querySelector('.centre'), info = host.querySelector('.info');
  let cur = -1;
  function show(i) {
    cur = i; const z = SIGNS[i];
    host.querySelectorAll('.sign').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    centre.innerHTML = z.lost ? `<div class="empty">Folio 74, cut out. ${z.s} went with it.</div>` : `<img src="${z.img}" alt="${z.s}, cut from folio ${z.folio}">`;
    info.innerHTML = `<h4>${z.s}</h4>${z.lost ? '' : `<dl><dt>Folio</dt><dd>${z.folio}</dd><dt>Month, in a later hand</dt><dd>"${z.month}"</dd><dt>Figures with stars</dt><dd>${z.figures}</dd></dl>`}<p>${z.emblem}</p>${z.lost ? '' : `<p><a href="${z.page}" target="_blank" rel="noopener">Open the whole page</a></p>`}<div class="nav"><button class="btn small" type="button" data-step="-1" aria-label="Previous sign">← Previous</button><button class="btn small" type="button" data-step="1" aria-label="Next sign">Next →</button></div>`;
  }
  host.addEventListener('click', e => {
    const b = e.target.closest('.sign'); if (b) { show(+b.dataset.i); return; }
    const s = e.target.closest('[data-step]'); if (s) { show(((cur < 0 ? -1 : cur) + +s.dataset.step + n) % n); }
  });
})();
