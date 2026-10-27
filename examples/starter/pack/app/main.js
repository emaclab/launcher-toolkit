// Main window (window.json main.entry → index.html). Loads the game identity, translations and
// data, renders the app and reveals the window with launcher.ready() after the first render.
// The pages, the language and the settings belong to this script; the core only provides the
// session (launcher.snapshot) and the bridge calls.
import { html, render, useCallback, useMemo, useState } from "../vendor/preact.js";
import { loadLocal, useData } from "./data.js";
import { chooseLanguage, loadTranslations, makeI18n, saveLanguage } from "./i18n.js";
import { ForceCloseDialog, LaunchBar } from "./launch-bar.js";
import { About } from "./pages/about.js";
import { Calendar, EventDialog } from "./pages/calendar.js";
import { Home } from "./pages/home.js";
import { News } from "./pages/news.js";
import { Servers } from "./pages/servers.js";
import { ResetDialog, Settings } from "./pages/settings.js";
import { Updates } from "./pages/updates.js";
import { useSession } from "./session.js";
import { DEFAULTS, loadRead, loadSettings, saveRead, saveSettings } from "./settings.js";
import { AppContext, Dropdown, Toast, useApp } from "./ui.js";

const PAGES = { home: Home, news: News, updates: Updates, calendar: Calendar, servers: Servers, about: About, settings: Settings };
/** Dialogs render last, over the whole window. Navigation closes them, except that opening the
 * calendar with an event opens that event's dialog. */
const DIALOGS = { forceClose: ForceCloseDialog, reset: ResetDialog, event: EventDialog };
/** Navigation order; settings sits apart at the right end. */
const NAVIGATION = ["home", "news", "updates", "calendar", "servers", "about", "settings"];

function TitleBar() {
  const { game, i18n, setLanguage } = useApp();
  const { t, lang, languages } = i18n;
  const [menu, setMenu] = useState(false);
  return html`
    <header class="titlebar">
      <div class="titlebar-drag" onPointerDown=${(event) => event.button === 0 && launcher.window.drag()}></div>
      <div class="brand">
        <img class="brand-logo" src="assets/images/logo.svg" alt="" width="28" height="28" draggable="false" />
        <span class="brand-name">${game.name}</span>
      </div>
      <div class="window-controls">
        <${Dropdown} className="language" open=${menu} onClose=${() => setMenu(false)}>
          <button class="language-button" aria-label=${t("language")} aria-expanded=${menu} onClick=${() => setMenu(!menu)}>
            <span>${lang.toUpperCase()}</span>
            <img src="assets/images/caret.svg" alt="" width="10" height="10" draggable="false" />
          </button>
          ${menu &&
          html`
            <div class="language-menu" role="group" aria-label=${t("language")}>
              ${languages.map(
                (language) => html`
                  <button
                    class=${language.code === lang ? "language-option chosen" : "language-option"}
                    aria-pressed=${language.code === lang}
                    onClick=${() => {
                      setLanguage(language.code);
                      setMenu(false);
                    }}
                  >${language.name}</button>`,
              )}
            </div>`}
        <//>
        <button class="window-button" aria-label=${t("minimize")} onClick=${() => launcher.window.minimize()}>
          <img src="assets/images/minimize.svg" alt="" width="12" height="12" draggable="false" />
        </button>
        <button class="window-button window-close" aria-label=${t("close")} onClick=${() => launcher.window.close()}>
          <img src="assets/images/close.svg" alt="" width="12" height="12" draggable="false" />
        </button>
      </div>
    </header>`;
}

function Navigation() {
  const { game, i18n, data, page, navigate, read, settings, article } = useApp();
  const { t } = i18n;
  const unread = data.news.filter((item) => !read.includes(item.id)).length;
  return html`
    <nav class="nav" aria-label=${game.name}>
      ${NAVIGATION.map((item) => {
        const classes = `${item === "settings" ? "nav-item nav-end" : "nav-item"}${page === item ? " active" : ""}`;
        // Opening News shows, and so reads, the selected or newest article.
        const open = () => navigate(item, item === "news" && article() ? { article: article().id } : {});
        return html`
          <button class=${classes} aria-current=${page === item ? "page" : undefined} onClick=${open}>
            <span>${t(item)}</span>
            ${item === "news" &&
            unread > 0 &&
            settings.badges &&
            html`<span class="badge" aria-label=${`${t("unread")}: ${unread}`}>${unread < 100 ? unread : "99+"}</span>`}
          </button>`;
      })}
    </nav>`;
}

function App({ game, translations, local }) {
  const session = useSession();
  const data = useData(local);
  const [lang, setLang] = useState(chooseLanguage);
  const i18n = useMemo(() => makeI18n(translations, lang), [lang]);
  const [settings, setSettings] = useState(loadSettings);
  const [read, setRead] = useState(loadRead);
  const [route, setRoute] = useState({ page: "home", params: {}, visit: 0 });
  // The selected article survives page changes; "" means the newest one.
  const [articleId, setArticleId] = useState("");
  const [toast, setToast] = useState("");
  const [tip, setTip] = useState("");
  const [dialog, setDialog] = useState(null);

  const markRead = useCallback((id, on = true) => {
    setRead((current) => {
      const next = on ? (current.includes(id) ? current : [...current, id]) : current.filter((entry) => entry !== id);
      saveRead(next);
      return next;
    });
  }, []);
  const navigate = useCallback(
    (page, params = {}) => {
      if (params.article) {
        setArticleId(params.article);
        markRead(params.article);
      }
      setTip("");
      setDialog(page === "calendar" && params.event ? { type: "event", id: params.event } : null);
      setRoute((current) => ({ page, params, visit: current.visit + 1 }));
    },
    [markRead],
  );
  // A refused URL (`notAllowed`) or a browser that did not open (`browserFailed`) shows a toast.
  const openLink = useCallback((url) => {
    launcher.openUrl(url).catch((error) => {
      if (error?.code === undefined) throw error;
      setToast("linkFailed");
    });
  }, []);
  const changeSettings = useCallback((change) => {
    setSettings((current) => {
      const next = { ...current, ...change };
      saveSettings(next);
      return next;
    });
  }, []);
  const setLanguage = useCallback((code) => {
    saveLanguage(code);
    setLang(code);
  }, []);

  const app = {
    game,
    i18n,
    data,
    session,
    settings,
    changeSettings,
    resetSettings: () => changeSettings(DEFAULTS),
    read,
    markRead,
    page: route.page,
    navigate,
    article: () => data.news.find((item) => item.id === articleId) ?? data.news[0],
    selectArticle: (id) => {
      setArticleId(id);
      markRead(id);
    },
    openLink,
    showToast: setToast,
    tip,
    setTip,
    setLanguage,
    openDialog: setDialog,
  };
  const Page = PAGES[route.page];
  // Force close is confirmed only while the session is blocked.
  const Dialog = dialog && (dialog.type !== "forceClose" || session.phase === "blocked") ? DIALOGS[dialog.type] : null;
  return html`
    <${AppContext.Provider} value=${app}>
      <main
        class="app"
        lang=${lang}
        data-page=${route.page}
        data-accent=${settings.accent}
        data-density=${settings.density}
        data-motion=${String(settings.motion)}
      >
        <${TitleBar} />
        <${Navigation} />
        <section class="page" key=${`page-${route.page}-${route.visit}`}>
          <${Page} params=${route.params} />
        </section>
        <${LaunchBar} />
        ${toast &&
        html`<${Toast} key=${toast} message=${i18n.t(toast)} closeLabel=${i18n.t("close")} onClose=${() => setToast("")} />`}
        ${Dialog && html`<${Dialog} key=${`${dialog.type}-${dialog.id ?? ""}`} ...${dialog} onClose=${() => setDialog(null)} />`}
      </main>
    <//>`;
}

const [game, translations, local] = await Promise.all([
  launcher.readJson("pack.json").then((manifest) => manifest.game),
  loadTranslations(),
  loadLocal(),
]);
render(html`<${App} game=${game} translations=${translations} local=${local} />`, document.getElementById("app"));
launcher.ready();
