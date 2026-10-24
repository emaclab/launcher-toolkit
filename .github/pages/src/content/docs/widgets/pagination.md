---
title: pagination
description: Keep a page number inside 1..pages after every render and step it with the arrow keys; the template slices the data.
sidebar:
  order: 16
---

`pagination` guards an `int` page number. After every render it clamps the state into `[1, data-pages]`, for example after a feed shrinks a list, and with focus inside it ← and → change the page. The template computes the page count, slices the data, and renders the buttons.

| | |
| --- | --- |
| Core API | 1 |
| Element | The container of the previous/next buttons and the page label |
| Reads | `data-state`, `data-pages` |
| Writes | `data-state` |
| Keyboard | ←/→ with focus inside |

## Attributes

| Attribute | Type | Required | Meaning |
| --- | --- | --- | --- |
| `data-state` | `int` state name | yes | The current page, starting at 1. |
| `data-pages` | int ≥ 1 | yes | The number of pages; a missing or smaller value counts as 1. |

## Behaviour

- After every render, if the state is outside `[1, data-pages]`, the widget writes the clamped value, which triggers one more render.
- With focus inside the element, **←** writes `page − 1` and **→** writes `page + 1`, clamped. The keys are consumed even at the ends.
- Buttons inside run their own handlers on click, Enter, and Space.

## State

```json title="pack.json (state)"
"releases_page": { "type": "int", "default": 1, "min": 1, "reset": "page" }
```

## Example

```html title="templates/pages/updates.html"
{%- set releases = data.releases.releases %}
{%- set per_page = 4 %}
{%- set pages = [(releases|length + per_page - 1) // per_page, 1]|max %}
{#- Clamp here too: this render runs before the widget corrects the state. #}
{%- set current = [state.releases_page, pages]|min %}
<div class="release-list" data-widget="list">
  {%- for item in releases[(current - 1) * per_page:current * per_page] %}
  <button class="release-row" data-key="release-{{ item.version }}" data-on-click="set('release', {{ item.version|arg }})">
    {{ t("version") }} {{ item.version }}
  </button>
  {%- endfor %}
</div>
<div class="pagination" data-widget="pagination" data-state="releases_page" data-pages="{{ pages }}">
  <button class="page-arrow"{% if current <= 1 %} disabled{% endif %} aria-label="{{ t('previousPage') }}"
          data-on-click="set('releases_page', {{ [current - 1, 1]|max|arg }})">‹</button>
  <span>{{ current }} / {{ pages }}</span>
  <button class="page-arrow"{% if current >= pages %} disabled{% endif %} aria-label="{{ t('nextPage') }}"
          data-on-click="set('releases_page', {{ [current + 1, pages]|min|arg }})">›</button>
</div>
```

```json title="i18n/en.json (strings)"
"version": "Version",
"previousPage": "Previous page",
"nextPage": "Next page"
```

A list with one page renders both arrows disabled and the label `1 / 1`.

## Accessibility

- Give the arrow buttons `aria-label`s; the glyphs are not words.
- The ←/→ keys work only while focus is on one of the widget's buttons, so at least one arrow must be enabled to reach them; with a single page there is nothing to step anyway.

## Pitfalls

- Keep the list's `data-widget="list"` on a separate container: see [list placement](../list/#placement-with-pagination).
- Declare the state as `int` with `min: 1`; a `string` or `float` makes every widget write fail.
- The state is per variable, not per list. Two paginated lists need two variables.

