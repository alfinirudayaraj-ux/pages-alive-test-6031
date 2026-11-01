/* ============================================================
   ARENA — Studio (top-right panel)
   Everything you can create: videos, streams, posts, listings,
   tournaments and communities.
   ============================================================ */

import { esc, money, toast } from "../utils.js";
import { state, persist, newId } from "../data.js";
import { avatar } from "../ui.js";
import { openSheet, successSheet, readForm } from "../sheets.js";
import { navigate } from "../router.js";
import { openCreateTournament } from "./tournament.js";

const ARTS = ["art--a", "art--b", "art--c", "art--d", "art--e", "art--f", "art--g", "art--h", "art--i", "art--j"];
const randArt = () => ARTS[Math.floor(Math.random() * ARTS.length)];

const T = {
  video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="m10 10 4.5 2-4.5 2v-4Z" fill="currentColor" stroke="none"/></svg>`,
  live: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M7.5 7.5a6.4 6.4 0 0 0 0 9M16.5 16.5a6.4 6.4 0 0 0 0-9" stroke-linecap="round"/></svg>`,
  post: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M4 12h11M4 17h7" stroke-linecap="round"/></svg>`,
  sell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4.5 8.5h15l-1.2 10a2 2 0 0 1-2 1.8H7.7a2 2 0 0 1-2-1.8l-1.2-10Z" stroke-linejoin="round"/><path d="M8.6 8.5V6.6a3.4 3.4 0 0 1 6.8 0v1.9" stroke-linecap="round"/></svg>`,
  cup: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" stroke-linejoin="round"/><path d="M8 5.5H5.5v1A3 3 0 0 0 8 9.4M16 5.5h2.5v1A3 3 0 0 1 16 9.4" stroke-linecap="round"/><path d="M12 13v4m-3 3h6" stroke-linecap="round"/></svg>`,
  community: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="9" cy="8.4" r="3"/><path d="M3.4 19.4c.5-3 2.8-4.6 5.6-4.6s5.1 1.6 5.6 4.6" stroke-linecap="round"/><circle cx="17.4" cy="9.6" r="2.1"/><path d="M16.3 14.9c2.4-.2 4.2 1.2 4.6 3.8" stroke-linecap="round"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18" stroke-linecap="round"/><circle cx="17" cy="14.5" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  fee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="8" cy="8" r="2.6"/><circle cx="16" cy="16" r="2.6"/><path d="M18 6 6 18" stroke-linecap="round"/></svg>`,
  id: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.4c.4-1.6 1.7-2.5 3.2-2.5s2.8.9 3.2 2.5" stroke-linecap="round"/><path d="M15 10h4M15 13.5h3" stroke-linecap="round"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6.5 16V11a5.5 5.5 0 0 1 11 0v5l1.5 2.5H5L6.5 16Z" stroke-linejoin="round"/><path d="M10 20.5a2 2 0 0 0 4 0" stroke-linecap="round"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.3" stroke-linecap="round"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg>`,
};

const tile = (key, icon, title, sub) => `
  <button class="tile" data-action="${key}">
    <span class="tile__icon">${icon}</span>
    <span><b>${title}</b><small>${sub}</small></span>
  </button>`;

const communityOptions = () =>
  state.communities
    .filter((c) => state.me.joined.includes(c.id))
    .map((c) => `<option>${esc(c.name)}</option>`)
    .join("") || `<option>NOVA Esports Guild</option>`;

export function openStudio() {
  const sheet = openSheet({
    wide: true,
    title: "Studio",
    sub: "Create, publish and get paid",
    body: `
      <div class="studiohead">
        ${avatar(state.me.handle, "md")}
        <div class="studiohead__id">
          <b>${esc(state.me.handle)} ${state.me.pro ? `<span class="badge badge--pro">Pro</span>` : ""}</b>
          <small>ID ${esc(state.me.uid)} · ${esc(state.me.tier)} · ${esc(state.me.region)}</small>
        </div>
        <div class="studiohead__bal">
          <b>${money(state.balance)}</b>
          <span>Balance</span>
        </div>
      </div>

      <div class="tilegrid">
        ${tile("video", T.video, "Post a video", "Upload a match or highlight")}
        ${tile("live", T.live, "Go live", "Stream to your community")}
        ${tile("post", T.post, "New post", "Ideas, calls, announcements")}
        ${tile("sell", T.sell, "Sell an ID", "List an account in the store")}
        ${tile("cup", T.cup, "Start a tournament", "Generate or paste a room code")}
        ${tile("community", T.community, "Create community", "For verified pro players")}
      </div>

      <div class="rowlist">
        <button class="rowlist__item" data-action="wallet">${T.wallet}<b>Wallet &amp; payouts</b><small>${money(state.balance)}</small></button>
        <button class="rowlist__item" data-action="fee">${T.fee}<b>Platform fee</b><small>10%</small></button>
        <button class="rowlist__item" data-action="id">${T.id}<b>Linked Free Fire ID</b><small>${esc(state.me.uid)}</small></button>
        <button class="rowlist__item" data-action="notify">${T.bell}<b>Notifications</b><small>On</small></button>
        <button class="rowlist__item" data-action="help">${T.help}<b>How the 90 / 10 split works</b><small></small></button>
      </div>
    `,
  });

  sheet.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === "video") return composeVideo(sheet);
    if (action === "live") return composeLive(sheet);
    if (action === "post") return composePost(sheet);
    if (action === "sell") return composeListing(sheet);
    if (action === "cup") {
      sheet.close();
      return openCreateTournament();
    }
    if (action === "community") return composeCommunity(sheet);
    if (action === "wallet") return toast(`Payouts land in 24–48h · ${money(state.balance)} available`, "ok");
    if (action === "fee") return toast("ARENA keeps a flat 10% of every subscription, entry and sale", "ok");
    if (action === "id") return toast("Free Fire ID linked — live capture verified", "ok");
    if (action === "notify") return toast("Notifications are on for your communities", "ok");
    if (action === "help") return toast("Creators keep 90% — fees and prizes are itemised on every receipt", "ok");
  });
}


/* ---------------- public entry points ---------------- */
export function openCompose(kind) {
  if (kind === "cup") return openCreateTournament();
  const map = {
    video: composeVideo,
    live: composeLive,
    post: composePost,
    sell: composeListing,
    community: composeCommunity,
  };
  map[kind]?.();
}

function composeVideo(parent) {
  parent?.close();
  const sheet = openSheet({
    title: "Post a video",
    sub: "Premieres in your community feed instantly",
    body: `
      <div class="panel" style="display:grid;place-items:center;gap:7px;padding:28px;border-style:dashed;border-color:rgba(11,11,12,.18);background:#fafafa;text-align:center">
        <span class="tile__icon" style="background:#fff">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 16V5m0 0L8 9m4-4 4 4"/><path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>
        </span>
        <b style="font-size:12.5px">Drop a clip or tap to upload</b>
        <small style="font-size:10.5px;color:var(--ink-40)">MP4 · up to 2 GB · 4K supported</small>
      </div>
      <label class="field"><span class="field__label">Title</span>
        <input class="input" name="title" placeholder="1v4 clutch on Bermuda" />
      </label>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Community</span>
          <select class="select" name="community">${communityOptions()}</select>
        </label>
        <label class="field"><span class="field__label">Visibility</span>
          <select class="select" name="visibility"><option>Community</option><option>Public</option></select>
        </label>
      </div>
      <button class="btn btn--ember btn--block" data-publish>Publish video</button>
    `,
  });

  sheet.body.querySelector("[data-publish]").addEventListener("click", async (e) => {
    const v = readForm(sheet.body);
    if (!v.title) return toast("Give your video a title");
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 950));
    btn.classList.remove("is-loading");

    state.videos.unshift({
      id: newId("v"),
      kind: "video",
      art: randArt(),
      title: v.title,
      creator: state.me.handle,
      creatorId: "me",
      views: 1,
      ago: "just now",
      duration: "14:02",
      likes: 0,
      community: v.community,
      tournament: /clash|cup|tournament|final/i.test(v.title),
    });
    persist();
    sheet.close();
    successSheet({
      title: "Video published",
      text: "Your clip is live in the community feed.",
      primary: "See it",
      onPrimary: () => navigate("home"),
    });
  });
}

function composeLive(parent) {
  parent?.close();
  const sheet = openSheet({
    title: "Go live",
    sub: "Your stream appears at the top of the feed with a live badge",
    body: `
      <div class="panel" style="display:grid;gap:10px">
        <div class="flex items-center gap-8">
          <span class="capture__dot"></span>
          <span style="font-size:11.5px;font-weight:600">Camera &amp; screen capture ready</span>
        </div>
        <div class="flex gap-8" style="font-size:10.5px;color:var(--ink-40)">
          <span class="spec">1080p 60fps</span><span class="spec">Game audio on</span><span class="spec">Low latency</span>
        </div>
      </div>
      <label class="field"><span class="field__label">Stream title</span>
        <input class="input" name="title" placeholder="Ranked grind — road to Heroic" />
      </label>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Community</span>
          <select class="select" name="community">${communityOptions()}</select>
        </label>
        <label class="field"><span class="field__label">Audience</span>
          <select class="select" name="audience"><option>Community</option><option>Public</option><option>Members only</option></select>
        </label>
      </div>
      <label class="switch">
        <input type="checkbox" checked />
        <span class="switch__track"><span class="switch__thumb"></span></span>
        <span class="switch__text">Live score overlay<small>Show kills and placement while you play</small></span>
      </label>
      <button class="btn btn--ember btn--block" data-start>Start streaming</button>
    `,
  });

  sheet.body.querySelector("[data-start]").addEventListener("click", async (e) => {
    const v = readForm(sheet.body);
    if (!v.title) return toast("Name your stream first");
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 1100));
    btn.classList.remove("is-loading");

    const id = newId("s");
    state.streams.unshift({
      id,
      kind: "stream",
      art: randArt(),
      title: v.title,
      creator: state.me.handle,
      creatorId: "me",
      viewers: 12,
      likes: 0,
      ago: "live",
      duration: "LIVE",
      community: v.community,
      tournament: false,
      live: true,
    });
    persist();
    sheet.close();
    navigate("watch", { id });
    toast("You are live", "ok");
  });
}


function composePost(parent) {
  parent?.close();
  const sheet = openSheet({
    title: "New post",
    sub: "Reaches every member of the community instantly",
    body: `
      <label class="field"><span class="field__label">What's happening</span>
        <textarea class="textarea" name="body" placeholder="Bracket drops tonight at 9 — room code in the chat."></textarea>
      </label>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Community</span>
          <select class="select" name="community">${communityOptions()}</select>
        </label>
        <label class="field"><span class="field__label">Type</span>
          <select class="select" name="type"><option>Announcement</option><option>Scrim call</option><option>Idea</option></select>
        </label>
      </div>
      <button class="btn btn--ember btn--block" data-publish>Publish post</button>
    `,
  });

  sheet.body.querySelector("[data-publish]").addEventListener("click", async (e) => {
    const v = readForm(sheet.body);
    if (!v.body) return toast("Write something first");
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 750));
    btn.classList.remove("is-loading");

    state.posts.unshift({
      id: newId("po"),
      author: state.me.handle,
      authorId: "me",
      community: v.community,
      ago: "just now",
      body: esc(v.body).replace(/#(\w+)/g, "<span class='tag'>#$1</span>"),
      likes: 0,
      comments: 0,
      shares: 0,
    });
    persist();
    sheet.close();
    toast("Post published", "ok");
    navigate("home");
  });
}

function composeListing(parent) {
  parent?.close();
  const sheet = openSheet({
    title: "Sell a Free Fire ID",
    sub: "Escrow protected · you keep 90% of the sale",
    body: `
      <label class="field"><span class="field__label">Listing title</span>
        <input class="input" name="title" placeholder="Grandmaster ID · Season 46 Elite Pass · 214 skins" />
      </label>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Price (₹)</span>
          <input class="input mono" type="number" name="price" min="99" step="50" value="2500" />
        </label>
        <label class="field"><span class="field__label">Level</span>
          <input class="input mono" type="number" name="level" min="1" max="100" value="60" />
        </label>
      </div>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Rank</span>
          <select class="select" name="rank">
            ${["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Heroic", "Master", "Grandmaster"].map((r) => `<option ${r === "Heroic" ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </label>
        <label class="field"><span class="field__label">Season pass</span>
          <select class="select" name="pass"><option>Free</option><option>Basic</option><option selected>Elite</option></select>
        </label>
      </div>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Region</span>
          <select class="select" name="region">${["IN", "SG", "BR", "ID", "ME"].map((r) => `<option>${r}</option>`).join("")}</select>
        </label>
        <label class="field"><span class="field__label">Login method</span>
          <select class="select" name="login"><option>Google</option><option>Facebook</option><option>Guest</option></select>
        </label>
      </div>
      <label class="field"><span class="field__label">Skins / collections</span>
        <input class="input mono" type="number" name="skins" min="0" value="120" />
      </label>
      <div class="cofeed">
        <div class="cofeed__row"><span>Listing price</span><b data-out-price>₹2,500</b></div>
        <div class="cofeed__row cofeed__row--fee"><span>Platform fee (10%)</span><b data-out-fee>₹250</b></div>
        <div class="cofeed__row cofeed__row--net"><span>You receive</span><b data-out-net>₹2,250</b></div>
      </div>
      <button class="btn btn--ember btn--block" data-publish>List in store</button>
    `,
  });

  const price = sheet.body.querySelector('[name="price"]');
  price.addEventListener("input", () => {
    const p = Number(price.value) || 0;
    sheet.body.querySelector("[data-out-price]").textContent = money(p);
    sheet.body.querySelector("[data-out-fee]").textContent = money(Math.round(p * 0.1));
    sheet.body.querySelector("[data-out-net]").textContent = money(p - Math.round(p * 0.1));
  });

  sheet.body.querySelector("[data-publish]").addEventListener("click", async (e) => {
    const v = readForm(sheet.body);
    if (!v.title) return toast("Add a listing title");
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 900));
    btn.classList.remove("is-loading");

    state.listings.unshift({
      id: newId("l"),
      title: v.title,
      price: Number(v.price) || 0,
      level: Number(v.level) || 1,
      pass: v.pass,
      rank: v.rank,
      region: v.region,
      skins: Number(v.skins) || 0,
      verified: true,
      art: randArt(),
      seller: state.me.handle,
      sellerId: "me",
      rating: 4.9,
      login: v.login,
    });
    persist();
    sheet.close();
    successSheet({
      title: "Listed in the store",
      text: "Buyers can find your ID now. Funds release from escrow after verified handover.",
      primary: "Open store",
      onPrimary: () => navigate("store"),
    });
  });
}


function composeCommunity(parent) {
  parent?.close();
  const sheet = openSheet({
    title: "Create a community",
    sub: "Verified pro players only · you keep 90% of every payment",
    body: `
      <div class="trust">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3Z"/></svg>
        <span>Your pro status is verified. Your community goes live immediately with messaging, cups and payouts.</span>
      </div>
      <label class="field"><span class="field__label">Community name</span>
        <input class="input" name="name" placeholder="Ember Collective" />
      </label>
      <label class="field"><span class="field__label">One-line pitch</span>
        <input class="input" name="tagline" placeholder="Daily scrims, VOD labs and a coaching roster." />
      </label>
      <div class="field-row field-row--2">
        <label class="field"><span class="field__label">Monthly price (₹)</span>
          <input class="input mono" type="number" name="price" min="0" step="50" value="199" />
        </label>
        <label class="field"><span class="field__label">Tier</span>
          <select class="select" name="tier"><option>Professional</option><option>Elite</option><option>Open</option></select>
        </label>
      </div>
      <div class="cofeed">
        <div class="cofeed__row"><span>You keep per member</span><b data-out-net>₹179</b></div>
        <div class="cofeed__row cofeed__row--fee"><span>Platform fee (10%)</span><b data-out-fee>₹20</b></div>
        <div class="cofeed__row cofeed__row--net"><span>100 members ≈ per month</span><b data-out-100>₹17,900</b></div>
      </div>
      <button class="btn btn--ember btn--block" data-publish>Launch community</button>
    `,
  });

  const price = sheet.body.querySelector('[name="price"]');
  price.addEventListener("input", () => {
    const p = Number(price.value) || 0;
    const cut = Math.round(p * 0.1);
    sheet.body.querySelector("[data-out-fee]").textContent = money(cut);
    sheet.body.querySelector("[data-out-net]").textContent = money(p - cut);
    sheet.body.querySelector("[data-out-100]").textContent = money((p - cut) * 100);
  });

  sheet.body.querySelector("[data-publish]").addEventListener("click", async (e) => {
    const v = readForm(sheet.body);
    if (!v.name) return toast("Name your community");
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 1100));
    btn.classList.remove("is-loading");

    const id = newId("c");
    state.communities.unshift({
      id,
      name: v.name,
      short: v.name.slice(0, 2).toUpperCase(),
      art: randArt(),
      tagline: v.tagline || "A new home for competitive players.",
      creator: state.me.handle,
      creatorId: "me",
      price: Number(v.price) || 0,
      members: 1,
      tournaments: 0,
      posts: 0,
      tier: v.tier,
      verified: true,
      joined: true,
      since: "this month",
    });
    state.me.joined.push(id);
    persist();
    sheet.close();
    successSheet({
      title: "Community launched",
      text: `${v.name} is live. Invite players, host your first cup and start collecting memberships.`,
      primary: "Open it",
      onPrimary: () => navigate("communityDetail", { id }),
    });
  });
}

