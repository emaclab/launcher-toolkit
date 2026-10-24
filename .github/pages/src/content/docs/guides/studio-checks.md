---
title: Studio checks
description: Run complete pack checks without writing build output, read text or JSON findings, test a feed body, and fix errors and warnings.
sidebar:
  order: 3
---

`launcher-toolkit check` runs every check once and exits. The preview runs the same checks on every
reload and shows them in the panel's **Checks** tab.

```powershell
launcher-toolkit.exe check pack                          # text report
launcher-toolkit.exe check pack --json                   # the same findings as JSON
launcher-toolkit.exe check pack --feed examples/feed.json  # every check with a feed body merged
```

| Exit code | Meaning |
| --- | --- |
| `0` | No errors. Warnings may remain |
| `1` | At least one error, or the check could not run |
| `2` | Usage error |

Errors block a preview reload. Fix warnings as well before building or sharing your pack.

## Check without creating output

`check` and `build` both render the configured pages, languages, and launcher phases, including
`checking` once while running and once with `launcher.check_failed: true`.
Use `check` for a report without creating a ZIP. `build` runs the same complete checks on exactly
the bytes it writes. Findings can look like this:

```text
error [resources] assets/images/missing.svg: `assets/images/missing.svg` is requested but not in the pack (first render)
warning [translations] templates/pages/home.html:31: t('nothere'): i18n/en.json has no `nothere`
warning [widgets] templates/pages/home.html:31: data-widget="sparkle" is not in the widget table
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
      "file": "templates/pages/home.html",
      "line": 31,
      "message": "templates/pages/home.html: line 31: the `safe` filter is not allowed"
    }
  ],
  "warnings": []
}
```

`file` and `line` are `null` when unknown. Paths are relative to the pack folder.

## Check with a feed body

`--feed <file>` reads a JSON file as a feed response and merges it into the pack's data the same
way the launcher does: each top-level key replaces the declared document of that name. Every check,
including the render matrix, then runs on the merged data. A file that cannot be read or is not
JSON makes the command fail with exit code `1`. See
[feed merge rules](../../reference/localization-data/#merge-rules).

## Checks

| ID | Severity | What it checks |
| --- | --- | --- |
| `zip` | error | Reads the pack folder with the code of `build` and the launcher's ZIP rules: paths, runtime file set, sizes, `pack.json` syntax |
| `validate` | error | Schemas of `pack.json`, `window.json`, languages and data; template rules; template compilation; items removed in the declared core API |
| `core-api` | error | Widgets, actions, functions, context fields, schema keys, or data documents of a later core API than the pack declares |
| `render` | error | Renders every page × language × launcher phase (all eight core API 3 phases, with a sample `anticheat.message` in `launch_failed`), plus `checking` with `launcher.check_failed: true`, and the splash in every language. Any template error fails, with template name and line |
| `resources` | error | Images and fonts requested during that render matrix but missing from the pack, and missing targets of stylesheet `url()` and quoted `@import`. `https://` images are not loaded and never count as missing |
| `feed` | error or warning | Only with `--feed`: a body that is not a JSON object or a rejected fixed-schema document is an error; an undeclared key is a warning |
| `translations` | warning | Literal `t('…')` keys missing from a language file, `t()` fallbacks during the render matrix, and keys present in one language but missing in another |
| `widgets` | warning | `data-widget` names and widget `data-*` attributes that the widget table of this core version does not list |
| `polygon` | warning | For `main` and `splash`: the root element's computed `clip-path: polygon(…)` against the `window.json` `polygon`: same vertices, same cyclic order, each within 0.5 px. A `null` polygon expects no `clip-path` |
| `mark` | warning | The splash's anti-cheat mark placeholder: the first `data-widget="anticheat-mark"` element must have a layout box of at least 120 × 24 px that lies entirely inside the window and inside its polygon |

The checks are headless: they never open a window.

## Fixing findings

| Finding | Fix |
| --- | --- |
| `zip`, `validate`, `core-api` | The same errors as `build`; see [validation errors](../validation-errors/) |
| `render` | Open the named template and line. A render error often depends on state or phase: reproduce it in the preview with the [state simulator](../state-simulator/) |
| `resources` | Add the file under `assets/`, or correct the path in `asset('…')` or `url()`. Names are case-sensitive in the pack |
| `feed` | Make the feed body a JSON object whose keys are declared `data` names, and keep fixed-schema documents such as `servers` valid |
| `translations` | Add the key to every `i18n/<code>.json`. The default language is the reference: a missing key shows the default text |
| `widgets` | Use a name and attributes from the [widget reference](../studio/#generate-the-widget-reference); an unknown widget is ignored by the launcher |
| `polygon` | Make the root element's `clip-path` describe the same polygon as `window.json`, in px of the window. See [windows and splash](../../reference/windows/) |
| `mark` | Give the splash one `data-widget="anticheat-mark"` element of at least 120 × 24 px, inside the window and its polygon. The launcher draws the EMAC mark there at 100% opacity; a missing or invalid placeholder moves the mark to the bottom-right corner. Never put the EMAC LAB logo in your pack |

Pack Studio's own runtime diagnostics also appear on stderr during `check`, for example
`Pack warning: missing asset …` or `Feed: ignoring undeclared key …`. The report lines above are
the authoritative result.

## Scratch data

Checks use a separate scratch profile. Use `--data-dir <dir>` to keep a check run separate from
your regular Studio profile.
