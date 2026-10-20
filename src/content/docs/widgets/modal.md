---
title: modal
description: Dialogs with a focus trap, Escape and backdrop close, and focus return, rendered from state with a keyed overlay.
sidebar:
  order: 13
---

`modal` turns a conditionally rendered overlay into an accessible dialog. The template decides when the dialog exists; the widget moves focus into it, keeps Tab inside it, closes it on Escape or on a backdrop click by running your `data-on-close`, and returns focus when it disappears.

| | |
| --- | --- |
| Core API | 1 |
| Element | The full-window backdrop that contains the dialog box |
| Reads | `data-return-focus`; `autofocus` on descendants |
| Writes | Nothing; runs `data-on-close` |
| Keyboard | Tab/Shift+Tab trapped; Escape closes |

## Attributes

| Attribute | On | Required | Meaning |
| --- | --- | --- | --- |
| `data-key` (or `id`) | modal element | yes | A stable, unique key for the conditional dialog. |
| `data-on-close` | modal element | yes in practice | Runs on Escape and on a backdrop click, usually `set('dialog', '')`. |
| `data-return-focus` | modal element | no | CSS selector of the fallback focus target when the opener is gone. |
| `autofocus` | a descendant | no | The element focused when the modal appears. |

## Behaviour

**When the modal element appears** (inserted by a render):

1. The core records the **opener**: the element whose handler caused the render, otherwise the focused element.
2. It reads `data-return-focus`.
3. It focuses the first descendant with `autofocus`, otherwise the first focusable, enabled descendant.

**While open:**

- **Tab / Shift+Tab** cycle through the modal's focusable, enabled descendants in DOM order and wrap. If focus is outside, Tab goes to the first and Shift+Tab to the last.
- **Escape** runs `data-on-close`.
- **A click whose target is the modal element itself** (the backdrop) runs `data-on-close`. A click inside the dialog box does not, and no stop-propagation is needed.
- Only the **most recently opened** modal is active for the trap, Escape, and backdrop clicks.

**When the modal element disappears:** focus returns to the opener if that element still exists; otherwise to the first element matching `data-return-focus`, if any.

## State

```json title="pack.json (state)"
"confirm": { "type": "string", "default": "", "values": ["", "cancel_download"], "reset": "page" }
```

A `string` naming the open dialog scales to several dialogs with one variable. `reset: "page"` closes dialogs on navigation.

## Example: confirm before cancelling a download

```html title="templates/launch-bar.html (trigger)"
{%- if launcher.phase in ["downloading", "paused"] %}
<button id="cancel-download" class="button" data-on-click="set('confirm', 'cancel_download')">{{ t("cancel") }}</button>
{%- endif %}
```

```html title="templates/layout.html (render last, so the overlay covers the window)"
{%- if state.confirm == "cancel_download" and launcher.phase in ["downloading", "paused"] %}
<div class="overlay" data-key="confirm-cancel" data-widget="modal" data-on-close="set('confirm', '')" data-return-focus="#play">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-text">
    <h2 id="confirm-title">{{ t("cancelTitle") }}</h2>
    <p id="confirm-text">{{ t("cancelText") }}</p>
    <div class="dialog-actions">
      <button class="button" autofocus data-on-click="set('confirm', '')">{{ t("keepDownloading") }}</button>
      <button class="button danger" data-on-click="cancel(); set('confirm', '')">{{ t("cancelDownload") }}</button>
    </div>
  </div>
</div>
{%- endif %}
```

```json title="i18n/en.json (strings)"
"cancel": "Cancel",
"cancelTitle": "Cancel the update?",
"cancelText": "You can play only after the update is complete.",
"keepDownloading": "Keep downloading",
"cancelDownload": "Cancel update"
```

```css title="styles (excerpt)"
.app { position: relative; }
/* The modal element is the backdrop: it must cover the window and receive clicks itself. */
.overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0; z-index: 50;
           display: flex; align-items: center; justify-content: center; background: rgba(5, 8, 12, 0.72); }
.dialog { width: 400px; padding: 22px 24px; border-radius: 12px; background: var(--surface); }
```

Notes on the example:

- `autofocus` is on the **safe** choice, so an accidental Enter does not cancel.
- The confirming button runs the real action itself (`cancel()`), then closes. The core keeps no "pending action".
- The condition also checks the phase: if the download ends while the dialog is open, the dialog disappears.
- When the player confirms, the trigger `#cancel-download` disappears with the phase change, so focus falls back to `data-return-focus` (a `#play` button that always exists).

## Example: details dialog from a list

```html title="templates/pages/calendar.html"
{%- set active = data.calendar.events|selectattr("id", "eq", state.event)|first %}
{%- if active %}
<div class="overlay" data-key="event-{{ active.id }}" data-widget="modal" data-on-close="set('event', '')" data-return-focus="#calendar-today">
  <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="event-title">
    <h2 id="event-title">{{ active.name|loc }}</h2>
    <button class="dialog-close" aria-label="{{ t('close') }}" autofocus data-on-click="set('event', '')">×</button>
    <p>{{ active.start|date("long") }}</p>
  </div>
</div>
{%- endif %}
```

A key that includes the item id makes switching items a new insertion, so focus moves to the new dialog's `autofocus` element.

## Composition

- A modal can contain [`markdown`](../markdown/), [`countdown`](../countdown/), and [`list`](../list/) elements.
- A [`dropdown`](../dropdown/) inside a modal works; Escape first closes the modal, because the modal step runs before the dropdown step.
- See [Event calendar](../../examples/event-calendar/) and [Launch bar](../../examples/launch-bar/).

## Accessibility

- Use `role="dialog"` (or `alertdialog` for confirmations), `aria-modal="true"`, and `aria-labelledby`/`aria-describedby` on the dialog box, not on the backdrop.
- Always provide a visible close or cancel button; Escape and backdrop clicks are not discoverable.
- Make sure the dialog has at least one focusable element, or the trap has nowhere to go.

## Pitfalls

- **No `data-key`:** an unkeyed overlay can reuse a sibling node of the same tag; key it.
- **Wrapper inside the backdrop:** a full-size wrapper between the backdrop and the dialog would receive the clicks, and backdrop close would stop working. Put the dialog box directly inside the modal element.
- **Hiding with CSS:** a modal that stays in the DOM keeps trapping focus. Render it conditionally.
- **`autofocus` on a disabled element:** the widget takes the first `autofocus` descendant as it is. Put `autofocus` only on an enabled button.

