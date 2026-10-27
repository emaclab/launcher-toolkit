// Start page. The scroll area snaps between the top (carousel and quick cards) and the details
// below; its offset fades the slide art and pauses the carousel.
import { html, useEffect, useState } from "../../vendor/preact.js";
import { Countdown, List, ScrollArea, scrollTo, useApp } from "../ui.js";

const SLIDE_INTERVAL = 7000;
const TICK = 100;

/** Highlights that advance every 7 s, paused on hover, on focus inside, past 200 px of scroll
 * or with animations off. Selecting a slide restarts its time. */
function Carousel({ slides, paused, fade }) {
  const { i18n, navigate } = useApp();
  const { t, loc, lang } = i18n;
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const stopped = paused || hover || focus || slides.length < 2;
  useEffect(() => {
    if (stopped) return undefined;
    const timer = setInterval(() => setElapsed((value) => value + TICK), TICK);
    return () => clearInterval(timer);
  }, [stopped]);
  useEffect(() => {
    if (elapsed < SLIDE_INTERVAL) return;
    setIndex((value) => (value + 1) % slides.length);
    setElapsed(0);
  }, [elapsed]);
  const select = (next) => {
    setIndex(next);
    setElapsed(0);
  };
  const shown = index < slides.length ? index : 0;
  const current = slides[shown];
  if (!current) return null;
  const link = current.link ?? {};
  const open = () => {
    if (link.page === "news" && link.article) navigate("news", { article: link.article });
    else if (link.page === "calendar" && link.event) navigate("calendar", { event: link.event });
    else if (link.page) navigate(link.page);
  };
  return html`
    <section
      class="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label=${t("highlights")}
      onMouseEnter=${() => setHover(true)}
      onMouseLeave=${() => setHover(false)}
      onFocusIn=${() => setFocus(true)}
      onFocusOut=${() => setFocus(false)}
    >
      <img class="slide-art" src=${`assets/${current.image}`} alt="" width="1056" height="236" draggable="false" style=${`opacity:${fade}`} />
      <div class="slide-story" key=${`${shown}-${lang}`}>
        <span class="category">${t(current.category)}</span>
        <h1>${loc(current.title)}</h1>
        <p>${loc(current.text)}</p>
        <button class="slide-cta" onClick=${open}>${t("learnMore")} →</button>
      </div>
      <div class="carousel-tabs" role="group" aria-label=${t("highlights")}>
        ${slides.map(
          (slide, position) => html`
            <button class="carousel-tab" aria-label=${loc(slide.title)} aria-pressed=${position === shown} onClick=${() => select(position)}>
              <span class="carousel-track"><span style=${`width:${position === shown ? Math.max(elapsed / 70, 4) : 0}%`}></span></span>
              <span class="carousel-label">${loc(slide.title)}</span>
            </button>`,
        )}
      </div>
    </section>`;
}

export function Home() {
  const { game, i18n, data, settings, navigate, openLink, read } = useApp();
  const { t, loc, date } = i18n;
  const [offset, setOffset] = useState(0);
  const links = game.links ?? {};
  const newest = data.releases.releases[0];
  const featured = data.calendar.events.find((event) => event.id === data.events.featured);
  const online = data.servers.servers.filter((server) => server.state === "online").length;
  return html`
    <${ScrollArea}
      id="home-scroll"
      className="home-scroll"
      onOffset=${setOffset}
      snap=${["start", ".home-details", "end"]}
      snapOffset=${20}
      snapDelay=${180}
    >
      <${Carousel} slides=${data.slides} paused=${offset >= 200 || !settings.motion} fade=${Math.max(1 - offset / 500, 0.35)} />
      <div class="quick-cards">
        ${featured &&
        html`
          <button class="quick-card" key="card-event" onClick=${() => navigate("calendar", { event: featured.id })}>
            <span class="quick-label">${t("nextEvent")}</span>
            <strong>${loc(featured.name)}</strong>
            ${data.calendar.countdown && html`<span class="quick-value"><${Countdown} /></span>`}
          </button>`}
        <button class="quick-card" key="card-servers" onClick=${() => navigate("servers")}>
          <span class="quick-label">${t("servers")}</span>
          <strong>${online} / ${data.servers.servers.length} ${t("online")}</strong>
          <span class="quick-value">${t("serversDetails")}</span>
        </button>
        ${newest &&
        html`
          <button class="quick-card" key="card-version" onClick=${() => navigate("updates")}>
            <span class="quick-label">${t("latestVersion")}</span>
            <strong>${t("version")} ${newest.version}</strong>
            <span class="quick-value">${date(newest.date, "long")}</span>
          </button>`}
      </div>
      <button class="scroll-hint" onClick=${() => scrollTo("home-scroll", ".home-details")}>${t("more")} ↓</button>
      <div class="home-details">
        <div class="home-grid">
          <section class="card" aria-labelledby="latest-heading">
            <h2 id="latest-heading">${t("latestNews")}</h2>
            <${List} className="latest">
              ${data.news.length === 0 && html`<p class="empty">${t("noNews")}</p>`}
              ${data.news.slice(0, 3).map(
                (item) => html`
                  <button class="latest-row" key=${item.id} onClick=${() => navigate("news", { article: item.id })}>
                    <span class="category">${t(item.category)}</span>
                    <strong>${loc(item.title)}</strong>
                    <time datetime=${item.date}>${date(item.date, "short")}</time>
                    ${!read.includes(item.id) && html`<i class="unread-dot" aria-label=${t("unread")}></i>`}
                  </button>`,
              )}
            <//>
          </section>
          <section class="card" aria-labelledby="links-heading">
            <h2 id="links-heading">${t("links")}</h2>
            <div class="links">
              ${["website", "community", "support"]
                .filter((key) => links[key])
                .map((key) => html`<button class="link-button" key=${key} onClick=${() => openLink(links[key])}>${t(`link.${key}`)} ↗</button>`)}
            </div>
          </section>
        </div>
        <section class="card fair-play-banner">
          <div>
            <h2>${t("fairPlayTitle")}</h2>
            <p>${t("fairPlayText")}</p>
          </div>
          <button class="link-button" onClick=${() => navigate("about")}>${t("about")} →</button>
        </section>
        <button class="back-top" onClick=${() => scrollTo("home-scroll", "start")}>${t("backTop")} ↑</button>
      </div>
    <//>`;
}
