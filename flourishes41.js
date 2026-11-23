/* Portfolio ambient flourishes, progressive enhancement and motion-safe. */
export function initFlourishes(root) {
  if (!root || root.dataset.flourishes) return () => {};
  root.dataset.flourishes = '41';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ambient = document.createElement('div');
  ambient.className = 'pf-ambient'; ambient.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 7; i++) ambient.appendChild(document.createElement('i'));
  root.prepend(ambient);
  const glow = document.createElement('div');
  glow.className = 'pf-cursor-glass'; glow.setAttribute('aria-hidden', 'true');
  root.appendChild(glow);
  let headingIO;
  const headings = [...root.querySelectorAll('h2')];
  if (!reduced.matches && typeof IntersectionObserver !== 'undefined') {
    headingIO = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('pf-words-in'); headingIO.unobserve(entry.target);
    }), { threshold: .2 });
    headings.forEach(heading => {
      const target = heading.querySelector('.pf-title-word') || heading;
      if (target.children.length) return;
      const text = target.textContent;
      const fragment = document.createDocumentFragment();
      text.split(/(\s+)/).forEach((word, i) => {
        if (!word.trim()) { fragment.append(document.createTextNode(word)); return; }
        const span = document.createElement('span');
        span.className = 'pf-reveal-word'; span.textContent = word;
        span.style.setProperty('--word-delay', `${Math.floor(i / 2) * 85}ms`);
        fragment.append(span);
      });
      target.replaceChildren(fragment); heading.classList.add('pf-word-heading');
      headingIO.observe(heading);
    });
  }
  let pointerFrame = 0;
  const move = event => {
    if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
    const x = event.clientX, y = event.clientY;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const bounds = root.getBoundingClientRect();
      glow.style.transform = `translate3d(${x - bounds.left - 180}px, ${y - bounds.top - 180}px, 0)`;
      glow.classList.add('is-active');
    });
  };
  const leave = () => glow.classList.remove('is-active');
  root.addEventListener('pointermove', move, { passive: true });
  root.addEventListener('pointerleave', leave);
  const laptop = root.querySelector('.pf-laptop-wrap');
  const hero = root.querySelector('.pf-hero');
  let scrollFrame = 0;
  const scroll = () => {
    if (reduced.matches || !laptop || !hero) return;
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      const shift = Math.max(-22, Math.min(38, -rect.top * .075));
      laptop.style.setProperty('--scroll-drift', `${shift.toFixed(1)}px`);
    });
  };
  let heroIO;
  if (hero && laptop && typeof IntersectionObserver !== 'undefined') {
    heroIO = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (reduced.matches || !entry.isIntersecting || document.documentElement.scrollHeight > innerHeight + 2) return;
      const clippedTop = Math.max(0, entry.intersectionRect.top - entry.boundingClientRect.top);
      laptop.style.setProperty('--scroll-drift', `${Math.min(38, clippedTop * .075).toFixed(1)}px`);
    }, { threshold: Array.from({ length: 41 }, (_, i) => i / 40) });
    heroIO.observe(hero);
  }
  const reset = () => {
    leave();
    if (reduced.matches) {
      headings.forEach(h => h.classList.add('pf-words-in'));
      laptop?.style.removeProperty('--scroll-drift');
    } else scroll();
  };
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('resize', scroll, { passive: true });
  reduced.addEventListener('change', reset);
  fine.addEventListener('change', leave);
  scroll();
  return () => {
    delete root.dataset.flourishes;
    cancelAnimationFrame(pointerFrame); cancelAnimationFrame(scrollFrame);
    headingIO?.disconnect(); heroIO?.disconnect(); ambient.remove(); glow.remove();
    root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', leave);
    window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll);
    reduced.removeEventListener('change', reset); fine.removeEventListener('change', leave);
  };
}

const boot = () => { const root = document.querySelector('.pf-root'); if (root) { initFlourishes(root); return true; } return false; };
if (!boot()) { const observer = new MutationObserver(() => { if (boot()) observer.disconnect(); }); observer.observe(document.getElementById('root'), { childList: true, subtree: true }); }
