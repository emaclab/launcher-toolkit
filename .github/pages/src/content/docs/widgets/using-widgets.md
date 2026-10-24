---
title: Using widgets
description: Add a widget to your pack, declare its state, connect actions, and check the result in Pack Studio.
sidebar:
  order: 1
---

Use a widget to add interaction to your templates. Choose one from the [catalog](../), add its
`data-widget` attribute, and configure the documented attributes. You do not write JavaScript for widgets.

## Add a widget

1. Choose a widget and check its required core API.
2. Declare any required state in `pack.json`.
3. Add the widget markup to a page or layout template.
4. Add styles and translated labels.
5. Preview the result in Pack Studio and run its checks.

For example, a dropdown needs a boolean state value:

```json title="pack.json (state entry)"
"menu_open": { "type": "bool", "default": false, "reset": "page" }
```

```html
<div data-widget="dropdown" data-open="{{ state.menu_open }}"
     data-on-close="set('menu_open', false)">
  <button aria-expanded="{{ state.menu_open }}" data-on-click="toggle('menu_open')">
    Menu
  </button>
  {% if state.menu_open %}
  <div data-key="main-menu">
    <button data-on-click="navigate('home'); set('menu_open', false)">Home</button>
  </div>
  {% endif %}
</div>
```

Declare `home` in `pages`. Replace the example labels with translation keys when adding languages.
See [dropdown](../dropdown/) for a complete example and keyboard behavior.

## Configure state and actions

Use the state type required by the widget. A carousel index needs `int`; a scroll position needs
`float`; a tooltip selection needs `string`. Undeclared names and incompatible types do not work.

Use [actions](../../reference/actions/) to change state and navigate. End every dynamic action
argument with `|arg`. Use only the attributes listed for each widget. Put extra styling attributes
on a wrapper if Studio reports them as unknown on the widget element.

## Keep controls usable

| Task | What to use |
| --- | --- |
| Clickable action | A `<button>` with `data-on-click` |
| External link | `open_url()` with an allowed HTTPS host |
| Fixed-choice setting | A dropdown, not `<select>` |
| Tooltip | The tooltip widget, not a `title` attribute |
| Closed menu or dialog | A conditional `{% if %}` block, not CSS-only hiding |
| Keyboard focus styling | `:focus`, not `:focus-visible` or `:focus-within` |
| Scroll controls | `scroll_to()` buttons or the scroll widget |
| Images and fonts | Files bundled under `assets/`; remote `https://` images only in `<img src>` |

Give conditional menus, dialogs, toasts, and tooltip bubbles stable `data-key` values.
Keep keys unique among siblings. Keep repeated-item keys tied to content IDs rather than list positions.
See [element keys](../../reference/templates/#element-keys).

## Test the interaction

```powershell
launcher-toolkit.exe dev pack
launcher-toolkit.exe check pack
```

Use the preview rather than opening the template in a browser. Check:

- Every control is reachable by Tab and has a visible focus indicator.
- Enter and Space activate buttons.
- Arrow keys and Escape behave as described on the widget's page.
- Closed menus and dialogs do not leave hidden keyboard targets.
- Long text, empty content, and each supported language fit the layout.
- Settings save only when their state declares `persist: true`.

Use the panel's **Reference** tab, or generate the reference for your installed release:

```powershell
launcher-toolkit.exe reference --out widget-reference.md
```

See [restrictions and limits](../../reference/restrictions/) before using unfamiliar HTML or CSS features.
