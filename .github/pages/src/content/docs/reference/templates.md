---
title: Templates
description: Write pack templates using the supported context, filters, functions, action arguments, and element keys.
sidebar:
  order: 7
---

Write HTML templates under `templates/` using MiniJinja syntax. Use the variables and helpers below to display pack data and settings. Use actions and widgets for interaction, not JavaScript.

## Template setup

| Rule | Consequence for authors |
| --- | --- |
| `window.json` `main.template` is the main window root; `splash.template` is the splash root. | Every other template is reached through `{% include %}`, `{% import %}`, or `{% from … import … %}`. |
| The output is the content of `<body>`. The core owns `<html>`, `<head>`, and the `<link rel="stylesheet">` of each `pack.json` `styles` entry. | Do not write `<html>`, `<head>`, `<body>`, `<style>`, or `<link>`. |
| State changes update the displayed template. | Give conditional and repeated controls stable [element keys](#element-keys) to preserve focus and scroll position. |
| A template error is reported with its file and line. | Run Studio checks and fix every error before building. |
| The splash re-renders only when the launcher presentation changes or a [`countdown`](../../widgets/countdown/) refresh is due. | The splash cannot react to clicks or keys. |

Every `.html` file under `templates/` is loaded at startup and named by its path relative to `templates/` (for example `pages/home.html`). Names use only `a-z 0-9 _ - /` and end in `.html`.

```html title="templates/layout.html"
<main class="app" lang="{{ lang }}" data-page="{{ page }}">
  {% include "header.html" %}
  <section class="page" data-key="page-{{ page }}">
    {% include "pages/" ~ page ~ ".html" %}
  </section>
</main>
```

The page name selects the page fragment; `navigate()` only accepts names listed in `pack.json` `pages`, so an include built from `page` always names a known page as long as each page has a file.

## Context

| Name | Main window | Splash | Type and content |
| --- | --- | --- | --- |
| `game` | yes | yes | `pack.json` `game`, as written (`id`, `name`, `client_version`, `allowed_hosts`, and the optional `links`, `requirements`, `info`, `download_size`). |
| `lang` | yes | yes | Current language code. |
| `languages` | yes | yes | `[{ code, name }]` in `languages.available` order; `name` is the file's `language_name`. |
| `i18n` | yes | yes | Current language file without `strings`: `months`, `months_short`, `weekdays_short`, `date_formats`. |
| `page` | yes | empty | Current page name. |
| `state` | yes | **no** | Every declared state variable by name. |
| `launcher` | yes | API 3 | Launcher phase, progress, versions, download fields, blocking processes, and failed-check flag, below. |
| `anticheat` | yes | yes | API 2. `{ status, simulated, message }`, below. |
| `data` | yes | yes | Data documents after the feed merge, by name. |
| `now` | yes | yes | Current UTC time, RFC 3339. |
| `today` | yes | yes | Local date, `YYYY-MM-DD`. |

Undefined values render empty, but attribute access on an undefined value is a render error. Because the splash has no `state` (and no `launcher` before core API 3), a shared macro that reads `state.x` fails when the splash includes it.

### `launcher`

| Field | Type | Meaning |
| --- | --- | --- |
| `phase` | string | `checking`, `downloading`, `verifying`, `blocked`, `ready`, `launching`, `launched`, or `launch_failed` (core API 3). |
| `progress` | float 0–100 | Update progress. `ready` reports 100. |
| `installed_version` | int | Client version recorded as installed. |
| `client_version` | int | `game.client_version`. |
| `downloaded` | int or none | API 2. Bytes done. |
| `total` | int or none | API 2. Bytes of the download. |
| `speed` | float or none | API 2. Bytes per second, an exponential moving average of one-second samples; none until the second sample. |
| `eta` | int or none | API 2. Estimated seconds remaining, or none when unavailable. |
| `blocked.processes` | list | API 3. `{ name, pid }` of each process that holds a game file during `blocked`; empty in every other phase. Never the launcher or a process it started. |
| `check_failed` | bool | API 3. `true` in `checking` after a check or game sync fails, until `retry()` or `repair()` starts it again; `false` otherwise. Only while it is `true` does `checking` accept these actions. |

Phases, in order:

| Phase | Meaning |
| --- | --- |
| `checking` | The launcher checks the game files. A failed check also stays here with `launcher.check_failed: true`, and only then accepts `retry()` and `repair()` |
| `downloading` | Files are downloaded; `progress` grows and never moves back within one update |
| `verifying` | Downloaded files are verified |
| `blocked` | API 3. Another process holds a file that must be replaced; see `launcher.blocked.processes` |
| `ready` | The game is up to date. **Play** is accepted only once the anti-cheat handshake is also ready |
| `launching` | The game is being started; the splash is shown |
| `launched` | API 3. The game process exists |
| `launch_failed` | API 3. The launch failed; the main window returns |

A pack that declares `"core_api": 1` or `2` sees `blocked` as `downloading`, `launched` as `launching`, and `launch_failed` as `ready`.

The download fields are available only during `downloading` and `blocked`, and only when the size is known; in `blocked`, `speed` is `0` and `eta` is none. In the launcher, they come from the game update configured for the game. When no game update is configured, and in Pack Studio, the update phases are simulated and `total` comes from `game.download_size`. Use Studio's launcher controls to test every phase and the missing-value cases. See [launcher actions](../actions/#launcher-actions) for the available controls.

In the main window, use `launcher.check_failed` to render a failure label and recovery controls
instead of a running check indicator:

```html
{%- if launcher.check_failed %}
<p role="alert">{{ t("checkFailed") }}</p>
<button data-on-click="retry()">{{ t("retry") }}</button>
<button data-on-click="repair()">{{ t("repair") }}</button>
{%- endif %}
```

The same flag is available in the API 3 splash, but its recovery buttons belong in the main
window only: the splash accepts no actions.

### `anticheat`

API 2. `status` is `checking`, `updating`, `ready`, `unavailable`, or `error`. In the launcher, the status comes from the real anti-cheat; it is `unavailable` when the anti-cheat cannot run, and `simulated` is `false`.

In Pack Studio, the status is simulated from the launcher phase and `simulated` is `true`: `checking` and `verifying` → `checking`; `downloading` and `blocked` → `updating`; `ready`, `launching`, and `launched` → `ready`; `launch_failed` → `error`. Studio's **Anti-cheat** control fixes any status, `unavailable` included, with `simulated: false`.

`message` (API 3) is none, or `{ title, message, dismissible }` describing the last anti-cheat error. An accepted `retry()` clears it. Show it in the main window, for example near the **Play** button, and test it with Studio's **Sample message** control.

## Pack filters and functions

These are global: they work in every template and inside imported macros, which also see `lang`, `today`, and `now`.

| Name | Form | API | Result |
| --- | --- | --- | --- |
| `t` | `t(key)` | 1 | String of `strings[key]` in the current language. Missing in that language: the default language's text (with a one-time warning). Missing everywhere: the key itself. |
| `loc` | `value\|loc` | 1 | Localized object (`{"en": "…", "pt": "…"}`) → current language, then default language, then the first value. A plain string is returned unchanged. |
| `date` | `value\|date(fmt)` | 1 | `fmt` is `short`, `long`, or `month_year` from the language file. Input `YYYY-MM-DD`, or `YYYY-MM` for `month_year`. Another format name or a malformed date is a render error. |
| `num` | `value\|num` | 1 | Shortest round-trip number with no exponent and no trailing `.0` (`0.5`, `12`, `33.3`). Use it for every number written into CSS. A non-finite or non-number value is a render error. |
| `arg` | `value\|arg` | 1 | Action literal: a quoted, escaped string, a number, `true`/`false`, or `null` (none and undefined become `null`). Required at the end of every `{{ … }}` inside `data-on-*`. |
| `asset` | `asset(path)` | 1 | URL for a bundled file under `assets/`. Pass a path such as `images/logo.png`, without the `assets/` prefix. Studio reports missing files. |
| `month_add` | `month_add("YYYY-MM", n)` | 1 | `"YYYY-MM"` moved by `n` months. |
| `calendar_days` | `calendar_days("YYYY-MM")` | 1 | 42 cells, Sunday first: `{ date, day, weekday, outside, today, events }`. Needs the `calendar` data document. |
| `calendar_events` | `calendar_events("YYYY-MM", day=none)` | 1 | Events that overlap the month, or that occur on `day`; an empty `day` means the whole month. |
| `countdown` | `countdown(begins, ends)` | 1 | `{ status, days, hours, minutes }` against `now`. `status` is `upcoming`, `ongoing`, or `ended`; the numbers count down to `begins` and are 0 once it has passed. Times are RFC 3339; an invalid time is a render error. |
| `fold` | `fold(text)` | 2 | Unicode NFKD, combining marks removed, lowercase, whitespace runs collapsed: `fold('Notícias') == fold('noticias')`. |
| `bytes` | `bytes(n, decimals=1)` | 2 | Units of 1024 named `B`, `KB`, `MB`, `GB`, `TB`, as in Windows Explorer: `bytes(1536)` → `1.5 KB`. `B` has no decimals; `decimals` is 0–3 (positional or keyword); the separator is the language's `decimal_separator` (default `.`). None → none. A negative or non-number `n` is a render error. |
| `duration` | `duration(seconds)` | 2 | `{ hours, minutes, seconds }` of the whole seconds (hours are not capped): `duration(3725)` → 1 h 2 min 5 s. None → none. Negative or non-number → render error. |
| `age` | `age(ts)` | 2 | Whole seconds from an RFC 3339 `ts` to `now`, at least 0. None, an empty string, or an invalid time → none. |

Using a function, context field, or schema key of a later core API than the pack declares fails validation; so do the actions removed in core API 3 (`pause`, `resume`, `cancel`) in a pack that declares `3`. See [pack configuration](../pack-config/#identity-and-compatibility).

```html
{%- set left = duration(launcher.eta) %}
{%- if launcher.speed is not none %}
<span class="speed">{{ bytes(launcher.speed) }}/s</span>
{%- endif %}
{%- if left %}
<span class="eta">{{ left.hours }}h {{ left.minutes }}m {{ left.seconds }}s</span>
{%- endif %}
```

### MiniJinja features

The core uses MiniJinja 2 with its default feature set, so the standard filters and tests are available: `length`, `first`, `last`, `selectattr`, `rejectattr`, `map(attribute=…)`, `unique`, `sum`, `min`, `max`, `int`, `trim`, `upper`, `lower`, `default`, `join`, `tojson`, `escape`; the tests `none`, `defined`, `number`, `string`, `eq`, `in`; slicing (`items[:3]`), `~` concatenation, `//` integer division, `loop.index0`, and `{% for … if … %}…{% else %}…{% endfor %}`. Loop controls (`{% break %}`, `{% continue %}`) are **not** enabled.

`{{ … }}` prints booleans as `true` and `false`, not Jinja's `True` and `False`. That is what widgets and ARIA attributes need: `aria-pressed="{{ on }}"`, `data-open="{{ state.menu }}"`. Only direct output is affected: `~` and the `string` filter keep MiniJinja's own spelling.

Template-side defaults keep state simple:

```html
{%- set month = state.cal_month or today[:7] %}
{%- set selected = data.news|selectattr("id", "eq", state.article)|first or data.news|first %}
{%- set unread = data.news|rejectattr("id", "in", state.read)|list|length %}
```

## Escaping and lint rules

Autoescape is HTML for every template. The loader rejects a pack that breaks any of these rules; `launcher-toolkit check` and `launcher-toolkit build` report the template and line.

1. **No escape bypass.** `{% autoescape %}` blocks and the `safe` filter are rejected, including `-`/`+` whitespace-control forms and `{% filter safe %}`. The core also replaces `safe` with a no-op.
2. **Interpolation only inside quoted attribute values.** Inside a start tag, `{{ … }}` may appear only within a quoted value. `{% if %}…{% endif %}` may wrap whole attributes. An unquoted value is rejected because data containing a space would create a new attribute.
3. **Action attributes take literals only.** Inside a `data-on-*` value, every `{{ … }}` must end with the `arg` filter, and `{% %}` and `{# #}` are rejected.

```html
{# Accepted #}
<button class="tab {% if on %}selected{% endif %}"{% if disabled %} disabled{% endif %}
        data-on-click="set('tab', {{ tab.id|arg }})">{{ tab.label|loc }}</button>

{# Rejected: unquoted value, missing |arg, block inside a handler #}
<button class={{ cls }} data-on-click="set('tab', '{{ tab.id }}')">…</button>
<button data-on-click="{% if on %}close(){% endif %}">…</button>
```

To vary a handler, render a different attribute with `{% if %}` around the whole attribute:

```html
<button class="nav-item"
  {%- if item == "news" %} data-on-click="navigate('news'); set('read', {{ newest.id|arg }}, true)"
  {%- else %} data-on-click="navigate({{ item|arg }})"{% endif %}>{{ t(item) }}</button>
```

`{% %}` blocks are allowed inside other quoted attribute values. Keep interpolated values quoted. Use `tojson` only to format JSON data, not to bypass HTML escaping.

## Supported markup

Use the supported alternatives below. Unsupported markup is omitted and reported in the log:

| Unsupported markup | Use instead |
| --- | --- |
| `script`, `template` | Actions and widgets |
| `style`, `link`, `meta`, `base`, `title` | List stylesheets in `pack.json` `styles` |
| `iframe`, `frame`, `object`, `embed` | Bundled images and template content |
| `form` | `data-on-input`, `data-on-key-enter`, and `set` |
| `select`, `option` | A [`dropdown`](../../widgets/dropdown/) |
| `input` of type `file`, `button`, `submit`, or `reset` | `<button>`; `pick_folder` for folder selection |
| `on*` event attributes and `href` | `data-on-click` and `open_url()` |
| HTML comments | Template comments: `{# … #}` |

`<a>` without `href` is not focusable. Use `<button>` for every interactive element.

## Element keys

Give conditional and repeated elements stable `data-key` values, or an `id`.
Keep keys unique among siblings and tied to the same logical item across updates.

- Key conditional dialogs, menus, toasts, and tooltip bubbles.
- Use a content ID, not its list position, for items that can be reordered.
- Keep a key unchanged when the same control should retain focus or scroll position.
- Change a key deliberately when an animation should restart, such as `data-key="{{ state.slide }}-{{ lang }}"`.
- Keep `id` values unique when using `focus()`, `scroll_to()`, and `data-return-focus`.

## Class names

If you generate CSS with a preprocessor that scans the template sources, such as Tailwind CSS, class names must appear literally. Write `{{ 'selected' if on }}` or `{{ 'row selected' if on else 'row' }}`, never `{{ 'sel' ~ 'ected' }}`. Generated markup (for example the [`markdown`](../../widgets/markdown/) output) is not in the templates: style it with descendant selectors.

## Diagnostics

| Message | Meaning |
| --- | --- |
| `ERROR template … (in <name>:<line>)` | Render error; the previous DOM stays. Studio lists it with the template and line. |
| `Pack warning: i18n/<code>.json lacks …` | A language misses keys of the default language. |
| `dropped <tag>` / ``dropped attribute `name` on <tag>`` | The sanitizer removed markup. |
| ``unknown widget `name` ignored`` | A `data-widget` value is not a widget of this core. |
| `Pack resource not found: <url>` | A missing image, font, or stylesheet. |
| `Remote image rejected: <url>: <error>` | A remote `https://` image failed to download or decode; it stays empty. |
| `Feed ignored: <template> (<page, language>): <error>` | A feed response would break a render, so the launcher kept the current data. |
| `Pack warning: pause() was removed in core API 3 and does nothing` | An older pack ran an action that the current core no longer performs. |

