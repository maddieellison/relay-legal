// Progressive enhancement: native scrolling owns the page. No wheel/touch interception.
(() => {
  const root = document.querySelector('.journey');
  if (!root) return;
  const chapters = [...root.querySelectorAll('[data-chapter]')];
  const links = [...root.querySelectorAll('.journey-nav a')];
  const preference = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 620px)');
  let enabled = false;
  let frame = 0;
  let current = -1;

  function select(index) {
    if (current === index) return;
    current = index;
    root.dataset.stage = chapters[index].dataset.chapter;
    chapters.forEach((chapter, i) => {
      chapter.toggleAttribute('data-active', i === index);
      chapter.setAttribute('aria-hidden', String(i !== index));
      chapter.inert = i !== index;
      if (i === index) links[i].setAttribute('aria-current', 'step');
      else links[i].removeAttribute('aria-current');
    });
  }

  function update() {
    frame = 0;
    if (!enabled) return;
    const bounds = root.getBoundingClientRect();
    const travel = Math.max(1, root.offsetHeight - innerHeight);
    const index = Math.min(chapters.length - 1, Math.max(0, Math.floor(-bounds.top / travel * chapters.length)));
    select(index);
  }

  function schedule() {
    if (enabled && !frame) frame = requestAnimationFrame(update);
  }

  function configure() {
    enabled = preference.matches;
    root.classList.toggle('is-enhanced', enabled);
    current = -1;
    if (enabled) update();
    else {
      chapters.forEach(chapter => {
        chapter.removeAttribute('aria-hidden');
        chapter.removeAttribute('data-active');
        chapter.inert = false;
      });
      links.forEach(link => link.removeAttribute('aria-current'));
      root.dataset.stage = 'request';
    }
  }

  function goTo(index, focus = false) {
    const top = root.getBoundingClientRect().top + scrollY;
    const travel = root.offsetHeight - innerHeight;
    // Land in the middle of the selected chapter, so rounding cannot select its neighbour.
    scrollTo({top: top + travel * (index + 0.5) / chapters.length, behavior: 'instant'});
    select(index);
    if (focus) chapters[index].focus({preventScroll: true});
  }

  links.forEach((link, index) => link.addEventListener('click', event => {
    if (!enabled) return; // Real anchor links remain the no-JS/reduced-motion navigation.
    event.preventDefault();
    history.replaceState(null, '', link.hash);
    goTo(index, event.detail === 0);
  }));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  preference.addEventListener('change', configure);
  configure();
  const initial = links.findIndex(link => link.hash === location.hash);
  if (enabled && initial !== -1) goTo(initial);
})();
