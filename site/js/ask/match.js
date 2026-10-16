/**
 * The Ask bar's matcher. Every answer on the page was written ahead of time (site/content.json guide.questions);
 * this only finds the one a visitor's question means. It runs in the browser, on the page's own data: no model,
 * no network, nothing typed ever leaves the page.
 *
 * A question is scored by the words it shares with each written question, weighted by how rare the word is
 * across all of them (idf) and by where it appears: a one-word keyword counts most, the words of a keyword
 * phrase and of the question itself next, the answer's words a little. A misspelt word one letter off a known
 * word still counts, a little less. Whole keyword phrases ("anyone's job") add a bonus, and typing a written
 * question exactly always picks it. A question steps aside when the query names a subject it does not answer
 * for (its `avoid` words): Ergon's price is never the answer to "How much is dotz?" or "What does he charge?".
 * `decide()` answers only when one question is clearly ahead; otherwise it offers the closest ones.
 */

/** Words that carry no meaning on their own here. */
export const STOP = new Set(`a an the is are was were be been am do does did doing you your yours he his him cayleb
  cayleb's what what's whats how can could would should will i me my we our us of to for in on at it its it's and or
  with about this that these those there any some tell please have has had get so if by as from just like know want
  need into than then them they their i'm im ok okay hi hello hey`.split(/\s+/).filter(Boolean));

/**
 * What a visitor might type, mapped to the words the written questions use. Kept here, in code, and never shown:
 * it is the only place words the page's copy rules keep out of the content (client, pilot) can still be heard.
 */
export const SYNONYMS = {
  client: 'company', clients: 'company', customer: 'company', customers: 'company', business: 'company',
  businesses: 'company', companies: 'company', firm: 'company', employer: 'company',
  pilot: 'rollout', pilots: 'rollout', deploy: 'rollout', deployed: 'rollout', deployment: 'rollout',
  production: 'rollout', shipped: 'built',
  price: 'cost', prices: 'cost', pricing: 'cost', priced: 'cost', fee: 'cost', fees: 'cost', expensive: 'cost',
  cheap: 'cost', budget: 'cost', costs: 'cost', charge: 'rate', charges: 'rate',
  // His own rate is its own question, never Ergon's price.
  rate: 'rate', rates: 'rate', hourly: 'rate', wage: 'rate', wages: 'rate', salary: 'rate', compensation: 'rate',
  quote: 'rate', quotes: 'rate', freelance: 'hire',
  onsite: 'office', hybrid: 'office', relocate: 'office', relocation: 'office', commute: 'office',
  monthly: 'month', subscription: 'month',
  cv: 'resume', 'résumé': 'resume', resumes: 'resume',
  available: 'hire', availability: 'hire', hiring: 'hire', hired: 'hire', recruit: 'hire', recruiting: 'hire',
  recruiter: 'hire', employ: 'hire', position: 'hire', opening: 'hire', candidate: 'hire', interview: 'hire',
  replace: 'job', replaces: 'job', replacing: 'job', replaced: 'job', layoff: 'job', layoffs: 'job', fire: 'job',
  fired: 'job', headcount: 'job', unemployment: 'job', jobs: 'job',
  python: 'stack', rust: 'stack', react: 'stack', tauri: 'stack', typescript: 'stack', javascript: 'stack',
  api: 'stack', apis: 'stack', sdk: 'stack', cli: 'stack', runtime: 'stack', framework: 'stack', frameworks: 'stack',
  language: 'stack', languages: 'stack', tech: 'stack', technology: 'stack', technologies: 'stack', node: 'stack',
  sql: 'stack', sqlite: 'stack', 'c#': 'stack', programming: 'stack',
  repo: 'github', repos: 'github', repository: 'github', repositories: 'github', pr: 'github', commits: 'github',
  opensource: 'github',
  claude: 'coding', chatgpt: 'coding', gpt: 'coding', copilot: 'coding', cursor: 'coding', codex: 'coding',
  vibe: 'coding', llm: 'coding', llms: 'coding',
  demos: 'demo', example: 'demo', examples: 'demo', proof: 'demo', screenshot: 'demo', screenshots: 'demo',
  school: 'study', studied: 'study', education: 'study', degree: 'study', college: 'study', university: 'study',
  graduate: 'study', graduated: 'study', diploma: 'study', age: 'study', old: 'study',
  qa: 'test', tested: 'test', tests: 'test', testing: 'test', bug: 'test', bugs: 'test', reliable: 'test',
  quality: 'test', checks: 'test',
  privacy: 'data', private: 'data', secure: 'safe', security: 'safe', risk: 'safe', risky: 'safe', trust: 'safe',
  mistakes: 'mistake', wrong: 'mistake', error: 'mistake', errors: 'mistake', hallucinate: 'mistake',
  trade: 'trading', trader: 'trading', stock: 'trading', stocks: 'trading', crypto: 'trading', markets: 'trading',
  mail: 'email', gmail: 'apps', outlook: 'apps', quickbooks: 'apps', excel: 'apps', slack: 'apps', software: 'apps',
  integrate: 'apps', integration: 'apps', integrations: 'apps', connect: 'apps', app: 'apps',
  phone: 'contact', call: 'contact', reach: 'contact', touch: 'contact', message: 'contact',
  begin: 'start', onboarding: 'start', kickoff: 'start', process: 'start', steps: 'start',
  automate: 'automation', automations: 'automation', automated: 'automation', workflows: 'automation',
  workflow: 'automation', busywork: 'automation',
};

const STRIP_MARKS = /[̀-ͯ]/g;

/** Lower case, accents off, curly apostrophes straightened, punctuation to spaces. */
export function normalize(s) {
  return String(s)
    .normalize('NFKD').replace(STRIP_MARKS, '')
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[^a-z0-9'+# ]+/g, ' ')
    .replace(/(^|\s)'+|'+(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A light stemmer: enough that "tests", "testing" and "tested" meet. */
export function stem(w) {
  let s = w.replace(/'s$/, '');
  if (s.length <= 4) return s;
  if (s.endsWith('ies')) return `${s.slice(0, -3)}y`;
  if (s.endsWith('ing') && s.length > 5) return s.slice(0, -3);
  if (s.endsWith('ed') && s.length > 4) return s.slice(0, -2);
  if (/(s|x|ch|sh)es$/.test(s)) return s.slice(0, -2);
  if (s.endsWith('s') && !s.endsWith('ss')) return s.slice(0, -1);
  return s;
}

/** The meaningful words of a string, mapped through the synonyms and stemmed. */
export function tokens(s) {
  return normalize(s).split(' ').filter(Boolean)
    .map((w) => SYNONYMS[w] ?? SYNONYMS[w.replace(/'s$/, '')] ?? w)
    .filter((w) => !STOP.has(w))
    .map(stem);
}

const WEIGHT = { keyword: 3, phrase: 2, question: 2, answer: 0.5 };
export const MIN_SCORE = 1.5;
const PHRASE_BONUS = 2.5;
const EXACT_BONUS = 100;
const TYPO_FACTOR = 0.7;

/** Precomputes each written question's weighted words and phrases, and how rare each word is. */
export function buildIndex(questions) {
  const docs = questions.map((item) => {
    const weights = new Map();
    const add = (text, w) => { for (const t of tokens(text)) weights.set(t, Math.max(weights.get(t) ?? 0, w)); };
    add(item.a, WEIGHT.answer);
    add(item.q, WEIGHT.question);
    // A one-word keyword is the strongest signal; a phrase's words count like the question's own.
    for (const k of item.keywords ?? []) add(k, normalize(k).includes(' ') ? WEIGHT.phrase : WEIGHT.keyword);
    // Keyword phrases add their words and a bonus; `phrases` add only the bonus, so a phrase such as "he charge"
    // can point at hiring without making every price question look like one.
    const phrases = [...(item.keywords ?? []).map(normalize).filter((p) => p.includes(' ')), ...(item.phrases ?? []).map(normalize)];
    const avoid = new Set((item.avoid ?? []).map(normalize));
    return { weights, phrases, avoid, exact: normalize(item.q) };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.weights.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const n = docs.length;
  const idf = new Map([...df].map(([t, k]) => [t, Math.log(1 + n / k)]));
  return { docs, idf, vocab: [...idf.keys()] };
}

/** True when a and b differ by one edit (one letter added, dropped or changed). */
export function oneEdit(a, b) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) === 1;
}

/** Every written question with its score for `query`, best first; ties keep the written order. */
export function rank(index, query) {
  const norm = normalize(query);
  const words = [...new Set(tokens(query))];
  // A word the index doesn't know, five letters or longer, may be a typo of one it does.
  const resolved = words.map((w) => {
    if (index.idf.has(w)) return [w, 1];
    if (w.length < 5) return [w, 0];
    const near = index.vocab.find((v) => v[0] === w[0] && oneEdit(v, w)) ?? index.vocab.find((v) => oneEdit(v, w));
    return near ? [near, TYPO_FACTOR] : [w, 0];
  });
  const padded = ` ${norm} `;
  // Whole words as typed, stop words kept: "he", "his" and "cayleb" name a subject even though they score nothing.
  const said = new Set(norm.split(' ').map((w) => w.replace(/'s$/, '')));
  return index.docs.map((doc, i) => {
    if ([...doc.avoid].some((w) => said.has(w))) return { i, score: 0 };
    let score = 0;
    for (const [w, factor] of resolved) score += factor * (index.idf.get(w) ?? 0) * (doc.weights.get(w) ?? 0);
    for (const p of doc.phrases) if (padded.includes(` ${p} `)) score += PHRASE_BONUS;
    if (norm && norm === doc.exact) score += EXACT_BONUS;
    return { i, score };
  }).sort((x, y) => y.score - x.score || x.i - y.i);
}

/**
 * What to do with a ranking: `empty` for a blank question, `answer` when the best match is strong and clearly
 * ahead of the next, otherwise `fallback` with up to three suggestions (the closest, or `chips` if none is close).
 */
export function decide(ranked, query, { min = MIN_SCORE, lead = 1.25, chips = [] } = {}) {
  if (!normalize(query)) return { kind: 'empty' };
  const [top, second] = ranked;
  if (top && top.score >= min && (!second || top.score >= second.score * lead)) return { kind: 'answer', i: top.i };
  const close = ranked.filter((r) => r.score > 0).slice(0, 3).map((r) => r.i);
  return { kind: 'fallback', suggestions: close.length ? close : chips.slice(0, 3) };
}

/** One call: rank and decide. */
export function ask(index, query, chips = []) {
  return decide(rank(index, query), query, { chips });
}
