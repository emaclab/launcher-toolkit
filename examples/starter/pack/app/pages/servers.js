// Server status from data/servers.json, replaced by the remote copy when one arrives
// (data.js). `updated_at` gives the data age, refreshed every 30 s: a missing time means
// "unknown", and data older than 10 minutes shows a warning.
import { html } from "../../vendor/preact.js";
import { age } from "../dates.js";
import { useApp, useNow } from "../ui.js";

const STALE = 600;

function ageText(seconds, t) {
  if (seconds === null) return t("unknown");
  if (seconds < 60) return t("justNow");
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} h`;
  return `${Math.floor(seconds / 86_400)} d`;
}

export function Servers() {
  const { i18n, data } = useApp();
  const { t, loc } = i18n;
  const now = useNow(30_000);
  const { servers, updated_at: updatedAt } = data.servers;
  const updated = age(updatedAt, now);
  const unknown = updated === null;
  const online = servers.filter((server) => server.state === "online");
  const players = online.reduce((sum, server) => sum + (typeof server.players === "number" ? server.players : 0), 0);
  return html`
    <div class="servers">
      <div class="servers-summary">
        <div class="summary-item">
          <span class="quick-label">${t("serversOnline")}</span>
          <strong>${unknown ? "—" : `${online.length} / ${servers.length}`}</strong>
        </div>
        <div class="summary-item">
          <span class="quick-label">${t("playersOnline")}</span>
          <strong>${unknown ? "—" : players}</strong>
        </div>
        <div class="summary-item">
          <span class="quick-label">${t("lastUpdate")}</span>
          <strong>${ageText(updated, t)}</strong>
        </div>
      </div>
      ${unknown && html`<p class="notice" key="notice-unknown">${t("statusUnknown")}</p>`}
      ${!unknown && updated > STALE && html`<p class="notice" key="notice-stale">${t("statusStale")}</p>`}
      <div class="server-list">
        ${servers.map((server) => {
          const status = unknown ? "unknown" : server.state;
          const load = !unknown && typeof server.players === "number" && typeof server.capacity === "number";
          return html`
            <div class="server-card" key=${`server-${server.id}`} data-state=${status}>
              <div class="server-heading">
                <span class="server-dot"></span>
                <strong>${loc(server.name)}</strong>
                <span class="server-state">${t(`server.${status}`)}</span>
              </div>
              ${load &&
              html`
                <div class="server-load">
                  <div class="load-bar" role="progressbar" aria-label=${t("playersOnline")} aria-valuemin="0" aria-valuemax=${server.capacity} aria-valuenow=${server.players}>
                    <span style=${`width:${Math.min((server.players / server.capacity) * 100, 100)}%`}></span>
                  </div>
                  <span>${server.players} / ${server.capacity}</span>
                </div>`}
              ${server.message && html`<p class="server-message">${loc(server.message)}</p>`}
            </div>`;
        })}
        ${servers.length === 0 && html`<p class="empty">${t("noServers")}</p>`}
      </div>
    </div>`;
}
