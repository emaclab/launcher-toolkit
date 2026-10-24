---
title: toast
description: Transient messages that close on Escape or after a timeout, and the error_state contract for core error keys.
sidebar:
  order: 14
---

`toast` closes a conditionally rendered message on Escape or after a timeout by running its `data-on-close`. It is also where the core's own error messages appear: the core writes error keys into the `error_state` variable, and your toast renders them.

| | |
| --- | --- |
| Core API | 1 |
| Element | The message box |
| Reads | `data-timeout` |
| Writes | Nothing; runs `data-on-close` |
| Keyboard | Escape closes (when no modal is open) |

## Attributes

| Attribute | Type | Required | Meaning |
| --- | --- | --- | --- |
| `data-key` (or `id`) | string | yes | Keyed insertion; the timeout starts when this node appears. |
| `data-on-close` | handler | yes in practice | Runs on Escape and when the timeout expires, usually `set('toast', '')`. |
| `data-timeout` | int ms | no | Runs `data-on-close` this long after the element appeared. Without it (or with 0), the toast stays until closed. |

## Behaviour

- The timeout starts **when the toast element first appears** and fires once. A toast that stays on screen while its text changes keeps its original deadline. Include the message in the key (`data-key="toast-{{ state.toast }}"`) to restart the timer for a new message.
- **Escape** with no open modal runs `data-on-close` of **every** toast element on the page and is consumed. A root `data-on-key-escape` handler does not run while a toast exists.
- The widget writes no state; your handler clears the variable and the template stops rendering the toast.

## The `error_state` contract

`pack.json` `error_state` names a `string` state variable **without** `values`. When a core action fails in a way the player must see, the core writes an i18n key into it:

| Key | Written when | API |
| --- | --- | --- |
| `linkFailed` | `open_url` could not start the browser. A URL refused by the host policy is only logged. | 1 |
| `pickFailed` | `pick_folder`'s dialog failed or returned a path over 1024 characters. | 2 |

Translate both keys in every language and render the variable with `t()`. Set `error_state` to `null` only if you do not want error messages at all.

## State

```json title="pack.json"
"error_state": "toast",
"state": {
  "toast": { "type": "string", "default": "" }
}
```

## Example

```html title="templates/layout.html (render near the end of the root)"
{%- if state.toast %}
<div class="toast" role="alert" data-key="toast-{{ state.toast }}" data-widget="toast" data-timeout="6000"
     data-on-close="set('toast', '')">
  <span>{{ t(state.toast) }}</span>
  <button class="toast-close" aria-label="{{ t('close') }}" data-on-click="set('toast', '')">×</button>
</div>
{%- endif %}
```

```json title="i18n/en.json (strings)"
"close": "Close",
"linkFailed": "Unable to open the browser.",
"pickFailed": "Unable to choose the folder."
```

```css title="styles (excerpt)"
.toast { position: absolute; right: 24px; bottom: 104px; z-index: 40; display: flex; align-items: center;
         padding: 10px 10px 10px 16px; border: 1px solid var(--danger); border-radius: 8px; background: var(--surface); }
```

Your own messages can use the same variable, for example `set('toast', 'settingsRestored')` after a reset, as long as the key exists in the language files.

## Testing

In `launcher-toolkit`, the control panel's **Error keys** control writes `linkFailed` or `pickFailed` into `error_state`, and **Offline** makes `open_url` report a browser failure. Use them to check the toast in every language.

## Accessibility

- `role="alert"` marks the message as important.
- Always render a close button with an `aria-label`; the timeout and Escape are not discoverable.
- Give the player enough time to read: several seconds, or no timeout for messages that need action.
- Toasts do not take focus. Do not put the only copy of important information in a toast.

## Pitfalls

- Declaring `values` on the `error_state` variable is a validation error.
- An unkeyed conditional toast can reuse a sibling node; key it.
- Several simultaneous toasts all close on one Escape; use one toast region driven by one variable.

