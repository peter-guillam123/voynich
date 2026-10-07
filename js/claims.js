/* Claims ledger: filter the decipherment claims by their status. */
(function () {
  const host = document.getElementById('ledger'); if (!host) return;
  const claims = [...host.querySelectorAll('.claim')], count = host.querySelector('.count');
  const btns = host.querySelectorAll('[data-filter]');
  function apply(f) {
    let n = 0;
    claims.forEach(c => { const show = f === 'all' || c.dataset.status === f; c.hidden = !show; if (show) n++; });
    btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    count.textContent = `${n} of ${claims.length} shown`;
  }
  btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.filter)));
  apply('all');
})();
