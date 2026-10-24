---
title: State, settings, and persistence
description: State declarations, validation, persistence, settings controls, reset behavior, and migration boundaries.
sidebar:
  order: 3
---

Pack-defined settings are declared state. There is no separate settings schema or arbitrary preferences API. A setting changes presentation only when a template or stylesheet consumes it; declaring a folder path or a toggle does not configure a real game client.

## Declaration fields

`pack.json` maps each state name to a declaration. Names match `[a-z][a-z0-9_]*`.

| Field | Applies to | Behavior |
| --- | --- | --- |
| `type` | All | `bool`, `int`, `float`, `string`, or `set` |
| `default` | All | Required JSON value of exactly the declared type |
| `min`, `max` | `int`, `float` | Inclusive bounds; `min` cannot exceed `max` |
| `values` | `string` | Optional list of allowed strings |
| `persist` | All | Defaults to `false`; `true` includes the value in preferences |
| `reset` | All | Optional `"page"`: reset to the default when navigation changes the page |

Defaults and saved JSON values are type-checked strictly. A `set` default is an array of strings; the runtime treats it as a set, not a list with order or duplicates.

Limits: a string is at most 1024 characters; a set has at most 1000 unique strings, each at most 1024 characters. Numeric writes must be valid for their declared type; floats must be finite. Out-of-range writes are rejected, not clamped by the general state layer. Some widgets apply their own clamping before writing.

## Runtime writes

Actions and widgets use the same coercion rules:

| Target type | Accepted input |
| --- | --- |
| `bool` | Boolean or the strings `"true"` / `"false"` |
| `int` | Integer or a decimal integer string |
| `float` | Finite number or numeric string |
| `string` | String, or a number converted to text |
| Any declaration | `null` resets it to the declared default |

Invalid coercion, bounds, or enum values leave state unchanged and log the rejection. Use `toggle('read', 'article-1')` to toggle set membership, `set('read', 'article-1', true)` to add an item, and `set('read', 'article-1', false)` to remove it. Do not assume `set()` accepts a JSON array literal in the action language.

```html
<button data-on-click="set('article_size', 16)">Larger text</button>
<button data-on-click="set('article_size', null)">Default text size</button>
```

Declare `article_size` first. A page reset is a reset of only the declarations with `reset: "page"`, not a global preferences reset.

## A settings pattern

Add these entries to `pack.json`'s `state` object:

```json
{
  "motion": { "type": "bool", "default": true, "persist": true },
  "article_size": { "type": "int", "default": 14, "min": 12, "max": 18, "persist": true },
  "screenshots_dir": { "type": "string", "default": "", "persist": true },
  "toast": { "type": "string", "default": "" }
}
```

Set `error_state` to `"toast"` if it is not already set. Error state must be an unrestricted string declaration; do not add a `values` list to it.

```html
<section aria-label="Appearance settings">
  <button role="switch" aria-checked="{{ state.motion }}"
          data-on-click="toggle('motion')">Motion effects</button>
  <div role="group" aria-label="Article font size">
    <button {% if state.article_size <= 12 %}disabled{% endif %}
            data-on-click="set('article_size', {{ (state.article_size - 1)|arg }})">Smaller</button>
    <span>{{ state.article_size }} px</span>
    <button {% if state.article_size >= 18 %}disabled{% endif %}
            data-on-click="set('article_size', {{ (state.article_size + 1)|arg }})">Larger</button>
  </div>
  <p>{{ state.screenshots_dir or 'No folder selected' }}</p>
  <button data-on-click="pick_folder('screenshots_dir')">Choose folder</button>
  <button data-on-click="set('screenshots_dir', '')">Clear folder</button>
  <button data-on-click="set('motion', null); set('article_size', null); set('screenshots_dir', null)">
    Reset these settings
  </button>
</section>
<article style="font-size:{{ state.article_size }}px" data-motion="{{ state.motion }}">
  <p>This article uses the selected font size.</p>
</article>
```

`pick_folder` requires API 2. Canceling the dialog changes nothing. A dialog failure or path over 1024 characters reports `pickFailed` through `error_state`; translate that key and `linkFailed`. The chosen folder is **only stored text**. The pack cannot use it to read/write files, capture screenshots, or change installation paths.

The example labels are English for clarity. In a localized pack, use `t()` and translate every label. Add CSS for any visual motion preference; the renderer does not implement `prefers-reduced-motion`. Use dropdown widgets with buttons for enum settings: native `<select>` is not supported.

## Core-owned values

Do not redeclare or assign `page`, `lang`, launcher phase/progress, or installed client version as if they were writable core state. Pack state is accessed through `state.<name>`; use core actions such as `navigate`, `set_language`, `play`, `check`, and (core API 3) `repair` for core-owned behavior.

The complete starter includes appearance choices (`accent`, `density`, `motion`), badge/detail toggles, text size, and a folder preference. These are examples of pack settings, not an extra built-in settings subsystem.

## Preferences file

The default location is:

```text
%LOCALAPPDATA%\<game.name> Launcher\preferences.json
```

Settings are saved automatically. Do not write the preferences file from your pack. An example of saved values is:

```json
{
  "language": "en",
  "installed_version": 5,
  "state": {
    "motion": false,
    "article_size": 16,
    "screenshots_dir": "C:\\Games\\Screenshots"
  }
}
```

- Declare `persist: true` to save a setting.
- Saved values that no longer match their declarations fall back to defaults.
- Use `set_language()` to save the chosen language.
- Never store credentials or access tokens in state.

## Language selection

The effective language is the first available choice in this order:

1. Supported saved language.
2. The primary subtag of the first Windows preferred UI language, if supported.
3. `languages.default`.

`set_language()` validates and saves the selected code, then re-renders. Language is core-owned and does not need a `persist` declaration.

## Stable settings across releases

Keep `game.id`, `game.name`, and setting names stable when changing themes. If you change a setting's type, range, or allowed values, a saved value may become invalid and fall back to its default.

