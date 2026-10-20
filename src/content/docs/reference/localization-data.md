---
title: Localization, data, and feeds
description: Translation files, localized content, calendar and server schemas, feed limits, and replacement rules.
sidebar:
  order: 4
---

Use translation keys for interface text and localized JSON objects for editorial content. Include useful bundled defaults for offline use.

## Translation file

Every language in `pack.json` needs `i18n/<code>.json`. This is a complete small English file shape; add every key your templates and core error UI use:

```json
{
  "language_name": "English",
  "strings": {
    "home": "Home",
    "play": "Play",
    "linkFailed": "Could not open the browser.",
    "pickFailed": "Could not select that folder."
  },
  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "months_short": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  "weekdays_short": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "date_formats": {
    "short": "%b %d",
    "long": "%B %-d, %Y",
    "month_year": "%B %Y"
  },
  "decimal_separator": "."
}
```

`months` and `months_short` each need 12 entries, January first. `weekdays_short` needs seven, Sunday first. `decimal_separator` requires API 2 and must be one character that is neither a digit nor whitespace; it defaults to `.`. Structured translation fields reject unknown keys, while `strings` is your own key/value map.

```html
<h1>{{ t('home') }}</h1>
<p>{{ '2026-10-19'|date('long') }}</p>
```

The default language's string keys are the reference set. If another language lacks a key, `t()` falls back to the default text and logs a warning once. A key absent everywhere renders as the key itself. Treat those fallbacks as diagnostics, not as a translation plan; run Studio checks for all languages.

### Date tokens

| Token | Expansion |
| --- | --- |
| `%d` | Two-digit day |
| `%-d` | Day without zero padding |
| `%b` | Localized short month name |
| `%B` | Localized full month name |
| `%Y` | Four-digit year |

Use only the date tokens listed above. Other text is literal.

## Free-form data documents

Declare `"data": ["news"]` in `pack.json`, then create `data/news.json`. Read it as `data.news`:

```json
[
  {
    "id": "welcome",
    "date": "2026-10-19",
    "category": "categoryNews",
    "title": { "en": "Welcome", "pt": "Bem-vindo" },
    "paragraphs": [
      { "en": "The new launcher is available.", "pt": "O novo launcher está disponível." }
    ]
  }
]
```

```html
{% for article in data.news %}
<article data-key="{{ article.id }}">
  <h2>{{ article.title|loc }}</h2>
  <p>{{ t(article.category) }} · {{ article.date|date('short') }}</p>
  {% for paragraph in article.paragraphs %}<p>{{ paragraph|loc }}</p>{% endfor %}
</article>
{% endfor %}
```

Add `categoryNews` to every translation file. `loc` chooses a localized value using current/default language fallback. Most document names have no fixed schema, so your template and JSON must agree. Template undefined-property access can fail even when JSON loading succeeds.

Use stable item IDs for DOM keys, selections, read sets, and links. Reordering content should not accidentally give an old article's read state to a new one.

## Calendar document

The name `calendar` has a fixed validated schema. Declare it in `data` and create `data/calendar.json`:

```json
{
  "events": [
    {
      "id": "weekend-bonus",
      "name": { "en": "Weekend bonus", "pt": "Bônus de fim de semana" },
      "start": "2026-10-01",
      "end": "2026-12-31",
      "color": "#4f8cff",
      "weekdays": [0, 6],
      "occurrences": null,
      "schedule": { "en": "Every weekend", "pt": "Todo fim de semana" }
    }
  ],
  "countdown": {
    "begins": "2026-10-24T12:00:00Z",
    "ends": "2026-10-25T23:00:00Z"
  }
}
```

| Field | Rules |
| --- | --- |
| `events` | Array; may be empty |
| Event `id` | Unique `[a-z0-9-]+` string |
| Event `name` | String or nonempty language-to-string object |
| `start`, `end` | `YYYY-MM-DD`; start cannot be after end; dates are inclusive |
| `color` | `#rgb`, `#rrggbb`, or `#rrggbbaa` |
| `weekdays` | Array of `0..6`, Sunday = `0`, or `null` |
| `occurrences` | Array of dates or `null` |
| `schedule` | Optional string/localized label |
| `countdown` | Optional object; RFC 3339 `begins` and `ends`, with begins no later than ends |

An event occurs only when **all** its applicable conditions match: inside the inclusive date range, on a listed weekday when restricted, and on a listed occurrence date when restricted. Setting both recurrence lists means intersection, not union. An empty restriction list matches no days; use `null` for unrestricted recurrence.

Calendar functions and countdown presentation are covered in [templates](../templates/) and the [widget catalog](../../widgets/).

## Server document (API 2)

The name `servers` also has a fixed schema. It is fed through the same game feed, not through a separate polling endpoint:

```json
{
  "updated_at": "2026-10-19T12:00:00Z",
  "servers": [
    { "id": "europe", "name": "Europe", "state": "online", "players": 812, "capacity": 2000 },
    { "id": "america", "name": "America", "state": "maintenance", "message": { "en": "Back at 14:00 UTC" } },
    { "id": "asia", "name": "Asia", "state": "offline" }
  ]
}
```

| Field | Rules |
| --- | --- |
| `updated_at` | Required; RFC 3339 timestamp or `null` when unknown |
| `servers` | Required array |
| Server `id` | Unique `[a-z0-9-]+` string |
| `name` | String or nonempty language-to-string object |
| `state` | Exactly `online`, `maintenance`, or `offline` |
| `players` | Optional nonnegative integer |
| `capacity` | Optional positive integer |
| `message` | Optional string/localized object |

A safe offline default is `{"updated_at": null, "servers": []}`. Distinguish unknown/stale status from a confirmed server outage. `age(data.servers.updated_at)` can expose freshness in the UI; it does not fetch status itself. The widget reference explains the list presentation helpers.

## Feed configuration and transport

```json
"feed": { "url": "https://example.com/launcher/feed.json", "refresh_minutes": 5 }
```

The feed performs an HTTPS GET at startup and at the configured interval. The request timeout is **10 seconds** and the maximum response body is **2 MiB**. It must return one JSON object. `feed: null` disables the subscription.

A response key names a declared document, not a file path:

```json
{
  "news": [
    { "id": "announcement", "date": "2026-10-19", "category": "categoryNews", "title": { "en": "Maintenance complete" }, "paragraphs": [] }
  ],
  "servers": {
    "updated_at": "2026-10-19T12:00:00Z",
    "servers": [{ "id": "europe", "name": "Europe", "state": "online" }]
  }
}
```

### Merge rules

1. Startup data comes from bundled `data/*.json`.
2. A feed key matching a declared data name replaces that **entire document**. There is no deep merge or item patching.
3. Undeclared keys are ignored and logged.
4. `calendar` and `servers` are validated separately. An invalid document retains its current value; other valid documents in the same response can still apply.
5. A transport failure or invalid JSON retains current data; retry waits for the next interval.
6. Accepted changes re-render the UI.

An offline start uses the bundled defaults. Keep those documents complete and useful.
Edit `feed.url` and `feed.refresh_minutes` in `pack.json` to change the feed settings.
Set `feed` to `null` to stop using a feed.

## Content security

Feed content remains data. Templates autoescape it. It cannot add actions through unescaped interpolation, execute scripts, load remote images, replace arbitrary files, or publish a pack. Bundle images/fonts and use local asset paths. Authorize HTTPS links with `allowed_hosts`; feed-provided URLs still go through `open_url` validation.

