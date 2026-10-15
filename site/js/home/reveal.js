/**
 * Text reveals: headings rise line by line out of a clip, the About statement word by word. Words are
 * grouped into lines by their measured top at the moment they reveal, so the stagger follows the real wrap.
 */

/** A line index per word: words whose tops sit within `tolerance` px share a line. */
export function lineIndexes(tops, tolerance = 4) {
  let line = -1, top = null;
  return tops.map((y) => {
    if (top === null || Math.abs(y - top) > tolerance) { line++; top = y; }
    return line;
  });
}
