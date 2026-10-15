/** The header's Connecticut clock: "4:22pm" and "15 October, 2026", in America/New_York. */
export function formatClock(date, timeZone = 'America/New_York') {
  const parts = (opts, locale) => Object.fromEntries(
    new Intl.DateTimeFormat(locale, { timeZone, ...opts }).formatToParts(date).map((p) => [p.type, p.value]),
  );
  const t = parts({ hour: 'numeric', minute: '2-digit', hour12: true }, 'en-US');
  const d = parts({ day: 'numeric', month: 'long', year: 'numeric' }, 'en-GB');
  return { time: `${t.hour}:${t.minute}${t.dayPeriod.toLowerCase()}`, date: `${d.day} ${d.month}, ${d.year}` };
}

/** Writes the time into every [data-time] and the date into every [data-date], each second. */
export function mount(doc = document) {
  const tick = () => {
    const { time, date } = formatClock(new Date());
    doc.querySelectorAll('[data-time]').forEach((el) => { el.textContent = time; });
    doc.querySelectorAll('[data-date]').forEach((el) => { el.textContent = date; });
  };
  tick();
  return window.setInterval(tick, 1000);
}
