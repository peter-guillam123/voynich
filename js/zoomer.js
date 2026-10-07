/* Pan-and-zoom viewer with hotspots, for the rosettes sheet. Works with mouse, touch, keyboard and buttons. */
(function () {
  document.querySelectorAll('.zoomer-block').forEach(block => {
    const box = block.querySelector('.zoomer'), img = box.querySelector('img'), note = block.querySelector('.zoom-note');
    const hots = JSON.parse(block.getAttribute('data-hotspots') || '[]');
    let s = 1, tx = 0, ty = 0, drag = null, pinch = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.setAttribute('tabindex', '0'); box.setAttribute('role', 'application'); box.setAttribute('aria-label', 'Zoomable image. Use plus and minus to zoom and the arrow keys to pan.');
    img.style.transition = reduced ? 'none' : 'transform 0.35s cubic-bezier(.22,.61,.36,1)';
    function apply(anim) {
      const W = box.clientWidth, H = box.clientHeight;
      const maxX = 0, minX = W - W * s, maxY = 0, minY = H - H * s;
      tx = Math.min(maxX, Math.max(minX, tx)); ty = Math.min(maxY, Math.max(minY, ty));
      img.style.transition = anim && !reduced ? 'transform 0.35s cubic-bezier(.22,.61,.36,1)' : 'none';
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
      box.querySelectorAll('.hot').forEach(h => { h.style.left = (h.dataset.x * W * s + tx) + 'px'; h.style.top = (h.dataset.y * H * s + ty) + 'px'; h.style.transition = img.style.transition.replace('transform', 'left, top'); });
    }
    function zoomTo(ns, px, py, anim) {
      const W = box.clientWidth, H = box.clientHeight; px = px ?? W / 2; py = py ?? H / 2;
      ns = Math.min(6, Math.max(1, ns));
      tx = px - (px - tx) * ns / s; ty = py - (py - ty) * ns / s; s = ns; apply(anim);
    }
    hots.forEach((h, i) => {
      const b = document.createElement('button'); b.className = 'hot'; b.type = 'button'; b.dataset.x = h.x; b.dataset.y = h.y; b.textContent = i + 1; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', h.title);
      b.addEventListener('click', e => {
        e.stopPropagation();
        box.querySelectorAll('.hot').forEach(x => x.setAttribute('aria-expanded', 'false')); b.setAttribute('aria-expanded', 'true');
        const W = box.clientWidth, H = box.clientHeight; s = 3; tx = W / 2 - h.x * W * s; ty = H / 2 - h.y * H * s; apply(true);
        note.innerHTML = `<b>${i + 1}. ${h.title}.</b> ${h.text}`;
      });
      box.appendChild(b);
    });
    // mouse drag
    box.addEventListener('pointerdown', e => { if (e.target.classList.contains('hot')) return; drag = { x: e.clientX, y: e.clientY, tx, ty }; box.setPointerCapture(e.pointerId); });
    box.addEventListener('pointermove', e => { if (!drag) return; tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; apply(false); });
    box.addEventListener('pointerup', () => drag = null); box.addEventListener('pointercancel', () => drag = null);
    box.addEventListener('wheel', e => { if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return; e.preventDefault(); const r = box.getBoundingClientRect(); zoomTo(s * (e.deltaY < 0 ? 1.15 : 0.87), e.clientX - r.left, e.clientY - r.top, false); }, { passive: false });
    box.addEventListener('dblclick', e => { const r = box.getBoundingClientRect(); zoomTo(s >= 4 ? 1 : s * 2, e.clientX - r.left, e.clientY - r.top, true); });
    // touch pinch
    box.addEventListener('touchstart', e => { if (e.touches.length === 2) { pinch = { d: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), s }; drag = null; } }, { passive: true });
    box.addEventListener('touchmove', e => { if (pinch && e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); const r = box.getBoundingClientRect(); zoomTo(pinch.s * d / pinch.d, (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left, (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top, false); } }, { passive: true });
    box.addEventListener('touchend', () => pinch = null);
    // keyboard
    box.addEventListener('keydown', e => {
      const step = 40; let h = true;
      if (e.key === '+' || e.key === '=') zoomTo(s * 1.3, null, null, true); else if (e.key === '-' || e.key === '_') zoomTo(s / 1.3, null, null, true);
      else if (e.key === 'ArrowLeft') { tx += step; apply(true); } else if (e.key === 'ArrowRight') { tx -= step; apply(true); }
      else if (e.key === 'ArrowUp') { ty += step; apply(true); } else if (e.key === 'ArrowDown') { ty -= step; apply(true); }
      else if (e.key === '0') { s = 1; tx = ty = 0; apply(true); } else h = false;
      if (h) e.preventDefault();
    });
    block.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => { const z = b.dataset.zoom; if (z === 'in') zoomTo(s * 1.4, null, null, true); else if (z === 'out') zoomTo(s / 1.4, null, null, true); else { s = 1; tx = ty = 0; apply(true); box.querySelectorAll('.hot').forEach(x => x.setAttribute('aria-expanded', 'false')); note.textContent = ''; } }));
    window.addEventListener('resize', () => apply(false)); img.addEventListener('load', () => apply(false)); apply(false);
  });
})();
