---
title: Studio checks
description: Run complete pack checks without writing build output, read text or JSON findings, and fix errors and warnings.
sidebar:
  order: 3
---

`launcher-toolkit check` runs every check once and exits. The preview runs the same checks on every
reload and shows them in the panel's **Checks** tab.

```powershell
launcher-toolkit.exe check pack            # text report
launcher-toolkit.exe check pack --json     # the same findings as JSON
```

| Exit code | Meaning |
| --- | --- |
| `0` | No errors. Warnings may remain |
| `1` | At least one error, or the check could not run |
| `2` | Usage error |

Errors block a preview reload. Fix warnings as well before building or sharing your pack.

## Check without creating output

`check` and `build` both render the configured pages, languages, and launcher phases.
Use `check` for a report without creating a ZIP. `build` prepares required styles and runs
the same complete checks before writing its output. Findings can look like this:

```text
error [resources] assets/images/missing.svg: `assets/images/missing.svg` is requested but not in the pack (page about, language pt, phase checking)
warning [translations] templates/layout.html:14: t('language'): i18n/es.json has no `language`
warning [widgets] templates/pages/about.html:40: data-widget="sparkle" is not in the widget table
1 error(s), 2 warning(s)
```

The starter's Windows CI runs `build`, so every check also runs there.
Run `check` locally when you want feedback before building or pushing.

## Output

Text lines have the form `error|warning [check] file:line: message`; the file or line is left
out when unknown. The last line counts the findings.

`--json` prints one object:

```json
{
  "errors": [
    {
      "check": "validate",
      "file": "templates/pages/about.html",
      "line": 40,
      "message": "templates/pages/about.html: line 40: the `safe` filter is not allowed"
    }
  ],
  "warnings": []
}
```

`file` and `line` are `null` when unknown. Paths are relative to the pack folder.

## Checks

| ID | Severity | What it checks |
| --- | --- | --- |
| `zip` | error | Builds the ZIP in memory with the code of `build` and reads it back with the launcher's ZIP rules: paths, runtime file set, sizes |
| `validate` | error | Schemas of `pack.json`, `window.json`, languages and data; template rules; template compilation |
| `core-api` | error | Features of core API 2 used in a pack that declares `core_api: 1` |
| `render` | error | Renders every page × language × launcher phase with default state, plus the splash in every language. Any `ERROR template` line fails, with template name and line |
| `resources` | error | Images and fonts requested during that render matrix but missing from the pack, and missing targets of stylesheet `url()` and quoted `@import` |
| `translations` | warning | Literal `t('…')` keys missing from a language file, `t()` fallbacks during the render matrix, and keys present in one language but missing in another |
| `widgets` | warning | `data-widget` names and widget `data-*` attributes that the widget table of this core version does not list |
| `polygon` | warning | For `main` and `splash`: the root element's computed `clip-path: polygon(…)` against the `window.json` `polygon`: same vertices, same cyclic order, each within 0.5 px. A `null` polygon expects no `clip-path` |
| `mark` | warning | The splash's anti-cheat mark placeholder: the first `data-widget="anticheat-mark"` element must have a layout box of at least 120 × 24 px that lies entirely inside the window and inside its polygon |
| `styles` | warning | `styles/app.css` differs from a fresh compile of `styles/input.css`. Without the Tailwind executable, the warning says the check did not run |

## Fixing findings

| Finding | Fix |
| --- | --- |
| `zip`, `validate`, `core-api` | The same errors as `build`; see [validation errors](../validation-errors/) |
| `render` | Open the named template and line. A render error often depends on state: reproduce it in the preview with the [state simulator](../state-simulator/) |
| `resources` | Add the file under `assets/`, or correct the path in `asset('…')` or `url()`. Names are case-sensitive in the pack |
| `translations` | Add the key to every `i18n/<code>.json`. The default language is the reference: a missing key shows the default text |
| `widgets` | Use a name and attributes from the [widget reference](../studio/#generate-the-widget-reference); an unknown widget is ignored by the launcher |
| `polygon` | Make the root element's `clip-path` describe the same polygon as `window.json`, in px of the window. See [windows and splash](../../reference/windows/) |
| `mark` | Give the splash one `data-widget="anticheat-mark"` element of at least 120 × 24 px, inside the window and its polygon. The launcher draws the EMAC mark there at 100% opacity; a missing or invalid placeholder moves the mark to the bottom-right corner. Never put the EMAC LAB logo in your pack |
| `styles` | Run `launcher-toolkit styles pack` and commit `styles/app.css`. See [Tailwind styles](../tailwind-styles/) |

Pack Studio's own runtime diagnostics also appear on stderr during `check`, for example
`Pack warning: missing asset …`. The report lines above are the authoritative result.

## Scratch data

Checks use a separate scratch profile. Use `--data-dir <dir>` to keep a check run separate from
your regular Studio profile.

