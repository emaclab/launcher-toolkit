// Splash window (window.json splash.entry → splash.html), shown while the game starts. It shows
// the launching/launched phase and the last anti-cheat error, and must keep exactly one
// [data-anticheat-mark] placeholder: the core paints the EMAC LAB mark into that box (at least
// 120 × 24 px, entirely inside the window). The splash has no launch actions; it reads the
// language chosen in the main window from localStorage.
import { html, render } from "../vendor/preact.js";
import { chooseLanguage, loadTranslations, makeI18n } from "./i18n.js";
import { useSession } from "./session.js";

function Splash({ name, i18n }) {
  const { t, lang } = i18n;
  const session = useSession();
  const message = session.message;
  return html`
    <main class="splash" lang=${lang}>
      <img class="splash-logo" src="assets/images/logo.svg" alt="" width="88" height="88" draggable="false" />
      <h1 class="splash-title">${name}</h1>
      <p class="splash-status">${t(`phase.${session.phase}`)}</p>
      ${message && html`<p class="splash-alert" role="alert">${message.message}</p>`}
      <div class="splash-protection">
        <span>${t("protectedBy")}</span>
        <div class="splash-mark" data-anticheat-mark></div>
      </div>
    </main>`;
}

const [manifest, translations] = await Promise.all([launcher.readJson("pack.json"), loadTranslations()]);
const i18n = makeI18n(translations, chooseLanguage());
render(html`<${Splash} name=${manifest.game.name} i18n=${i18n} />`, document.getElementById("app"));
launcher.ready();
