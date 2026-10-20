---
title: countdown
description: Re-render the window on a timer so now, today, countdown() and age() stay current; build event clocks and live data ages.
sidebar:
  order: 19
---

`countdown` keeps time-dependent output fresh. Templates read the time from `now` and `today`, which only change when the core renders. While at least one `countdown` element exists, the core re-renders periodically, which updates every `countdown()`, `age()`, and `today` result on the page, not only the widget's own text.

| | |
| --- | --- |
| Core API | 1 |
| Element | Any element; usually the one that shows the time |
| Reads | `data-refresh` |
| Writes | Nothing |
| Keyboard | None |

## Attributes

| Attribute | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `data-refresh` | int ms | no | `30000` | Re-render period; values below `1000` count as `1000`. |

## Behaviour

- The first refresh is scheduled when the first `countdown` element appears; later refreshes use the **shortest** `data-refresh` among all countdown elements on the page.
- Removing the last countdown element stops the timer.
- The splash re-renders only for countdown refreshes, so a countdown there also works.

## The `countdown()` function

`countdown(begins, ends)` takes two RFC 3339 times and returns `{ status, days, hours, minutes }` computed against `now`:

| `status` | When | `days`, `hours`, `minutes` |
| --- | --- | --- |
| `upcoming` | `now` < `begins` | Time left until `begins` |
| `ongoing` | `begins` ≤ `now` < `ends` | 0 |
| `ended` | `now` ≥ `ends` | 0 |

An invalid time is a render error. The usual source is the optional `countdown` object of the fixed-schema `calendar` data document: `{ "begins": "…", "ends": "…" }`.

## Example: event clock

```json title="data/calendar.json (excerpt)"
"countdown": { "begins": "2026-11-15T12:00:00Z", "ends": "2026-11-22T12:00:00Z" }
```

```html title="templates/pages/home.html"
{%- if data.calendar.countdown %}
{%- set clock = countdown(data.calendar.countdown.begins, data.calendar.countdown.ends) %}
<span class="event-clock" data-widget="countdown" data-refresh="30000">
  {%- if clock.status == "upcoming" %}{{ t("startsIn") }} {{ clock.days }}d {{ clock.hours }}h {{ clock.minutes }}m
  {%- else %}{{ t("countdown." ~ clock.status) }}{% endif -%}
</span>
{%- endif %}
```

```json title="i18n/en.json (strings)"
"startsIn": "Starts in",
"countdown.ongoing": "Happening now",
"countdown.ended": "Ended"
```

Minutes are the smallest unit, so a 30-second refresh is enough.

## Example: data age with `age()`

`age(ts)` (API 2) returns whole seconds since an RFC 3339 time. Put the countdown on a container so the age advances between feed updates:

```html title="templates/pages/servers.html"
{%- set updated = age(data.servers.updated_at) %}
<div class="servers" data-widget="countdown" data-refresh="30000">
  {%- if updated is none %}
  <p class="notice" data-key="notice-unknown">{{ t("statusUnknown") }}</p>
  {%- elif updated > 600 %}
  <p class="notice" data-key="notice-stale">{{ t("statusStale") }}</p>
  {%- endif %}
  …
</div>
```

See [Server status](../../examples/server-status/) for the complete page.

## Testing

`launcher-toolkit`'s **Time** control overrides `now` and `today`, so you can check `upcoming`, `ongoing`, and `ended` without waiting.

## Pitfalls

- The widget does not compute anything; without the `countdown()` or `age()` call the element only causes re-renders.
- A short `data-refresh` re-renders the whole window that often. Match it to the smallest unit you display.

