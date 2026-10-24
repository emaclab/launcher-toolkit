---
title: Server status
description: A server status page from the fixed servers schema, with data age from age(), unknown and stale states, load bars, and a periodic refresh.
sidebar:
  order: 8
---

Server status comes from the data document named `servers`, which has a fixed, validated schema. The game's feed replaces it at runtime; there is no separate status endpoint. The page shows a summary, a card per server, and warnings when the data is unknown or old.

**Uses:** `data.servers`, `age()`, [`countdown`](../../widgets/countdown/) as a refresh timer. **Core API:** 2.

## Declarations

```json title="pack.json"
"core_api": 2,
"pages": ["home", "servers"],
"data": ["servers"],
"feed": { "url": "https://status.example.com/launcher/feed.json", "refresh_minutes": 5 }
```

The page needs no state. `feed` is optional: with `null`, the page shows the bundled default. The feed body is one JSON object; its `servers` key replaces the whole document when it passes the schema. See [localization, data, and feeds](../../reference/localization-data/#server-document-api-2).

## Data

```json title="data/servers.json (bundled default)"
{
  "updated_at": null,
  "servers": [
    { "id": "sa-east", "name": { "en": "South America" }, "state": "online" },
    { "id": "eu-west", "name": { "en": "Europe" }, "state": "online" }
  ]
}
```

`updated_at: null` makes an offline cold start show "unknown" instead of stale numbers. A feed then delivers, for example:

```json title="feed body (excerpt)"
{
  "servers": {
    "updated_at": "2026-10-19T12:00:00Z",
    "servers": [
      { "id": "sa-east", "name": { "en": "South America" }, "state": "online", "players": 1840, "capacity": 3000 },
      { "id": "eu-west", "name": { "en": "Europe" }, "state": "maintenance", "capacity": 3000,
        "message": { "en": "Scheduled maintenance until 8 AM (UTC)." } }
    ]
  }
}
```

Schema: `id` (`[a-z0-9-]+`, unique), `name` (string or localized), `state` (`online`, `maintenance`, `offline`), optional `players` (int ≥ 0), `capacity` (int ≥ 1), and `message` (string or localized). A feed value that fails the schema is rejected and the current value stays.

## Template

```html title="templates/pages/servers.html"
{%- set s = data.servers -%}
{%- set updated = age(s.updated_at) -%}
{%- set unknown = updated is none -%}
{%- set stale = not unknown and updated > 600 -%}
{%- set online = s.servers|selectattr("state", "eq", "online")|list -%}
{%- set players = online|selectattr("players", "number")|map(attribute="players")|sum -%}
<div class="servers" data-widget="countdown" data-refresh="30000">
  <div class="servers-summary">
    <div class="summary-item">
      <span class="label">{{ t("serversOnline") }}</span>
      <strong>{{ "—" if unknown else online|length ~ " / " ~ s.servers|length }}</strong>
    </div>
    <div class="summary-item">
      <span class="label">{{ t("playersOnline") }}</span>
      <strong>{{ "—" if unknown else players }}</strong>
    </div>
    <div class="summary-item">
      <span class="label">{{ t("lastUpdate") }}</span>
      <strong>
        {%- if unknown %}{{ t("unknown") }}
        {%- elif updated < 60 %}{{ t("justNow") }}
        {%- elif updated < 3600 %}{{ updated // 60 }} min
        {%- elif updated < 86400 %}{{ updated // 3600 }} h
        {%- else %}{{ updated // 86400 }} d{% endif -%}
      </strong>
    </div>
  </div>
  {%- if unknown %}
  <p class="notice" data-key="notice-unknown">{{ t("statusUnknown") }}</p>
  {%- elif stale %}
  <p class="notice" data-key="notice-stale">{{ t("statusStale") }}</p>
  {%- endif %}
  <div class="server-list">
    {%- for srv in s.servers %}
    {%- set status = "unknown" if unknown else srv.state %}
    <div class="server-card" data-key="server-{{ srv.id }}" data-state="{{ status }}">
      <div class="server-heading">
        <span class="server-dot"></span>
        <strong>{{ srv.name|loc }}</strong>
        <span class="server-state">{{ t("server." ~ status) }}</span>
      </div>
      {%- if not unknown and srv.players is number and srv.capacity is number %}
      <div class="load-bar" role="progressbar" aria-label="{{ t('playersOnline') }}" aria-valuemin="0"
           aria-valuemax="{{ srv.capacity }}" aria-valuenow="{{ srv.players }}">
        <span style="width:{{ [srv.players / srv.capacity * 100, 100]|min|num }}%"></span>
      </div>
      <span class="load-text">{{ srv.players }} / {{ srv.capacity }}</span>
      {%- endif %}
      {%- if srv.message %}
      <p class="server-message">{{ srv.message|loc }}</p>
      {%- endif %}
    </div>
    {%- else %}
    <p class="empty">{{ t("noServers") }}</p>
    {%- endfor %}
  </div>
</div>
```

## Translations

```json title="i18n/en.json (strings)"
"serversOnline": "Servers online",
"playersOnline": "Players online",
"lastUpdate": "Data age",
"unknown": "Unknown",
"justNow": "under 1 min",
"statusUnknown": "The server status has not been received yet.",
"statusStale": "This data is out of date. The real status can be different.",
"server.online": "Online",
"server.maintenance": "Maintenance",
"server.offline": "Offline",
"server.unknown": "Unknown",
"noServers": "No servers listed."
```

## Styles

```css title="styles (structural rules)"
.servers-summary { display: flex; }
.server-list { display: flex; flex-wrap: wrap; }
.server-dot { width: 10px; height: 10px; border-radius: 5px; background: var(--muted); }
.server-card[data-state="online"] .server-dot { background: var(--ready); }
.server-card[data-state="maintenance"] .server-dot { background: var(--warning); }
.server-card[data-state="offline"] .server-dot { background: var(--danger); }
.load-bar { height: 6px; overflow: hidden; border-radius: 3px; background: var(--border); }
.load-bar span { display: block; height: 100%; background: var(--accent); }
```

The state lives in `data-state` on an ordinary element, and CSS reads it with attribute selectors. `data-state` here is not a widget attribute: the card has no `data-widget`.

## How it behaves

- **Age.** `age(updated_at)` is whole seconds to `now`, or none for `null`, an empty string, or an invalid time. The `countdown` element re-renders every 30 s, so the age and the stale warning advance between feed fetches.
- **Unknown and stale.** With no timestamp, every card shows "Unknown" and the totals show "—". After 10 minutes without a fresh feed, a warning appears but the last values stay visible.
- **Load.** The bar is drawn only when both `players` and `capacity` exist; `|num` writes the width without exponent, and `min` caps it at 100%.
- **Feed failures.** A failed fetch or invalid JSON keeps the current data; the next attempt happens at the next interval. A response that would break a render is rejected as a whole. The launcher caches accepted feed documents, so a cold start without network shows the last accepted status (still marked stale by `age()`), or the bundled default when there is no valid cache.

## Try it in Studio

The panel's **Feed** control applies a JSON file as a feed body (rejections are shown), resets to the bundled data, or fetches the pack's feed. **Time** moves `now`, which makes the data stale. **Offline** makes fetches fail. `launcher-toolkit check --feed <file>` runs every check with a feed body, so you can test edge cases before publishing them.

