/**
 * The eyebrow scramble: his title resolves out of cycling letters (the Kitchen's Scramble Text pattern,
 * written for this site). The served text is the real text; the effect only re-presents it, runs once,
 * and never runs when motion is reduced. The real words stay in the page for anything reading text: the
 * scrambling copy is hidden from assistive tech, which gets the settled line instead.
 */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function mountScramble(el, { reduced } = {}) {
  if (!el || reduced) return;
  const final = el.textContent.trim();
  if (final.length < 3) return;
  const settledLine = document.createElement('span');
  settledLine.className = 'sr-only';
  settledLine.textContent = final;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  visual.textContent = final;
  el.textContent = '';
  el.append(settledLine, visual);
  const frames = Math.min(28, 10 + final.length);
  let frame = 0;
  const tick = () => {
    frame += 1;
    const settled = Math.floor((frame / frames) * final.length);
    let out = final.slice(0, settled);
    for (let i = settled; i < final.length; i += 1) {
      out += final[i] === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }
    visual.textContent = out;
    if (frame < frames) window.setTimeout(tick, 30);
    else visual.textContent = final;
  };
  window.setTimeout(tick, 400);
}
