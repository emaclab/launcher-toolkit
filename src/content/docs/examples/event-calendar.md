---
title: Event calendar
description: A month calendar with recurring events, a keyboard grid, a filtered event list, and an event dialog with countdown, Markdown, and an external link.
sidebar:
  order: 6
---

A complete calendar page. The month grid and the event list come from template functions over the fixed-schema `calendar` document; selecting an event opens a dialog.

**Uses:** `calendar_days()`, `calendar_events()`, `month_add()`, `countdown()`, [`list`](../../widgets/list/) with `data-columns`, [`modal`](../../widgets/modal/), [`countdown`](../../widgets/countdown/), [`markdown`](../../widgets/markdown/), `open_url()`. **Core API:** 2 (for `markdown`).

## Declarations

```json title="pack.json"
"core_api": 2,
"game": {
  "allowed_hosts": ["example.com"]
},
"pages": ["home", "calendar"],
"data": ["calendar", "events"],
"state": {
  "cal_month": { "type": "string", "default": "", "reset": "page" },
  "cal_day":   { "type": "string", "default": "", "reset": "page" },
  "event":     { "type": "string", "default": "", "reset": "page" }
}
```

`cal_month: ""` means the current month and `cal_day: ""` the whole month; the template resolves both. `allowed_hosts` must cover the event links.

## Data

```json title="data/calendar.json (fixed schema)"
{
  "events": [
    { "id": "launch-week", "name": { "en": "Launch week" }, "start": "2026-11-15", "end": "2026-11-21",
      "color": "#4f8cff", "weekdays": null, "occurrences": null },
    { "id": "weekly-cup", "name": { "en": "Weekly cup" }, "start": "2026-10-01", "end": "2026-12-31",
      "color": "#ff8c24", "weekdays": [6], "occurrences": null, "schedule": { "en": "Every Saturday" } },
    { "id": "maintenance", "name": { "en": "Maintenance" }, "start": "2026-11-03", "end": "2026-11-03",
      "color": "#ef5b6b", "weekdays": null, "occurrences": null }
  ],
  "countdown": { "begins": "2026-11-15T12:00:00Z", "ends": "2026-11-22T12:00:00Z" }
}
```

An event occurs on a day when the day is between `start` and `end` (inclusive), its weekday is in `weekdays` (Sunday = 0) when set, and it is in `occurrences` when set. The schema is fixed, so extra text lives in a second, free-form document:

```json title="data/events.json"
{
  "featured": "launch-week",
  "details": {
    "launch-week": {
      "description": { "en": "Seven days of daily challenges and **double experience**." },
      "url": "https://example.com/events/launch-week"
    },
    "weekly-cup": {
      "description": { "en": "An open tournament for teams of three." }
    }
  }
}
```

## Template

```html title="templates/pages/calendar.html"
{%- set month = state.cal_month or today[:7] -%}
{%- set events = calendar_events(month, state.cal_day) -%}
<div class="calendar">
  <div class="calendar-main">
    <div class="calendar-toolbar">
      <h1>{{ month|date("month_year") }}</h1>
      <button class="icon-button" aria-label="{{ t('previousMonth') }}"
              data-on-click="set('cal_month', {{ month_add(month, -1)|arg }}); set('cal_day', '')">‹</button>
      <button id="calendar-today" class="secondary-button" data-on-click="set('cal_month', ''); set('cal_day', '')">{{ t("today") }}</button>
      <button class="icon-button" aria-label="{{ t('nextMonth') }}"
              data-on-click="set('cal_month', {{ month_add(month, 1)|arg }}); set('cal_day', '')">›</button>
    </div>
    <div class="weekdays">
      {%- for day in i18n.weekdays_short %}<span>{{ day }}</span>{% endfor %}
    </div>
    <div class="calendar-grid" data-widget="list" data-columns="7">
      {%- for cell in calendar_days(month) %}
      <button class="calendar-day{{ ' outside' if cell.outside }}{{ ' today' if cell.today }}{{ ' selected' if cell.date == state.cal_day }}"
              aria-label="{{ cell.date|date('long') }}: {{ cell.events|length }} {{ t('eventsCount') }}"
              aria-pressed="{{ cell.date == state.cal_day }}" data-on-click="set('cal_day', {{ cell.date|arg }})">
        <span class="day-number">{{ cell.day }}</span>
        {%- for event in cell.events[:2] %}
        <span class="day-event" style="border-color:{{ event.color }}">{{ event.name|loc }}</span>
        {%- endfor %}
        {%- if cell.events|length > 2 %}<span class="day-more">+{{ cell.events|length - 2 }}</span>{% endif %}
      </button>
      {%- endfor %}
    </div>
  </div>
  <aside class="events-panel">
    <h2>{{ state.cal_day|date("long") if state.cal_day else t("monthEvents") }}</h2>
    {%- if state.cal_day %}
    <button class="text-button" data-key="all-events" data-on-click="set('cal_day', '')">{{ t("allEvents") }}</button>
    {%- endif %}
    <div class="event-list" data-widget="list">
      {%- for event in events %}
      <button class="event-row" data-key="event-{{ event.id }}" data-on-click="set('event', {{ event.id|arg }})">
        <i class="event-color" style="background:{{ event.color }}"></i>
        <strong>{{ event.name|loc }}</strong>
        <small>
          {%- if event.schedule %}{{ event.schedule|loc }}
          {%- elif event.start == event.end %}{{ event.start|date("short") }}
          {%- else %}{{ event.start|date("short") }} – {{ event.end|date("short") }}{% endif -%}
        </small>
      </button>
      {%- else %}
      <p class="empty" data-key="no-events">{{ t("noEvents") }}</p>
      {%- endfor %}
    </div>
  </aside>
  {%- set active = data.calendar.events|selectattr("id", "eq", state.event)|first if state.event else none %}
  {%- if active %}
  {%- set info = data.events.details[active.id] if active.id in data.events.details else none %}
  <div class="overlay" data-key="event-{{ active.id }}" data-widget="modal" data-on-close="set('event', '')" data-return-focus="#calendar-today">
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="event-title">
      <div class="dialog-heading">
        <span class="event-color" style="background:{{ active.color }}"></span>
        <h2 id="event-title">{{ active.name|loc }}</h2>
        <button class="dialog-close" aria-label="{{ t('close') }}" autofocus data-on-click="set('event', '')">×</button>
      </div>
      <p class="event-when">
        {%- if active.schedule %}{{ active.schedule|loc }}
        {%- elif active.start == active.end %}{{ active.start|date("long") }}
        {%- else %}{{ active.start|date("long") }} – {{ active.end|date("long") }}{% endif -%}
      </p>
      {%- if active.id == data.events.featured and data.calendar.countdown %}
      {%- set clock = countdown(data.calendar.countdown.begins, data.calendar.countdown.ends) %}
      <p class="event-clock" data-widget="countdown" data-refresh="30000">
        {%- if clock.status == "upcoming" %}{{ t("startsIn") }} {{ clock.days }}d {{ clock.hours }}h {{ clock.minutes }}m
        {%- else %}{{ t("countdown." ~ clock.status) }}{% endif -%}
      </p>
      {%- endif %}
      {%- if info %}
      <div class="dialog-body" data-widget="markdown" data-source="{{ info.description|loc }}"></div>
      {%- endif %}
      {%- if info and info.url %}
      <button class="dialog-button" data-on-click="open_url({{ info.url|arg }})">{{ t("eventPage") }} ↗</button>
      {%- endif %}
    </div>
  </div>
  {%- endif %}
</div>
```

## Translations

```json title="i18n/en.json (strings)"
"previousMonth": "Previous month",
"nextMonth": "Next month",
"today": "Today",
"eventsCount": "events",
"monthEvents": "Events this month",
"allEvents": "All events",
"noEvents": "No events in this period.",
"close": "Close",
"startsIn": "Starts in",
"countdown.ongoing": "Happening now",
"countdown.ended": "Ended",
"eventPage": "Event page"
```

Month and weekday names come from the language file's `months` and `weekdays_short`, and `date("month_year")` uses its `date_formats`.

## Styles

```css title="styles (structural rules)"
.calendar { display: flex; flex: 1; min-height: 0; }
.calendar-main { flex: 1; min-width: 0; }
.weekdays, .calendar-grid { display: flex; flex-wrap: wrap; }
.weekdays span, .calendar-day { width: 14.2857%; }
.calendar-day { display: flex; flex-direction: column; height: 62px; overflow: hidden; }
.calendar-day.outside { opacity: 0.45; }
.calendar-day.today .day-number { color: var(--accent); }
.calendar-day[aria-pressed="true"] { border-color: var(--accent); }
.day-event { border-left: 3px solid; font-size: 11px; white-space: nowrap; overflow: hidden; }
.events-panel { width: 280px; margin-left: 20px; overflow-y: auto; }
.event-color { display: inline-block; width: 10px; height: 10px; border-radius: 5px; }
.app { position: relative; }
.overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 50;
           display: flex; align-items: center; justify-content: center; background: rgba(5, 8, 12, 0.72); }
.dialog { width: 480px; max-height: 460px; overflow-y: auto; }
```

The overlay is absolutely positioned against the nearest positioned ancestor. Leave `.calendar` and the page containers unpositioned so that ancestor is `.app` and the backdrop covers the whole window, title bar included.

## How it behaves

- **Month navigation.** `month_add()` computes the previous and next month; both buttons also clear the day filter. **Today** clears both variables, which returns to the current month.
- **Grid.** `calendar_days()` always returns 42 cells, Sunday first, with `outside`, `today`, and the day's events after recurrence. With `data-columns="7"`, ←/→ move one day and ↑/↓ one week. Enter or Space selects the day.
- **Event list.** `calendar_events(month, state.cal_day)` lists the month's events, or one day's when a day is selected.
- **Dialog.** Selecting an event writes `event`; the modal appears keyed by the event id, focuses the close button, traps Tab, and closes on Escape, a backdrop click, or ×. Focus returns to the event row that opened it; if that row is gone, to **Today**.
- **Countdown.** Only the featured event shows the clock; the `countdown` widget refreshes it every 30 s while the dialog is open.
- **Links.** The event page button uses `open_url`; the URL's host must be in `allowed_hosts`.
- **Time.** `today` is the local date. Use Studio's **Time** control to view other months and countdown states.

