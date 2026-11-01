/* ============================================================
   ARENA — bootstrap
   ============================================================ */

import { $, $$, toast } from "./utils.js";
import { state, persist, unreadTotal, threadById } from "./data.js";
import { register, navigate, back, onRoute } from "./router.js";
import { openSheet } from "./sheets.js";
import { home } from "./views/home.js";
import { communityList, communityDetail, openJoinSheet } from "./views/community.js";
import { store, openCheckout } from "./views/store.js";
import { watch } from "./views/watch.js";
import { tournamentDetail } from "./views/tournament.js";
import { inbox, chatBlock, mountChat } from "./views/chat.js";
import { openPlayer, openFullBoard } from "./views/player.js";
import { openStudio, openCompose } from "./views/studio.js";

window.__arenaCleanups = [];

/* ---------------- routes ---------------- */
register("home", home);
register("community", communityList);
register("communityDetail", communityDetail);
register("store", store);
register("watch", watch);
register("tournament", tournamentDetail);
register("inbox", inbox);
register("thread", (p) => {
  const t = threadById(p.id) || state.threads[0];
  return {
    html: `
      <section class="screen">
        <div class="detailbar">
          <button class="backbtn" data-back aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>
          </button>
          <div class="detailbar__title"><b>${t.name}</b><small>${t.sub}</small></div>
        </div>
        <div class="mt-16">${chatBlock(t.id)}</div>
      </section>`,
    mount(root) {
      mountChat(root, t.id);
    },
  };
});

/* ---------------- dock ---------------- */
const DOCK_MAP = {
  home: "home",
  community: "community",
  communityDetail: "community",
  store: "store",
  watch: "home",
  tournament: "home",
  inbox: "community",
  thread: "community",
};

let currentName = "home";

function moveIndicator(name) {
  const dock = $("#dock");
  const btn = dock.querySelector(`[data-nav="${DOCK_MAP[name] || "home"}"]`);
  const indicator = $("#dockIndicator");
  if (!btn || !indicator) return;
  indicator.style.left = `${btn.offsetLeft + 8}px`;
  indicator.style.width = `${btn.offsetWidth - 16}px`;
  indicator.style.opacity = btn.classList.contains("dock__item--center") ? "0" : "1";
}

function syncDock(name) {
  $$("#dock .dock__item").forEach((b) => b.classList.toggle("is-active", b.dataset.nav === DOCK_MAP[name]));
  requestAnimationFrame(() => moveIndicator(name));
}

/* ---------------- global click delegation ---------------- */
document.addEventListener("click", (e) => {
  const hit = (sel) => e.target.closest(sel);

  const nav = hit("[data-nav]");
  if (nav) {
    e.preventDefault();
    return navigate(nav.dataset.nav);
  }

  if (hit("[data-back]")) return back();

  const player = hit("[data-player]");
  if (player) return openPlayer(player.dataset.player);

  const media = hit("[data-media]");
  if (media) return navigate("watch", { id: media.dataset.media });

  const chatBtn = hit("[data-community-chat]");
  if (chatBtn) return navigate("communityDetail", { id: chatBtn.dataset.communityChat, tab: "chat" });

  const comm = hit("[data-community]");
  if (comm) return navigate("communityDetail", { id: comm.dataset.community });

  const listing = hit("[data-listing]");
  if (listing) return openCheckout(listing.dataset.listing);

  const tour = hit("[data-tournament]");
  if (tour) return navigate("tournament", { id: tour.dataset.tournament });

  const thread = hit("[data-thread-open]");
  if (thread) return navigate("thread", { id: thread.dataset.threadOpen });

  if (hit("[data-studio]")) return openStudio();
  if (hit("[data-fullboard]")) return openFullBoard("app");
  if (hit("[data-sell]")) return openCompose("sell");
  if (hit("[data-new-post]")) return openCompose("post");
  if (hit("[data-new-tournament]")) return openCompose("cup");
  if (hit("[data-create-community]")) return openCompose("community");

  const join = hit("[data-join]");
  if (join) return openJoinSheet(join.dataset.join);

  const like = hit("[data-like-post]");
  if (like) {
    const id = like.dataset.likePost;
    const on = state.likedPosts.includes(id);
    state.likedPosts = on ? state.likedPosts.filter((x) => x !== id) : [...state.likedPosts, id];
    persist();
    like.classList.toggle("is-on", !on);
    const post = state.posts.find((p) => p.id === id);
    like.querySelector("span").textContent = (post.likes + (on ? 0 : 1)).toLocaleString("en-IN");
  }
});


/* ---------------- top bar ---------------- */
$("#btnStudio").addEventListener("click", () => openStudio());
$("#btnInbox").addEventListener("click", () => navigate("inbox"));
$("#btnSearch").addEventListener("click", () => {
  const sheet = openSheet({
    title: "Search ARENA",
    sub: "Players, communities, streams and IDs",
    body: `
      <div class="input-group">
        <span class="input-group__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.4"/><path d="m20 20-3.6-3.6" stroke-linecap="round"/></svg>
        </span>
        <input class="input" placeholder="Try “grandmaster”, “NOVA”, “scrim”…" />
      </div>
      <div class="rowlist">
        ${state.communities
          .slice(0, 3)
          .map((c) => `<button class="rowlist__item" data-community="${c.id}"><b>${c.name}</b><small>Community</small></button>`)
          .join("")}
        ${state.videos
          .slice(0, 3)
          .map((v) => `<button class="rowlist__item" data-media="${v.id}"><b>${v.title}</b><small>Video</small></button>`)
          .join("")}
      </div>
    `,
  });
  sheet.body.addEventListener("click", (e) => {
    if (e.target.closest("[data-community],[data-media]")) sheet.close();
  });
});

/* hide the top bar on scroll-down, reveal on scroll-up */
let lastY = 0;
window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    const bar = $("#topbar");
    if (y > 120 && y > lastY) bar.classList.add("is-hidden");
    else bar.classList.remove("is-hidden");
    $("#dock").classList.toggle("is-scrolled", y > 24);
    lastY = y;
  },
  { passive: true }
);

window.addEventListener("resize", () => moveIndicator(currentName));

onRoute((route) => {
  currentName = route.name;
  syncDock(route.name);
  const dot = $("#inboxDot");
  if (dot) dot.classList.toggle("is-on", unreadTotal() > 0);
});

/* ---------------- boot ---------------- */
navigate("home", {}, { replace: true });

if (!sessionStorage.getItem("arena.greeted")) {
  sessionStorage.setItem("arena.greeted", "1");
  setTimeout(() => toast("Welcome to ARENA — tap the centre button to create", "ok", 3600), 1100);
}

/* keep the dock indicator aligned once fonts land */
if (document.fonts?.ready) document.fonts.ready.then(() => moveIndicator(currentName));
window.addEventListener("load", () => moveIndicator(currentName));

