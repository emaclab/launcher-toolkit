---
title: tabs
description: Arrow-key movement between role=tab buttons that also selects the tab, with the accessible tablist markup.
sidebar:
  order: 11
---

`tabs` adds the keyboard behaviour of a tab list. Selection itself stays ordinary state: each tab is a button whose `data-on-click` writes the selected value, and the template shows the matching panel.

| | |
| --- | --- |
| Core API | 1 |
| Element | The `role="tablist"` container |
| Reads | Its `[role=tab]` descendants and their `disabled` attribute |
| Writes | Nothing directly; it runs the target tab's `data-on-click` |
| Keyboard | ←/→ (wrapping), Home, End with focus inside |

## Attributes

`tabs` has no configuration attributes. It uses:

| On | Attribute | Meaning |
| --- | --- | --- |
| Each tab | `role="tab"` | Required: only these elements take part. |
| Each tab | `data-on-click` | The selection handler the widget runs. |
| Each tab | `disabled` | Skipped by the arrow keys and not clickable. |

## Behaviour

With focus anywhere inside the element:

- **→** focuses the next enabled tab, wrapping from the last to the first. **←** goes the other way. **Home** and **End** go to the first and last enabled tab.
- After moving focus, the widget runs that tab's `data-on-click`. Arrow movement therefore selects the tab, which is the "automatic activation" tab pattern.
- ↑ and ↓ are not handled, so an outer [`list`](../list/) or a `data-on-key-*` handler can still use them.
- Enter and Space on a focused tab run its handler like any button.

## State

```json title="pack.json (state)"
"notes_tab": { "type": "string", "default": "client", "values": ["client", "server"], "reset": "page" }
```

A `string` with `values` refuses any other value, so a typo in a handler is caught when the handler runs.

## Example

```html title="templates/pages/updates.html"
<div class="tabs" role="tablist" aria-label="{{ t('patchNotes') }}" data-widget="tabs">
  {%- for tab in ["client", "server"] %}
  <button id="tab-{{ tab }}" class="{{ 'tab active' if state.notes_tab == tab else 'tab' }}" role="tab"
          aria-selected="{{ state.notes_tab == tab }}" aria-controls="notes-panel"
          data-on-click="set('notes_tab', {{ tab|arg }})">{{ t("notes." ~ tab) }}</button>
  {%- endfor %}
</div>
<div id="notes-panel" class="notes" role="tabpanel" aria-labelledby="tab-{{ state.notes_tab }}">
  {%- if state.notes_tab == "client" %}
  <p>{{ t("clientNotesIntro") }}</p>
  {%- else %}
  <p>{{ t("serverNotesIntro") }}</p>
  {%- endif %}
</div>
```

```json title="i18n/en.json (strings)"
"patchNotes": "Patch notes",
"notes.client": "Client",
"notes.server": "Server",
"clientNotesIntro": "Changes to the game client.",
"serverNotesIntro": "Changes to the game servers."
```

```css title="styles (excerpt)"
.tab { padding: 8px 14px; border-bottom: 2px solid transparent; color: var(--muted); }
.tab[aria-selected="true"] { border-bottom-color: var(--accent); color: var(--text); }
.tab:focus { outline: 2px solid var(--accent); outline-offset: 2px; }
```

Render only the selected panel. The panel content can be a [`markdown`](../markdown/) element; see [Release notes](../../examples/release-notes/).

## Variants

- **Tabs as navigation.** `data-on-click="navigate('news')"` on each tab works the same way; arrow movement then changes the page.
- **Disabled tab.** Add `disabled`; the arrows skip it and clicks do nothing.
- **Segmented control.** For a two-state setting that is not a tab list, use plain buttons with `aria-pressed` instead of `role="tab"`.

## Accessibility

- `role="tablist"` on the container, `role="tab"` and `aria-selected` on each tab, `role="tabpanel"` with `aria-labelledby` on the panel.
- Give each tab an `id` so the panel can reference it and focus survives re-renders.
- The widget needs focus inside the list, which happens when the player Tabs to a tab.

## Pitfalls

- A tab without `role="tab"` is invisible to the arrow keys.
- Keep other controls out of the tab list. With focus on a non-tab button inside it, → jumps to the first tab and ← to the last, and runs that tab's handler.

