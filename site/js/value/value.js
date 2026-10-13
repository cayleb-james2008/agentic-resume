/**
 * Worth it: the calculator. Reads the visitor's numbers as they type and shows
 * what comes back each year and how many times over that covers the hire
 * (math.js). Nothing is stored or sent.
 */
import { valueMath } from './math.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function mount(section) {
  const form = section.querySelector('[data-value-calc]');
  const out = section.querySelector('[data-value-out]');
  const multiple = section.querySelector('[data-value-multiple]');
  if (!form || !out || !multiple) return;
  const update = () => {
    const values = Object.fromEntries([...form.querySelectorAll('input')].map((i) => [i.name, i.value]));
    const { perYear, multiple: times } = valueMath(values);
    out.textContent = perYear === null ? out.dataset.empty : money.format(perYear);
    multiple.textContent = times === null ? '—' : `${times}×`;
  };
  form.addEventListener('input', update);
  // Dollar fields read back with thousands separators once the visitor moves on.
  form.addEventListener('focusout', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.name === 'trim') return;
    const n = Number(input.value.replace(/[$,\s]/g, ''));
    if (input.value.trim() && Number.isFinite(n)) input.value = n.toLocaleString('en-US');
  });
  form.addEventListener('submit', (event) => event.preventDefault());
  update();
}
