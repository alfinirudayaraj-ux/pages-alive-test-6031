/* ============================================================
   ARENA — mock data + live state
   All numbers are plausible mobile-esports fiction for the demo.
   ============================================================ */

import { store, uid } from "./utils.js";

export const ME = {
  id: "me",
  name: "Ravi Kapoor",
  handle: "RV•NOVA",
  uid: "8845120977",
  initials: "RK",
  pro: true,
  tier: "Creator",
  balance: 4280,
  rating: 4.9,
  region: "IN",
  joined: ["c1"],
};

/* ---------------- leaderboard players ---------------- */
export const PLAYERS = [
  {
    id: "p1", name: "TSG•Viper", team: "TSG", wins: 62, matches: 88, kills: 512, kd: 5.82, winRate: 70,
    hs: 48, avgPlace: 1.8, region: "IN", pro: true, art: "art--a",
    spark: [12, 18, 15, 26, 22, 31, 28, 38, 35, 44],
    history: [
      { event: "NOVA Invitational", place: 1, kills: 14, date: "2 days ago" },
      { event: "Ember Cup · Finals", place: 1, kills: 11, date: "6 days ago" },
      { event: "Weekend Clash #42", place: 2, kills: 9, date: "9 days ago" },
    ],
  },
  {
    id: "p2", name: "4Mercy", team: "4M", wins: 57, matches: 84, kills: 468, kd: 5.31, winRate: 68,
    hs: 45, avgPlace: 2.1, region: "IN", pro: true, art: "art--b",
    spark: [10, 14, 22, 19, 27, 25, 33, 30, 40, 42],
    history: [
      { event: "Ember Cup · Finals", place: 1, kills: 12, date: "6 days ago" },
      { event: "Blaze League S4", place: 3, kills: 7, date: "12 days ago" },
    ],
  },
  {
    id: "p3", name: "Kaze•YT", team: "KZE", wins: 51, matches: 79, kills: 431, kd: 4.94, winRate: 65,
    hs: 41, avgPlace: 2.4, region: "IN", pro: true, art: "art--c",
    spark: [8, 16, 13, 21, 24, 20, 29, 34, 31, 38],
    history: [
      { event: "Weekend Clash #42", place: 1, kills: 10, date: "9 days ago" },
      { event: "Rookie Rumble", place: 2, kills: 8, date: "15 days ago" },
    ],
  },
  {
    id: "p4", name: "S8UL•Shadow", team: "S8UL", wins: 46, matches: 75, kills: 402, kd: 4.61, winRate: 61,
    hs: 39, avgPlace: 2.7, region: "IN", pro: true, art: "art--d",
    spark: [6, 11, 15, 13, 20, 24, 22, 28, 26, 33],
    history: [{ event: "NOVA Invitational", place: 3, kills: 8, date: "2 days ago" }],
  },
  {
    id: "p5", name: "Raistar", team: "TRUE", wins: 43, matches: 71, kills: 389, kd: 4.35, winRate: 60,
    hs: 52, avgPlace: 2.9, region: "IN", pro: false, art: "art--e",
    spark: [9, 8, 14, 18, 16, 22, 25, 23, 30, 31],
    history: [{ event: "Blaze League S4", place: 2, kills: 9, date: "12 days ago" }],
  },
  {
    id: "p6", name: "Ajjubhai", team: "TSG", wins: 39, matches: 68, kills: 356, kd: 4.12, winRate: 57,
    hs: 36, avgPlace: 3.1, region: "IN", pro: true, art: "art--f",
    spark: [5, 10, 9, 16, 19, 17, 24, 21, 27, 29],
    history: [{ event: "Weekend Clash #42", place: 4, kills: 6, date: "9 days ago" }],
  },
  {
    id: "p7", name: "Neyoo•OP", team: "OP", wins: 35, matches: 64, kills: 322, kd: 3.88, winRate: 55,
    hs: 33, avgPlace: 3.4, region: "IN", pro: false, art: "art--g",
    spark: [4, 8, 12, 10, 15, 18, 16, 22, 20, 26],
    history: [{ event: "Rookie Rumble", place: 3, kills: 5, date: "15 days ago" }],
  },
  {
    id: "p8", name: "Blaze•X", team: "BLZ", wins: 31, matches: 61, kills: 298, kd: 3.6, winRate: 51,
    hs: 31, avgPlace: 3.7, region: "IN", pro: false, art: "art--h",
    spark: [3, 7, 6, 11, 14, 12, 18, 17, 21, 24],
    history: [],
  },
];

/* ---------------- communities ---------------- */
export const COMMUNITIES = [
  {
    id: "c1", name: "NOVA Esports Guild", short: "NO", art: "art--a",
    tagline: "Pro scrims, weekly paid cups and a coaching roster run by TSG•Viper.",
    creator: "TSG•Viper", creatorId: "p1", price: 299, members: 8420, tournaments: 34, posts: 412,
    tier: "Professional", verified: true, joined: true, since: "Mar 2026",
  },
  {
    id: "c2", name: "Blaze Legion", short: "BL", art: "art--e",
    tagline: "Aggression-first squad hub. Daily custom rooms, scrim VOD reviews.",
    creator: "4Mercy", creatorId: "p2", price: 199, members: 5610, tournaments: 21, posts: 288,
    tier: "Professional", verified: true, joined: false,
  },
  {
    id: "c3", name: "Kaze Academy", short: "KZ", art: "art--b",
    tagline: "Learn rotations, IGL calls and clutch discipline from Kaze•YT.",
    creator: "Kaze•YT", creatorId: "p3", price: 149, members: 3940, tournaments: 12, posts: 197,
    tier: "Professional", verified: true, joined: false,
  },
  {
    id: "c4", name: "Shadow Syndicate", short: "SH", art: "art--d",
    tagline: "Invite-only scrim circuit with real prize pools every weekend.",
    creator: "S8UL•Shadow", creatorId: "p4", price: 399, members: 2180, tournaments: 18, posts: 143,
    tier: "Elite", verified: true, joined: false,
  },
  {
    id: "c5", name: "Rookie Rumble", short: "RR", art: "art--i",
    tagline: "Free to join. Built for first-time tournament players.",
    creator: "Raistar", creatorId: "p5", price: 0, members: 12480, tournaments: 9, posts: 620,
    tier: "Open", verified: false, joined: false,
  },
  {
    id: "c6", name: "Ember Collective", short: "EM", art: "art--j",
    tagline: "Fine art of the clutch — VOD labs and sensitivity workshops.",
    creator: "Neyoo•OP", creatorId: "p7", price: 249, members: 3260, tournaments: 15, posts: 208,
    tier: "Professional", verified: true, joined: false,
  },
];

/* ---------------- video / stream / post feed ---------------- */
export const VIDEOS = [
  {
    id: "v0", kind: "video", feature: true, art: "art--a",
    title: "NOVA Invitational — Grand Finals, full comeback",
    creator: "TSG•Viper", creatorId: "p1", views: 248000, ago: "2 days ago",
    duration: "48:12", likes: 12400, community: "NOVA Esports Guild", tournament: true,
  },
  {
    id: "v1", kind: "video", art: "art--c",
    title: "1v4 clutch on Bermuda — every frame explained",
    creator: "4Mercy", creatorId: "p2", views: 96300, ago: "5 hours ago",
    duration: "12:44", likes: 5210, community: "Blaze Legion", tournament: false,
  },
  {
    id: "v2", kind: "video", art: "art--b",
    title: "Kaze's rotation guide: Purgatory to Peak in 60s",
    creator: "Kaze•YT", creatorId: "p3", views: 61400, ago: "1 day ago",
    duration: "09:31", likes: 3480, community: "Kaze Academy", tournament: false,
  },
  {
    id: "v3", kind: "video", art: "art--d",
    title: "Shadow Syndicate scrim finals — IGL POV",
    creator: "S8UL•Shadow", creatorId: "p4", views: 41200, ago: "3 days ago",
    duration: "31:08", likes: 2140, community: "Shadow Syndicate", tournament: true,
  },
  {
    id: "v4", kind: "video", art: "art--e",
    title: "Sensitivity settings that fixed my headshot rate",
    creator: "Raistar", creatorId: "p5", views: 188400, ago: "1 week ago",
    duration: "07:52", likes: 15300, community: "Rookie Rumble", tournament: false,
  },
  {
    id: "v5", kind: "video", art: "art--g",
    title: "Ember Collective — VOD lab: reading third parties",
    creator: "Neyoo•OP", creatorId: "p7", views: 32700, ago: "4 days ago",
    duration: "22:19", likes: 1620, community: "Ember Collective", tournament: false,
  },
  {
    id: "v6", kind: "video", art: "art--f",
    title: "Ajjubhai on why utility wins Kalahari endgames",
    creator: "Ajjubhai", creatorId: "p6", views: 241100, ago: "6 days ago",
    duration: "15:03", likes: 19800, community: "NOVA Esports Guild", tournament: true,
  },
  {
    id: "v7", kind: "video", art: "art--h",
    title: "Weekend Clash #42 — top 10 kills of the day",
    creator: "Blaze•X", creatorId: "p8", views: 58400, ago: "9 days ago",
    duration: "11:26", likes: 3090, community: "Blaze Legion", tournament: true,
  },
];

export const STREAMS = [
  {
    id: "s1", kind: "stream", art: "art--a", title: "NOVA Invitational · Semi-final 2 — live now",
    creator: "TSG•Viper", creatorId: "p1", viewers: 18420, likes: 0, ago: "live",
    duration: "LIVE", community: "NOVA Esports Guild", tournament: true, live: true,
  },
  {
    id: "s2", kind: "stream", art: "art--b", title: "Ranked push to Heroic — road to 500 wins",
    creator: "Kaze•YT", creatorId: "p3", viewers: 9310, likes: 0, ago: "live",
    duration: "LIVE", community: "Kaze Academy", tournament: false, live: true,
  },
  {
    id: "s3", kind: "stream", art: "art--e", title: "Custom room open to chat — squad fills",
    creator: "Raistar", creatorId: "p5", viewers: 6240, likes: 0, ago: "live",
    duration: "LIVE", community: "Rookie Rumble", tournament: false, live: true,
  },
  {
    id: "s4", kind: "stream", art: "art--d", title: "Blaze Legion scrim night — IGL comms",
    creator: "4Mercy", creatorId: "p2", viewers: 3180, likes: 0, ago: "live",
    duration: "LIVE", community: "Blaze Legion", tournament: true, live: true,
  },
];

export const POSTS = [
  {
    id: "po1", author: "TSG•Viper", authorId: "p1", community: "NOVA Esports Guild", ago: "42m",
    body: "Invitational bracket drops tonight at 9. All 16 slots confirmed — check your DMs for the room code. <span class='tag'>#NOVAInvitational</span>",
    likes: 812, comments: 94, shares: 41,
  },
  {
    id: "po2", author: "4Mercy", authorId: "p2", community: "Blaze Legion", ago: "2h",
    body: "Looking for one dedicated M1887 player for weekend scrims. Drop your ID below — we'll review VODs Sunday. <span class='tag'>#recruiting</span>",
    likes: 356, comments: 128, shares: 12,
  },
  {
    id: "po3", author: "Kaze•YT", authorId: "p3", community: "Kaze Academy", ago: "5h",
    body: "New coaching slot opened for Thursday. Bring 3 VODs of losses, not highlights — that's where the growth is.",
    likes: 921, comments: 61, shares: 88,
  },
  {
    id: "po4", author: "S8UL•Shadow", authorId: "p4", community: "Shadow Syndicate", ago: "8h",
    body: "Prize pool for the next Syndicate cup is locked at ₹50,000. Entry code goes live with the bracket. Keep your squad warm.",
    likes: 1440, comments: 203, shares: 176,
  },
];


/* ---------------- store listings ---------------- */
export const LISTINGS = [
  {
    id: "l1", title: "Grandmaster ID · Season 46 Elite Pass · 214 skins", price: 8499, level: 72,
    pass: "Elite", rank: "Grandmaster", region: "IN", skins: 214, verified: true, art: "art--a",
    seller: "TSG•Viper", sellerId: "p1", rating: 4.9, login: "Google",
  },
  {
    id: "l2", title: "Heroic account · EVO gun skins ×12 · 4 bundles", price: 5200, level: 65,
    pass: "Elite", rank: "Heroic", region: "IN", skins: 148, verified: true, art: "art--b",
    seller: "4Mercy", sellerId: "p2", rating: 4.7, login: "Facebook",
  },
  {
    id: "l3", title: "Diamond III · Starter boost · 38 skins · cheap", price: 1350, level: 41,
    pass: "Basic", rank: "Diamond", region: "IN", skins: 38, verified: false, art: "art--c",
    seller: "Blaze•X", sellerId: "p8", rating: 4.2, login: "Guest",
  },
  {
    id: "l4", title: "Elite Pass collector ID · 6 seasons · Alok + Chrono", price: 11900, level: 78,
    pass: "Elite", rank: "Grandmaster", region: "IN", skins: 302, verified: true, art: "art--d",
    seller: "S8UL•Shadow", sellerId: "p4", rating: 5.0, login: "Google",
  },
  {
    id: "l5", title: "Smurf-ready Platinum ID · level 32 · 12 skins", price: 620, level: 32,
    pass: "Free", rank: "Platinum", region: "IN", skins: 12, verified: false, art: "art--f",
    seller: "Raistar", sellerId: "p5", rating: 4.4, login: "Guest",
  },
  {
    id: "l6", title: "Heroic · EVO AK + M4 maxed · 96 skins", price: 6750, level: 69,
    pass: "Elite", rank: "Heroic", region: "SG", skins: 96, verified: true, art: "art--g",
    seller: "Kaze•YT", sellerId: "p3", rating: 4.8, login: "Google",
  },
  {
    id: "l7", title: "Grandmaster · 5 bundles · pet Draco max", price: 9400, level: 74,
    pass: "Elite", rank: "Grandmaster", region: "IN", skins: 189, verified: true, art: "art--h",
    seller: "Ajjubhai", sellerId: "p6", rating: 4.6, login: "Facebook",
  },
  {
    id: "l8", title: "Gold IV · budget PvP ID · level 24", price: 349, level: 24,
    pass: "Free", rank: "Gold", region: "IN", skins: 7, verified: false, art: "art--i",
    seller: "Neyoo•OP", sellerId: "p7", rating: 4.1, login: "Guest",
  },
  {
    id: "l9", title: "Master · Season 43-46 Elite Pass · 156 skins", price: 7200, level: 70,
    pass: "Elite", rank: "Master", region: "IN", skins: 156, verified: true, art: "art--j",
    seller: "TSG•Viper", sellerId: "p1", rating: 4.9, login: "Google",
  },
  {
    id: "l10", title: "Bronze starter · extra ID · level 18", price: 199, level: 18,
    pass: "Free", rank: "Bronze", region: "IN", skins: 3, verified: false, art: "art--e",
    seller: "Blaze•X", sellerId: "p8", rating: 4.0, login: "Guest",
  },
];

/* ---------------- tournaments ---------------- */
export const TOURNAMENTS = [
  {
    id: "t1", name: "NOVA Invitational · Semi-final 2", mode: "Battle Royale", entry: 0, prize: 50000,
    slots: 48, joined: 48, code: "NOVA-7X4K", visibility: "public", status: "live",
    startsIn: "LIVE · map 3 of 4", community: "NOVA Esports Guild",
    teams: [
      { name: "TSG•Viper", tag: "TSG", kills: 14, points: 32 },
      { name: "4Mercy", tag: "4M", kills: 12, points: 28 },
      { name: "Kaze•YT", tag: "KZE", kills: 9, points: 24 },
      { name: "S8UL•Shadow", tag: "S8UL", kills: 8, points: 21 },
      { name: "Raistar", tag: "TRUE", kills: 7, points: 18 },
      { name: "Blaze•X", tag: "BLZ", kills: 4, points: 11 },
    ],
    events: [
      { t: "18:42", text: "<b>TSG•Viper</b> wiped Blaze Legion — 4 kills in zone 4." },
      { t: "18:38", text: "<b>4Mercy</b> knocked 2 with a single grenade." },
      { t: "18:31", text: "Zone 3 shifting to Peak — rotation window open." },
    ],
  },
  {
    id: "t2", name: "Weekend Clash #43", mode: "Clash Squad", entry: 49, prize: 12000,
    slots: 64, joined: 51, code: "WKC-93TQ", visibility: "public", status: "upcoming",
    startsIn: "Starts in 3h 12m", community: "Blaze Legion", teams: [], events: [],
  },
  {
    id: "t3", name: "Kaze Academy Scrim Cup", mode: "Battle Royale", entry: 0, prize: 5000,
    slots: 24, joined: 24, code: "KZ-SCRM", visibility: "community", status: "upcoming",
    startsIn: "Starts in 1d 4h", community: "Kaze Academy", teams: [], events: [],
  },
];

/* ---------------- messages ---------------- */
export const THREADS = [
  {
    id: "th1", name: "NOVA Esports Guild", sub: "Creator + 8.4k players", group: true, art: "art--a",
    unread: 3,
    messages: [
      { from: "TSG•Viper", text: "Bracket is final. Room code drops 20 minutes before lock.", time: "18:02" },
      { from: "Ajjubhai", text: "Squad 7 ready. We're running double sniper this time.", time: "18:06" },
      { from: "me", text: "Copy. I'll cast the first two matches from the watch party.", time: "18:09" },
      { from: "TSG•Viper", text: "Perfect — pin the stream in the community feed once you're live.", time: "18:11" },
    ],
  },
  {
    id: "th2", name: "4Mercy", sub: "Blaze Legion · Creator", group: false, art: "art--e", unread: 1,
    messages: [
      { from: "4Mercy", text: "Your ID is verified on the store. Payout clears tomorrow.", time: "16:40" },
      { from: "me", text: "Appreciated. The 10% platform cut showed up clearly in the breakdown.", time: "16:44" },
      { from: "4Mercy", text: "That transparency is why I moved my community here.", time: "16:45" },
    ],
  },
  {
    id: "th3", name: "Scrim Coordination", sub: "12 members · NOVA + Blaze", group: true, art: "art--b", unread: 0,
    messages: [
      { from: "Kaze•YT", text: "Need one more IGL for the 21:00 scrim block.", time: "15:12" },
      { from: "me", text: "I can take it. Sharing the room code in the feed.", time: "15:20" },
    ],
  },
];


/* ============================================================
   Live state (persisted to localStorage)
   ============================================================ */
const seed = (arr) => arr.map((x) => ({ ...x, ...(Array.isArray(x.teams) ? { teams: x.teams.map((t) => ({ ...t })) } : {}) }));
const seedThreads = () => THREADS.map((t) => ({ ...t, messages: t.messages.map((m) => ({ ...m })) }));

export const state = {
  me: { ...ME, ...store.get("me", {}) },
  communities: store.get("communities", seed(COMMUNITIES)),
  listings: store.get("listings", seed(LISTINGS)),
  threads: store.get("threads", seedThreads()),
  tournaments: store.get("tournaments", seed(TOURNAMENTS)),
  posts: store.get("posts", seed(POSTS)),
  videos: store.get("videos", seed(VIDEOS)),
  streams: store.get("streams", seed(STREAMS)),
  following: store.get("following", []),
  likedVideos: store.get("likedVideos", []),
  likedPosts: store.get("likedPosts", []),
  balance: store.get("balance", 4280),
  earnings: store.get("earnings", { gross: 148600, payouts: 6 }),
};

export function persist() {
  store.set("me", state.me);
  store.set("communities", state.communities);
  store.set("listings", state.listings);
  store.set("threads", state.threads);
  store.set("tournaments", state.tournaments);
  store.set("posts", state.posts);
  store.set("videos", state.videos);
  store.set("streams", state.streams);
  store.set("following", state.following);
  store.set("likedVideos", state.likedVideos);
  store.set("likedPosts", state.likedPosts);
  store.set("balance", state.balance);
  store.set("earnings", state.earnings);
}

/* ---------------- selectors ---------------- */
export const playerById = (id) => PLAYERS.find((p) => p.id === id) || PLAYERS[0];
export const communityById = (id) => state.communities.find((c) => c.id === id);
export const myCommunities = () => state.communities.filter((c) => state.me.joined.includes(c.id));
export const leaderboard = (mode = "app") => {
  const list = [...PLAYERS];
  return mode === "custom"
    ? list.sort((a, b) => b.kills - a.kills)
    : list.sort((a, b) => b.wins - a.wins);
};
export const allMedia = () => [...state.streams, ...state.videos];
export const mediaById = (id) => allMedia().find((m) => m.id === id);
export const tournamentById = (id) => state.tournaments.find((t) => t.id === id);
export const threadById = (id) => state.threads.find((t) => t.id === id);
export const listingById = (id) => state.listings.find((l) => l.id === id);

export const joinCommunity = (id) => {
  if (!state.me.joined.includes(id)) {
    state.me.joined.push(id);
    const c = communityById(id);
    if (c) c.members += 1;
    persist();
  }
};

export const unreadTotal = () => state.threads.reduce((n, t) => n + (t.unread || 0), 0);

export const newId = (p) => uid(p);
