---
title: News reader
description: A news page with accent-insensitive search, category chips, a keyboard-navigable list, Markdown articles, persisted read marks, and an unread badge.
sidebar:
  order: 3
---

A two-column news page: search and filters with the article list on the left, the selected article on the right. Read marks persist across launches and feed an unread badge in the navigation.

**Uses:** [`list`](../../widgets/list/), [`markdown`](../../widgets/markdown/), `fold()`, `focus()`, `set` variables. **Core API:** 2.

## Declarations

```json title="pack.json"
"core_api": 2,
"pages": ["home", "news"],
"data": ["news"],
"state": {
  "article":     { "type": "string", "default": "" },
  "read":        { "type": "set",    "default": [], "persist": true },
  "query":       { "type": "string", "default": "", "reset": "page" },
  "news_filter": { "type": "set",    "default": [], "reset": "page" }
}
```

- `article` is not reset on navigation, so the reader reopens the last article. An empty value means "the newest".
- `read` persists in the player's preferences; a `set` holds at most 1000 strings.
- `query` and `news_filter` start empty on every visit.

## Data

```json title="data/news.json"
[
  {
    "id": "season-2",
    "date": "2026-10-15",
    "category": "categoryEvent",
    "title": { "en": "Season 2: Frontier" },
    "body": { "en": "**Season 2** starts on November 15.\n\n## What is coming\n\n- The **Frontier** map.\n- Season rewards every 10 levels.\n\nRead the rules on the [official website](https://example.com/season-2)." }
  },
  {
    "id": "patch-5",
    "date": "2026-10-12",
    "category": "categoryUpdate",
    "title": { "en": "Version 5 patch notes" },
    "body": { "en": "1. Faster matchmaking.\n2. Fixed the scoreboard layout." }
  }
]
```

Newest first: the page treats the first item as the default article. `category` holds an i18n key; `title` and `body` are localized objects. A feed can replace the whole document at runtime.

## Template

```html title="templates/pages/news.html"
{%- set selected = data.news|selectattr("id", "eq", state.article)|first or data.news|first -%}
{%- set q = fold(state.query|trim) -%}
{%- set categories = data.news|map(attribute="category")|unique|list -%}
<div class="news">
  <div class="news-side">
    <input id="news-search" class="search" type="text" value="{{ state.query }}" placeholder="{{ t('searchNews') }}"
           aria-label="{{ t('searchNews') }}" data-on-input="set('query', $value)" data-on-key-escape="set('query', '')">
    <div class="chips" role="group" aria-label="{{ t('filterCategory') }}">
      {%- for category in categories %}
      {%- set on = category in state.news_filter %}
      <button class="{{ 'chip on' if on else 'chip' }}" aria-pressed="{{ on }}"
              data-on-click="toggle('news_filter', {{ category|arg }})">{{ t(category) }}</button>
      {%- endfor %}
    </div>
    <div class="news-list" data-widget="list">
      {%- for item in data.news if (not q or q in fold(item.title|loc) or q in fold(item.body|loc)) and (not state.news_filter or item.category in state.news_filter) %}
      {%- set on = selected and item.id == selected.id %}
      <button class="{{ 'news-row selected' if on else 'news-row' }}" aria-pressed="{{ on }}" data-key="{{ item.id }}"
              data-on-click="set('article', {{ item.id|arg }}); set('read', {{ item.id|arg }}, true)">
        <span class="category">{{ t(item.category) }}</span>
        <strong>{{ item.title|loc }}</strong>
        <time datetime="{{ item.date }}">{{ item.date|date("short") }}</time>
        {%- if item.id not in state.read %}<i class="unread-dot" aria-label="{{ t('unread') }}"></i>{% endif %}
      </button>
      {%- else %}
      <div class="no-results" data-key="no-results">
        <p class="empty">{{ t("noResults") }}</p>
        <button class="link-button" data-on-click="set('query', ''); set('news_filter', null); focus('#news-search')">{{ t("clearSearch") }}</button>
      </div>
      {%- endfor %}
    </div>
  </div>
  {%- if selected %}
  <article class="article" data-key="article-{{ selected.id }}">
    <div class="article-heading">
      <span class="category">{{ t(selected.category) }}</span>
      {%- if selected.id in state.read %}
      <button class="text-button" data-key="mark-unread" data-on-click="set('read', {{ selected.id|arg }}, false)">{{ t("markUnread") }}</button>
      {%- endif %}
    </div>
    <h1>{{ selected.title|loc }}</h1>
    <time datetime="{{ selected.date }}">{{ selected.date|date("long") }}</time>
    <div class="article-body" data-widget="markdown" data-source="{{ selected.body|loc }}"></div>
  </article>
  {%- else %}
  <p class="empty">{{ t("noNews") }}</p>
  {%- endif %}
</div>
```

Opening the page from the navigation can mark the default article as read in the same handler, and a badge can count the rest:

```html title="templates/layout.html (navigation excerpt)"
{%- set unread = data.news|rejectattr("id", "in", state.read)|list|length %}
{%- set newest = data.news|selectattr("id", "eq", state.article)|first or data.news|first %}
<button class="{{ 'nav-item active' if page == 'news' else 'nav-item' }}"
  {%- if page == "news" %} aria-current="page"{% endif %}
  {%- if newest %} data-on-click="navigate('news'); set('read', {{ newest.id|arg }}, true)"
  {%- else %} data-on-click="navigate('news')"{% endif %}>
  <span>{{ t("news") }}</span>
  {%- if unread %}<span class="badge" aria-label="{{ t('unread') }}: {{ unread }}">{{ unread if unread < 100 else "99+" }}</span>{% endif %}
</button>
```

## Translations

```json title="i18n/en.json (strings)"
"news": "News",
"unread": "Unread",
"categoryEvent": "Event",
"categoryUpdate": "Update",
"searchNews": "Search news",
"filterCategory": "Filter by category",
"noResults": "No news found.",
"clearSearch": "Clear search and filters",
"markUnread": "Mark as unread",
"noNews": "No news yet."
```

Every `category` value in the data must exist as a key; the render check reports missing ones.

## Styles

```css title="styles (structural rules)"
.news { display: flex; flex: 1; min-height: 0; }
.news-side { display: flex; flex-direction: column; width: 300px; margin-right: 20px; }
.news-list { flex: 1; min-height: 0; overflow-y: auto; }
.news-row { position: relative; display: flex; flex-direction: column; width: 100%; }
.news-row.selected { border-color: var(--accent); background: var(--accent-soft); }
.chip[aria-pressed="true"] { background: var(--accent); color: #ffffff; }
.unread-dot { position: absolute; top: 12px; right: 12px; width: 8px; height: 8px; border-radius: 4px; background: var(--accent); }
.article { flex: 1; min-width: 0; overflow-y: auto; }
.article-body p, .article-body ul, .article-body ol { margin: 0 0 10px; }
.article-body .md-link { color: var(--accent); text-decoration: underline; }
input:focus, button:focus { outline: 2px solid var(--accent); outline-offset: 2px; }
```

## How it behaves

- **Search.** Every keystroke writes `query` and re-renders. `fold()` lowercases and removes accents on both sides, so `noticias` finds `Notícias`. Escape in the field clears it. The input is the same node across renders and keeps focus while the list below changes.
- **Filters.** Each chip toggles its category in `news_filter`; an empty set means "all". `set('news_filter', null)` empties it.
- **Empty result.** The `{% else %}` branch of the loop offers a reset that also moves focus back to the search field with `focus()`, because the button itself disappears.
- **List.** ↑/↓, Home, and End move between rows; Enter or Space opens the focused row and marks it read. Keyed rows keep their nodes when the filter changes, so focus stays on the same article if it remains visible.
- **Article.** Keyed by id, so switching articles replaces the article subtree. The `markdown` element expands the body; links to `allowed_hosts` become buttons.

## Variations

- **Text size setting:** add an `int` setting and `style="font-size:{{ state.article_size|num }}px"` on `.article-body`.
- **No API 2:** drop the `markdown` element and `fold()`; render paragraphs from a `paragraphs: [loc]` array with a loop, and filter with `state.query|lower in (item.title|loc|lower)`.

