---
title: Keyboard, focus, and accessibility
description: How keyboard input reaches widgets, how focus moves, which ARIA attributes the core reads, and the accessible markup patterns for every widget.
sidebar:
  order: 2
---

The launcher has no browser accessibility defaults: there is no native button activation, no keyboard scrolling, and no `<select>`. The core and its widgets provide the keyboard behaviour, but only when your markup gives them focusable elements and the right attributes. This page collects those rules.

## Ground rules

1. **Every interactive element is a `<button>`** (or a text `<input>`). Other elements cannot take focus, so Tab, the arrow-key widgets, and Enter/Space cannot reach them.
2. **The handler goes on the focusable element itself.** Enter and Space run the `data-on-click` of the focused element only, never a wrapper's.
3. **Render hidden things conditionally.** Tab follows DOM order and does not skip invisible nodes. A closed menu, a collapsed panel, or a dismissed dialog must not be in the DOM.
4. **Key conditional elements.** `data-key` (or `id`) keeps node identity, so focus and scroll survive re-renders and widgets see real insertions.
5. **Show focus with `:focus`.** `:focus-visible` and `:focus-within` never match in this renderer.

```css
button:focus,
input:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

## Keyboard map

| Key | Where | Effect |
| --- | --- | --- |
| Tab / Shift+Tab | anywhere | Next or previous focusable element in DOM order; trapped and wrapping inside the active [`modal`](../modal/). |
| Enter, Space | focused element with `data-on-click` | Runs that handler. |
| Escape | open `modal` | Runs the modal's `data-on-close`. |
| Escape | no modal | Every open [`dropdown`](../dropdown/) and every [`toast`](../toast/) runs `data-on-close`; every shown [`tooltip`](../tooltip/) hides. Focus returns to an open dropdown's `[aria-expanded]` button. |
| ← / → / Home / End | inside [`tabs`](../tabs/) | Focus the previous, next, first, or last enabled `[role=tab]` and run its `data-on-click`. Left and right wrap. |
| ↑ / ↓ / Home / End | inside a [`list`](../list/) | Move focus by one, or to the first or last focusable element. |
| ← / → / ↑ / ↓ | inside a `list` with `data-columns="N"` | Move by one horizontally and by N vertically (grids). |
| ← / → | inside [`pagination`](../pagination/) | Previous or next page, clamped. |
| ↑ / ↓ | inside an open `dropdown` | Move focus through the dropdown's focusable elements. |
| any listed key | `data-on-key-<key>` | The nearest handler on the focused chain, or on the root when nothing is focused. |

When several widgets contain the focused element, the nearest one that handles the key wins. For example, ↑/↓ in a `list` inside an open `dropdown` move within the list. The full resolution order is in [actions: keyboard order](../../reference/actions/#keyboard-order).

## Focus behavior

| Situation | Focus goes to |
| --- | --- |
| A `modal` element is inserted | Its first descendant with `autofocus`, else its first focusable descendant. |
| That `modal` is removed | The opener (the element whose handler opened it, or the focused element), if it still exists; else the first match of `data-return-focus`. |
| Escape closes a `dropdown` | The dropdown's first `[aria-expanded]` descendant. |
| `focus('#selector')` runs | The first focusable element matching the selector, after the render of the same event. |
| `tabs`, `list`, `dropdown` arrow keys | The target element (tabs also run its handler). |
| The focused element is removed by a render | Nothing. Avoid removing the focused control; key it so it survives. |

Use `focus()` after actions that remove the focused control, for example clearing a search from an empty-results button:

```html
<button data-on-click="set('query', ''); set('news_filter', null); focus('#news-search')">{{ t("clearSearch") }}</button>
```

## Attributes to set

Use these attributes for the documented controls:

| Attribute | Read by |
| --- | --- |
| `role="tab"` | `tabs`: the elements arrow keys move between. |
| `aria-expanded` | `dropdown`: the element that receives focus after an Escape close. |
| `autofocus` | `modal`: the first element focused on insertion. Ignored elsewhere. |
| `disabled` | Dispatch (clicks are ignored) and focus (the element is skipped). |
| `data-key`, `id` | Stable control identity; `id` also supplies targets for `focus()`, `scroll_to()`, and `data-return-focus`. |

Because `{{ … }}` prints booleans as `true`/`false`, state can drive ARIA directly: `aria-pressed="{{ on }}"`, `aria-expanded="{{ state.menu }}"`, `aria-checked="{{ state.sound }}"`. Style those attributes instead of extra classes when you can: `.switch[aria-checked="true"]`.

## Accessible patterns per control

| Control | Markup |
| --- | --- |
| Icon-only button | `<button aria-label="{{ t('close') }}">×</button>`; images inside with `alt=""`. |
| Current navigation item | `aria-current="page"` on the active page button. |
| Toggle button, selected row, chip | `aria-pressed="{{ on }}"`. |
| Switch setting | `<button role="switch" aria-checked="{{ state.x }}" aria-label="…">`. |
| Tabs | `role="tablist"` container with `data-widget="tabs"`; `role="tab"`, `aria-selected`, `aria-controls` on each tab; `role="tabpanel"` with `aria-labelledby`. |
| Select | Trigger button with `aria-expanded`; menu `role="listbox"`; options `role="option"` with `aria-selected`. |
| Menu of actions | Trigger with `aria-expanded`; menu `role="group"` with `aria-label`. |
| Dialog | Modal element as the backdrop; child `role="dialog"` or `role="alertdialog"` with `aria-modal="true"`, `aria-labelledby`, `aria-describedby`; `autofocus` on the safe choice. |
| Toast | `role="alert"` and a close button with `aria-label`. |
| Tooltip | Trigger with `aria-describedby="tip-x"`; bubble `id="tip-x" role="tooltip"` with no focusable content. |
| Progress bar | `role="progressbar"`, `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (omit `aria-valuenow` while indeterminate). |
| Accordion | Header button with `aria-expanded` and `aria-controls`; panel `role="region"` rendered only when open. |
| Carousel | `role="region"` with `aria-roledescription="carousel"` and `aria-label`; one `aria-pressed` button per slide. |
| Count badge | `aria-label="{{ t('unread') }}: {{ n }}"`. |
| Language | `lang="{{ lang }}"` on the root element of both templates. |

## Motion, timing, and reading time

- The `carousel` pauses while the pointer is over it, while focus is inside it, while the window is inactive, and while `data-paused="true"`. Offer a persisted motion setting and feed it into `data-paused`, because `prefers-reduced-motion` is not available.
- Give `toast` timeouts enough reading time (the starter uses 6000 ms) and always render a close button. Leave `data-timeout` out for messages that must stay until dismissed.
- Tooltips appear on keyboard focus immediately, not only on hover, and Escape hides them.
- `countdown` refreshes every 30 s by default; do not set a refresh period shorter than the information needs.

## Screen readers

Do not assume full screen-reader support. Test your pack with the assistive technology you need. In Studio, check keyboard operation, visible focus, contrast, and readable text sizes. Keep correct roles, labels, and states in the markup.

## Review checklist

- [ ] Every action is reachable with Tab and runs with Enter or Space.
- [ ] Focus is visible on every button and input.
- [ ] No hidden focusable element remains in the DOM.
- [ ] Every conditional element with same-tag siblings has a `data-key` or `id`.
- [ ] Dialogs focus a safe choice and return focus when closed.
- [ ] Icon-only buttons, badges, and progress bars have labels from `t()`.
- [ ] Every page can be operated without the mouse wheel (`scroll_to` buttons for long scroll areas).
- [ ] Motion can be paused with a setting.

