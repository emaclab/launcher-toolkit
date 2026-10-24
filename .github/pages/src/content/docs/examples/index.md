---
title: Examples overview
description: Complete, adaptable launcher examples - a runnable minimal pack and page-sized compositions of widgets, state, and actions.
sidebar:
  order: 0
---

The examples are complete enough to paste into a pack and adapt. Each one lists everything it needs: the `pack.json` state and data declarations, the data documents, the translation keys, the template markup, and the CSS that makes the widgets work (positioning, overflow, focus). Styling beyond that is yours.

## Runnable pack

| Example | Shows |
| --- | --- |
| [Minimal pack](minimal-pack/) | A complete project in this repository, with the same files as the minimal starter, that passes `launcher-toolkit check` and `build`: title bar, navigation, news with Markdown, settings, launch bar, toast, confirm dialog, tooltip, and splash. |

## Page compositions

| Example | Widgets and features | API |
| --- | --- | --- |
| [Launch bar](launch-bar/) | Every launcher phase, progress, size/speed/ETA, blocking programs with a confirmed `force_close()`, `repair()`/`retry()`, anti-cheat status with `tooltip` and `anticheat.message` | 3 |
| [News reader](news-reader/) | Search with `fold()`, category chips, `list`, `markdown`, read marks, unread badge | 2 |
| [Home highlights](home-highlights/) | `scroll` with snapping, `carousel`, `countdown` quick card, `scroll_to` buttons | 1 |
| [Release notes](release-notes/) | `list` + `pagination`, `tabs`, `markdown` | 2 |
| [Event calendar](event-calendar/) | `calendar_days`, `list` grid, event list, `modal` with `countdown` and `markdown` | 2 |
| [Settings page](settings-page/) | Switch, select (`dropdown`), stepper, folder (`pick_folder`), `tooltip`, reset confirmation (`modal`) | 2 |
| [Server status](server-status/) | Fixed `servers` schema, `age()`, `countdown` refresh, status styling | 2 |
| [FAQ accordion](faq-accordion/) | Accordion with a `set`, `list`, `markdown`, `scroll` with a back-to-top button | 2 |

## Conventions used in every example

- **Plain CSS.** The excerpts are plain CSS so they work without a build step. With a preprocessor such as Tailwind CSS, keep the structural rules (positioning, overflow, sizes) and express the rest with utility classes written literally in the templates.
- **English strings.** Add every listed key to each language file in `languages.available`. The default language is the reference set; missing keys fall back with a warning.
- **Merge, do not replace.** `pack.json (state)` snippets are entries for the `state` object; add them next to your existing ones. Snippets titled `layout.html` go inside your root element.
- **Keys and ids.** Conditional elements carry a `data-key` and controls that receive focus carry an `id`. Keep them when you adapt the markup.
- **Root attributes.** Examples assume a root like `<main class="app" lang="{{ lang }}" data-page="{{ page }}">` with `position: relative` and the full window size.

## Check your adaptation

1. `launcher-toolkit check <pack-dir>`: zero errors, and resolve warnings (unknown widget attributes, missing translations, missing assets).
2. `launcher-toolkit dev <pack-dir>`: try every control with the mouse **and** with Tab, arrows, Enter, Space, and Escape.
3. Use the Studio panel to set the launcher phase and scenarios, the time, error keys, and offline mode, so you see every state the example handles.

See [widgets](../widgets/) for the behaviour behind each example and [actions](../reference/actions/) and [templates](../reference/templates/) for the language.

