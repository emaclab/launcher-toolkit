---
title: Widgets overview
description: What a widget is, the complete widget catalog with API levels, how widgets read and write state, and how to combine them.
sidebar:
  order: 0
---

A **widget** adds interaction to an element in your template. Set `data-widget="<name>"` and its documented attributes. Add the markup, styles, and state shown on the widget's page.

```html
<div class="language" data-widget="dropdown" data-open="{{ state.lang_menu }}" data-on-close="set('lang_menu', false)">
  <button aria-expanded="{{ state.lang_menu }}" data-on-click="toggle('lang_menu')">{{ lang|upper }}</button>
  {%- if state.lang_menu %}
  <div class="language-menu" role="group" data-key="language-menu">…</div>
  {%- endif %}
</div>
```

Start with [Using widgets](using-widgets/) to add and test your first control.

## Catalog

| Widget | API | Purpose | Reads | Writes | Keyboard |
| --- | --- | --- | --- | --- | --- |
| [`carousel`](carousel/) | 1 | Advances a slide index on a timer | `data-state`, `data-elapsed-state` (`int`) | both | none |
| [`tabs`](tabs/) | 1 | Arrow-key movement between `[role=tab]` buttons | — | — (tabs use `set`) | ←/→ (wrapping), Home, End |
| [`dropdown`](dropdown/) | 1 | Closes an open menu on outside pointer-down or Escape | `data-open` | — (runs `data-on-close`) | ↑/↓ while open, Escape |
| [`modal`](modal/) | 1 | Focus trap, Escape and backdrop close, focus return | `data-return-focus` | — (runs `data-on-close`) | Tab/Shift+Tab trapped, Escape |
| [`scroll`](scroll/) | 1 | Snap anchors and a scroll-linked value | `data-snap*` | `data-scroll-state` (`float`) | none |
| [`countdown`](countdown/) | 1 | Re-renders on a timer so `now` advances | `data-refresh` | — | none |
| [`toast`](toast/) | 1 | Closes on Escape or after a timeout | `data-timeout` | — (runs `data-on-close`) | Escape |
| [`list`](list/) | 1 | Arrow-key movement between focusable rows or grid cells | `data-columns` | — | arrows, Home, End |
| [`pagination`](pagination/) | 1 | Clamps a page number and steps it with the arrows | `data-state`, `data-pages` | `data-state` (`int`) | ←/→ |
| [`anticheat-mark`](anticheat-mark/) | 1 | Placeholder box for the core-painted EMAC LAB mark (splash only) | — | — | — |
| [`markdown`](markdown/) | 2 | Expands Markdown text into safe elements | `data-source` | — | link buttons: Enter/Space |
| [`tooltip`](tooltip/) | 2 | Shows a tooltip after a hover delay or on keyboard focus | `data-state`, `data-value`, `data-delay` | `data-state` (`string`) | Escape hides |

Everything else a launcher needs is a [template pattern](template-patterns/) built from markup, state, actions, and the widgets above: window controls, language selector, progress bar, download speed and ETA, anti-cheat status, settings (switch, select, stepper, folder), confirm dialog, count badge, calendar, server status, accordion, and search and filter.

## API levels

`pack.json` `core_api` declares the minimum core API the pack needs. API 1 widgets work everywhere. `markdown` and `tooltip` are API 2: a pack that uses them must declare `"core_api": 2` or `3`. Core API 3 adds no widget; it adds launcher phases, actions, and context fields (see [templates](../reference/templates/#launcher) and [actions](../reference/actions/#launcher-actions)). The validator rejects a widget name, action, function, or context field of a later API than the pack declares, and the launcher refuses a pack whose `core_api` is higher than the core offers. Run `launcher-toolkit reference` to print the exact table of your toolkit release.

## Attribute rules

- **One widget per element.** `data-widget` holds one name. To combine behaviours, nest elements: a `list` inside a `modal`, a `markdown` element inside an accordion panel, a `tooltip` button inside a `dropdown`.
- **Configuration is `data-*` on the same element.** Each widget page lists its attributes. Studio's `widgets` check warns about an unknown `data-widget` name and about any `data-*` attribute on a widget element that the widget does not define, except `data-widget`, `data-key`, and `data-on-*`. Put styling hooks such as `data-phase` on a wrapper or child instead.
- **State-name attributes name declared state.** `data-state="slide"` refers to `state.slide` in `pack.json`; the declared type must match (for example `int` for `carousel`, `float` for `scroll`, `string` for `tooltip`). A widget write that fails coercion is refused and logged once.
- **Use template values for configuration.** Attributes such as `data-paused`, `data-pages`, and `data-open` can follow state. Boolean values must be `true` or `false`.
- **Unknown names are ignored** with a log line, so a typo fails silently in the launcher. Keep `launcher-toolkit check` warnings at zero.
- **Key conditional widget elements.** Give a `modal`, `toast`, tooltip bubble, or dropdown menu a stable `data-key` or `id`. See [element keys](../reference/templates/#element-keys).

## Widgets and state

Widgets never invent state. A widget either **reads** declared state through attributes, **writes** declared state through the same coercion as actions, or **runs your handler** (`data-on-close`, a tab's `data-on-click`). This keeps the template the single source of what is shown:

| Pattern | Widgets | The template decides |
| --- | --- | --- |
| Open/closed from a `bool` | `dropdown`, `modal` | Whether the menu or dialog is rendered |
| Selected value from `set` | `tabs`, `list` | Which row or tab looks selected (`aria-pressed`, `aria-selected`) |
| Counter written by the core | `carousel`, `pagination`, `scroll` | How the value is shown (slide, page label, opacity) |
| Shared `string` written by the core | `tooltip` | Which tooltip bubble is rendered |

Declare transient UI state (`lang_menu`, `tip`, `event`, scroll offsets) with `"reset": "page"` and without `persist`. Persist only real preferences. See [state and settings](../reference/state-settings/).

## Composition examples

| Composition | Where |
| --- | --- |
| `scroll` + `carousel` + `countdown` (home highlights) | [Home highlights](../examples/home-highlights/) |
| `list` + `pagination` + `tabs` + `markdown` (release notes) | [Release notes](../examples/release-notes/) |
| `list` with `data-columns="7"` + `modal` + `countdown` + `markdown` (calendar) | [Event calendar](../examples/event-calendar/) |
| `dropdown` + `tooltip` + `modal` + `pick_folder` (settings) | [Settings page](../examples/settings-page/) |
| `tooltip` + `modal` + launcher actions of core API 3 (bottom bar) | [Launch bar](../examples/launch-bar/) |
| `list` + `markdown` + search with `fold()` (news) | [News reader](../examples/news-reader/) |
| A complete runnable pack | [Minimal pack](../examples/minimal-pack/) |

