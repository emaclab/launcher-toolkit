---
title: Settings page
description: Persisted settings with a switch, a select built on dropdown, a stepper, a language control, a folder picker with a tooltip, and a confirmed reset.
sidebar:
  order: 7
---

Settings are declared state with `"persist": true`; the page only renders controls that write them. This example covers every control type and a reset that asks first.

**Uses:** [`dropdown`](../../widgets/dropdown/), [`tooltip`](../../widgets/tooltip/), [`modal`](../../widgets/modal/), `toggle`, `set`, `set_language`, `pick_folder`. **Core API:** 2.

## Declarations

```json title="pack.json"
"core_api": 2,
"pages": ["home", "settings"],
"error_state": "toast",
"state": {
  "toast":           { "type": "string", "default": "" },
  "tip":             { "type": "string", "default": "", "reset": "page" },
  "confirm":         { "type": "string", "default": "", "values": ["", "reset_settings"], "reset": "page" },
  "accent":          { "type": "string", "default": "blue", "values": ["blue", "green", "orange"], "persist": true },
  "accent_menu":     { "type": "bool",   "default": false, "reset": "page" },
  "motion":          { "type": "bool",   "default": true, "persist": true },
  "article_size":    { "type": "int",    "default": 14, "min": 12, "max": 18, "persist": true },
  "screenshots_dir": { "type": "string", "default": "", "persist": true }
}
```

- Persist preferences, never menus, tooltips, or dialogs.
- `screenshots_dir` has no `values`, which `pick_folder` requires. It is display-only: the core never reads, lists, or writes the folder.
- Changing a setting's type, range, or values later can invalidate saved values; invalid saved values fall back to the default. See [state and settings](../../reference/state-settings/).

## Applying settings

Settings change nothing until a template or stylesheet uses them. Put presentation settings on the root element:

```html title="templates/layout.html (root element)"
<main class="app" lang="{{ lang }}" data-page="{{ page }}" data-accent="{{ state.accent }}" data-motion="{{ state.motion }}">
```

```css title="styles"
.app[data-accent="green"] { --accent: #2fbf7f; }
.app[data-accent="orange"] { --accent: #ff8c24; }
.app[data-motion="false"] .slide-story { animation: none; }
```

Feed `motion` to carousels with `data-paused="{{ not state.motion }}"`, and `article_size` to article bodies with `style="font-size:{{ state.article_size|num }}px"`.

## Template

```html title="templates/pages/settings.html"
{%- set accents = ["blue", "green", "orange"] -%}
<div class="settings">
  <div class="setting">
    <div class="setting-text"><strong>{{ t("accentColor") }}</strong><span class="hint">{{ t("accentColorHint") }}</span></div>
    <div class="select" data-widget="dropdown" data-open="{{ state.accent_menu }}" data-on-close="set('accent_menu', false)">
      <button id="accent-button" class="select-button" aria-label="{{ t('accentColor') }}" aria-expanded="{{ state.accent_menu }}"
              data-on-click="toggle('accent_menu')">{{ t("accent." ~ state.accent) }}</button>
      {%- if state.accent_menu %}
      <div class="select-menu" role="listbox" aria-label="{{ t('accentColor') }}" data-key="accent-menu">
        {%- for value in accents %}
        <button class="{{ 'select-option chosen' if value == state.accent else 'select-option' }}" role="option"
                aria-selected="{{ value == state.accent }}"
                data-on-click="set('accent', {{ value|arg }}); set('accent_menu', false); focus('#accent-button')">{{ t("accent." ~ value) }}</button>
        {%- endfor %}
      </div>
      {%- endif %}
    </div>
  </div>

  <div class="setting">
    <div class="setting-text"><strong>{{ t("motion") }}</strong><span class="hint">{{ t("motionHint") }}</span></div>
    <button class="switch" role="switch" aria-label="{{ t('motion') }}" aria-checked="{{ state.motion }}"
            data-on-click="toggle('motion')"><span></span></button>
  </div>

  <div class="setting">
    <div class="setting-text"><strong>{{ t("articleSize") }}</strong><span class="hint">{{ t("articleSizeHint") }}</span></div>
    <div class="stepper" role="group" aria-label="{{ t('articleSize') }}">
      <button class="icon-button" aria-label="{{ t('smaller') }}"{% if state.article_size <= 12 %} disabled{% endif %}
              data-on-click="set('article_size', {{ (state.article_size - 1)|arg }})">−</button>
      <span>{{ state.article_size }} px</span>
      <button class="icon-button" aria-label="{{ t('larger') }}"{% if state.article_size >= 18 %} disabled{% endif %}
              data-on-click="set('article_size', {{ (state.article_size + 1)|arg }})">+</button>
    </div>
  </div>

  <div class="setting">
    <div class="setting-text"><strong>{{ t("language") }}</strong></div>
    <div class="segmented" role="group" aria-label="{{ t('language') }}">
      {%- for l in languages %}
      <button class="{{ 'segment on' if l.code == lang else 'segment' }}" aria-pressed="{{ l.code == lang }}"
              data-on-click="set_language({{ l.code|arg }})">{{ l.code|upper }}</button>
      {%- endfor %}
    </div>
  </div>

  <div class="setting">
    <div class="setting-text">
      <span class="setting-title">
        <strong>{{ t("screenshots") }}</strong>
        <span class="tip-anchor">
          <button class="help" aria-label="{{ t('help') }}" aria-describedby="tip-folder"
                  data-widget="tooltip" data-state="tip" data-value="folder">?</button>
          {%- if state.tip == "folder" %}
          <span id="tip-folder" class="tooltip" role="tooltip" data-key="tip-folder">{{ t("screenshotsTip") }}</span>
          {%- endif %}
        </span>
      </span>
      <span class="hint">{{ state.screenshots_dir or t("notSet") }}</span>
    </div>
    <div class="path-actions">
      {%- if state.screenshots_dir %}
      <button class="secondary-button" data-key="clear-folder" data-on-click="set('screenshots_dir', '')">{{ t("clear") }}</button>
      {%- endif %}
      <button class="secondary-button" data-key="choose-folder" data-on-click="pick_folder('screenshots_dir')">{{ t("choose") }}</button>
    </div>
  </div>

  <div class="settings-footer">
    <span class="hint">{{ t("settingsSaved") }}</span>
    <button id="reset-settings" class="secondary-button" data-on-click="set('confirm', 'reset_settings')">{{ t("resetSettings") }}</button>
  </div>
</div>
```

```html title="templates/layout.html (render last inside the root)"
{%- if state.confirm == "reset_settings" and page == "settings" %}
<div class="overlay" data-key="confirm-reset" data-widget="modal" data-on-close="set('confirm', '')" data-return-focus="#reset-settings">
  <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-reset-title" aria-describedby="confirm-reset-text">
    <h2 id="confirm-reset-title">{{ t("resetTitle") }}</h2>
    <p id="confirm-reset-text">{{ t("resetText") }}</p>
    <div class="dialog-actions">
      <button class="dialog-button" autofocus data-on-click="set('confirm', '')">{{ t("keepSettings") }}</button>
      <button class="dialog-button danger"
              data-on-click="set('accent', null); set('motion', null); set('article_size', null); set('screenshots_dir', null); set('confirm', '')">{{ t("resetConfirm") }}</button>
    </div>
  </div>
</div>
{%- endif %}
{%- if state.toast %}
<div class="toast" role="alert" data-key="toast-{{ state.toast }}" data-widget="toast" data-timeout="6000" data-on-close="set('toast', '')">
  <span>{{ t(state.toast) }}</span>
  <button class="toast-close" aria-label="{{ t('close') }}" data-on-click="set('toast', '')">×</button>
</div>
{%- endif %}
```

## Translations

```json title="i18n/en.json (strings)"
"accentColor": "Accent color",
"accentColorHint": "Buttons, tabs and indicators.",
"accent.blue": "Blue",
"accent.green": "Green",
"accent.orange": "Orange",
"motion": "Animations",
"motionHint": "Automatic highlight rotation and transitions.",
"articleSize": "Article text",
"articleSizeHint": "News, patch notes and answers.",
"smaller": "Smaller",
"larger": "Larger",
"language": "Language",
"screenshots": "Screenshot folder",
"help": "Help",
"screenshotsTip": "An example folder setting. The launcher keeps only the path; it does not read or write files in it.",
"notSet": "No folder chosen",
"clear": "Clear",
"choose": "Choose…",
"settingsSaved": "Settings are saved on this computer.",
"resetSettings": "Restore defaults",
"resetTitle": "Restore the settings?",
"resetText": "All the options on this page go back to their default values.",
"keepSettings": "Keep",
"resetConfirm": "Restore",
"close": "Close",
"linkFailed": "Unable to open the browser.",
"pickFailed": "Unable to choose the folder."
```

## Styles

```css title="styles (structural rules)"
.setting { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; }
.setting-text { display: flex; flex-direction: column; min-width: 0; margin-right: 16px; }
.select, .tip-anchor { position: relative; }
.select-menu { position: absolute; top: 100%; right: 0; z-index: 20; display: flex; flex-direction: column; }
.select-button[aria-expanded="true"] { border-color: var(--accent); }
.select-option.chosen { color: var(--accent); }
.switch { position: relative; width: 42px; height: 24px; border-radius: 12px; background: var(--border); }
.switch span { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 9px; background: #ffffff; }
.switch[aria-checked="true"] { background: var(--accent); }
.switch[aria-checked="true"] span { left: 21px; }
.stepper button:disabled { opacity: 0.4; }
.segment[aria-pressed="true"] { background: var(--accent); color: #ffffff; }
.tooltip { position: absolute; top: 100%; left: 0; z-index: 30; width: 260px; margin-top: 8px; }
```

## How it behaves

- **Persistence.** Declare `persist: true` for settings that should be saved. Studio keeps its preview preferences separate from installed launchers.
- **Select.** The menu opens with Enter or a click; ↓/↑ move through the options; Enter picks one, closes the menu, and `focus('#accent-button')` puts focus back on the trigger. Escape closes it and returns focus to the trigger; a click outside closes it.
- **Stepper.** The template disables each button at its bound; the declaration's `min`/`max` would refuse an out-of-range write anyway.
- **Language.** `set_language` re-renders every text at once and saves the choice.
- **Folder.** **Choose…** opens the Windows folder dialog at the current folder, if it exists. Cancel changes nothing; a failure shows the `pickFailed` toast. **Clear** empties the value.
- **Reset.** The confirmation focuses **Keep**. **Restore** writes `null` to every setting, which writes each declared default. Focus returns to **Restore defaults**.

