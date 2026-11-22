(() => {
  const style = document.createElement('style');
  style.textContent = `
    .pf-stats .pf-stat > b { position: relative; z-index: 1; display: block; font-size: 38px; line-height: 1; letter-spacing: -.03em; }
    .pf-dark .pf-stats .pf-stat > b { color: var(--gold2); }
    .pf-stats .pf-stat > b > .pf-count { font: inherit; color: inherit; }
    .pf-stats .pf-stat > b > small { display: block; margin: 8px 0 0; font-family: inherit; font-size: 15px; font-weight: 700; line-height: 1.25; letter-spacing: .01em; color: var(--gold); }
    .pf-stats .pf-stat > span:not(.pf-stat-bars) { position: relative; z-index: 1; display: block; margin-top: 5px; font-size: 12px; line-height: 1.35; }
    @media (max-width: 719px) {
      .pf-stats .pf-stat > b { font-size: 32px; }
      .pf-stats .pf-stat > b > small { margin-top: 7px; font-size: 13px; }
      .pf-stats .pf-stat > span:not(.pf-stat-bars) { margin-top: 4px; font-size: 11px; }
    }
  `;
  document.head.appendChild(style);

  const apply = () => {
    const cards = document.querySelectorAll('.pf-stats .pf-stat');
    if (cards.length !== 3) return false;
    const firstValue = cards[0].querySelector(':scope > b');
    if (firstValue && !firstValue.querySelector('small')) {
      firstValue.textContent = 'MIS';
      const label = document.createElement('small');
      label.textContent = 'Student';
      firstValue.appendChild(label);
    }
    const count = cards[2].querySelector('.pf-count');
    if (count && !count.dataset.singleDigit) {
      const trimLeadingZero = () => {
        const value = count.textContent || '';
        if (/^0\d+$/.test(value)) count.textContent = String(Number(value));
      };
      trimLeadingZero();
      new MutationObserver(trimLeadingZero).observe(count, { childList: true, characterData: true, subtree: true });
      count.dataset.singleDigit = 'true';
    }
    return true;
  };

  if (!apply()) {
    const observer = new MutationObserver(() => {
      if (apply()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
