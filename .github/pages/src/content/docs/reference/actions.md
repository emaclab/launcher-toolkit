---
title: Actions and events
description: Event attributes, the handler grammar, dispatch and keyboard order, validation, and every action a pack can run.
sidebar:
  order: 8
---

A pack never runs code. Interaction is declared in `data-on-*` attributes whose values are short handler strings, for example `data-on-click="set('tab', 'news'); focus('#search')"`. The core parses each handler, validates it against `pack.json`, and runs the listed actions itself. Widgets add behaviour on top of the same mechanism; see [widgets](../../widgets/).

## Event attributes

| Attribute | Fires on | Notes |
| --- | --- | --- |
| `data-on-click` | Primary-button click; Enter or Space on the focused element that carries the attribute | Ignored when the target or any element between it and the handler has `disabled`. |
| `data-on-mousedown` | Primary-button pointer-down | The only place where `drag()` is valid. |
| `data-on-input` | The text of an `<input>` changed | `$value` is the new text. |
| `data-on-key-<key>` | Key-down | `<key>` is `enter`, `space`, `escape`, `tab`, `arrowup`, `arrowdown`, `arrowleft`, `arrowright`, `home`, `end`, `pageup`, or `pagedown`. Modifiers are not distinguished. |
| `data-on-close` | Synthesized by the [`modal`](../../widgets/modal/), [`dropdown`](../../widgets/dropdown/), and [`toast`](../../widgets/toast/) widgets | Runs on the widget element itself. |

There are no hover, focus, blur, scroll, change, or wheel handlers. Hover styling is CSS (`:hover`); hover and focus *behaviour* exists only through the [`tooltip`](../../widgets/tooltip/) and [`carousel`](../../widgets/carousel/) widgets; scroll position reaches templates through the [`scroll`](../../widgets/scroll/) widget.

### Dispatch

For each event the core walks from the target element up to the root. **Only the nearest element with a matching attribute runs**; ancestors do not. There is no bubbling and no stop-propagation to manage.

```html
<main class="app" data-on-key-escape="set('lang_menu', false)">
  {#- Escape while this input has focus runs only set('query', ''). #}
  <input type="text" value="{{ state.query }}" aria-label="{{ t('search') }}"
         data-on-input="set('query', $value)" data-on-key-escape="set('query', '')">
</main>
```

Key events use the chain of the focused element. When nothing has focus, they use the chain of the template's root element, so a `data-on-key-*` on the root acts globally.

Enter and Space activate only an element that is focused **and** carries `data-on-click` itself. A `data-on-click` on a wrapper `<div>` works for the mouse but not for the keyboard, because a `<div>` cannot take focus. Put handlers on `<button>` elements.

## Handler grammar

```text
handler := call (";" call)* [";"]       at most 16 calls, at most 1024 characters
call    := name "(" [arg ("," arg)*] ")"
name    := [a-z_]+
arg     := string | number | "true" | "false" | "null" | "$value"
string  := "'" ( any character except ' and \ | "\'" | "\\" )* "'"
number  := "-"? [0-9]+ ("." [0-9]+)?
```

- Whitespace between tokens is ignored. Strings use single quotes only.
- The 1024-character limit counts Unicode characters after HTML entity decoding, including whitespace and escapes.
- `$value` is valid only in `data-on-input`.
- Arguments are literals. Dynamic values come from the template through the `arg` filter, which quotes and escapes them:

```html
<button data-on-click="set('article', {{ item.id|arg }}); set('read', {{ item.id|arg }}, true)">
```

The [template lint](../templates/#escaping-and-lint-rules) requires every `{{ … }}` inside a `data-on-*` value to end with `|arg` and rejects `{% %}` and `{# #}` there.

## Handler rules

- A syntax error, unknown action, wrong argument count/type, undeclared state name, or unknown page/language rejects the whole handler. Check the log and fix it.
- Calls run in the written order. A refused state write or unavailable action does not stop later valid calls.
- `focus()` and `scroll_to()` can target elements made visible by an earlier state change in the same handler.
- Put `drag()` on a pointer-down handler for a dedicated drag area.
- Do not add action handlers to the splash: the splash runs no actions.

## Action reference

### State actions

| Action | Arguments | Effect |
| --- | --- | --- |
| `set` | `(name, value)` | Writes a declared variable with coercion. `null` writes the declared default. A `set` variable accepts only `null` here. |
| `set` | `(name, item, on)` | `name` is a `set` variable; `item` is a string or number; `on` is `true` (add) or `false` (remove). |
| `toggle` | `(name)` | Flips a `bool`. |
| `toggle` | `(name, item)` | Flips `item`'s membership in a `set`. |

Coercion rules: `bool` takes `true`/`false` or the strings `'true'`/`'false'`; `int` takes an integer or a decimal integer string; `float` takes a finite number or numeric string; `string` takes a string or a number (written as its decimal text). Values outside `min`/`max`, outside `values`, longer than 1024 characters, or a set above 1000 items are refused. See [state and settings](../state-settings/).

```html
{# int with min/max: the template computes the next value #}
<button data-on-click="set('article_size', {{ (state.article_size + 1)|arg }})">+</button>
{# set membership #}
<button data-on-click="toggle('news_filter', {{ category|arg }})">{{ t(category) }}</button>
{# restore defaults #}
<button data-on-click="set('accent', null); set('density', null)">{{ t("resetSettings") }}</button>
```

### Navigation and language

| Action | Arguments | Effect |
| --- | --- | --- |
| `navigate` | `(page)` | `page` must be listed in `pages`. When the page changes, every `reset: "page"` variable returns to its default first. |
| `set_language` | `(code)` | `code` must be in `languages.available`. The choice is saved in the preferences file. |

### Launcher actions

The update and launch flow belongs to the launcher session. An action asks for a transition; the
session checks the current phase (and, for **Play**, the anti-cheat handshake) and refuses a request
that does not fit, so buttons can stay simple. Disable or hide them for clarity.

| Action | API | Accepted in | Result |
| --- | --- | --- | --- |
| `play()` | 1 | `ready`, with the anti-cheat handshake complete | `launching`: the splash opens and the main window hides; then `launched`, or `launch_failed` with the main window back |
| `check()` | 1 | `ready` | Checks for a game update again, running the update when there is one |
| `retry()` | 1 | `blocked`; `launch_failed`; `ready` while `anticheat.status` is `error`; `checking` while `launcher.check_failed` is `true` | `blocked`: checks the held files again without closing anything, then continues or returns to `blocked`. `launch_failed` and anti-cheat error: restarts the anti-cheat, returns to or stays in `ready`, and clears `anticheat.message`. Failed check: clears `launcher.check_failed` and checks again |
| `repair()` | 3 | `ready`, `launch_failed`, `checking` while `launcher.check_failed` is `true` | Verifies every game file again, ignoring cached results, and downloads broken ones through `checking`, `downloading`, and `verifying`; clears `launcher.check_failed` when it starts again |
| `force_close()` | 3 | `blocked` | Shuts down the processes of `launcher.blocked.processes`, then continues like `retry()` |

The launcher never closes a program without `force_close()`, and never the launcher itself or a
process it started. Ask for confirmation first; see the [`modal`](../../widgets/modal/) example.

`pause()`, `resume()`, and `cancel()` were removed in core API 3 together with the `paused` and
`cancelled` phases. A pack that declares `"core_api": 3` and uses them fails validation; in a pack
that declares `1` or `2` they still parse but do nothing, and the launcher logs a warning.

In Pack Studio these actions change only the simulated launcher, and the **Log** tab records each
outcome; see the [state simulator](../../guides/state-simulator/#the-simulated-launcher) and
[templates: `launcher`](../templates/#launcher).

### Links and folders

| Action | Arguments | Effect |
| --- | --- | --- |
| `open_url` | `(url)` | Opens the default browser. The URL must be `https:` and its host must equal an entry of `game.allowed_hosts` or be a subdomain of one (`www.example.com` matches `example.com`; `notexample.com` does not). A policy refusal is only logged. A browser failure writes `linkFailed` into the `error_state` variable. |
| `pick_folder` | `(name)` | API 2. `name` is a declared `string` without `values`. Opens the Windows folder dialog owned by the main window, starting at the current value when it is an existing folder. OK writes the absolute path; Cancel changes nothing; a failure or a path over 1024 characters writes `pickFailed` into `error_state`. The core never reads, lists, or writes that folder. |

### Window actions

| Action | Arguments | Effect |
| --- | --- | --- |
| `minimize` | `()` | Minimizes this window. |
| `close` | `()` | Closes this window; the process exits when no window is left. |
| `drag` | `()` | Starts moving the borderless window. Valid only in `data-on-mousedown`. |

```html
<header class="titlebar">
  <div class="titlebar-drag" data-on-mousedown="drag()"><span>{{ game.name }}</span></div>
  <button aria-label="{{ t('minimize') }}" data-on-click="minimize()">–</button>
  <button aria-label="{{ t('close') }}" data-on-click="close()">×</button>
</header>
```

### Focus and scrolling

| Action | Arguments | Effect |
| --- | --- | --- |
| `focus` | `(selector)` | Focuses the first focusable element matching the CSS selector. |
| `scroll_to` | `(selector, target)` | Smooth-scrolls the first element matching `selector`. `target` is a number in px, `'start'`, `'end'`, or a descendant selector. A selector target is the descendant's top inside the scroll content minus the container's `data-snap-offset`, clamped to the scroll range. |

```html
<button data-on-click="set('query', ''); set('news_filter', null); focus('#news-search')">{{ t("clearSearch") }}</button>
<button data-on-click="scroll_to('#about-scroll', '#faq')">{{ t("faq") }}</button>
```

## Keyboard order

The core resolves a key-down in this order and stops at the first step that consumes the key. A consumed key skips the renderer's default action.

1. **An open modal:** Tab and Shift+Tab cycle focus inside the most recently opened modal; Escape runs its `data-on-close`.
2. **Escape with no modal:** every open `dropdown` and every `toast` runs `data-on-close`, then every shown `tooltip` hides. The key is consumed when anything closed or hid.
3. **Widget keys** in the focused chain, nearest first: `tabs`, `list`, `pagination`, and an open `dropdown`.
4. **The nearest `data-on-key-<key>` handler.**
5. **Enter or Space** on a focused element with `data-on-click` runs that handler. The renderer has no native button activation.
6. **Renderer default:** Tab moves focus in DOM order, and text inputs are edited.

Consequences:

- While a toast is on screen, Escape closes it and a root `data-on-key-escape` does not run.
- A `data-on-key-tab` handler consumes Tab and breaks Tab navigation inside its subtree. Avoid it.
- Keys that a widget handles in step 3 (for example the arrows inside a `list` or an open `dropdown`) never reach a `data-on-key-*` handler.

## Error reporting

`pack.json` `error_state` names a `string` variable without `values`. The core writes an i18n key into it when a user-visible action fails: `linkFailed` (browser could not open) and, in API 2, `pickFailed` (folder dialog failed). Render it, usually as a [`toast`](../../widgets/toast/), with `t(state.toast)`, and translate both keys in every language.

