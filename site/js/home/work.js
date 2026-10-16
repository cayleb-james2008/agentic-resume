/**
 * The work index on a wide screen: the rows on the left, one preview frame on the right that shows the row you
 * point at or tab to. The frame holds a copy of each row's own picture (decorative there: the row keeps the real
 * one, with its description, for narrow screens and assistive technology), and the new one wipes in from the top.
 * Below 1024px, without the script, or with motion reduced (then without the wipe), each row shows its own.
 */
const WIDE = '(min-width: 1024px)';
const WIPE = [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }];

export function mount(index, { reduced }) {
  const wide = window.matchMedia(WIDE);
  const rows = [...index.querySelectorAll('[data-row]')];
  let preview = null, panes = [], active = -1;

  function build() {
    preview = document.createElement('div');
    preview.className = 'index-preview';
    preview.setAttribute('aria-hidden', 'true');
    panes = rows.map((row) => {
      const pane = row.querySelector('.row-shot').cloneNode(true);
      pane.classList.add('pane');
      pane.querySelectorAll('img').forEach((img) => { img.alt = ''; img.loading = 'eager'; });
      preview.append(pane);
      return pane;
    });
    index.append(preview);
  }

  function show(i, animate) {
    if (i === active || !preview) return;
    rows.forEach((row, k) => row.classList.toggle('on', k === i));
    // The new pane on top, the old one just under it, so the wipe uncovers one over the other.
    panes.forEach((pane, k) => { pane.style.zIndex = k === i ? '2' : k === active ? '1' : '0'; });
    if (animate && !reduced) panes[i].animate(WIPE, { duration: 320, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' });
    active = i;
  }

  function apply() {
    if (!wide.matches) { index.classList.remove('index--preview'); return; }
    if (!preview) build();
    index.classList.add('index--preview');
    show(active < 0 ? 0 : active, false);
  }

  rows.forEach((row, i) => {
    row.addEventListener('pointerenter', () => { if (wide.matches) show(i, true); });
    row.addEventListener('focusin', () => { if (wide.matches) show(i, true); });
  });
  wide.addEventListener?.('change', apply);
  apply();
}
