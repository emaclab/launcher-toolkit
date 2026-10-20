---
title: Release notes
description: A paged release list with keyboard navigation, client and server note tabs, and Markdown notes, combining list, pagination, tabs, and markdown.
sidebar:
  order: 5
---

A patch-notes page: a paged list of versions on the left, the selected version's notes on the right in two tabs. It shows how four widgets share one page without fighting over the arrow keys.

**Uses:** [`list`](../../widgets/list/), [`pagination`](../../widgets/pagination/), [`tabs`](../../widgets/tabs/), [`markdown`](../../widgets/markdown/). **Core API:** 2 (for `markdown`).

## Declarations

```json title="pack.json"
"core_api": 2,
"pages": ["home", "updates"],
"data": ["releases"],
"state": {
  "release":       { "type": "int",    "default": 0, "min": 0, "reset": "page" },
  "releases_page": { "type": "int",    "default": 1, "min": 1, "reset": "page" },
  "notes_tab":     { "type": "string", "default": "client", "values": ["client", "server"], "reset": "page" }
}
```

`release: 0` means "the newest release"; the template resolves it.

## Data

```json title="data/releases.json"
{
  "releases": [
    {
      "version": 5,
      "date": "2026-10-12",
      "title": { "en": "Matchmaking update" },
      "notes": {
        "client": { "en": "- Faster matchmaking.\n- New scoreboard layout." },
        "server": { "en": "- Region balancing.\n- Fixed a reconnect issue." }
      }
    },
    {
      "version": 4,
      "date": "2026-09-20",
      "title": { "en": "Season 1 finale" },
      "notes": {
        "client": { "en": "Final season rewards." },
        "server": { "en": "Leaderboard reset at the end of the season." }
      }
    }
  ]
}
```

Newest first. The shape is free-form; the template below reads exactly these fields.

## Template

```html title="templates/pages/updates.html"
{%- set releases = data.releases.releases -%}
{%- set newest = releases|first -%}
{%- set selected = (releases|selectattr("version", "eq", state.release)|first if state.release else none) or newest -%}
{%- set per_page = 4 -%}
{%- set pages = [(releases|length + per_page - 1) // per_page, 1]|max -%}
{%- set current_page = [state.releases_page, pages]|min -%}
<div class="updates">
  <div class="release-side">
    <div class="release-list" data-widget="list">
      {%- for item in releases[(current_page - 1) * per_page:current_page * per_page] %}
      {%- set on = item.version == selected.version %}
      <button class="{{ 'release-row selected' if on else 'release-row' }}" aria-pressed="{{ on }}"
              data-key="release-{{ item.version }}" data-on-click="set('release', {{ item.version|arg }})">
        <strong>{{ t("version") }} {{ item.version }}</strong>
        <span>{{ item.title|loc }}</span>
        <time datetime="{{ item.date }}">{{ item.date|date("short") }}</time>
        {%- if item.version == launcher.installed_version %}<i class="tag">{{ t("installed") }}</i>{% endif %}
      </button>
      {%- else %}
      <p class="empty" data-key="empty">{{ t("noReleases") }}</p>
      {%- endfor %}
    </div>
    <div class="pagination" data-widget="pagination" data-state="releases_page" data-pages="{{ pages }}">
      <button class="page-arrow"{% if current_page <= 1 %} disabled{% endif %} aria-label="{{ t('previousPage') }}"
              data-on-click="set('releases_page', {{ [current_page - 1, 1]|max|arg }})">‹</button>
      <span>{{ current_page }} / {{ pages }}</span>
      <button class="page-arrow"{% if current_page >= pages %} disabled{% endif %} aria-label="{{ t('nextPage') }}"
              data-on-click="set('releases_page', {{ [current_page + 1, pages]|min|arg }})">›</button>
    </div>
  </div>
  {%- if selected %}
  <article class="release-panel" data-key="release-panel">
    <header class="release-heading">
      <h1>{{ t("version") }} {{ selected.version }} · {{ selected.title|loc }}</h1>
      <time datetime="{{ selected.date }}">{{ selected.date|date("long") }}</time>
      <button class="secondary-button"{% if launcher.phase != "ready" %} disabled{% endif %} data-on-click="check()">{{ t("checkUpdates") }}</button>
    </header>
    <div class="tabs" role="tablist" aria-label="{{ t('patchNotes') }}" data-widget="tabs">
      {%- for tab in ["client", "server"] %}
      <button id="tab-{{ tab }}" class="{{ 'tab active' if state.notes_tab == tab else 'tab' }}" role="tab"
              aria-selected="{{ state.notes_tab == tab }}" aria-controls="notes-panel"
              data-on-click="set('notes_tab', {{ tab|arg }})">{{ t("notes." ~ tab) }}</button>
      {%- endfor %}
    </div>
    <div id="notes-panel" class="notes" role="tabpanel" aria-labelledby="tab-{{ state.notes_tab }}">
      <div class="article-body" data-widget="markdown" data-source="{{ selected.notes[state.notes_tab]|loc }}"></div>
    </div>
  </article>
  {%- endif %}
</div>
```

## Translations

```json title="i18n/en.json (strings)"
"version": "Version",
"installed": "Installed",
"noReleases": "No versions published.",
"previousPage": "Previous page",
"nextPage": "Next page",
"checkUpdates": "Check for updates",
"patchNotes": "Patch notes",
"notes.client": "Client",
"notes.server": "Server"
```

## Styles

```css title="styles (structural rules)"
.updates { display: flex; flex: 1; min-height: 0; }
.release-side { display: flex; flex-direction: column; width: 280px; margin-right: 20px; }
.release-list { flex: 1; min-height: 0; overflow-y: auto; }
.release-row { display: flex; flex-direction: column; width: 100%; }
.release-row.selected { border-color: var(--accent); }
.pagination { display: flex; align-items: center; justify-content: space-between; height: 40px; }
.page-arrow:disabled { opacity: 0.4; cursor: default; }
.release-panel { flex: 1; min-width: 0; overflow-y: auto; }
.tab[aria-selected="true"] { border-bottom: 2px solid var(--accent); }
.article-body ul { padding-left: 20px; }
```

## How it behaves

- **Selection.** `release: 0` falls back to the newest version, so the page opens on the latest notes. Selecting a row writes its version.
- **Paging.** The template computes the page count and clamps the current page itself (`current_page`), because the widget's clamp of `releases_page` lands one render later. ←/→ on the arrows step pages.
- **Separate key zones.** `list` is on the rows' container only, `pagination` on the arrow container, `tabs` on the tab list. With focus on a row, ↑/↓, Home, and End move between rows. With focus on a page arrow, ←/→ change the page. With focus on a tab, ←/→ switch tabs and select them.
- **Notes.** The tab panel holds one `markdown` element whose source follows `notes_tab`; switching tabs replaces the expanded content, and an unchanged source changes nothing.
- **Installed tag.** `launcher.installed_version` marks the version the launcher considers installed.

