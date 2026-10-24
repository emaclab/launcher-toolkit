---
title: Restrictions and limits
description: Supported HTML and CSS, file paths, asset rules, and size limits for launcher packs.
sidebar:
  order: 5
---

Create packs with templates, styles, declared state, actions, and widgets. JavaScript, browser APIs, and HTML forms are not supported.

## Supported features

| Capability | Supported contract |
| --- | --- |
| Templates | MiniJinja HTML fragments with enforced autoescaping |
| Interactions | Registered `data-on-*` actions and `data-widget` behaviors |
| Network data | Configured HTTPS JSON feed |
| External navigation | Validated HTTPS `open_url()` action, in the system browser |
| Images and fonts | Bundled local assets; `<img src>` may also use a remote `https://` image |
| Player settings | Declared state, with optional preference persistence |
| Folder picker | Native dialog storing a string; no access to the selected folder |
| Pack executable code | Not supported |
| Game update and launch | Performed by the launcher session; the pack only presents them and requests actions |

`game.download_size` controls the simulated update in Pack Studio and in a launcher without a configured game update. It does not configure a real download.

## HTML sanitization

Write template body content without `<html>`, `<head>`, or stylesheet links. These elements are not supported in pack templates:

```text
script style link meta base title iframe frame object embed form select option template
```

It also removes `<input>` elements with types `file`, `button`, `submit`, or `reset`, HTML comments, `on*` event attributes, and `href` attributes. Use `<button>` rather than input buttons, dropdown widgets rather than `<select>`, and `data-on-click="open_url(...)"` rather than `<a href>`.

```html
<button data-on-click="open_url({{ game.links.website|arg }})">Visit website</button>
```

The host still must be allowed in `game.allowed_hosts`. Inline CSS belongs in quoted `style` attributes when appropriate, or in the pack's stylesheets; `<style>` in a template is removed.

## Template safety rules

- Autoescape cannot be disabled. `safe` and `{% autoescape %}` blocks are rejected, including whitespace-control forms.
- Interpolations inside start tags must occur inside quoted attribute values.
- Every interpolation in a `data-on-*` attribute must end in `|arg`.
- Template statements and comments (`{% ... %}`, `{# ... #}`) are forbidden **inside** action attribute values. Conditionals may wrap whole attributes.
- Do not concatenate user/feed text into action source manually. `arg` serializes a value as an escaped action literal.
- `tojson` is not an HTML bypass. Its output remains escaped in attributes.

```html
<button data-on-click="set('article', {{ article.id|arg }})">Read</button>
```

See [templates](../templates/) for context, filters, render errors, and keyed updates.

## CSS boundaries

Do not depend on these features in the current renderer:

| Unsupported or unreliable feature | Use instead |
| --- | --- |
| `:has()`, `:focus-visible`, `:focus-within` | Explicit state classes/attributes; `:focus` |
| `scroll-snap-*` | The `scroll` widget and explicit controls |
| `position: sticky` | A fixed layout outside the scroll viewport |
| `text-overflow: ellipsis`, `-webkit-line-clamp` | Deliberate content/layout limits |
| `mix-blend-mode`, `backdrop-filter`, `filter` | Precomposed assets and ordinary backgrounds |
| 3D transforms | Ordinary supported 2D layout |
| `@media (prefers-reduced-motion)` | A declared pack motion setting |
| Positive `tabindex` | Correct DOM order |

`visibility: hidden` hides an entire subtree. Hidden but still-mounted focusable elements may receive Tab focus: render inactive dialogs, menus, and tab panels conditionally rather than hiding them with CSS. A `title` attribute does not create a tooltip; use the tooltip widget.

`clip-path` does not constrain pointer hit testing. Match the root clipping shape with the native window polygon. See [windows](../windows/).

## Resource access

The document base is `http://pack.localhost/`. Only bundled `assets/` and the `styles/` files listed in `pack.json` are served, from memory. Templates, data JSON, translation files, configuration files, and files outside the pack are not runtime web resources.

- Requests to another host or scheme are refused, except remote images in `<img src>` (below). CDN scripts, remote stylesheets, and remote fonts do not load.
- Resource paths cannot escape the pack. Traversal, backslashes, drive letters, and invalid segments are refused.
- `asset('images/banner.png')` resolves an asset and adds a content-hash query for reloads. Do not pass `assets/images/banner.png` to it: the helper adds the prefix.
- CSS font/image URLs resolve relative to the stylesheet, for example `url('../assets/fonts/ui.woff2')` from `styles/app.css`. CSS uses pack files only.
- A missing resource logs `Pack resource not found: <url>`, and `check` reports it as a `resources` error. Check its spelling and include the file.

The JSON feed is a separate constrained transport, not an exception permitting remote UI resources.

### Remote images

An `<img src>` in a template or in feed data may be an absolute `https://` URL of any host, without user information. The launcher downloads it with a 10-second timeout, at most 8 MiB, and at most four downloads at a time. It accepts PNG, JPEG, GIF, or WebP images of up to 4096 px per side that decode completely.

- A failed or invalid image stays empty, logs `Remote image rejected: <url>: <error>`, and is not requested again while the launcher runs. Pack Studio requests it again at the next reload.
- Downloaded images are cached in the launcher's data folder (up to 64 MiB, least recently used first), so a cached image appears immediately, also offline.
- A URL is treated as immutable: to change the image, change the URL, for example with `?v=2`.
- Remote images do not delay the window's first appearance. `check` neither loads them nor reports them as missing.
- Pack Studio's **Offline** switch makes remote image downloads fail while cached images stay.

## Source and archive paths

Use `/` separators. Runtime archive path segments match `[A-Za-z0-9][A-Za-z0-9._-]*`; complete paths are at most **255 bytes**. Template names have the stricter lowercase naming rules described in [pack configuration](../pack-config/).

No spaces, Unicode filenames, `..`, absolute paths, drive prefixes, or backslashes. Avoid case-only filename differences so Windows checkout and archive validation agree. Symlinks are refused. Names beginning with `.` are excluded from the build; they are not a way to include hidden runtime files.

The runtime set contains:

- `pack.json` and `window.json`;
- valid `templates/**/*.html`;
- stylesheets explicitly listed in `styles`;
- listed language and data JSON files;
- all nonhidden files under `assets/`.

Other authoring files are excluded. **Everything under `assets/` is public pack content**: never place private keys, tokens, source archives, or confidential documents there.

## ZIP limits

Build with `launcher-toolkit build`; do not use a general-purpose ZIP program and assume equivalent output.

| Limit | Maximum |
| --- | --- |
| Compressed archive | 64 MiB |
| Entries | 4096 |
| One uncompressed entry | 32 MiB |
| All uncompressed entries | 128 MiB |
| Complete path | 255 bytes |

Create the ZIP with `build`. Do not encrypt, modify, or repackage the generated archive.

## Other bounded inputs

| Input | Limit or rule |
| --- | --- |
| State string | 1024 characters |
| State set | 1000 unique strings; each at most 1024 characters |
| Feed response | 2 MiB, 10-second request timeout |
| Feed interval | Positive integer minutes |
| Markdown widget source | 32 KiB UTF-8 |
| Markdown expansion | Nesting depth 16; 2000 output elements |
| Splash duration | At least 1000 ms |
| Mark placeholder | At least 120 × 24 logical pixels, entirely within the window shape |

The Markdown widget treats raw HTML as text, images as alt text, and disallowed links as text. Over a parsing/output limit it falls back to a paragraph containing the source; do not use that fallback as a layout strategy.

