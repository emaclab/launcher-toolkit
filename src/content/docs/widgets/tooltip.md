---
title: tooltip
description: Hover-delay and keyboard-focus tooltips that write a shared string state, so the template renders at most one bubble.
sidebar:
  order: 15
---

`tooltip` watches hover and focus on a trigger element and writes a shared `string` state. The template renders the bubble when the state equals the trigger's value. Because every tooltip writes the same variable only while it owns it, at most one bubble shows at a time.

| | |
| --- | --- |
| Core API | **2** (`"core_api": 2` required) |
| Element | The trigger, normally a `<button>` |
| Reads | `data-state`, `data-value`, `data-delay` |
| Writes | `data-state` (`string`) |
| Keyboard | Shows on keyboard focus; Escape hides |

## Attributes

| Attribute | Type | Required | Default | Meaning |
| --- | --- | --- | --- | --- |
| `data-state` | `string` state name | yes | — | Receives `data-value` while shown, `""` when hidden. |
| `data-value` | string | yes | — | This tooltip's identity. |
| `data-delay` | int ms | no | `400` | Hover delay, clamped to 0–5000. |

## Behaviour

**Shows** (writes `data-value`):

- when the pointer has rested on the element for `data-delay` ms, once per hover;
- immediately when focus arrives inside the element by keyboard (focus that comes from a primary pointer-down on it does not show the tooltip).

**Hides** (writes `""`), but only while the state still equals this element's `data-value`:

- when the pointer has left and focus is elsewhere;
- on Escape (when no modal is open), after dropdowns and toasts close;
- on any primary pointer-down anywhere.

A `title` attribute is not a substitute: the renderer gives it no behaviour.

## State

```json title="pack.json"
"core_api": 2,
"state": {
  "tip": { "type": "string", "default": "", "reset": "page" }
}
```

One `tip` variable serves every tooltip on the page.

## Example

```html title="templates/pages/settings.html"
<span class="tip-anchor">
  <button class="help" aria-label="{{ t('help') }}" aria-describedby="tip-folder"
          data-widget="tooltip" data-state="tip" data-value="folder">?</button>
  {%- if state.tip == "folder" %}
  <span id="tip-folder" class="tooltip" role="tooltip" data-key="tip-folder">{{ t("folderTip") }}</span>
  {%- endif %}
</span>
```

```json title="i18n/en.json (strings)"
"help": "Help",
"folderTip": "The launcher stores only the path; it never reads or writes the folder."
```

```css title="styles (excerpt)"
.tip-anchor { position: relative; }
.tooltip { position: absolute; top: 100%; left: 0; z-index: 30; width: 260px; margin-top: 8px; padding: 8px 10px;
           border: 1px solid var(--border); border-radius: 6px; background: var(--bar); font-size: 12px; }
.tooltip-up { top: auto; bottom: 100%; margin-top: 0; margin-bottom: 8px; }
```

## Example: status with an explanation

A tooltip trigger can be a meaningful control rather than a "?" icon. Here it explains the anti-cheat status in the bottom bar:

```html title="templates/launch-bar.html"
<div class="tip-anchor">
  <button class="protection" aria-describedby="tip-protection" data-widget="tooltip" data-state="tip" data-value="protection">
    <span class="protection-dot" data-status="{{ anticheat.status }}"></span>
    <span>{{ t("anticheat." ~ anticheat.status) }}</span>
  </button>
  {%- if state.tip == "protection" %}
  <span id="tip-protection" class="tooltip tooltip-up" role="tooltip" data-key="tip-protection">
    {{- t("anticheatTip." ~ anticheat.status) }}
  </span>
  {%- endif %}
</div>
```

## Template duties

- Render the bubble **conditionally** with a `data-key`.
- Put **no focusable element** inside the bubble: it disappears when focus leaves the trigger.
- Link trigger and bubble with `aria-describedby` and give the bubble `role="tooltip"` and the matching `id`.
- Position the bubble with CSS relative to a wrapper; the widget does not position anything.

## Pitfalls

- `data-state` must name a `string` variable without restrictive `values` that exclude your `data-value` strings; a refused write is logged and nothing shows.
- Using `tooltip` in a pack that declares `core_api: 1` fails validation.
- The trigger should be focusable (`<button>`); otherwise keyboard users never see the text.

