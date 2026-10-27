// Calendar and clock helpers over data/calendar.json: month grids, recurring events, the
// countdown and the age of server data. Days are `YYYY-MM-DD` strings and months `YYYY-MM`,
// computed in UTC so that no time zone shifts a day; "today" is the player's local date.

const pad = (n) => String(n).padStart(2, "0");
const DAY_MS = 86_400_000;

function toDay(time) {
  const date = new Date(time);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function dayTime(day) {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date);
}

export function today(now = Date.now()) {
  const date = new Date(now);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function monthAdd(month, amount) {
  const [year, number] = month.split("-").map(Number);
  const months = year * 12 + (number - 1) + amount;
  return `${Math.floor(months / 12)}-${pad((((months % 12) + 12) % 12) + 1)}`;
}

/** Recurrence rule: inside start..end, on one of `weekdays` (0 = Sunday) and one of
 * `occurrences` when those are set. */
export function occursOn(event, day) {
  const weekday = new Date(dayTime(day)).getUTCDay();
  return (
    day >= event.start &&
    day <= event.end &&
    (!event.weekdays || event.weekdays.includes(weekday)) &&
    (!event.occurrences || event.occurrences.includes(day))
  );
}

/** The 42 cells of a month grid, Sunday first. */
export function monthGrid(calendar, month, todayDay) {
  const first = dayTime(`${month}-01`);
  const start = first - new Date(first).getUTCDay() * DAY_MS;
  return Array.from({ length: 42 }, (_, index) => {
    const date = toDay(start + index * DAY_MS);
    return {
      date,
      day: Number(date.slice(8)),
      outside: date.slice(0, 7) !== month,
      today: date === todayDay,
      events: calendar.events.filter((event) => occursOn(event, date)),
    };
  });
}

/** Events on `day`, or overlapping `month` when no day is selected. */
export function eventsOf(calendar, month, day) {
  if (day) return calendar.events.filter((event) => occursOn(event, day));
  const first = `${month}-01`;
  const last = toDay(dayTime(`${monthAdd(month, 1)}-01`) - DAY_MS);
  return calendar.events.filter((event) => event.start <= last && event.end >= first);
}

/** Status of the featured event's countdown and the time left until it begins. */
export function countdown(spec, now = Date.now()) {
  const begins = Date.parse(spec.begins);
  const ends = Date.parse(spec.ends);
  const left = Math.max(0, Math.floor((begins - now) / 1000));
  const status = now >= ends ? "ended" : now >= begins ? "ongoing" : "upcoming";
  return {
    status,
    days: Math.floor(left / 86_400),
    hours: Math.floor(left / 3_600) % 24,
    minutes: Math.floor(left / 60) % 60,
  };
}

/** Whole seconds since an RFC 3339 time, at least 0; null for a missing or invalid time. */
export function age(time, now = Date.now()) {
  const then = Date.parse(time ?? "");
  return Number.isNaN(then) ? null : Math.max(0, Math.floor((now - then) / 1000));
}
