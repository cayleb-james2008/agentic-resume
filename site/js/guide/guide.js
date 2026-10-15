/**
 * Ask my agent: Cayleb's guide as a small terminal in the corner. It appears once the hero is mostly out of
 * view; each question prints `$ <cmd>` and then its answer, a few characters a tick (all at once with motion
 * reduced). It only answers what is asked: no speech bubbles, no face.
 */
export const TYPE_PER_TICK = 3;
const TICK_MS = 16;
const SHOW_BELOW = 0.35;

/** Shown once less than 35% of the hero is still on screen. */
export const askVisible = (heroRatio) => heroRatio < SHOW_BELOW;

/** The part of an answer printed after `tick` ticks. */
export const typeStep = (full, tick) => full.slice(0, Math.min(full.length, (tick + 1) * TYPE_PER_TICK));

export function mount(aside, { reduced, onModal }) {
  const panel = aside.querySelector('.guide-panel');
  const agent = aside.querySelector('.guide-agent');
  const log = aside.querySelector('.guide-log');
  const answers = JSON.parse(aside.querySelector('[data-guide-answers]').textContent);
  const hero = document.getElementById('home');
  let typing = null;

  aside.hidden = false;
  const toggle = (open) => {
    aside.classList.toggle('open', open);
    agent.setAttribute('aria-expanded', String(open));
    if (open) {
      panel.hidden = false;
      panel.classList.add('enter');
      void panel.offsetWidth;
      panel.classList.remove('enter');
      aside.querySelector('.guide-q')?.focus({ preventScroll: true });
    } else {
      panel.classList.add('enter');
      window.setTimeout(() => { panel.hidden = true; panel.classList.remove('enter'); }, reduced ? 0 : 250);
      agent.focus({ preventScroll: true });
    }
  };
  agent.addEventListener('click', () => toggle(panel.hidden));
  aside.querySelector('[data-guide-close]').addEventListener('click', () => toggle(false));
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });

  function ask(index) {
    const item = answers[index];
    typing?.finish();
    const q = document.createElement('p');
    q.className = 'q';
    q.textContent = `$ ${item.cmd}`;
    const a = document.createElement('p');
    a.className = 'a';
    // The log is a polite live region: it hears the whole answer once, never each typed step.
    const typed = document.createElement('span');
    typed.setAttribute('aria-hidden', 'true');
    const said = document.createElement('span');
    said.className = 'sr-only';
    said.textContent = item.a;
    a.append(typed, said);
    log.append(q, a);
    const finish = () => {
      window.clearInterval(timer);
      typed.textContent = item.a;
      for (const link of item.links ?? []) {
        const el = document.createElement('a');
        el.href = link.href;
        el.textContent = link.label;
        if (link.href.startsWith('mailto:')) el.addEventListener('click', (e) => { e.preventDefault(); toggle(false); onModal?.(); });
        else if (link.href.endsWith('.pdf')) el.setAttribute('download', '');
        a.append(' ', el);
      }
      log.scrollTop = log.scrollHeight;
      typing = null;
    };
    let tick = 0, timer = 0;
    if (reduced) { finish(); return; }
    timer = window.setInterval(() => {
      typed.textContent = typeStep(item.a, tick++);
      log.scrollTop = log.scrollHeight;
      if (typed.textContent.length >= item.a.length) finish();
    }, TICK_MS);
    typing = { finish };
  }
  aside.querySelectorAll('.guide-q').forEach((b) => b.addEventListener('click', () => ask(Number(b.dataset.q))));

  if (hero) {
    new IntersectionObserver(([e]) => aside.classList.toggle('show', askVisible(e.isIntersecting ? e.intersectionRatio : 0)),
      { threshold: [0, 0.2, 0.35, 0.5, 1] }).observe(hero);
  } else aside.classList.add('show');
}
