---
title: dropdown
description: Close an open menu on an outside pointer-down or Escape, move through its items with the arrow keys, and build selects without <select>.
sidebar:
  order: 12
---

`dropdown` gives a template-rendered menu the closing and keyboard behaviour of a native popup. The open state is a `bool` you declare; the template renders the menu only while it is open, and the widget runs your `data-on-close` handler when the menu should close.

| | |
| --- | --- |
| Core API | 1 |
| Element | A wrapper around the trigger button and the menu |
| Reads | `data-open` |
| Writes | Nothing; runs `data-on-close` |
| Keyboard | ↑/↓ while open; Escape closes |

## Attributes

| Attribute | Type | Required | Meaning |
| --- | --- | --- | --- |
| `data-open` | `true`/`false` | yes | Whether the menu is open. Render it from state: `data-open="{{ state.menu }}"`. |
| `data-on-close` | handler | yes in practice | Runs when the menu must close, usually `set('menu', false)`. |

## Behaviour

While `data-open="true"`:

- A **primary pointer-down outside** the dropdown element runs its `data-on-close`. The same press still reaches whatever it hit, so one click both closes the menu and activates the other control.
- **Escape** runs `data-on-close` of every open dropdown (when no modal is open) and moves focus to the dropdown's first descendant with `aria-expanded`, normally the trigger button.
- **↓ / ↑** with focus inside move focus to the next or previous focusable element inside the dropdown element, including the trigger, clamped at both ends. With focus on the trigger, ↓ moves to the first item.

While closed, the widget does nothing; Enter or Space on the trigger runs its `data-on-click` (usually `toggle('menu')`).

## State

```json title="pack.json (state)"
"lang_menu": { "type": "bool", "default": false, "reset": "page" }
```

Do not persist a menu's open state. `reset: "page"` closes it on navigation.

## Example: language menu

```html title="templates/layout.html"
<div class="language" data-widget="dropdown" data-open="{{ state.lang_menu }}" data-on-close="set('lang_menu', false)">
  <button id="language-button" class="language-button" aria-label="{{ t('language') }}" aria-expanded="{{ state.lang_menu }}"
          data-on-click="toggle('lang_menu')">{{ lang|upper }}</button>
  {%- if state.lang_menu %}
  <div class="language-menu" role="group" aria-label="{{ t('language') }}" data-key="language-menu">
    {%- for l in languages %}
    <button class="{{ 'language-option chosen' if l.code == lang else 'language-option' }}" aria-pressed="{{ l.code == lang }}"
            data-on-click="set_language({{ l.code|arg }}); set('lang_menu', false); focus('#language-button')">{{ l.name }}</button>
    {%- endfor %}
  </div>
  {%- endif %}
</div>
```

```json title="i18n/en.json (strings)"
"language": "Language"
```

```css title="styles (excerpt)"
.language { position: relative; }
.language-button[aria-expanded="true"] { background: var(--raised); }
.language-menu { position: absolute; top: 100%; right: 0; z-index: 20; display: flex; flex-direction: column; }
.language-option.chosen { color: var(--accent); }
```

## Example: a select replacement

The renderer has no `<select>`, and the sanitizer removes it. A setting with fixed choices is a `string` with `values` plus a dropdown:

```json title="pack.json (state)"
"quality":      { "type": "string", "default": "medium", "values": ["low", "medium", "high"], "persist": true },
"quality_menu": { "type": "bool", "default": false, "reset": "page" }
```

```html title="templates/pages/settings.html"
<div class="select" data-widget="dropdown" data-open="{{ state.quality_menu }}" data-on-close="set('quality_menu', false)">
  <button id="quality-button" class="select-button" aria-label="{{ t('quality') }}" aria-expanded="{{ state.quality_menu }}"
          data-on-click="toggle('quality_menu')">{{ t("quality." ~ state.quality) }}</button>
  {%- if state.quality_menu %}
  <div class="select-menu" role="listbox" aria-label="{{ t('quality') }}" data-key="quality-menu">
    {%- for value in ["low", "medium", "high"] %}
    <button class="{{ 'select-option chosen' if value == state.quality else 'select-option' }}" role="option"
            aria-selected="{{ value == state.quality }}"
            data-on-click="set('quality', {{ value|arg }}); set('quality_menu', false); focus('#quality-button')">{{ t("quality." ~ value) }}</button>
    {%- endfor %}
  </div>
  {%- endif %}
</div>
```

```json title="i18n/en.json (strings)"
"quality": "Graphics quality",
"quality.low": "Low",
"quality.medium": "Medium",
"quality.high": "High"
```

## Accessibility

- The trigger is a `<button>` with `aria-expanded` bound to the same state; the widget uses that attribute to return focus after Escape.
- Items are `<button>` elements so ↑/↓ can reach them. Mark the current choice with `aria-selected` (listbox) or `aria-pressed` (group).
- Close the menu in each item's handler (`set('menu', false)`) so a keyboard selection does not leave it open, and end the handler with `focus('#trigger-id')`: the chosen item disappears with the menu, and without it focus would be lost.

## Pitfalls

- Hiding the menu with CSS instead of `{% if %}` leaves its buttons in the Tab order.
- `data-open` must print exactly `true`; render it from a `bool` state, not from a string.
- Clicks inside the dropdown element never close it automatically. Close it in the item handlers.
- Several open dropdowns all close on Escape. Prefer one open menu at a time.

