---
title: Authoring conventions
description: Naming, files, layout, translations, settings, and review conventions for pack authors.
sidebar:
  order: 6
---

This page separates **enforced contracts** from **recommended project conventions**. Follow the schema and runtime limits even if your own repository uses different editorial conventions.


## Enforced names

| Item | Pattern or rule |
| --- | --- |
| Game ID | `[a-z0-9-]{1,64}` |
| Page/data slugs | Unique `[a-z0-9-]+` |
| State variable | `[a-z][a-z0-9_]*` |
| Language code | Unique `[a-z]{2}` |
| Template name | Lowercase letters, digits, `_`, `-`, `/`, ending in `.html` |
| Archive path segment | `[A-Za-z0-9][A-Za-z0-9._-]*` |
| Runtime path separator | `/`, never `\` |

Use kebab-case filenames and stable content IDs as a convention. Use snake_case state names. Avoid filename differences that depend only on case.

## Complete packs, not overlays

Every branch includes all of its templates, styles, fonts, images, data, translations, and window configuration. No inheritance or `extends` exists. A seasonal branch must work on its own after checkout.

- Keep the fixed tenant root `pack/`.
- Keep authoring notes, local build outputs, and repository automation outside runtime assets.
- Commit compiled `styles/app.css` alongside `styles/input.css`.
- Keep stylesheet imports local to the same complete pack.
- Do not rename `game.id` or change identity to represent a theme.
- Do not add removed top-level `id`, `version`, or `extends` fields.


## Layout and templates

Use `layout.html` as the main shell, `pages/` for page fragments, and macros/includes for repeated markup. This is a recommendation, not a filename-based router: `window.json` selects the root and your templates select page content.

Prefer explicit declarative state over hidden behavior. Name independent scroll/selection/menu states independently so one component does not unexpectedly control another. Reserve stable `data-key` values for repeated or conditionally mounted nodes that need identity across re-renders.

Keep static IDs unique. A DOM key must represent the same logical item across renders; do not use a list position for a reordered article. Put appropriate `data-key` values on menus/dialogs that are conditionally rendered.

Never interpolate raw action syntax. All dynamic action arguments end in `|arg`:

```html
<button data-key="news-{{ article.id }}"
        data-on-click="navigate('news'); set('article', {{ article.id|arg }})">
  {{ article.title|loc }}
</button>
```

This fragment assumes `news` is a declared page, `article` is declared string state, and `article` in the loop context is a data object. Navigation resets page-scoped state before the later `set()` runs. See [actions](../actions/) for ordering.

## Translation and editorial content

- Use `t('key')` for interface labels, categories, accessibility labels, and core error keys.
- Use localized objects plus `|loc` for article titles, paragraphs, and other editorial content.
- Add keys in every supported language together; do not depend on fallback for normal operation.
- Keep stable article/event/server IDs across translation edits.
- Use `YYYY-MM-DD` for calendar dates and RFC 3339 with an offset for instants.
- Bundle useful data defaults for offline starts.
- Remember that a feed replaces complete documents. Removing an entry from a feed document removes it from that current document.

The docs are English; each pack's product copy may use its supported languages.

## Settings design

Persist genuine user preferences, not transient menus, hover values, modal visibility, or scroll bookkeeping. Use `reset: "page"` for temporary page-local state. Keep an unrestricted error string available for core error reporting.

A setting only takes effect if you use it in templates/styles. Explain settings honestly: a stored screenshots folder is not an implemented screenshot feature, and a motion flag is not automatic operating-system reduced-motion integration.

See [state and settings](../state-settings/) before changing a persisted type, enum, or range.

## Keyboard and accessibility review

- Use real `<button>` elements for actions; Enter and Space activation are core behavior.
- Label icon-only controls and associate tooltips with `aria-describedby`.
- Keep focus order in DOM order; do not depend on positive `tabindex`.
- Render closed interactive overlays and inactive panels conditionally.
- Preserve visible `:focus` styling; do not depend on `:focus-visible` support.
- Verify Escape, Tab, arrow navigation, and focus restoration for the widgets you use.
- Keep tooltips noninteractive; put actions in a dialog or menu instead.
- Use text as well as color for important status changes.

ARIA markup helps express intent but does not make every browser accessibility behavior available in the native renderer. Validate the actual Studio interaction, not only the HTML.

## Assets and legal review

Use licensed fonts/images and retain their notices. Include only assets needed by the game UI. Do not add an EMAC LAB logo file to the pack. Follow the template's license and retain its required notices.

Optimize oversized images before building. Check the archive limits rather than assuming a repository's allowed file size equals a pack's allowed size.

## Review before building

1. Confirm your project's `game.id` and display name.
2. Compile CSS and review the resulting committed change.
3. Run Studio checks and the deterministic pack builder.
4. Inspect all pages, languages, empty content, long content, and errors in native Studio.
5. Exercise menus, dialogs, tooltips, filters, lists, scroll controls, and persistent settings.
6. Preview launcher phases and splash without claiming that the simulated game client is a real updater.
7. Check offline defaults and stale server status.
8. Review the runtime file set for accidental confidential content.

