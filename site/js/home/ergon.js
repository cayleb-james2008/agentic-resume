/**
 * The Ergon team graph: wires from the hub to each person, updates travelling down them, tickets climbing
 * the ladder Agent → Senior agent → Person. The team switch reshapes every card to another sample team.
 *
 * Autoplay runs only while the figure is on screen and the tab is visible, and never with motion reduced;
 * the switch, the test ticket and a tap on a person still work then, with instant steps. The log announces
 * only what the visitor started.
 */
import { ticker } from '../engine/ticker.js';
import { ladderStop, nextTeam, ticketCard, wirePath } from './graph.js';
import { term } from './text.js';

const NS = 'http://www.w3.org/2000/svg';
const TICK_MS = 2300;
const LOG_LINES = 4;
const STEP_MS = 650;

export function mount(figure, { reduced }) {
  const data = JSON.parse(figure.querySelector('[data-ergon-data]').textContent);
  const f = data.figure;
  const stage = figure.querySelector('[data-stage]');
  const svg = figure.querySelector('[data-wires]');
  const hub = figure.querySelector('[data-hub]');
  const list = figure.querySelector('[data-people]');
  const log = figure.querySelector('.eg-log');
  const ladder = [...document.querySelectorAll('[data-ladder] li')];
  const seg = document.querySelector('[data-seg]');
  const button = figure.querySelector('[data-ticket]');
  const narrow = window.matchMedia('(max-width: 767.98px)');
  const cards = () => [...list.querySelectorAll('.eg-person')];
  let team = data.teamOrder[0], wires = [], packets = [], stopPackets = null;
  let visible = false, ticketBusy = false, tickets = 0, beats = 0, timer = 0;

  const wait = (ms) => new Promise((r) => window.setTimeout(r, reduced ? Math.min(ms, 120) : ms));
  const rect = (el, s) => { const r = el.getBoundingClientRect(); return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height }; };

  function line(text, announce) {
    const p = document.createElement('p');
    p.innerHTML = term([text]);
    if (announce) log.setAttribute('aria-live', 'polite');
    log.append(p);
    while (log.children.length > LOG_LINES) log.firstElementChild.remove();
    [...log.children].forEach((x, k, all) => x.classList.toggle('old', k < all.length - 2));
    if (announce) window.setTimeout(() => log.setAttribute('aria-live', 'off'), 50);
  }

  function layout() {
    const s = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${s.width} ${s.height}`);
    // Packets in flight rode the old wires: finish them so nothing awaiting them stalls.
    for (const k of packets) { k.dot.remove(); k.done(); }
    packets = [];
    svg.replaceChildren();
    const mode = narrow.matches ? 'rows' : 'cols';
    const h = rect(hub, s), mark = rect(hub.querySelector('.mk'), s);
    wires = cards().map((card) => {
      const c = rect(card, s);
      const av = rect(card.querySelector('.av'), s);
      // On phones the bus turns into each card level with its avatar.
      const target = mode === 'rows' ? { left: c.left, top: av.top, width: c.width, height: av.height } : c;
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', wirePath(mode, h, target, mark));
      svg.append(path);
      return { el: path, len: path.getTotalLength() };
    });
  }

  function frame(now) {
    packets = packets.filter((k) => {
      const t = Math.min(1, (now - k.t0) / k.dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const pt = k.wire.el.getPointAtLength(k.wire.len * (k.dir > 0 ? e : 1 - e));
      k.dot.setAttribute('cx', pt.x);
      k.dot.setAttribute('cy', pt.y);
      if (t < 1) return true;
      k.dot.remove();
      k.wire.el.classList.remove('hot');
      k.done();
      return false;
    });
    if (!packets.length && stopPackets) { stopPackets(); stopPackets = null; }
  }

  /** A dot along wire i: dir 1 runs hub → person, -1 person → hub. Resolves when it arrives. */
  function packet(i, dir, cls, dur = 900) {
    const wire = wires[i];
    if (!wire) return Promise.resolve();
    wire.el.classList.add('hot');
    if (reduced) return wait(250).then(() => wire.el.classList.remove('hot'));
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '4');
    if (cls) dot.setAttribute('class', cls);
    svg.append(dot);
    return new Promise((done) => {
      packets.push({ dot, wire, dir, dur, done, t0: performance.now() });
      if (!stopPackets) stopPackets = ticker.subscribe(frame);
    });
  }

  async function routine(i, announce = false) {
    const card = cards()[i];
    if (!card || card.classList.contains('busy') || card.classList.contains('tk')) return;
    const status = card.querySelector('.st');
    card.classList.add('busy');
    status.textContent = f.working;
    await packet(i, 1, '', 850);
    // Read the person now: a team switch during the packet reshapes this card into someone else.
    const person = data.teams[team].people[i];
    line(`› ${person.role.toLowerCase()} · ${person.task}`, announce);
    await wait(500);
    card.classList.remove('busy');
    status.textContent = f.assistantOn;
  }

  async function ticket(announce = false) {
    if (ticketBusy) return;
    const n = cards().length;
    const i = ticketCard(((tickets + 1) * 2) % n, cards().map((c) => c.classList.contains('busy')));
    if (i < 0) return;
    ticketBusy = true;
    button.setAttribute('aria-disabled', 'true'); // not `disabled`: that would drop the visitor's focus
    button.textContent = f.busy;
    tickets += 1;
    const card = cards()[i], T = data.teams[team];
    const issue = T.tickets[tickets % T.tickets.length];
    card.classList.add('tk');
    line(`${f.flag} · ${T.people[i].role.toLowerCase()} · ${issue.toLowerCase()}`, announce);
    await packet(i, -1, 'tk', 950);
    hub.classList.add('hot');
    const stop = ladderStop(tickets);
    for (let s = 0; s <= stop; s++) {
      ladder.forEach((li, k) => { li.classList.toggle('on', k === s); li.classList.remove('ok'); });
      await wait(STEP_MS);
    }
    ladder[stop].classList.remove('on');
    ladder[stop].classList.add('ok');
    line(f.outcomes[stop], announce);
    await packet(i, 1, '', 800);
    hub.classList.remove('hot');
    const status = card.querySelector('.st');
    card.classList.remove('tk');
    card.classList.add('fixed');
    status.textContent = f.fixed;
    await wait(1400);
    card.classList.remove('fixed');
    status.textContent = f.assistantOn;
    ladder.forEach((li) => li.classList.remove('on', 'ok'));
    ticketBusy = false;
    button.removeAttribute('aria-disabled');
    button.textContent = f.button;
  }

  async function shape(next) {
    if (next === team) return;
    team = next;
    seg.querySelectorAll('[data-team]').forEach((b) => {
      const on = b.dataset.team === next;
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    line(`${f.shape} ${next}`, true);
    list.classList.add('swap');
    await wait(180);
    data.teams[next].people.forEach((p, k) => {
      const card = cards()[k];
      card.querySelector('.role').textContent = p.role;
      card.querySelector('.apps').replaceChildren(...p.apps.map((a) => Object.assign(document.createElement('span'), { textContent: a })));
      card.setAttribute('aria-label', f.personLabel.replace('{role}', p.role).replace('{apps}', p.apps.join(f.appsJoin)));
      card.style.transitionDelay = reduced ? '' : `${k * 40}ms`;
    });
    list.classList.remove('swap');
    window.requestAnimationFrame(layout);
    window.setTimeout(() => { cards().forEach((c) => { c.style.transitionDelay = ''; }); layout(); }, 420);
    line(f.shaped, false);
  }

  seg.addEventListener('click', (e) => { const b = e.target.closest('[data-team]'); if (b) shape(b.dataset.team); });
  seg.addEventListener('keydown', (e) => {
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const name = nextTeam(data.teamOrder, team, delta);
    seg.querySelector(`[data-team="${name}"]`).focus();
    shape(name);
  });
  list.addEventListener('click', (e) => {
    const card = e.target.closest('.eg-person');
    if (card) routine(cards().indexOf(card), true);
  });
  button.addEventListener('click', () => ticket(true));

  function loop() {
    window.clearTimeout(timer);
    if (!visible || reduced || document.hidden) return;
    timer = window.setTimeout(async () => {
      if (!ticketBusy) {
        beats += 1;
        if (beats % 3 === 0) await ticket(false);
        else await routine((beats * 2) % cards().length, false);
      }
      loop();
    }, TICK_MS);
  }
  new ResizeObserver(() => layout()).observe(stage);
  narrow.addEventListener?.('change', layout);
  new IntersectionObserver(([e]) => { visible = e.intersectionRatio >= 0.25; loop(); }, { threshold: [0, 0.25] }).observe(stage);
  document.addEventListener('visibilitychange', loop);
  layout();
}
