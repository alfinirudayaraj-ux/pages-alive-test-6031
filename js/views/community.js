/* ============================================================
   Screen: Community
   Join a pro player's community on a monthly subscription,
   or open your own if you're a verified pro.
   ============================================================ */

import { esc, money, compact, fmt, fee, net, $, $$, PLATFORM_FEE, toast, copy } from "../utils.js";
import { state, communityById, myCommunities, joinCommunity, persist, playerById, tournamentById } from "../data.js";
import { commcard, avatar, upcard, postcard, teamRow, emptyState, icon } from "../ui.js";
import { openSheet, successSheet } from "../sheets.js";
import { chatBlock, mountChat } from "./chat.js";
import { navigate } from "../router.js";

/* ---------------- subscription sheet ---------------- */
export function openJoinSheet(id) {
  const c = communityById(id);
  if (!c) return;
  const platformFee = fee(c.price);
  const creatorCut = net(c.price);

  const sheet = openSheet({
    title: `Join ${esc(c.name)}`,
    sub: c.price ? `${money(c.price)} / month · cancel anytime` : "Free to join",
    body: `
      <div class="coitem">
        <span class="coitem__art"><span class="art ${c.art}"></span></span>
        <span class="coitem__body">
          <b>${esc(c.name)}</b>
          <small>${esc(c.creator)} · ${compact(c.members)} members · ${c.tier}</small>
        </span>
      </div>

      <div class="panel" style="display:grid;gap:9px">
        ${[
          "Tournament slots reserved for members",
          "Direct messages with the creator and squad leaders",
          "Weekly scrim rooms, VOD reviews and coaching drops",
          "Live score capture synced to your Free Fire ID",
        ]
          .map(
            (b) => `<div class="flex gap-8 items-center" style="font-size:12px">
              <span style="width:16px;height:16px;border-radius:50%;background:rgba(18,185,129,.12);color:var(--mint);display:grid;place-items:center;flex:none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="width:9px;height:9px"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
              </span>${b}</div>`
          )
          .join("")}
      </div>

      <div class="cofeed">
        <div class="cofeed__row"><span>Monthly subscription</span><b>${money(c.price)}</b></div>
        <div class="cofeed__row cofeed__row--fee"><span>Platform fee (10%)</span><b>${money(platformFee)}</b></div>
        <div class="cofeed__row"><span>Goes to the creator</span><b>${money(creatorCut)}</b></div>
        <div class="cofeed__row cofeed__row--net"><span>You pay today</span><b>${money(c.price)}</b></div>
      </div>

      <div class="trust">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3Z"/></svg>
        <span>10% platform fee is shown on every transaction — creators keep 90% of subscriptions and sales, always.</span>
      </div>

      <button class="btn btn--ember btn--block" data-pay>
        ${c.price ? `Subscribe · ${money(c.price)}/mo` : "Join for free"}
      </button>
    `,
  });

  sheet.body.querySelector("[data-pay]").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.classList.add("is-loading");
    await new Promise((r) => setTimeout(r, 900));
    btn.classList.remove("is-loading");
    joinCommunity(c.id);
    sheet.close();
    successSheet({
      title: "You're in",
      text: `Welcome to ${c.name}. Walk into the chat and say hello — the creator is usually on.`,
      primary: "Open community",
      onPrimary: () => navigate("communityDetail", { id: c.id }),
    });
  });
}

/* ---------------- community list ---------------- */
export function communityList() {
  const mine = myCommunities()[0];
  const discover = state.communities.filter((c) => !mine || c.id !== mine.id);

  return {
    html: `
      <section class="screen">
        <div class="pagehead">
          <div class="pagehead__row">
            <div>
              <span class="eyebrow">Communities</span>
              <h1>Play with <em>winners</em></h1>
              <p>Monthly memberships run by verified pro players. Tournaments, scrims and a direct line to the creator — with a transparent 10% platform fee on every payment.</p>
            </div>
          </div>
        </div>

        ${
          mine
            ? `<div class="mycomm reveal">
                 <div class="mycomm__cover"><div class="art ${mine.art}"></div></div>
                 <div class="mycomm__body">
                   <div class="mycomm__top">
                     <span class="mycomm__logo">${esc(mine.short)}</span>
                     <span class="mycomm__id">
                       <span class="mycomm__name">
                         ${esc(mine.name)}
                         <span class="badge badge--glass">${esc(mine.tier)}</span>
                       </span>
                       <span class="mycomm__sub">Run by ${esc(mine.creator)} · member since ${esc(mine.since || "this month")}</span>
                     </span>
                   </div>
                   <div class="mycomm__stats">
                     <div><b>${compact(mine.members)}</b><span>Members</span></div>
                     <div><b>${mine.tournaments}</b><span>Cups</span></div>
                     <div><b>${mine.posts}</b><span>Posts</span></div>
                     <div><b>${money(mine.price)}</b><span>Per mo</span></div>
                   </div>
                   <div class="mycomm__actions">
                     <button class="btn btn--ember btn--sm grow" data-community="${mine.id}">Open</button>
                     <button class="btn btn--ghost btn--sm" data-community-chat="${mine.id}">Chat</button>
                     <button class="btn btn--ghost btn--sm" data-community-tournaments="${mine.id}">Cups</button>
                   </div>
                 </div>
               </div>`
            : ""
        }

        <div class="section-head mt-32">
          <div>
            <span class="eyebrow">Discover</span>
            <h2 style="margin-top:6px">Creator communities</h2>
          </div>
          <span class="pillnote"><i></i>${state.communities.length} live</span>
        </div>

        <div class="commgrid stagger">
          ${discover.map((c) => commcard(c)).join("")}
        </div>

        <div class="creator-cta mt-32 reveal">
          <div class="creator-cta__body">
            <h4>Are you a professional player?</h4>
            <p>Open your own community, price your membership, and keep 90% of every subscription and sale. We handle payments, escrow and live score capture.</p>
          </div>
          <button class="btn btn--ember btn--sm" data-create-community>Create</button>
        </div>
      </section>
    `,
    mount(root) {
      $$("[data-community-chat]", root).forEach((b) =>
        b.addEventListener("click", () => navigate("communityDetail", { id: b.dataset.communityChat, tab: "chat" }))
      );
      $$("[data-community-tournaments]", root).forEach((b) =>
        b.addEventListener("click", () => navigate("communityDetail", { id: b.dataset.communityTournaments, tab: "cups" }))
      );
    },
  };
}


/* ---------------- community detail ---------------- */
export function communityDetail(params) {
  const c = communityById(params.id) || state.communities[0];
  const joined = state.me.joined.includes(c.id);
  let tab = params.tab || "feed";

  const thread = state.threads.find((t) => t.name === c.name) || state.threads[0];
  const posts = state.posts.filter((p) => p.community === c.name);
  const cups = state.tournaments.filter((t) => t.community === c.name);
  const roster = [
    playerById(c.creatorId),
    ...state.communities.filter((x) => x.id !== c.id).map((x) => playerById(x.creatorId)).slice(0, 4),
  ];

  const earn = state.earnings;
  const gross = earn.gross;
  const platform = fee(gross);
  const payout = net(gross);

  const body = () => {
    if (tab === "chat") {
      return joined
        ? `<div class="mt-16">${chatBlock(thread.id)}</div>`
        : `${emptyState("Members only", "Join this community to open the war room with the creator and players.")}
           <button class="btn btn--ember btn--block" data-join="${c.id}">Join for ${c.price ? money(c.price) + "/mo" : "free"}</button>`;
    }

    if (tab === "cups") {
      return `
        <div class="flex items-center gap-8 mt-16" style="justify-content:space-between">
          <span class="eyebrow">${cups.length} tournaments run</span>
          <button class="btn btn--primary btn--xs" data-new-tournament>Host a cup</button>
        </div>
        <div class="stack mt-16">
          ${cups.length ? cups.map((t) => upcard(t)).join("") : emptyState("No cups yet", "Host the first tournament and it appears here instantly.")}
        </div>`;
    }

    if (tab === "roster") {
      return `
        <div class="stack mt-16">
          ${roster
            .map(
              (p) => `
            <button class="upcard" data-player="${p.id}">
              ${avatar(p.name, "md")}
              <span class="upcard__body">
                <span class="upcard__title">${esc(p.name)} ${p.pro ? `<span class="badge badge--pro">Pro</span>` : ""}</span>
                <span class="upcard__meta"><span>${p.wins} wins</span><span>·</span><span>${p.kd.toFixed(2)} K/D</span><span>·</span><span>${p.matches} matches</span></span>
              </span>
              <span class="upcard__prize" style="color:var(--ink-40)">${icon.CHEV}</span>
            </button>`
            )
            .join("")}
        </div>`;
    }

    if (tab === "earnings") {
      return `
        <div class="mt-16" style="display:grid;gap:14px">
          <div class="panel" style="background:#fff">
            <span class="eyebrow">Creator revenue · season 12</span>
            <div class="earn mt-16">
              <div class="earn__bar"><i style="width:90%"></i><i style="width:10%"></i></div>
              <div class="earn__legend"><span><i></i>Creator 90%</span><span><i></i>Platform 10%</span></div>
              <div class="earn__row"><span>Subscriptions + transactions</span><b>${money(gross)}</b></div>
              <div class="earn__row earn__row--fee"><span>Platform fee (10%)</span><b>− ${money(platform)}</b></div>
              <div class="earn__row"><span>Creator payouts</span><b>${money(payout)}</b></div>
              <div class="earn__row earn__row--total"><span>Your balance</span><b>${money(state.balance)}</b></div>
            </div>
            <button class="btn btn--primary btn--block mt-16" data-withdraw>Withdraw to bank</button>
          </div>

          <div class="panel" style="display:grid;gap:10px">
            <span class="eyebrow">How the split works</span>
            ${[
              ["Community subscriptions", `${c.price ? money(c.price) : "Free"} / mo per member`],
              ["Tournament entry fees", "90% to prize pool + creator"],
              ["Account sales", "90% seller · 10% escrow fee"],
            ]
              .map(
                ([k, v]) => `<div class="earn__row" style="padding:4px 0"><span>${k}</span><b style="font-size:11.5px;color:var(--ink-55)">${v}</b></div>`
              )
              .join("")}
          </div>
        </div>`;
    }

    return `
      <div class="stack mt-16 stagger">
        ${cups.length ? upcard(cups[0]) : ""}
        ${posts.length ? posts.map((p) => postcard(p)).join("") : state.posts.slice(0, 2).map((p) => postcard(p)).join("")}
        <button class="postcard" data-new-post style="border-style:dashed;background:rgba(255,255,255,.55)">
          <div class="postcard__head">
            ${avatar(state.me.handle, "sm")}
            <div class="postcard__who"><b>Post in ${esc(c.name)}</b><small>Reaches ${compact(c.members)} members</small></div>
            <span class="badge">Write</span>
          </div>
        </button>
      </div>`;
  };

  return {
    html: `
      <section class="screen">
        <div class="detailbar">
          <button class="backbtn" data-back aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>
          </button>
          <div class="detailbar__title">
            <b>${esc(c.name)}</b>
            <small>${compact(c.members)} members · ${esc(c.tier)}</small>
          </div>
          <button class="btn btn--quiet btn--xs" data-community-chat="${c.id}">Chat</button>
        </div>

        <div class="mycomm reveal" style="margin-top:4px">
          <div class="mycomm__cover" style="height:104px"><div class="art ${c.art}"></div></div>
          <div class="mycomm__body">
            <div class="mycomm__top">
              <span class="mycomm__logo">${esc(c.short)}</span>
              <span class="mycomm__id">
                <span class="mycomm__name">${esc(c.name)}</span>
                <span class="mycomm__sub">Run by ${esc(c.creator)} · ${c.verified ? "verified pro creator" : "community creator"}</span>
              </span>
            </div>
            <p style="font-size:12px;color:rgba(255,255,255,.72);line-height:1.55;margin-bottom:12px">${esc(c.tagline)}</p>
            <div class="mycomm__stats">
              <div><b>${compact(c.members)}</b><span>Members</span></div>
              <div><b>${c.tournaments}</b><span>Cups</span></div>
              <div><b>${c.posts}</b><span>Posts</span></div>
              <div><b>${c.price ? money(c.price) : "Free"}</b><span>${c.price ? "Per mo" : "Open"}</span></div>
            </div>
            <div class="mycomm__actions">
              ${
                joined
                  ? `<button class="btn btn--ember btn--sm grow" data-community-chat="${c.id}">Open war room</button>
                     <button class="btn btn--ghost btn--sm" data-new-tournament>Host</button>`
                  : `<button class="btn btn--ember btn--sm grow" data-join="${c.id}">Join · ${c.price ? money(c.price) + "/mo" : "Free"}</button>
                     <button class="btn btn--ghost btn--sm" data-community-chat="${c.id}" disabled style="opacity:.45">Chat</button>`
              }
            </div>
            ${
              joined
                ? `<div class="flex items-center gap-8 mt-16" style="font-size:10.5px;color:rgba(255,255,255,.6)">
                     <span class="badge badge--mint">Active</span> Renews on the 1st · manage from Studio
                   </div>`
                : ""
            }
          </div>
        </div>

        <div class="tabs mt-24">
          ${[
            ["feed", "Feed"],
            ["chat", "War room"],
            ["cups", "Cups"],
            ["roster", "Roster"],
            ["earnings", "Earnings"],
          ]
            .map(([k, label]) => `<button class="tab ${tab === k ? "is-on" : ""}" data-ctab="${k}">${label}</button>`)
            .join("")}
        </div>

        <div id="commBody">${body()}</div>
      </section>
    `,
    mount(root) {
      const host = root.querySelector("#commBody");
      root.addEventListener("click", (e) => {
        const t = e.target.closest("[data-ctab]");
        if (!t) return;
        tab = t.dataset.ctab;
        $$(".tab", root).forEach((b) => b.classList.toggle("is-on", b.dataset.ctab === tab));
        host.innerHTML = body();
        host.style.animation = "screen-in 380ms var(--ease-out) both";
        if (tab === "chat") mountChat(root, thread.id);
      });
      if (tab === "chat") mountChat(root, thread.id);

      root.querySelectorAll("[data-join]").forEach((b) =>
        b.addEventListener("click", () => openJoinSheet(b.dataset.join))
      );
      root.querySelectorAll("[data-withdraw]").forEach((b) =>
        b.addEventListener("click", () => toast("Payout requested — arrives in 24–48h", "ok"))
      );
    },
  };
}


