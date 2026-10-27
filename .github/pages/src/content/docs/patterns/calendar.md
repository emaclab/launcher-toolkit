---
title: Calendar and countdown
description: The starter's month grid, date ranges, recurrence, event details, and clock-driven countdown.
sidebar:
  order: 7
---

**Source:** `pack/app/pages/calendar.js`, `pack/app/dates.js`, `pack/data/calendar.json`, and `pack/data/events.json`. The home page also consumes the featured countdown. These are application conventions, not core schemas.

## Calendar document

`calendar.json` contains `events` and an optional featured `countdown`. This example schedules a Saturday event inside a bounded date range:

```json
{
  "events": [
    {
      "id": "weekly-cup",
      "name": {"pt": "Copa semanal", "en": "Weekly cup", "es": "Copa semanal"},
      "start": "2026-10-24",
      "end": "2026-12-26",
      "color": "#f0b74a",
      "weekdays": [6],
      "occurrences": null,
      "schedule": {"pt": "Sábados, 20h", "en": "Saturdays, 8 PM", "es": "Sábados, 20 h"}
    }
  ],
  "countdown": {
    "begins": "2026-10-29T13:00:00Z",
    "ends": "2026-11-05T13:00:00Z"
  }
}
```

Use `YYYY-MM-DD` for days, `YYYY-MM` for months, and timezone-qualified timestamps for the countdown. Store detail content and external destinations in `events.json`, using the same event ID for lookup by the dialog.

## Recurrence rules

`occursOn(event, day)` requires all applicable conditions:

1. `day` is between `start` and `end`, inclusive;
2. if `weekdays` is set, it contains the day's weekday (`0` Sunday through `6` Saturday);
3. if `occurrences` is set, it contains the exact date.

`null` means no restriction for that field. An empty array means there are no matching days. When both lists are set, they intersect: neither overrides the other. A range with both lists `null` occurs every day in the range.

`monthGrid` returns 42 cells, starting on Sunday, including adjacent-month dates. Date arithmetic uses UTC to avoid timezone shifts; the highlighted “today” is the player's local date. With a selected day, `eventsOf` returns occurrences for that day. Without one, it lists event ranges overlapping the month, rather than proving an occurrence in every range.

## Details and navigation

The calendar page owns the displayed month, selected date, event list, and event dialog. The application-level `navigate` helper can open the calendar with a selected event. Stable IDs keep that lookup connected to the detail document.

The event dialog uses the shared `Modal`: focus moves inside, Tab stays within it, Escape closes, and focus returns to the opener. External links go through the app's `openLink` helper and therefore `launcher.openUrl`.

## Featured countdown

`countdown(spec, now)` returns:

| Moment | Status | Remaining time |
| --- | --- | --- |
| Before `begins` | `upcoming` | Whole days, hours, and minutes until `begins` |
| From `begins` until `ends` | `ongoing` | Zero |
| At or after `ends` | `ended` | Zero |

The `Countdown` component refreshes with `useNow(30_000)`. Keep `ends` later than `begins`. Event dates and countdown timestamps are separate: changing a calendar range does not automatically change the featured timer.

## Review with the simulator

Open `launcher-toolkit dev` and use Pack Studio's clock controls to inspect before the start, during the event, and after its end. Advancing time fires due timers; moving the clock backward changes `Date` without rewinding timers. Reload when you need a fresh timer schedule.

Also inspect a month boundary, a weekly recurrence, an explicit occurrence list, a day with no events, multiple events on one day, and a long localized detail. Run `check` and `build` after changing either data document.
