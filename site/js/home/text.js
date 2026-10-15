/** Terminal lines, as scripts/home/markup.py `term()` sets them: a leading prompt or ticket flag coloured, every
 * tick coloured, everything else escaped. */
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const PREFIX = { $: 'c', '›': 'c', '⚑': 'w' };

const line = (raw) => {
  const head = raw[0];
  const body = PREFIX[head] ? `<span class="${PREFIX[head]}">${head}</span>${escapeHtml(raw.slice(1))}` : escapeHtml(raw);
  return body.replace(/✓/g, '<span class="g">✓</span>');
};

export const term = (lines) => lines.map(line).join('\n');
