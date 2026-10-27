---
title: Components
description: Dialogs, menus, toasts, tooltips, keyboard lists, tabs, pagination, scroll areas, carousel, and countdown from the starter.
sidebar:
  order: 3
---

The starter's `app/ui.js` implements these components with focus and keyboard handling that work
in the launcher renderer. Import them as they are or use them as a reference.

| Component | Behavior |
| --- | --- |
| `Modal({ onClose, returnFocus })` | Focuses the `autofocus` descendant or the first focusable one; Tab and Shift+Tab cycle inside; Escape or a backdrop click closes; focus returns to the opener |
| `Dropdown({ open, onClose })` | While open, a pointer-down outside or Escape closes; Escape returns focus to the `aria-expanded` button; Up and Down move through the items |
| `Toast({ message, closeLabel, onClose, timeout })` | A message at the bottom that closes after `timeout` ms (6000 by default) or on Escape |
| `useTooltip(value, delay)` | Shows after `delay` ms of hover (400 by default) or on keyboard focus; hides on leave, blur, Escape, or pointer-down |
| `List({ columns })` | Row buttons with Up and Down, Left and Right in grids, Home and End |
| `Tabs({ label, tabs, current, onSelect, panel })` | Left and Right with wrap, Home and End, which also select |
| `Pagination({ page, pages, onPage })` | Previous and next buttons; Left and Right turn the page |
| `ScrollArea({ id, onOffset, snap, snapOffset, snapDelay })` | Reports its scroll offset and, with `snap`, settles on the nearest anchor after scrolling stops; `scrollTo(id, target)` scrolls it |
| `Markdown({ source })` | See [Markdown](../markdown/) |
| `Countdown({ prefix })` | Time left until the featured event of `data/calendar.json` |

## Focus and keyboard

The renderer has a few gaps that shape these components:

- **Escape and global keys** are listened on `window`, since native events never reach `document`.
  `useEscape(active, handler, priority)` lets the topmost layer (a modal over a dropdown) win.
- **Closed things are not rendered.** Hidden focusable elements would still take focus, so menus,
  dialogs, and tooltips exist only while open.
- **Tab order is DOM order;** positive `tabindex` is ignored. The modal's focus trap cycles through
  `focusables(root)`.
- **There is no `<select>`.** The language and setting menus are a `Dropdown` with one button per
  value.

The modal shows all of it: the focus trap and Escape live on `window`, and focus goes back to the
opener on close.

```js
export function Modal({ onClose, returnFocus, children }) {
  const overlay = useRef(null);
  const close = useLatest(onClose);
  useEscape(true, () => close.current(), 1);
  useLayoutEffect(() => {
    const root = overlay.current;
    const opener = document.activeElement;
    openModals.push(root);
    (root.querySelector("[autofocus]") ?? focusables(root)[0])?.focus();
    const trap = (event) => {
      if (event.key !== "Tab" || openModals[openModals.length - 1] !== root) return;
      const items = focusables(root);
      if (items.length === 0) return;
      const index = items.indexOf(document.activeElement);
      const next = event.shiftKey ? (index <= 0 ? items.length - 1 : index - 1) : (index + 1) % items.length;
      event.preventDefault();
      items[next].focus();
    };
    window.addEventListener("keydown", trap);
    return () => {
      window.removeEventListener("keydown", trap);
      openModals.splice(openModals.indexOf(root), 1);
      const target = opener?.isConnected && opener !== document.body ? opener : returnFocus && document.querySelector(returnFocus);
      target?.focus();
    };
  }, []);
  return html`<div class="overlay" ref=${overlay} onClick=${(event) => event.target === overlay.current && close.current()}>${children}</div>`;
}
```

## Carousel and countdown

`pages/home.js` advances its highlights every 7 s with a `setInterval` timer. It pauses while
hovered, while focus is inside, past 200 px of scroll, or with the player's animations setting
off, and fades the slide art with the scroll offset from `ScrollArea`.

`Countdown` refreshes every 30 s with `useNow(30_000)` and shows the time until
`calendar.countdown.begins`, then "Happening now" or "Ended". Timers follow the Pack Studio clock,
so **Fix time** shows any moment of an event.

## Scrolling and snapping

CSS scroll-snap is not supported. `ScrollArea` snaps in JS: after `snapDelay` ms (180 by default)
without scrolling, it moves to the nearest anchor in the direction of the last movement. Anchors
are `"start"`, `"end"`, or descendant selectors, placed `snapOffset` px above the element.
