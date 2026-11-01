/* ============================================================
   Screen: Studio (home)
   Top of screen = live leaderboard, then the video / stream feed.
   ============================================================ */

import { esc, compact, $, $$ } from "../utils.js";
import { state, leaderboard } from "../data.js";
import { podiumCard, vcard, livecard, postcard, upcard, avatar, icon, emptyState } from "../ui.js";

let mode = "app";
let tab = "foryou";

const chip = (p, rank, max) => `
  <button class="rankchip" data-player="${p.id}">
    <span class="rankchip__top">
      <span class="rankchip__pos mono">${String(rank).padStart(2, "0")}</span>
      ${avatar(p.name, "xs")}
      <span class="rankchip__name">${esc(p.name)}</span>
    </span>
    <span class="rankchip__bar">
      <span class="meter grow"><span class="meter__fill" data-w="${Math.round((p.wins / max) * 100)}"></span></span>
      <span class="rankchip__wins">${p.wins}W</span>
    </span>
  </button>`;

function board() {
  const list = leaderboard(mode);
  const max = list[0].wins;
  const [first, second, third, ...rest] = list;
  return `
  <div class="board reveal">
    <div class="board__head">
      <div>
        <span class="eyebrow">Season 12 · global circuit</span>
        <h1 class="board__title">The board of <em>winners</em></h1>
      </div>
      <div style="display:grid;gap:7px;justify-items:end">
        <span class="board__season"><i></i>Live</span>
        <button class="btn btn--quiet btn--xs" data-fullboard>Full board</button>
      </div>
    </div>

    <div class="flex items-center gap-8" style="justify-content:space-between;margin-top:10px">
      <span class="segmented" data-boardmode>
        <button class="segmented__btn ${mode === "app" ? "is-on" : ""}" data-mode="app">App cups</button>
        <button class="segmented__btn ${mode === "custom" ? "is-on" : ""}" data-mode="custom">Custom</button>
      </span>
      <span class="eyebrow" style="font-size:9px">${mode === "app" ? "Ranked by cups won" : "Ranked by total kills"}</span>
    </div>

    <div class="podium stagger">
      ${podiumCard(second, 2)}
      ${podiumCard(first, 1)}
      ${podiumCard(third, 3)}
    </div>

    <div class="boardrail">
      ${rest.map((p, i) => chip(p, i + 4, max)).join("")}
    </div>
  </div>`;
}

function feedBody() {
  if (tab === "foryou") {
    const featured = state.videos.find((v) => v.feature) || state.videos[0];
    const videos = state.videos.filter((v) => v.id !== featured.id);
    return `
      <div class="reveal-blur is-in">
        <button class="hero" data-media="${featured.id}">
          <span class="hero__art"><span class="art ${featured.art}"></span></span>
          <span class="hero__play">${icon.PLAY}</span>
          <span class="hero__content">
            <span class="flex gap-8 items-center">
              <span class="badge badge--glass">${featured.tournament ? "Tournament final" : "Featured"}</span>
              <span class="badge badge--glass">${esc(featured.duration)}</span>
            </span>
            <span class="hero__title">${esc(featured.title)}</span>
            <span class="hero__meta">
              <span>${esc(featured.creator)}</span><span class="hero__dot"></span>
              <span>${compact(featured.views)} views</span><span class="hero__dot"></span>
              <span>${esc(featured.ago)}</span>
            </span>
          </span>
        </button>
      </div>

      <div class="studio-nav" style="margin:24px 0 10px">
        <div class="flex items-center gap-8">
          <span class="badge badge--live">Live now</span>
          <span class="eyebrow">${state.streams.length} streams</span>
        </div>
        <button class="btn btn--quiet btn--xs" data-jump="live">See all</button>
      </div>

      <div class="rail">
        ${state.streams.map((s) => livecard(s)).join("")}
        <button class="livecard" data-studio style="display:grid;place-items:center;background:rgba(255,255,255,.66);border:1px dashed var(--hair-2);box-shadow:none">
          <span style="color:var(--ink-55);display:grid;place-items:center;gap:8px;text-align:center">
            <span class="tile__icon" style="margin:0 auto;background:#fff">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>
            </span>
            <small style="font-size:10.5px;letter-spacing:.06em">Go live</small>
          </span>
        </button>
      </div>

      <div class="studio-nav" style="margin:26px 0 12px">
        <div>
          <span class="eyebrow">Latest</span>
          <h2 class="display" style="font-size:23px;margin-top:5px">From the tournaments</h2>
        </div>
      </div>
      <div class="feed-grid stagger">
        ${videos.map((v) => `<div>${vcard(v)}</div>`).join("")}
      </div>`;
  }

  if (tab === "live") {
    return `
      <div class="feed-grid stagger">
        ${state.streams.map((s) => `<div>${livecard(s)}</div>`).join("")}
        ${state.videos.slice(0, 4).map((v) => `<div>${vcard({ ...v, duration: "VOD" })}</div>`).join("")}
      </div>`;
  }

  if (tab === "posts") {
    return `
      <div class="stack stagger">
        <button class="postcard" data-studio style="border-style:dashed;background:rgba(255,255,255,.55)">
          <div class="postcard__head">
            ${avatar(state.me.handle, "sm")}
            <div class="postcard__who">
              <b>Share an idea with your communities</b>
              <small>Posts and scrim calls reach every member instantly</small>
            </div>
            <span class="badge badge--ember">New</span>
          </div>
        </button>
        ${state.posts.map((p) => postcard(p)).join("")}
      </div>`;
  }

  const upcoming = state.tournaments.filter((t) => t.status !== "live");
  const live = state.tournaments.filter((t) => t.status === "live");
  return `
    <div class="stack stagger">
      ${live.length ? `<div class="section-head" style="margin-bottom:2px"><h2 style="font-size:19px">Happening now</h2></div>` : ""}
      ${live.map((t) => upcard(t)).join("")}
      <div class="section-head" style="margin:14px 0 2px">
        <h2 style="font-size:19px">Scheduled</h2>
        <button class="btn btn--quiet btn--xs" data-studio>Host one</button>
      </div>
      ${upcoming.length ? upcoming.map((t) => upcard(t)).join("") : emptyState("Nothing scheduled", "Create a tournament and its card will appear here.")}
    </div>`;
}


export function home() {
  return {
    html: `
      <section class="screen">
        ${board()}
        <div class="studio-nav">
          <div>
            <span class="eyebrow">Studio</span>
            <h2 class="display" style="font-size:26px;margin-top:6px">Videos, streams &amp; posts</h2>
          </div>
          <button class="btn btn--primary btn--sm" data-studio>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 6v12M6 12h12"/></svg>
            Create
          </button>
        </div>
        <div class="tabs" data-feedtabs>
          <button class="tab ${tab === "foryou" ? "is-on" : ""}" data-tab="foryou">For you</button>
          <button class="tab ${tab === "live" ? "is-on" : ""}" data-tab="live">Live</button>
          <button class="tab ${tab === "posts" ? "is-on" : ""}" data-tab="posts">Posts</button>
          <button class="tab ${tab === "upcoming" ? "is-on" : ""}" data-tab="upcoming">Upcoming</button>
        </div>
        <div id="feedBody" class="mt-16">${feedBody()}</div>
      </section>
    `,
    mount(root) {
      const body = $("#feedBody", root);

      root.addEventListener("click", (e) => {
        const modeBtn = e.target.closest("[data-mode]");
        if (modeBtn) {
          mode = modeBtn.dataset.mode;
          const host = root.querySelector(".board");
          const wrap = document.createElement("div");
          wrap.innerHTML = board();
          host.replaceWith(wrap.firstElementChild);
          requestAnimationFrame(() => {
            $$(".meter__fill", root).forEach((f) => (f.style.width = `${f.dataset.w}%`));
          });
          return;
        }

        const tabBtn = e.target.closest("[data-tab], [data-jump]");
        if (tabBtn) {
          const next = tabBtn.dataset.tab || tabBtn.dataset.jump;
          if (!next) return;
          tab = next;
          $$(".tab", root).forEach((b) => b.classList.toggle("is-on", b.dataset.tab === next));
          body.innerHTML = feedBody();
          body.style.animation = "screen-in 420ms var(--ease-out) both";
        }
      });

      requestAnimationFrame(() => {
        $$(".meter__fill", root).forEach((f) => (f.style.width = `${f.dataset.w}%`));
      });
    },
  };
}

