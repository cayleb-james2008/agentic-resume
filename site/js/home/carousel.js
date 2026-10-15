/** The hero card's carousel: AI employees, workflows, automations, everything. */
export const step = (i, delta, n) => (i + delta + n) % n;

const AUTO_MS = 4200;

/**
 * Click the card or Next to advance, Prev to go back. It turns by itself every 4.2s after the intro, until the
 * visitor touches it; from then the slot is announced politely. With motion reduced it never turns by itself.
 */
export function mount(row, { onReady, reduced }) {
  const items = [...row.querySelectorAll('.hc-item')];
  const dots = [...row.querySelectorAll('.hc-dots i')];
  const slot = row.querySelector('.hc-slot');
  let i = 0, timer = 0, touched = false;
  const show = (delta) => {
    const out = items[i];
    i = step(i, delta, items.length);
    const inn = items[i];
    if (out === inn) return;
    out.classList.remove('on');
    out.setAttribute('aria-hidden', 'true');
    out.style.transform = `translateY(${delta > 0 ? -14 : 14}px)`;
    inn.style.transition = 'none';
    inn.style.transform = `translateY(${delta > 0 ? 14 : -14}px)`;
    void inn.offsetWidth;
    inn.style.transition = '';
    inn.style.transform = '';
    inn.classList.add('on');
    inn.removeAttribute('aria-hidden');
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  };
  row.addEventListener('click', (e) => {
    const button = e.target.closest('[data-hc]');
    if (!touched) { touched = true; window.clearInterval(timer); slot.setAttribute('aria-live', 'polite'); }
    show(button ? Number(button.dataset.hc) : 1);
  });
  if (!reduced) onReady(() => { timer = window.setInterval(() => { if (!document.hidden && !touched) show(1); }, AUTO_MS); });
}
