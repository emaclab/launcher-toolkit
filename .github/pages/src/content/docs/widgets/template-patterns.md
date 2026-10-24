---
title: Template patterns
description: Launcher UI built from markup, state, actions, and functions without a dedicated widget - window controls, navigation, progress, settings controls, badges, search, accordion, and more.
sidebar:
  order: 30
---

Where one action or one function is enough, the core offers no widget. These patterns are the supported way to build the remaining launcher UI. Each one lists the state it needs and the API level of anything beyond API 1.

## Window controls

Windows are borderless, so the pack draws its own title bar.

```html
<header class="titlebar">
  <div class="titlebar-drag" data-on-mousedown="drag()">
    <span class="titlebar-name">{{ game.name }}</span>
  </div>
  <button class="window-button" aria-label="{{ t('minimize') }}" data-on-click="minimize()">–</button>
  <button class="window-button window-close" aria-label="{{ t('close') }}" data-on-click="close()">×</button>
</header>
```

- `drag()` is valid only in `data-on-mousedown`. Put the title text **inside** the drag element: a pointer-down on a sibling that overlaps the drag area does not reach it.
- Window buttons are siblings of the drag element, so pressing them never starts a move.
- With a non-rectangular window, match `window.json` `polygon` and the root's `clip-path`; see [windows](../../reference/windows/).

## Page navigation

```html
<nav class="nav" aria-label="{{ game.name }}">
  {%- for item in ["home", "news", "settings"] %}
  <button class="{{ 'nav-item active' if page == item else 'nav-item' }}"
    {%- if page == item %} aria-current="page"{% endif %} data-on-click="navigate({{ item|arg }})">{{ t(item) }}</button>
  {%- endfor %}
</nav>
<section class="page" data-key="page-{{ page }}">
  {% include "pages/" ~ page ~ ".html" %}
</section>
```

- `navigate()` accepts only names in `pack.json` `pages`; a handler naming another page is rejected as a whole.
- Every `reset: "page"` variable returns to its default when the page changes.
- Keying the page section by `page` gives each page a fresh subtree (and restarts its enter animations).
- Expose the page on the root (`data-page="{{ page }}"`) to style page-specific layout without `:has()`.

## Language selector

A [`dropdown`](../dropdown/#example-language-menu) holds a menu built from `languages`, or a segmented control shows every language at once:

```html
<div class="segmented" role="group" aria-label="{{ t('language') }}">
  {%- for l in languages %}
  <button class="{{ 'segment on' if l.code == lang else 'segment' }}" aria-pressed="{{ l.code == lang }}"
          data-on-click="set_language({{ l.code|arg }})">{{ l.code|upper }}</button>
  {%- endfor %}
</div>
```

`set_language` validates and saves the choice. Put `lang="{{ lang }}"` on the root of both templates and style languages with `[lang="pt"]`: `:lang()` never matches in this renderer.

## Progress bar

Core API 3 distinguishes an active check from a failed one:

```html
{%- set phase = launcher.phase %}
{%- set failed = launcher.check_failed %}
{%- set busy = phase in ["checking", "verifying", "launching"] and not failed %}
{%- set label = t("checkFailed") if failed else t("phase." ~ phase) %}
<div class="progress" role="progressbar" aria-label="{{ label }}" aria-valuemin="0" aria-valuemax="100"
  {%- if not busy %} aria-valuenow="{{ launcher.progress|int }}"{% endif %}>
  {%- if busy %}<i class="progress-runner"></i>{% else %}<span style="width:{{ launcher.progress|num }}%"></span>{% endif -%}
</div>
```

- `launcher.progress` is a float from 0 to 100; write it into CSS with `|num`.
- Use a different element for the indeterminate state so its animation does not remain on the progress bar when the phase changes.
- Translate every phase key your pack can see: the eight core API 3 phases (`phase.checking` … `phase.launch_failed`), plus `checkFailed` for a failed check. Studio's render check visits every phase and `checking` with `launcher.check_failed: true`.

## Launcher actions by phase

Core API 3:

```html
{%- set phase = launcher.phase %}
{%- set failed = launcher.check_failed %}
{%- set retry = failed or phase in ["blocked", "launch_failed"] or (phase == "ready" and anticheat.status == "error") %}
{%- if phase == "blocked" %}
<button id="close-programs" data-on-click="set('confirm', 'force_close')">{{ t("closePrograms") }}</button>
{%- elif phase == "ready" %}
<button data-key="check" data-on-click="check()">{{ t("checkUpdates") }}</button>
{%- endif %}
{%- if failed or phase in ["ready", "launch_failed"] %}
<button data-key="repair" data-on-click="repair()">{{ t("repair") }}</button>
{%- endif %}
{%- if retry %}
<button id="play" class="play" data-on-click="retry()">{{ t("retry") }}</button>
{%- else %}
<button id="play" class="play"{% if phase != "ready" or anticheat.status != "ready" %} disabled{% endif %} data-on-click="play()">{{ t("play") }}</button>
{%- endif %}
```

The core refuses actions that do not fit the phase, but disabling or hiding them tells the player what is possible. The transitions are listed in [actions](../../reference/actions/#launcher-actions). Closing programs asks first through a [`modal`](../modal/#example-confirm-before-closing-programs). A failed check stays in `checking` with `launcher.check_failed: true`; only then does that phase accept `retry()` and `repair()`. In `ready`, an anti-cheat error offers **Retry**, while **Play** needs both the phase and anti-cheat status to be `ready`.

`pause()`, `resume()`, and `cancel()` do not exist in core API 3; in older packs they do nothing.

## Download size, speed, and time left

API 2. In Pack Studio and in a launcher without a configured game update, the size comes from `game.download_size`.

```html
{%- set left = duration(launcher.eta) %}
{%- if launcher.phase in ["downloading", "blocked"] and launcher.total is not none %}
<span>{{ bytes(launcher.downloaded) }} / {{ bytes(launcher.total) }}</span>
{%- endif %}
{%- if launcher.phase == "downloading" and launcher.speed is not none %}
<span>{{ bytes(launcher.speed) }}/s</span>
{%- endif %}
{%- if launcher.phase == "downloading" and left %}
<span>{{ t("timeLeft") }} {{ left.hours }}h {{ left.minutes }}m {{ left.seconds }}s</span>
{%- endif %}
```

`speed` is none until the second one-second sample and 0 while `blocked`; `eta` is none while `blocked`. A `core_api` 2 pack sees `blocked` as `downloading`, with the same values. Set `decimal_separator` in a language file to print `1,5 GB`.

## Blocking processes

API 3. While `blocked`, `launcher.blocked.processes` lists the programs that hold game files:

```html
{%- if launcher.phase == "blocked" %}
<ul class="process-list" aria-label="{{ t('filesInUse') }}">
  {%- for process in launcher.blocked.processes %}
  <li data-key="process-{{ process.pid }}">{{ process.name }} ({{ process.pid }})</li>
  {%- endfor %}
</ul>
{%- endif %}
```

Offer `retry()` after the player closes them, and `force_close()` behind a confirmation.

## Anti-cheat status

API 2. `anticheat.status` is `checking`, `updating`, `ready`, `unavailable`, or `error`. `anticheat.simulated` is `true` only while Pack Studio simulates the status.

```html
<span class="protection-dot" data-status="{{ anticheat.status }}"></span>
<strong>{{ t("anticheat." ~ anticheat.status) }}</strong>
{%- if anticheat.simulated %}<small>{{ t("anticheatSimulated") }}</small>{% endif %}
```

```css
.protection-dot[data-status="ready"] { background: var(--ready); }
.protection-dot[data-status="unavailable"], .protection-dot[data-status="error"] { background: var(--danger); }
```

Translate all five statuses; test each one with Studio's **Anti-cheat** control. API 3 adds `anticheat.message`, the last anti-cheat error:

```html
{%- if anticheat.message %}
<div class="ac-message" role="alert" data-key="ac-message">
  <strong>{{ anticheat.message.title }}</strong>
  <p>{{ anticheat.message.message }}</p>
</div>
{%- endif %}
```

An accepted `retry()` clears it. The [launch bar example](../../examples/launch-bar/) combines these patterns and adds a [`tooltip`](../tooltip/#example-status-with-an-explanation).

## Settings controls

A setting is a declared state variable with `"persist": true`. There is no settings widget. Complete page: [Settings page](../../examples/settings-page/).

| Control | State | Markup |
| --- | --- | --- |
| Switch | `bool` | `<button role="switch" aria-checked="{{ state.motion }}" data-on-click="toggle('motion')">` |
| Select | `string` with `values` + a `bool` menu flag | [`dropdown`](../dropdown/#example-a-select-replacement) with one `role="option"` button per value |
| Stepper | `int` with `min`/`max` | Two buttons writing `state.x ± 1`, disabled at the bounds |
| Folder | `string` without `values` | `pick_folder('name')` (API 2) and a clear button |
| Reset | — | `set('name', null)` for each setting writes its default |

```html
<div class="stepper" role="group" aria-label="{{ t('articleSize') }}">
  <button aria-label="{{ t('smaller') }}"{% if state.article_size <= 12 %} disabled{% endif %}
          data-on-click="set('article_size', {{ (state.article_size - 1)|arg }})">−</button>
  <span>{{ state.article_size }} px</span>
  <button aria-label="{{ t('larger') }}"{% if state.article_size >= 18 %} disabled{% endif %}
          data-on-click="set('article_size', {{ (state.article_size + 1)|arg }})">+</button>
</div>
```

Apply presentation settings through root attributes (`data-accent="{{ state.accent }}"`, `data-density="{{ state.density }}"`) and attribute selectors in CSS. `pick_folder` stores a display-only path: the core never reads, lists, or writes that folder, and the value does not configure a game client.

## Count badge

```html
{%- set unread = data.news|rejectattr("id", "in", state.read)|list|length %}
{%- if unread %}
<span class="badge" aria-label="{{ t('unread') }}: {{ unread }}">{{ unread if unread < 100 else "99+" }}</span>
{%- endif %}
```

No state of its own: it counts the items missing from a persisted `read` set. Render it only when the count is above 0.

## Search and filter

API 2 for `fold`.

```json title="pack.json (state)"
"query":       { "type": "string", "default": "", "reset": "page" },
"news_filter": { "type": "set",    "default": [], "reset": "page" }
```

```html
<input id="news-search" class="search" type="text" value="{{ state.query }}" placeholder="{{ t('searchNews') }}"
       aria-label="{{ t('searchNews') }}" data-on-input="set('query', $value)" data-on-key-escape="set('query', '')">
{%- set q = fold(state.query|trim) %}
<div class="chips" role="group" aria-label="{{ t('filterCategory') }}">
  {%- for category in data.news|map(attribute="category")|unique %}
  {%- set on = category in state.news_filter %}
  <button class="{{ 'chip on' if on else 'chip' }}" aria-pressed="{{ on }}"
          data-on-click="toggle('news_filter', {{ category|arg }})">{{ t(category) }}</button>
  {%- endfor %}
</div>
<div class="news-list" data-widget="list">
  {%- for item in data.news if (not q or q in fold(item.title|loc)) and (not state.news_filter or item.category in state.news_filter) %}
  <button class="news-row" data-key="{{ item.id }}" data-on-click="set('article', {{ item.id|arg }})">{{ item.title|loc }}</button>
  {%- else %}
  <button class="link-button" data-key="clear" data-on-click="set('query', ''); set('news_filter', null); focus('#news-search')">{{ t("clearSearch") }}</button>
  {%- endfor %}
</div>
```

- `$value` is the input's new text; each keystroke re-renders, which is fast enough.
- `fold()` makes `Notícias` match `noticias`.
- `set('news_filter', null)` empties the set by writing its default.
- The input keeps typed text across renders, because the core writes `value` only when the rendered value changes.

## Accordion

```json title="pack.json (state)"
"faq_open": { "type": "set", "default": [], "reset": "page" }
```

```html
<div class="faq-list" data-widget="list">
  {%- for item in data.faq %}
  {%- set open = item.id in state.faq_open %}
  <button class="{{ 'faq-question open' if open else 'faq-question' }}" data-key="faq-q-{{ item.id }}"
          aria-expanded="{{ open }}" aria-controls="faq-{{ item.id }}"
          data-on-click="toggle('faq_open', {{ item.id|arg }})">{{ item.question|loc }}</button>
  {%- if open %}
  <div id="faq-{{ item.id }}" class="faq-answer" data-key="faq-a-{{ item.id }}" role="region"
       data-widget="markdown" data-source="{{ item.answer|loc }}"></div>
  {%- endif %}
  {%- endfor %}
</div>
```

A `set` allows several open panels; a `string` (`set('faq', id)` / `set('faq', '')`) allows one. Closed panels are not rendered, so Tab never reaches their links. See [FAQ accordion](../../examples/faq-accordion/).

## Calendar

The calendar is `list` with `data-columns="7"` plus the `calendar_days`, `calendar_events`, and `month_add` functions over the fixed-schema `calendar` document:

```html
{%- set month = state.cal_month or today[:7] %}
<button aria-label="{{ t('previousMonth') }}" data-on-click="set('cal_month', {{ month_add(month, -1)|arg }}); set('cal_day', '')">‹</button>
<h1>{{ month|date("month_year") }}</h1>
<button aria-label="{{ t('nextMonth') }}" data-on-click="set('cal_month', {{ month_add(month, 1)|arg }}); set('cal_day', '')">›</button>
```

Complete page with event dialog: [Event calendar](../../examples/event-calendar/).

## Server status

API 2. The `servers` data document has a fixed schema and arrives through the feed; `age()` tells how old it is and a `countdown` element keeps the age moving. Complete page: [Server status](../../examples/server-status/).

