// Componentes e hooks compartilhados pela aplicação do pack.
// Listeners globais de teclado ficam em `window`: eventos nativos percorrem os
// elementos e chegam a `window`, mas não a `document`.
import { createContext, h, html, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "../vendor/preact.js";
import { countdown } from "./dates.js";
import { renderMarkdown } from "./markdown.js";

/** What every page reads: game, translations, data, settings, session and app actions. */
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

/** The latest value of `value`, for listeners registered once. */
function useLatest(value) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/** Enabled focusable descendants of `root`, in DOM order. */
export function focusables(root) {
  return Array.from(root.querySelectorAll("button, input, [tabindex]")).filter((element) => !element.hasAttribute("disabled"));
}

// Escape closes the most recent open layer: modals first, then menus, toasts and tooltips.
const escapeLayers = [];
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || escapeLayers.length === 0) return;
  const top = Math.max(...escapeLayers.map((layer) => layer.priority));
  const layer = escapeLayers.filter((entry) => entry.priority === top).pop();
  event.preventDefault();
  layer.handler.current();
});

/** While `active`, Escape runs `handler` when this is the most recent layer. */
export function useEscape(active, handler, priority = 0) {
  const latest = useLatest(handler);
  useEffect(() => {
    if (!active) return undefined;
    const layer = { handler: latest, priority };
    escapeLayers.push(layer);
    return () => escapeLayers.splice(escapeLayers.indexOf(layer), 1);
  }, [active]);
}

/** The current time, refreshed every `interval` ms: countdowns and data ages. */
export function useNow(interval) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}

// Only the most recently opened modal is active.
const openModals = [];

/**
 * A dialog over the whole window. On open it focuses the `autofocus` descendant, or the first
 * focusable one; Tab and Shift+Tab cycle inside; Escape or a click on the backdrop closes. On
 * close, focus returns to the element that opened it or, if that one is gone, to `returnFocus`.
 */
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

/**
 * A menu container. While `open`, a pointer-down outside or Escape calls `onClose`; Escape also
 * returns focus to the `aria-expanded` button, and Up/Down move focus through the menu. Render the
 * menu only while open, so that Tab never reaches a closed one.
 */
export function Dropdown({ className, open, onClose, children }) {
  const root = useRef(null);
  const close = useLatest(onClose);
  useEscape(open, () => {
    close.current();
    root.current?.querySelector("[aria-expanded]")?.focus();
  });
  useEffect(() => {
    if (!open) return undefined;
    const outside = (event) => {
      if (!root.current?.contains(event.target)) close.current();
    };
    window.addEventListener("pointerdown", outside);
    return () => window.removeEventListener("pointerdown", outside);
  }, [open]);
  const onKeyDown = (event) => {
    if (!open || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
    const items = focusables(root.current);
    const index = items.indexOf(document.activeElement);
    const next = event.key === "ArrowDown" ? Math.min(items.length - 1, index + 1) : Math.max(0, index - 1);
    event.preventDefault();
    items[next]?.focus();
  };
  return html`<div class=${className} ref=${root} onKeyDown=${onKeyDown}>${children}</div>`;
}

/** A message at the bottom of the window that closes itself after `timeout` ms, or on Escape. */
export function Toast({ message, closeLabel, onClose, timeout = 6000 }) {
  const close = useLatest(onClose);
  useEscape(true, () => close.current());
  useEffect(() => {
    const timer = setTimeout(() => close.current(), timeout);
    return () => clearTimeout(timer);
  }, [message]);
  return html`
    <div class="toast" role="alert">
      <span>${message}</span>
      <button class="toast-close" aria-label=${closeLabel} onClick=${() => close.current()}>×</button>
    </div>`;
}

/**
 * A tooltip trigger. Hovering for `delay` ms, or focusing without a pointer-down, shows the tip
 * `value` in the shared `tip` state; leaving without focus, blurring, Escape or a pointer-down
 * hides it if it is still the one shown. Spread `trigger` on the button and render the tip while
 * `shown`.
 */
export function useTooltip(value, delay = 400) {
  const { tip, setTip } = useApp();
  const timer = useRef(0);
  const pressed = useRef(false);
  const focused = useRef(false);
  const hide = () => setTip((current) => (current === value ? "" : current));
  useEscape(tip === value, hide);
  useEffect(() => () => clearTimeout(timer.current), []);
  return {
    shown: tip === value,
    trigger: {
      onMouseEnter: () => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setTip(value), delay);
      },
      onMouseLeave: () => {
        clearTimeout(timer.current);
        if (!focused.current) hide();
      },
      onFocus: () => {
        focused.current = true;
        if (!pressed.current) setTip(value);
      },
      onBlur: () => {
        focused.current = false;
        pressed.current = false;
        hide();
      },
      onPointerDown: () => {
        pressed.current = true;
        clearTimeout(timer.current);
        hide();
      },
    },
  };
}

/**
 * A list or grid of row buttons with keyboard focus: Up/Down move by one row (`columns` cells in a
 * grid, where Left/Right move by one), Home/End go to the ends. It selects nothing by itself.
 */
export function List({ className, columns = 1, children, ...rest }) {
  const root = useRef(null);
  const onKeyDown = (event) => {
    const container = root.current;
    const rows = Array.from(container.querySelectorAll("button")).filter(
      (row) => row.parentElement === container && !row.hasAttribute("disabled"),
    );
    if (rows.length === 0) return;
    const index = rows.indexOf(document.activeElement);
    const steps = { ArrowDown: columns, ArrowUp: -columns };
    if (columns > 1) Object.assign(steps, { ArrowRight: 1, ArrowLeft: -1 });
    let next;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = rows.length - 1;
    else if (event.key in steps && index >= 0) next = Math.min(rows.length - 1, Math.max(0, index + steps[event.key]));
    else return;
    event.preventDefault();
    rows[next].focus();
  };
  return html`<div class=${className} ref=${root} onKeyDown=${onKeyDown} ...${rest}>${children}</div>`;
}

/** Tabs: Left/Right (with wrap) and Home/End move focus between the tabs and select them. */
export function Tabs({ label, tabs, current, onSelect, panel }) {
  const root = useRef(null);
  const onKeyDown = (event) => {
    const index = tabs.findIndex((tab) => tab.id === current);
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    const next = (moves[event.key] + tabs.length) % tabs.length;
    event.preventDefault();
    onSelect(tabs[next].id);
    root.current.querySelector(`#tab-${tabs[next].id}`)?.focus();
  };
  return html`
    <div class="tabs" role="tablist" aria-label=${label} ref=${root} onKeyDown=${onKeyDown}>
      ${tabs.map(
        (tab) => html`
          <button
            id=${`tab-${tab.id}`}
            class=${tab.id === current ? "tab active" : "tab"}
            role="tab"
            aria-selected=${tab.id === current}
            aria-controls=${panel}
            onClick=${() => onSelect(tab.id)}
          >${tab.label}</button>`,
      )}
    </div>`;
}

/** Previous/next page buttons; Left/Right also turn the page. `page` is already in 1..pages. */
export function Pagination({ page, pages, onPage }) {
  const { t } = useApp().i18n;
  const go = (next) => onPage(Math.min(pages, Math.max(1, next)));
  const onKeyDown = (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    go(page + (event.key === "ArrowRight" ? 1 : -1));
  };
  return html`
    <div class="pagination" onKeyDown=${onKeyDown}>
      <button class="page-arrow" disabled=${page <= 1} aria-label=${t("previousPage")} onClick=${() => go(page - 1)}>‹</button>
      <span>${page} / ${pages}</span>
      <button class="page-arrow" disabled=${page >= pages} aria-label=${t("nextPage")} onClick=${() => go(page + 1)}>›</button>
    </div>`;
}

/** The ScrollArea of each id, for `scrollTo`. */
const areas = new Map();

/** Scroll the ScrollArea `id` smoothly to its top ("start"), its end ("end") or a descendant
 * selector, placed like its snap anchors. */
export function scrollTo(id, target) {
  areas.get(id)?.(target);
}

/**
 * A vertical scroll area that reports its offset to `onOffset` and, with `snap`, settles on the
 * nearest anchor in the direction of the last movement once scrolling has paused for
 * `snapDelay` ms. Anchors are "start", "end" or descendant selectors, placed `snapOffset` px
 * above the element.
 */
export function ScrollArea({ id, className, onOffset, snap, snapOffset = 0, snapDelay = 180, children }) {
  const root = useRef(null);
  const last = useRef(0);
  const direction = useRef(0);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  // The offset of an anchor, within the scroll range; null when its element is missing.
  const offsetOf = (anchor) => {
    const area = root.current;
    const max = area.scrollHeight - area.clientHeight;
    let point = anchor === "end" ? max : 0;
    if (anchor !== "start" && anchor !== "end") {
      const element = area.querySelector(anchor);
      if (!element) return null;
      point = element.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop - snapOffset;
    }
    return Math.min(max, Math.max(0, point));
  };
  const record = (offset) => {
    if (Math.abs(offset - last.current) > 0.01) {
      direction.current = Math.sign(offset - last.current);
      last.current = offset;
      onOffset?.(offset);
    }
  };
  // The runtime fires no `scroll` event for programmatic scrolls: a move of the area is recorded
  // at its destination, so that the next gesture starts from there.
  const move = (top) => {
    record(top);
    root.current.scrollTo({ top, behavior: "smooth" });
  };
  useEffect(() => {
    if (!id) return undefined;
    areas.set(id, (target) => {
      const point = offsetOf(target);
      if (point !== null) move(point);
    });
    return () => areas.delete(id);
  });
  const settle = () => {
    const area = root.current;
    if (!area) return;
    const points = snap
      .map(offsetOf)
      .filter((point) => point !== null)
      .sort((a, b) => a - b);
    const now = area.scrollTop;
    if (points.length === 0 || points.some((point) => Math.abs(point - now) <= 0.5)) return;
    const next =
      direction.current >= 0
        ? (points.find((point) => point > now) ?? points[points.length - 1])
        : ([...points].reverse().find((point) => point < now) ?? points[0]);
    move(next);
  };
  const onScroll = () => {
    record(root.current.scrollTop);
    if (snap) {
      clearTimeout(timer.current);
      timer.current = setTimeout(settle, snapDelay);
    }
  };
  return html`<div id=${id} class=${className} ref=${root} onScroll=${onScroll}>${children}</div>`;
}

/** The featured event's countdown from data/calendar.json, refreshed every 30 s:
 * "2d 4h 10m" (after "Starts in" with `prefix`) while upcoming, else "Happening now"/"Ended". */
export function Countdown({ prefix = false }) {
  const { data, i18n } = useApp();
  const now = useNow(30_000);
  const spec = data.calendar.countdown;
  if (!spec) return null;
  const clock = countdown(spec, now);
  if (clock.status !== "upcoming") return i18n.t(`countdown.${clock.status}`);
  return `${prefix ? `${i18n.t("startsIn")} ` : ""}${clock.days}d ${clock.hours}h ${clock.minutes}m`;
}

/** Markdown from the pack's data, with links opened by launcher.openUrl. */
export function Markdown({ source, size, className = "article-body", ...rest }) {
  const { game, openLink } = useApp();
  const nodes = useMemo(
    () => renderMarkdown(source, { allowedHosts: game.allowed_hosts, openLink }),
    [source, openLink],
  );
  return h("div", { class: className, style: size ? `font-size:${size}px` : undefined, ...rest }, nodes);
}
