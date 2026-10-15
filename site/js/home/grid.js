/**
 * The rem grid above 1920px. CSS sets the root size up to 1920px (tokens.css); past that the layout keeps
 * growing with the reference's damped formula (base 1920px, coefficient 0.6666).
 */
const FONT_BASE = 16;
const BASE_WIDTH = 1920;
const COEF = 0.6666;

/** The root font size in px for a window width, or null when CSS should decide. */
export function rootFontSize(width) {
  if (width <= BASE_WIDTH) return null;
  const widthReduction = ((BASE_WIDTH - width) / BASE_WIDTH) * 100;
  return FONT_BASE - (FONT_BASE * (widthReduction * COEF)) / 100;
}

/** Keeps the root size in step with the window above 1920px. */
export function mount(root = document.documentElement) {
  const apply = () => {
    const size = rootFontSize(window.innerWidth);
    if (size === null) root.style.removeProperty('font-size');
    else root.style.fontSize = `${size}px`;
  };
  apply();
  window.addEventListener('resize', apply, { passive: true });
}
