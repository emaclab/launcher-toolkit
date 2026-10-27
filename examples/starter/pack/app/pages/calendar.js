// Events calendar over data/calendar.json: a month grid with recurring events, the events of
// the month or of the selected day, and a dialog per event with its description from
// data/events.json and, for the featured event, the countdown.
import { html, useState } from "../../vendor/preact.js";
import { eventsOf, monthAdd, monthGrid, today } from "../dates.js";
import { Countdown, List, Markdown, Modal, useApp } from "../ui.js";

function When({ event, style }) {
  const { loc, date } = useApp().i18n;
  if (event.schedule) return loc(event.schedule);
  if (event.start === event.end) return date(event.start, style);
  return `${date(event.start, style)} – ${date(event.end, style)}`;
}

export function EventDialog({ id, onClose }) {
  const { i18n, data, openLink } = useApp();
  const { t, loc } = i18n;
  const active = data.calendar.events.find((event) => event.id === id);
  if (!active) return null;
  const info = data.events.details[active.id];
  return html`
    <${Modal} onClose=${onClose} returnFocus="#calendar-today">
      <div class="dialog event-dialog" role="dialog" aria-modal="true" aria-labelledby="event-title">
        <div class="dialog-heading">
          <span class="event-color" style=${`background:${active.color}`}></span>
          <h2 id="event-title">${loc(active.name)}</h2>
          <button class="dialog-close" aria-label=${t("close")} autofocus onClick=${onClose}>×</button>
        </div>
        <p class="event-when"><${When} event=${active} style="long" /></p>
        ${active.id === data.events.featured &&
        data.calendar.countdown &&
        html`<p class="event-clock"><${Countdown} prefix /></p>`}
        ${info && html`<${Markdown} className="dialog-body" source=${loc(info.description)} />`}
        ${info?.url &&
        html`
          <div class="dialog-actions">
            <button class="dialog-button" onClick=${() => openLink(info.url)}>${t("eventPage")} ↗</button>
          </div>`}
      </div>
    <//>`;
}

export function Calendar() {
  const { i18n, data, openDialog } = useApp();
  const { t, loc, date, weekdays } = i18n;
  // "" is the current month and the whole month.
  const [monthState, setMonth] = useState("");
  const [day, setDay] = useState("");
  const now = today();
  const month = monthState || now.slice(0, 7);
  const events = eventsOf(data.calendar, month, day);
  const featured = data.calendar.events.find((event) => event.id === data.events.featured);
  const go = (next) => {
    setMonth(next);
    setDay("");
  };
  return html`
    <div class="calendar">
      <div class="calendar-main">
        <div class="calendar-toolbar">
          <h1>${date(month, "month_year")}</h1>
          <div class="calendar-buttons">
            <button class="icon-button" aria-label=${t("previousMonth")} onClick=${() => go(monthAdd(month, -1))}>‹</button>
            <button id="calendar-today" class="secondary-button" onClick=${() => go("")}>${t("today")}</button>
            <button class="icon-button" aria-label=${t("nextMonth")} onClick=${() => go(monthAdd(month, 1))}>›</button>
          </div>
        </div>
        <div class="weekdays">${weekdays.map((name) => html`<span>${name}</span>`)}</div>
        <${List} className="calendar-grid" columns=${7}>
          ${monthGrid(data.calendar, month, now).map((cell) => {
            const classes = `calendar-day${cell.outside ? " outside" : ""}${cell.today ? " today" : ""}${cell.date === day ? " selected" : ""}`;
            return html`
              <button
                class=${classes}
                aria-label=${`${date(cell.date, "long")}: ${cell.events.length} ${t("eventsCount")}`}
                aria-pressed=${cell.date === day}
                onClick=${() => setDay(cell.date)}
              >
                <span class="day-number">${cell.day}</span>
                ${cell.events.slice(0, 2).map((event) => html`<span class="day-event" style=${`border-color:${event.color}`}>${loc(event.name)}</span>`)}
                ${cell.events.length > 2 && html`<span class="day-more">+${cell.events.length - 2}</span>`}
              </button>`;
          })}
        <//>
      </div>
      <aside class="events-panel">
        ${featured &&
        data.calendar.countdown &&
        html`
          <button class="featured-event" onClick=${() => openDialog({ type: "event", id: featured.id })}>
            <span class="quick-label">${t("nextEvent")}</span>
            <strong>${loc(featured.name)}</strong>
            <span class="quick-value"><${Countdown} prefix /></span>
          </button>`}
        <div class="events-heading">
          <h2>${day ? date(day, "long") : t("monthEvents")}</h2>
          ${day && html`<button class="text-button" onClick=${() => setDay("")}>${t("allEvents")}</button>`}
        </div>
        <${List} className="event-list">
          ${events.map(
            (event) => html`
              <button class="event-row" key=${`event-${event.id}`} onClick=${() => openDialog({ type: "event", id: event.id })}>
                <i class="event-color" style=${`background:${event.color}`}></i>
                <span>
                  <strong>${loc(event.name)}</strong>
                  <small><${When} event=${event} style="short" /></small>
                </span>
              </button>`,
          )}
          ${events.length === 0 && html`<p class="empty" key="no-events">${t("noEvents")}</p>`}
        <//>
      </aside>
    </div>`;
}
