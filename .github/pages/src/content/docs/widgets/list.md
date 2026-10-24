---
title: list
description: Arrow-key focus movement through rows or grid cells, for selectable lists, accordions, and calendar grids.
sidebar:
  order: 10
---

`list` adds arrow-key navigation to a container of buttons. It moves focus only; selection, read marks, and any other effect come from each row's own `data-on-click`, which Enter and Space run.

| | |
| --- | --- |
| Core API | 1 |
| Element | The direct container of the rows (not of the pagination) |
| Reads | `data-columns` |
| Writes | Nothing |
| Keyboard | ↑/↓ (or arrows in a grid), Home, End |

## Attributes

| Attribute | Type | Required | Meaning |
| --- | --- | --- | --- |
| `data-columns` | int ≥ 1 | no | Grid width. Without it the list is one column. |

## Behaviour

With focus on or inside one of the list's focusable, enabled descendants:

| Key | Without `data-columns` | With `data-columns="N"` |
| --- | --- | --- |
| ↓ / ↑ | next / previous item | N items forward / back |
| → / ← | not handled | next / previous item |
| Home / End | first / last item | first / last item |

Movement is clamped at both ends (no wrapping). Items are all focusable, enabled elements inside the list in DOM order, at any depth. The handled keys are consumed even when the list is empty.

## Example: selectable news rows

```json title="pack.json (state)"
"article": { "type": "string", "default": "" },
"read":    { "type": "set",    "default": [], "persist": true }
```

```html title="templates/pages/news.html"
{%- set selected = data.news|selectattr("id", "eq", state.article)|first or data.news|first %}
<div class="news-list" data-widget="list">
  {%- for item in data.news %}
  {%- set on = item.id == selected.id %}
  <button class="{{ 'news-row selected' if on else 'news-row' }}" aria-pressed="{{ on }}" data-key="{{ item.id }}"
          data-on-click="set('article', {{ item.id|arg }}); set('read', {{ item.id|arg }}, true)">
    <strong>{{ item.title|loc }}</strong>
    <time datetime="{{ item.date }}">{{ item.date|date("short") }}</time>
    {%- if item.id not in state.read %}<span class="unread-dot" aria-label="{{ t('unread') }}"></span>{% endif %}
  </button>
  {%- else %}
  <p class="empty" data-key="empty">{{ t("noNews") }}</p>
  {%- endfor %}
</div>
```

`data-key="{{ item.id }}"` keeps each row's node when the list is filtered or reordered, so focus stays on the same article.

## Example: a 7-column calendar grid

```html title="templates/pages/calendar.html"
{%- set month = state.cal_month or today[:7] %}
<div class="calendar-grid" data-widget="list" data-columns="7">
  {%- for cell in calendar_days(month) %}
  <button class="{{ 'day outside' if cell.outside else 'day' }}{{ ' today' if cell.today }}"
          aria-label="{{ cell.date|date('long') }}" aria-pressed="{{ cell.date == state.cal_day }}"
          data-on-click="set('cal_day', {{ cell.date|arg }})">{{ cell.day }}</button>
  {%- endfor %}
</div>
```

↑ and ↓ move one week; ← and → move one day. See [Event calendar](../../examples/event-calendar/).

## Placement with pagination

Put `data-widget="list"` on the **rows' container only**, not on an element that also holds the [`pagination`](../pagination/) buttons. Otherwise Home, End, and the arrows would also move into the page buttons:

```html
<div class="release-side">
  <div class="release-list" data-widget="list">…rows…</div>
  <div class="pagination" data-widget="pagination" data-state="releases_page" data-pages="{{ pages }}">…</div>
</div>
```

## Accessibility

- Rows are `<button>` elements; mark the selected one with `aria-pressed` (or `aria-current` for navigation).
- Give unread dots and icons an `aria-label`.
- The list itself is not a Tab stop; Tab enters at the first row in DOM order and leaves after the last. Long lists stay quick to cross because arrows, Home, and End move within them.

## Pitfalls

- Non-focusable rows (`<div data-on-click>`) are skipped by the arrows and cannot be activated by keyboard.
- A list nested in another list: the inner one handles the keys while focus is inside it.
- Without `data-columns`, ← and → fall through to outer widgets or `data-on-key-*` handlers.

