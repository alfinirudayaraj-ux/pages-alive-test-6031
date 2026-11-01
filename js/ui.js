/* ============================================================
   ARENA — shared UI fragments
   Pure template functions: data in, markup out.
   ============================================================ */

import { esc, compact, money, fmt, initials, avatarCls, timeAgo } from "./utils.js";
import { state } from "./data.js";

const EYE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" style="width:11px;height:11px"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>`;
const CHEV = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12 8 5.2Z"/></svg>`;
const VERIFIED = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.6 2.1 3.3-.4 1 3.2 2.8 1.8-1.2 3.1 1.2 3.1-2.8 1.8-1 3.2-3.3-.4L12 22l-2.6-2.1-3.3.4-1-3.2L2.3 15.3l1.2-3.1-1.2-3.1 2.8-1.8 1-3.2 3.3.4L12 2Z" opacity=".18"/><path d="m10.6 15.2-2.9-2.9 1.2-1.2 1.7 1.7 4.4-4.4 1.2 1.2-5.6 5.6Z"/></svg>`;
const HEART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z"/></svg>`;
const COMMENT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M4 6.8A2.8 2.8 0 0 1 6.8 4h10.4A2.8 2.8 0 0 1 20 6.8v6.4a2.8 2.8 0 0 1-2.8 2.8H9.4L5 19.6v-3.6h-.2A2.8 2.8 0 0 1 4 13.2V6.8Z"/></svg>`;
const SHARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4m0 0L8 8m4-4 4 4"/><path d="M5 13v5.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V13"/></svg>`;

export const icon = { EYE, CHEV, PLAY, VERIFIED, HEART, COMMENT, SHARE };

export const avatar = (name, size = "sm", ring = false) => `
  <span class="avatar avatar--${size} ${avatarCls(name)} ${ring ? "avatar--ring" : ""}">${esc(initials(name))}</span>`;

export const boardRow = (p, rank, maxWins) => `
  <button class="rankrow" data-player="${p.id}">
    <span class="rankrow__num mono">${String(rank).padStart(2, "0")}</span>
    ${avatar(p.name, "sm")}
    <span class="rankrow__body">
      <span class="rankrow__name">
        <span>${esc(p.name)}</span>
        ${p.pro ? `<span class="badge badge--pro">Pro</span>` : ""}
      </span>
      <span class="rankrow__bar">
        <span class="meter grow"><span class="meter__fill" data-w="${Math.round((p.wins / maxWins) * 100)}"></span></span>
        <span class="rankrow__wins">${p.wins}W</span>
      </span>
    </span>
    <span class="rankrow__chev">${CHEV}</span>
  </button>`;

export const podiumCard = (p, place) => `
  <button class="podium__card podium__card--${place}" data-player="${p.id}">
    <span class="podium__rank">0${place}</span>
    <span class="podium__avatar">${avatar(p.name, place === 1 ? "md" : "sm", true)}</span>
    <span class="podium__name">${esc(p.name)}</span>
    <span class="podium__wins">${p.wins}<span>wins</span></span>
    <span class="podium__meta">${p.kd.toFixed(2)} K/D</span>
  </button>`;

export const vcard = (v) => `
  <button class="vcard" data-media="${v.id}">
    <span class="vcard__thumb">
      <span class="art ${v.art || "art--a"}"></span>
      <span class="vcard__tags">
        ${v.tournament ? `<span class="badge badge--glass">Tournament</span>` : ""}
      </span>
      <span class="vcard__time">${esc(v.duration || "")}</span>
    </span>
    <span class="vcard__title">${esc(v.title)}</span>
    <span class="vcard__sub">${esc(v.creator)} · ${compact(v.views)} views · ${esc(v.ago)}</span>
  </button>`;

export const livecard = (s) => `
  <button class="livecard" data-media="${s.id}">
    <span class="art ${s.art || "art--a"}"></span>
    <span class="livecard__top">
      <span class="badge badge--live">Live</span>
      <span class="livecard__viewers">${EYE} ${compact(s.viewers)}</span>
    </span>
    <span class="livecard__bot">
      <span class="livecard__title">${esc(s.title)}</span>
      <span class="livecard__who">
        <span class="wave"><i></i><i></i><i></i><i></i></span>
        ${esc(s.creator)} · ${esc(s.community)}
      </span>
    </span>
  </button>`;

export const postcard = (p) => {
  const liked = state.likedPosts.includes(p.id);
  return `
  <article class="postcard" data-post="${p.id}">
    <div class="postcard__head">
      ${avatar(p.author, "sm")}
      <div class="postcard__who">
        <b>${esc(p.author)}</b>
        <small>${esc(p.community)} · ${esc(p.ago)}</small>
      </div>
      <span class="badge">Post</span>
    </div>
    <p class="postcard__body">${p.body}</p>
    <div class="postcard__foot">
      <button class="postcard__act ${liked ? "is-on" : ""}" data-like-post="${p.id}">${HEART} <span>${fmt(p.likes + (liked ? 1 : 0))}</span></button>
      <span class="postcard__act">${COMMENT} ${fmt(p.comments)}</span>
      <span class="postcard__act">${SHARE} ${fmt(p.shares)}</span>
    </div>
  </article>`;
};

export const upcard = (t) => {
  const d = new Date();
  d.setDate(d.getDate() + (t.id.charCodeAt(1) % 4) + 1);
  return `
  <button class="upcard" data-tournament="${t.id}">
    <span class="upcard__date">
      <b class="mono">${String(d.getDate()).padStart(2, "0")}</b>
      <span>${d.toLocaleString("en", { month: "short" })}</span>
    </span>
    <span class="upcard__body">
      <span class="upcard__title">${esc(t.name)}</span>
      <span class="upcard__meta">
        <span>${esc(t.mode)}</span><span>·</span>
        <span>${t.joined}/${t.slots} slots</span><span>·</span>
        <span>${esc(t.startsIn)}</span>
      </span>
    </span>
    <span class="upcard__prize">${t.prize ? money(t.prize) : "Free"}</span>
  </button>`;
};

export const commcard = (c) => `
  <button class="commcard" data-community="${c.id}">
    <span class="commcard__cover">
      <span class="art ${c.art}"></span>
      <span class="commcard__logo">${esc(c.short)}</span>
    </span>
    <span class="commcard__body">
      <span class="commcard__name">
        ${esc(c.name)}
        ${c.verified ? `<span style="width:13px;height:13px;color:var(--ember);display:inline-block">${VERIFIED}</span>` : ""}
      </span>
      <span class="commcard__tag">${esc(c.tagline)}</span>
      <span class="commcard__meta">
        <span class="commcard__people">
          <span class="commcard__stack">${["a", "b", "c"].map((k) => avatar(c.name + k, "xs")).join("")}</span>
          ${compact(c.members)}
        </span>
        <span class="commcard__price">
          <b>${c.price ? money(c.price) : "Free"}</b>
          <span>${c.price ? "/month" : "open"}</span>
        </span>
      </span>
    </span>
  </button>`;

export const listingCard = (l) => `
  <button class="listing" data-listing="${l.id}">
    <span class="listing__art">
      <span class="art ${l.art}"></span>
      <span class="listing__badges">
        ${l.verified ? `<span class="badge badge--glass">Verified</span>` : ""}
        <span class="badge badge--glass">${esc(l.rank)}</span>
      </span>
      <span class="listing__lvl">Lv ${l.level}</span>
    </span>
    <span class="listing__body">
      <span class="listing__title">${esc(l.title)}</span>
      <span class="listing__specs">
        <span class="spec">${esc(l.pass)} pass</span>
        <span class="spec">${l.skins} skins</span>
        <span class="spec">${esc(l.region)}</span>
      </span>
      <span class="listing__foot">
        <span class="listing__price">${money(l.price)}</span>
        <span class="listing__seller">${VERIFIED} ${l.rating.toFixed(1)}</span>
      </span>
    </span>
  </button>`;

export const teamRow = (t, i, top = false) => `
  <div class="teamrow ${top ? "is-top" : ""}" data-team="${esc(t.tag)}">
    <span class="teamrow__rank mono">${i + 1}</span>
    <span class="teamrow__id">
      ${avatar(t.name, "xs")}
      <span style="min-width:0">
        <b>${esc(t.name)}</b>
        <small>${esc(t.tag)}</small>
      </span>
    </span>
    <span class="teamrow__kills mono">${t.kills}</span>
    <span class="teamrow__pts mono">${t.points}</span>
  </div>`;

export const emptyState = (title, text) => `
  <div class="empty">
    <span class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M9 15h6"/></svg></span>
    <h4>${esc(title)}</h4>
    <p>${esc(text)}</p>
  </div>`;

/* sparkline path builder used by the analytics sheet */
export const sparkPath = (values, w = 300, h = 64) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 10) - 5;
    return [x, y];
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  return { line, area, last: pts[pts.length - 1] };
};

export { timeAgo, money, compact, fmt };
