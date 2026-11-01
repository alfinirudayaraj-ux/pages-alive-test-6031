/* ============================================================
   Screen: Watch — video / live stream player
   ============================================================ */

import { esc, compact, toast } from "../utils.js";
import { state, mediaById, persist, playerById } from "../data.js";
import { avatar, icon } from "../ui.js";

const CHAT_LINES = [
  ["TSG•Viper", "Zone 4 rotation was insane, watch the ridge"],
  ["4Mercy", "that snipe at 0:34 🔥"],
  ["blaze_fan_07", "first time here — where's the bracket?"],
  ["Kaze•YT", "peak rotation is free if you hold the left rock"],
  ["Raistar", "room code please admin 🙏"],
  ["nova_supporter", "42 kills across 3 maps, machine"],
  ["Ajjubhai", "GG, rematch tomorrow same time"],
];

const msgHTML = ([who, text]) => `
  <div class="livechat__msg">
    ${avatar(who, "xs")}
    <span><b>${esc(who)}</b> <span>${esc(text)}</span></span>
  </div>`;

export function watch(params) {
  const m = mediaById(params.id) || state.videos[0];
  const live = m.kind === "stream" || m.live;
  const creator = playerById(m.creatorId);
  const related = state.videos.filter((v) => v.id !== m.id).slice(0, 4);
  const liked = state.likedVideos.includes(m.id);

  return {
    html: `
      <section class="screen">
        <div class="detailbar">
          <button class="backbtn" data-back aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>
          </button>
          <div class="detailbar__title">
            <b>${live ? "Live stream" : "Video"}</b>
            <small>${esc(m.community || "ARENA studio")}</small>
          </div>
          <span class="badge ${live ? "badge--live" : ""}">${live ? "Live" : esc(m.duration || "VOD")}</span>
        </div>

        <div class="watch mt-16">
          <div>
            <div class="stage">
              <span class="stage__art"><span class="art ${m.art}"></span></span>
              <span class="stage__scrim"></span>
              <span class="stage__live">
                ${live ? `<span class="badge badge--live">Live</span>` : `<span class="badge badge--glass">Replay</span>`}
                ${m.tournament ? `<span class="badge badge--glass">Tournament</span>` : ""}
              </span>
              <span class="stage__center">
                <button class="stage__playbtn" data-play aria-label="Play">${icon.PLAY}</button>
              </span>
              <span class="stage__controls">
                <span class="stage__progress"><i data-progress></i></span>
                <span class="stage__row">
                  <button class="stage__icon" data-play aria-label="Play">${icon.PLAY}</button>
                  <span class="mono" data-time>00:00</span>
                  <span class="stage__spacer"></span>
                  <span class="mono" style="opacity:.72">${live ? compact(m.viewers) + " watching" : esc(m.duration)}</span>
                </span>
              </span>
            </div>

            <h1 class="watch__title">${esc(m.title)}</h1>
            <div class="watch__meta">
              <span>${compact(live ? m.viewers : m.views)} ${live ? "watching" : "views"}</span>
              <span>·</span><span>${esc(m.ago)}</span><span>·</span>
              <span>${esc(m.community || "ARENA")}</span>
            </div>

            <div class="watch__actions">
              <button class="btn btn--primary btn--sm" data-play>${live ? "Join stream" : "Play video"}</button>
              <button class="btn btn--ghost btn--sm ${liked ? "is-on" : ""}" data-like-video="${m.id}">${icon.HEART} ${liked ? "Liked" : "Like"}</button>
              <button class="btn btn--ghost btn--sm" data-community-chat="c1">Community chat</button>
              <button class="btn btn--ghost btn--sm" data-copy-link>Share</button>
            </div>
          </div>

          <aside class="stack" id="watchSide"></aside>
        </div>
      </section>
    `,

    mount(root) {
      // side rail: live chat (streams) + creator card + up next
      const side = root.querySelector("#watchSide");
      side.innerHTML = `
        ${
          live
            ? `<div class="card" style="padding:14px">
                 <div class="flex items-center gap-8" style="justify-content:space-between;margin-bottom:10px">
                   <span class="eyebrow">Live chat</span>
                   <span class="badge badge--live">${compact(m.viewers)}</span>
                 </div>
                 <div class="livechat" data-livechat>${CHAT_LINES.slice(0, 5).map(msgHTML).join("")}</div>
               </div>`
            : ""
        }
        <div class="panel">
          <div class="flex items-center gap-12">
            ${avatar(m.creator, "md", true)}
            <div class="grow">
              <div style="font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px">
                ${esc(m.creator)} ${creator.pro ? `<span class="badge badge--pro">Pro</span>` : ""}
              </div>
              <div style="font-size:10.5px;color:var(--ink-40)">${creator.wins} wins · ${creator.kd.toFixed(2)} K/D · ${esc(creator.team)}</div>
            </div>
            <button class="btn btn--primary btn--xs" data-player="${creator.id}">Stats</button>
          </div>
          <p style="font-size:11.5px;color:var(--ink-55);line-height:1.6;margin-top:11px">
            ${
              m.tournament
                ? "Full tournament coverage — every kill, rotation and the final circle, captured live from Free Fire and synced to the leaderboard."
                : "Round breakdown with pause points, rotations and the decision that won it."
            }
          </p>
        </div>
        <div class="card" style="padding:14px">
          <span class="eyebrow">Up next</span>
          <div class="stack mt-16">
            ${related
              .map(
                (v) => `<button class="vcard" data-media="${v.id}" style="flex-direction:row;align-items:center;gap:10px">
                  <span class="vcard__thumb" style="width:104px;flex:none;aspect-ratio:16/10;border-radius:12px">
                    <span class="art ${v.art}"></span>
                    <span class="vcard__time">${esc(v.duration)}</span>
                  </span>
                  <span style="min-width:0;display:grid;gap:3px">
                    <span class="vcard__title" style="text-align:left">${esc(v.title)}</span>
                    <span class="vcard__sub">${esc(v.creator)} · ${compact(v.views)} views</span>
                  </span>
                </button>`
              )
              .join("")}
          </div>
        </div>`;

      let timer = null;
      let pct = 0;
      const bar = root.querySelector("[data-progress]");
      const time = root.querySelector("[data-time]");
      const play = () => {
        if (timer) return;
        timer = setInterval(() => {
          pct = Math.min(100, pct + 0.7);
          bar.style.width = `${pct}%`;
          const s = Math.round((pct / 100) * 2880);
          time.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
          if (pct >= 100) clearInterval(timer);
        }, 200);
      };
      root.querySelectorAll("[data-play]").forEach((b) => b.addEventListener("click", play));
      root.querySelector("[data-copy-link]")?.addEventListener("click", () => toast("Link copied to clipboard", "ok"));

      const likeBtn = root.querySelector("[data-like-video]");
      likeBtn?.addEventListener("click", () => {
        const on = state.likedVideos.includes(m.id);
        state.likedVideos = on ? state.likedVideos.filter((x) => x !== m.id) : [...state.likedVideos, m.id];
        persist();
        likeBtn.classList.toggle("is-on", !on);
        likeBtn.innerHTML = `${icon.HEART} ${!on ? "Liked" : "Like"}`;
      });

      window.__arenaCleanups?.push(() => clearInterval(timer));

      if (live) {
        const feed = root.querySelector("[data-livechat]");
        const chatTimer = setInterval(() => {
          const line = CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)];
          feed.insertAdjacentHTML("beforeend", msgHTML(line));
          while (feed.children.length > 7) feed.firstElementChild.remove();
        }, 3200);
        window.__arenaCleanups?.push(() => clearInterval(chatTimer));
      }
    },
  };
}

