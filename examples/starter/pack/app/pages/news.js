// News: search, category chips, the article list and the selected article (or the newest one).
// The search ignores case and accents; article bodies are Markdown at the "article text" size.
import { html, useState } from "../../vendor/preact.js";
import { fold } from "../i18n.js";
import { List, Markdown, useApp } from "../ui.js";

export function News() {
  const { i18n, data, read, markRead, settings, article, selectArticle } = useApp();
  const { t, loc, date } = i18n;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState([]);
  const selected = article();
  const q = fold(query.trim());
  const categories = [...new Set(data.news.map((item) => item.category))];
  const items = data.news.filter(
    (item) =>
      (!q || fold(loc(item.title)).includes(q) || fold(loc(item.body)).includes(q)) &&
      (filter.length === 0 || filter.includes(item.category)),
  );
  const toggle = (category) =>
    setFilter((current) => (current.includes(category) ? current.filter((entry) => entry !== category) : [...current, category]));
  const clear = () => {
    setQuery("");
    setFilter([]);
    document.getElementById("news-search")?.focus();
  };
  return html`
    <div class="news">
      <div class="news-side">
        <div class="search-box">
          <input
            id="news-search"
            class="search"
            type="text"
            value=${query}
            aria-label=${t("searchNews")}
            onInput=${(event) => setQuery(event.target.value)}
            onKeyDown=${(event) => event.key === "Escape" && setQuery("")}
          />
          ${!query && html`<span class="search-hint" key="search-hint">${t("searchNews")}</span>`}
        </div>
        <div class="chips" role="group" aria-label=${t("filterCategory")}>
          ${categories.map((category) => {
            const on = filter.includes(category);
            return html`<button class=${on ? "chip on" : "chip"} key=${category} aria-pressed=${on} onClick=${() => toggle(category)}>${t(category)}</button>`;
          })}
        </div>
        <${List} className="news-list">
          ${items.map((item) => {
            const on = selected?.id === item.id;
            return html`
              <button class=${on ? "news-row selected" : "news-row"} key=${item.id} aria-pressed=${on} onClick=${() => selectArticle(item.id)}>
                <span class="category">${t(item.category)}</span>
                <strong>${loc(item.title)}</strong>
                <time datetime=${item.date}>${date(item.date, "short")}</time>
                ${!read.includes(item.id) && html`<i class="unread-dot" aria-label=${t("unread")}></i>`}
              </button>`;
          })}
          ${items.length === 0 &&
          html`
            <div class="no-results" key="no-results">
              <p class="empty">${t("noResults")}</p>
              <button class="link-button" onClick=${clear}>${t("clearSearch")}</button>
            </div>`}
        <//>
      </div>
      ${selected
        ? html`
            <article class="article" key=${`article-${selected.id}`}>
              <div class="article-heading">
                <span class="category">${t(selected.category)}</span>
                ${read.includes(selected.id) &&
                html`<button class="text-button" onClick=${() => markRead(selected.id, false)}>${t("markUnread")}</button>`}
              </div>
              <h1>${loc(selected.title)}</h1>
              <time datetime=${selected.date}>${date(selected.date, "long")}</time>
              <${Markdown} source=${loc(selected.body)} size=${settings.article_size} />
            </article>`
        : html`<p class="empty">${t("noNews")}</p>`}
    </div>`;
}
