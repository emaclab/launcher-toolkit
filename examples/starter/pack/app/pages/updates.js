// Patch notes: a paged release list and the notes of the selected release in two tabs. The
// heading offers check and repair in `ready` and disables them in every other phase; after a
// failure the launch bar offers repair itself.
import { html, useState } from "../../vendor/preact.js";
import { request } from "../session.js";
import { List, Markdown, Pagination, Tabs, useApp } from "../ui.js";

const PER_PAGE = 4;
const NOTES = ["client", "server"];

export function Updates() {
  const { i18n, data, session, settings } = useApp();
  const { t, loc, date } = i18n;
  const releases = data.releases.releases;
  // 0 selects the newest release.
  const [version, setVersion] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("client");
  const selected = (version && releases.find((item) => item.version === version)) || releases[0];
  const pages = Math.max(Math.ceil(releases.length / PER_PAGE), 1);
  // A data refresh can shorten the list: the page stays in range.
  const current = Math.min(page, pages);
  const visible = releases.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const ready = session.phase === "ready";
  return html`
    <div class="updates">
      <div class="release-side">
        <${List} className="release-list">
          ${visible.map((item) => {
            const on = item.version === selected?.version;
            return html`
              <button class=${on ? "release-row selected" : "release-row"} key=${`release-${item.version}`} aria-pressed=${on} onClick=${() => setVersion(item.version)}>
                <strong>${t("version")} ${item.version}</strong>
                <span>${loc(item.title)}</span>
                <time datetime=${item.date}>${date(item.date, "short")}</time>
                ${item.version === session.installedVersion && html`<i class="tag">${t("installed")}</i>`}
              </button>`;
          })}
          ${visible.length === 0 && html`<p class="empty">${t("noReleases")}</p>`}
        <//>
        <${Pagination} page=${current} pages=${pages} onPage=${setPage} />
      </div>
      ${selected &&
      html`
        <article class="release-panel" key="release-panel">
          <header class="release-heading">
            <div>
              <span class="category">${t("patchNotes")}</span>
              <h1>${t("version")} ${selected.version} · ${loc(selected.title)}</h1>
              <time datetime=${selected.date}>${date(selected.date, "long")}</time>
            </div>
            <div class="release-actions">
              <button class="secondary-button" disabled=${!ready} onClick=${() => request("check")}>${t("checkUpdates")}</button>
              <button class="secondary-button" disabled=${!ready} onClick=${() => request("repair")}>${t("repair")}</button>
            </div>
          </header>
          <${Tabs}
            label=${t("patchNotes")}
            tabs=${NOTES.map((id) => ({ id, label: t(`notes.${id}`) }))}
            current=${tab}
            onSelect=${setTab}
            panel="notes-panel"
          />
          <div id="notes-panel" class="notes" role="tabpanel" aria-labelledby=${`tab-${tab}`}>
            <${Markdown} source=${loc(selected.notes[tab])} size=${settings.article_size} />
          </div>
        </article>`}
    </div>`;
}
