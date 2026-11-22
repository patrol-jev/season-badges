/*
  season-badges · 봄 여름 가을 겨울 배지 네 개 · 원작 patrol_jev (https://github.com/patrol-jev/season-badges)
  - 누르면 그 계절 날씨로 바뀝니다. 겨울은 눈이 내리고 쌓이고, 봄은 나무가 자라 꽃이 피고, 여름은 햇볕과 풀, 가을은 낙엽.
  - 이 파일 하나가 전부입니다. 라이브러리도, 빌드도, 서버도 없습니다.
  - 붙이는 법: 페이지 맨 아래에 <script src="seasons.js" defer></script> 한 줄.
      배지를 놓을 자리가 있으면 그 자리에 <span data-season-badges></span>. 없으면 화면 왼쪽 아래에 떠 있습니다.
  - 내 페이지 색까지 바꾸고 싶으면 CSS 에서 html[data-season="winter"] { … } 처럼 고르면 됩니다.
      그때는 덧칠(전체를 살짝 물들이는 막)을 끄세요: <span data-season-badges data-tint="off"></span>
  - 남의 페이지(구글 등)에는 북마클릿으로 씁니다. 만드는 법은 README.md.
  - 마음대로 고쳐 쓰셔도 됩니다. MIT. (인용 시 patrol_jev 한 줄 ㅎㅎ)
*/
(function seasonBadges() {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;
  // <head> 에서 defer 없이 불러도 되게, 본문이 생길 때까지 기다린다.
  if (!document.body) { document.addEventListener("DOMContentLoaded", seasonBadges, { once: true }); return; }

  // 두 번 불리면(북마클릿을 또 누르면) 떠 있는 것은 걷어 낸다. 자리에 붙은 것은 그대로 둔다.
  if (window.SeasonBadges && window.SeasonBadges.__alive) {
    if (window.SeasonBadges.floating) window.SeasonBadges.destroy();
    return;
  }

  const SEASONS = ["spring", "summer", "autumn", "winter"];
  const KO = { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" };
  const EN = { spring: "Spring", summer: "Summer", autumn: "Autumn", winter: "Winter" };
  const HUE = { spring: "#f2a7c3", summer: "#f4c542", autumn: "#dc6f2f", winter: "#86b7e6" };
  // 덧칠: 페이지 전체 위에 곱하기로 얹는 아주 옅은 막. 흰 바탕은 그 계절 빛으로, 글자는 그대로 읽힌다.
  const TINT = {
    spring: ["linear-gradient(180deg,#fbe4ee 0%,#e8f5d6 100%)", 0.55],
    summer: ["linear-gradient(180deg,#fff0bf 0%,#d6f0c2 100%)", 0.5],
    autumn: ["linear-gradient(180deg,#fde2c0 0%,#f1c49a 100%)", 0.5],
    winter: ["linear-gradient(180deg,#dcebfa 0%,#bcd5ee 100%)", 0.62],
  };
  const KEY = "season-badges";
  const NS = "http://www.w3.org/2000/svg";
  const me = document.currentScript;
  const root = document.documentElement;
  const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slot = document.querySelector("[data-season-badges]");
  const floating = !slot;
  const opt = (name, fallback) => (slot && slot.getAttribute(name)) || (me && me.getAttribute(name)) || fallback;
  const tintOn = opt("data-tint", "on") !== "off";
  const lang = opt("data-lang", (root.lang || navigator.language || "ko").toLowerCase().startsWith("ko") ? "ko" : "en");
  const NAMES = lang === "ko" ? KO : EN;

  const el = (tag, css, parent) => { const n = document.createElement(tag); if (css) n.style.cssText = css; if (parent) parent.appendChild(n); return n; };
  const svg = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };

  // ---------- 배지 ----------

  const host = slot || el("div", "position:fixed;left:14px;bottom:14px;z-index:2147483646;", document.body);
  host.setAttribute("title", "season-badges · patrol_jev");
  // 배지가 붙었다는 표시. 페이지 CSS 가 [data-ready] 로 자리를 잡는다.
  host.setAttribute("data-ready", "");
  const shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
  const style = el("style", "", shadow);
  style.textContent = `
    :host { display: inline-flex; vertical-align: middle; }
    .row { display: inline-flex; align-items: center; gap: 4px; font: 500 13px/1 "Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif; letter-spacing: -.01em; color: inherit; }
    .float { padding: 5px; border-radius: 999px; background: rgba(255,255,255,.82); color: #26352a; box-shadow: 0 10px 30px -12px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); }
    button { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 11px 0 9px; border-radius: 999px; border: 1px solid rgba(127,127,127,.35); border: 1px solid color-mix(in srgb, currentColor 22%, transparent); cursor: pointer; white-space: nowrap; transition: background .25s, border-color .25s, color .25s, transform .15s; }
    button:hover { border-color: color-mix(in srgb, currentColor 45%, transparent); }
    button:active { transform: scale(.95); }
    button:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
    button[aria-pressed="true"] { background: var(--c); border-color: var(--c); color: #1d2420; }
    svg { width: 14px; height: 14px; flex: none; }
    .x { padding: 0; width: 26px; justify-content: center; border-color: transparent; opacity: .55; }
    /* 자리가 좁으면 <span data-season-badges data-compact> 로 그림만 */
    :host([data-compact]) button { padding: 0; width: 28px; justify-content: center; }
    :host([data-compact]) button span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    :host([data-compact]) .row { gap: 3px; }
    @media (max-width: 420px) { button { height: 28px; padding: 0 9px 0 7px; } .row { gap: 3px; } }
  `;
  const row = el("div", "", shadow);
  row.className = floating ? "row float" : "row";
  row.setAttribute("role", "group");
  row.setAttribute("aria-label", lang === "ko" ? "계절 바꾸기" : "Change season");

  const icon = (season) => {
    const s = svg("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "1.3", "stroke-linecap": "round", "aria-hidden": "true" });
    if (season === "spring") {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; svg("circle", { cx: (8 + Math.cos(a) * 3.6).toFixed(2), cy: (8 + Math.sin(a) * 3.6).toFixed(2), r: "2.3" }, s); }
      svg("circle", { cx: "8", cy: "8", r: "1", fill: "currentColor" }, s);
    } else if (season === "summer") {
      svg("circle", { cx: "8", cy: "8", r: "3" }, s);
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; svg("line", { x1: (8 + Math.cos(a) * 5).toFixed(2), y1: (8 + Math.sin(a) * 5).toFixed(2), x2: (8 + Math.cos(a) * 7).toFixed(2), y2: (8 + Math.sin(a) * 7).toFixed(2) }, s); }
    } else if (season === "autumn") {
      svg("path", { d: "M3 13C3 7 7 3 13 3c0 6-4 10-10 10Z" }, s);
      svg("path", { d: "M3 13 9.5 6.5" }, s);
    } else {
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI; svg("line", { x1: (8 + Math.cos(a) * 6.5).toFixed(2), y1: (8 + Math.sin(a) * 6.5).toFixed(2), x2: (8 - Math.cos(a) * 6.5).toFixed(2), y2: (8 - Math.sin(a) * 6.5).toFixed(2) }, s); }
      svg("circle", { cx: "8", cy: "8", r: "1.2", fill: "currentColor" }, s);
    }
    return s;
  };

  const buttons = {};
  for (const season of SEASONS) {
    const b = el("button", "", row);
    b.type = "button";
    b.style.setProperty("--c", HUE[season]);
    b.setAttribute("aria-pressed", "false");
    b.appendChild(icon(season));
    el("span", "", b).textContent = NAMES[season];
    b.addEventListener("click", () => set(current === season ? "" : season));
    buttons[season] = b;
  }
  if (floating) {
    const x = el("button", "", row);
    x.className = "x";
    x.type = "button";
    x.setAttribute("aria-label", lang === "ko" ? "닫기" : "Close");
    x.textContent = "×";
    x.addEventListener("click", () => destroy());
  }

  // ---------- 무대: 페이지 위에 얹는 그림판 한 장 + 덧칠 한 장. 둘 다 누르는 것을 막지 않는다 ----------

  const tint = el("div", "position:fixed;inset:0;pointer-events:none;z-index:2147483644;mix-blend-mode:multiply;opacity:0;transition:opacity .9s ease;", document.body);
  tint.setAttribute("aria-hidden", "true");
  const canvas = el("canvas", "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483645;", document.body);
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, DPR = 1;
  const fit = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (scene) scene.resize();
  };

  // 늘 같은 나무가 자라게 씨앗 있는 난수
  const seeded = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const R = Math.random;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (p) => 1 - Math.pow(1 - p, 3);
  const pop = (p) => { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  const narrow = () => W < 700;

  // 바닥에 쌓이는 것(눈 · 낙엽). 칸마다 높이를 둔다.
  const makeGround = (cap) => {
    const step = 6;
    let h = new Float32Array(Math.ceil(W / step) + 2);
    return {
      resize() { h = new Float32Array(Math.ceil(W / step) + 2); },
      top(x) { return H - h[clamp(Math.floor(x / step), 0, h.length - 1)]; },
      add(x, amount) {
        const i = clamp(Math.floor(x / step), 0, h.length - 1);
        for (let k = -3; k <= 3; k++) { const j = i + k; if (j >= 0 && j < h.length) h[j] = Math.min(cap, h[j] + amount * (1 - Math.abs(k) / 4)); }
      },
      fill(color, shade) {
        ctx.beginPath(); ctx.moveTo(0, H);
        for (let i = 0; i < h.length; i++) ctx.lineTo(i * step, H - h[i]);
        ctx.lineTo(W, H); ctx.closePath();
        ctx.save(); ctx.shadowColor = shade; ctx.shadowBlur = 10; ctx.shadowOffsetY = -2; ctx.fillStyle = color; ctx.fill(); ctx.restore();
      },
    };
  };

  // 풀: 바닥을 따라 가는 잎. 자라 오르고 바람에 흔들린다.
  const makeGrass = (tall, colors, flowers) => {
    let blades = [];
    const build = () => {
      blades = [];
      const gap = narrow() ? 6 : 7;
      for (let x = -4; x < W + 8; x += gap * (0.6 + R() * 0.8)) {
        blades.push({ x, h: tall[0] + R() * (tall[1] - tall[0]), lean: (R() - 0.5) * 10, c: colors[Math.floor(R() * colors.length)], d: R() * 0.8, f: flowers && R() < 0.08 ? flowers[Math.floor(R() * flowers.length)] : "" });
      }
    };
    build();
    return {
      resize: build,
      draw(t) {
        ctx.lineCap = "round";
        for (const b of blades) {
          const g = ease(clamp((t - b.d) / 1.6, 0, 1));
          if (g <= 0) continue;
          const sway = Math.sin(t * 1.6 + b.x * 0.025) * 4 * g;
          const tx = b.x + b.lean * g + sway, ty = H - b.h * g;
          ctx.strokeStyle = b.c; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.moveTo(b.x, H + 2); ctx.quadraticCurveTo(b.x + b.lean * 0.3, H - b.h * 0.5 * g, tx, ty); ctx.stroke();
          if (b.f && g > 0.95) { ctx.fillStyle = b.f; ctx.beginPath(); ctx.arc(tx, ty, 3, 0, 6.283); ctx.fill(); }
        }
      },
    };
  };

  // 나무: 밑동에서 가지가 차례로 뻗고, 끝마다 꽃이나 잎이 톡 핀다.
  const makeTree = (x0, size, lean, seed, bloom) => {
    const rnd = seeded(seed);
    const branches = [], tips = [];
    const grow = (x, y, ang, len, w, depth, t0) => {
      const dur = 0.32 + rnd() * 0.12;
      const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
      branches.push({ x, y, ex, ey, w, t0, t1: t0 + dur });
      if (depth >= 6) { tips.push({ x: ex, y: ey, t: t0 + dur, kind: rnd() < bloom ? 1 : 0, r: 0.7 + rnd() * 0.6, a: rnd() * 6.283 }); return; }
      if (depth >= 3 && rnd() < 0.5) tips.push({ x: (x + ex) / 2, y: (y + ey) / 2, t: t0 + dur, kind: rnd() < bloom ? 1 : 0, r: 0.6 + rnd() * 0.5, a: rnd() * 6.283 });
      const n = depth < 1 ? 2 : rnd() < 0.28 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const spread = n === 3 ? (i - 1) * 0.55 : (i ? 0.42 : -0.42);
        grow(ex, ey, ang + spread + (rnd() - 0.5) * 0.5, len * (0.7 + rnd() * 0.1), w * 0.66, depth + 1, t0 + dur * 0.85);
      }
    };
    grow(x0, H + 4, -Math.PI / 2 + lean, size * 0.3, Math.max(4, size * 0.045), 0, 0);
    const done = Math.max(...tips.map((p) => p.t)) + 0.7;
    return { branches, tips, done };
  };

  const blossom = (x, y, s, rot, petal, heart) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = petal;
    for (let i = 0; i < 5; i++) { ctx.rotate(1.2566); ctx.beginPath(); ctx.ellipse(0, -s * 0.55, s * 0.36, s * 0.55, 0, 0, 6.283); ctx.fill(); }
    ctx.fillStyle = heart; ctx.beginPath(); ctx.arc(0, 0, s * 0.22, 0, 6.283); ctx.fill(); ctx.restore();
  };
  const leaf = (x, y, s, rot, color) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.75, -s * 0.15, 0, s); ctx.quadraticCurveTo(-s * 0.75, -s * 0.15, 0, -s); ctx.fill(); ctx.restore();
  };
  const ginkgo = (x, y, s, rot, color) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, s * 0.9); ctx.lineTo(-s * 0.8, -s * 0.25); ctx.quadraticCurveTo(-s * 0.4, -s * 0.85, -s * 0.05, -s * 0.55); ctx.lineTo(0, -s * 0.3); ctx.lineTo(s * 0.05, -s * 0.55); ctx.quadraticCurveTo(s * 0.4, -s * 0.85, s * 0.8, -s * 0.25); ctx.closePath(); ctx.fill(); ctx.restore();
  };

  // 떨어지는 것(눈송이 · 꽃잎 · 낙엽) 공통 틀
  const makeFall = (count, spawn, draw, ground, land) => {
    let list = [];
    const fill = (scatter) => { list = []; const n = count(); for (let i = 0; i < n; i++) list.push(spawn(scatter)); };
    fill(true);
    return {
      resize() { fill(true); },
      draw(t, dt) {
        for (const p of list) {
          if (!still) {
            p.y += p.vy * dt; p.x += (p.vx + Math.sin(t * p.w + p.ph) * p.sw) * dt; p.rot += p.vr * dt;
            const floor = ground ? ground.top(p.x) : H + 20;
            if (p.y > floor - p.s * 0.3) { if (land) land(p); Object.assign(p, spawn(false)); }
            else if (p.vy < 0 && p.y < -30) Object.assign(p, spawn(false));
            if (p.x < -30) p.x = W + 20; else if (p.x > W + 30) p.x = -20;
          }
          draw(p, t);
        }
      },
    };
  };

  const SCENES = {
    winter() {
      const ground = makeGround(narrow() ? 22 : 34);
      const fall = makeFall(
        () => Math.round(clamp((W * H) / 5200, 60, 260)),
        (scatter) => { const s = 1.3 + Math.pow(R(), 2) * 3.6; return { x: R() * W, y: scatter ? R() * H : -10 - R() * 60, s, vy: 22 + s * 16 + R() * 10, vx: -6 + R() * 4, w: 0.6 + R(), ph: R() * 6.283, sw: 8 + R() * 14, rot: 0, vr: 0, a: 0.55 + R() * 0.45 }; },
        (p) => { ctx.globalAlpha = p.a; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill(); if (p.s > 1.8) ctx.stroke(); },
        ground,
        (p) => ground.add(p.x, p.s * 0.4),
      );
      return {
        resize() { ground.resize(); fall.resize(); },
        draw(t, dt) {
          // 가장자리 서리
          const g = ctx.createRadialGradient(W / 2, H / 2, Math.hypot(W, H) * 0.36, W / 2, H / 2, Math.hypot(W, H) * 0.56);
          g.addColorStop(0, "rgba(220,236,250,0)"); g.addColorStop(1, "rgba(232,244,255,0.7)");
          ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
          // 밝은 바탕에서도 보이게 눈송이마다 옅은 파란 테
          ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(110,150,195,.45)"; ctx.lineWidth = 0.8;
          fall.draw(t, dt);
          ctx.globalAlpha = 1;
          ground.fill("#fbfdff", "rgba(90,130,170,.35)");
        },
      };
    },

    spring() {
      let trees = [];
      const build = () => {
        // 글을 가리지 않게 가장자리에 붙여 바깥으로 기울인다. 가지 끝은 화면 밖으로 넘어간다.
        const s = narrow() ? H * 0.24 : Math.min(H * 0.42, 360);
        trees = [makeTree(-s * 0.02, s, -0.22, 7, 0.75), makeTree(W + s * 0.02, s * 0.92, 0.24, 11, 0.75)];
        const side = (W - 1180) / 2;
        if (side > s * 0.5) { trees.push(makeTree(side * 0.55, s * 0.6, -0.05, 23, 0.8)); trees.push(makeTree(W - side * 0.5, s * 0.5, 0.06, 31, 0.8)); }
      };
      build();
      const grass = makeGrass([8, 22], ["#7fb35a", "#93c46b", "#6ea24d", "#a7d07b"], ["#ffffff", "#f6d65a", "#f4a6c4"]);
      const fall = makeFall(
        () => Math.round(clamp(W / 28, 18, 60)),
        (scatter) => ({ x: R() * W, y: scatter ? R() * H : -12, s: 4 + R() * 3, vy: 24 + R() * 22, vx: 10 + R() * 14, w: 0.8 + R(), ph: R() * 6.283, sw: 18, rot: R() * 6.283, vr: -1.5 + R() * 3, a: 0.75 + R() * 0.25 }),
        (p, t) => { ctx.globalAlpha = p.a; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.abs(Math.cos(t * 2 + p.ph)) * 0.7 + 0.3); ctx.fillStyle = "#f7b9cf"; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.6, 0, 0, 6.283); ctx.fill(); ctx.restore(); },
      );
      return {
        resize() { build(); grass.resize(); fall.resize(); },
        draw(t, dt) {
          const T = still ? 99 : t;
          ctx.lineCap = "round";
          // 옆 여백이 좁아 나무가 글에 닿는 화면에서는 옅게
          ctx.globalAlpha = (W - 1180) / 2 > 140 ? 1 : 0.62;
          for (const tree of trees) {
            for (const b of tree.branches) {
              const p = clamp((T - b.t0) / (b.t1 - b.t0), 0, 1);
              if (p <= 0) continue;
              ctx.strokeStyle = b.w > 3 ? "#6b4f3a" : "#7d6146"; ctx.lineWidth = b.w;
              ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + (b.ex - b.x) * ease(p), b.y + (b.ey - b.y) * ease(p)); ctx.stroke();
            }
            for (const tip of tree.tips) {
              const p = clamp((T - tip.t) / 0.55, 0, 1);
              if (p <= 0) continue;
              const k = pop(p) * tip.r;
              const sway = Math.sin(T * 1.3 + tip.x * 0.01) * 0.08;
              if (tip.kind) blossom(tip.x, tip.y, 9 * k, tip.a + sway, "#f8c4d6", "#e9789f");
              else leaf(tip.x, tip.y, 7 * k, tip.a + sway, "#8cc263");
            }
          }
          ctx.globalAlpha = 1;
          grass.draw(T);
          if (T > 1.2) fall.draw(t, dt);
          ctx.globalAlpha = 1;
        },
      };
    },

    summer() {
      const grass = makeGrass([14, narrow() ? 34 : 52], ["#3f8a3a", "#4e9c43", "#2f7533", "#5daa4c"], ["#ffffff", "#ffd34d", "#ff8a5c"]);
      const fall = makeFall(
        () => Math.round(clamp(W / 40, 12, 40)),
        (scatter) => ({ x: R() * W, y: scatter ? R() * H : H + 10, s: 1.2 + R() * 1.8, vy: -(8 + R() * 14), vx: 0, w: 0.5 + R(), ph: R() * 6.283, sw: 10, rot: 0, vr: 0, a: 0 }),
        (p, t) => { ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 2.4 + p.ph); ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 6.283); ctx.fill(); },
      );
      // 위쪽 두 모서리에 드리운 짙은 잎(나무 그늘의 가장자리). 천천히 흔들린다.
      let canopy = [];
      const buildCanopy = () => {
        canopy = [];
        // 옆 여백만큼만. 여백이 좁은 화면에서는 작게.
        const r = narrow() ? 64 : clamp((W - 1100) / 2 + 80, 80, 200);
        for (const [cx, cy] of [[0, H * 0.3], [W, H * 0.22]]) {
          for (let i = 0; i < (narrow() ? 30 : 56); i++) {
            const a = (R() - 0.5) * Math.PI, d = Math.sqrt(R()) * r;
            canopy.push({ x: cx + (cx ? -1 : 1) * Math.cos(a) * d * 0.6, y: cy + Math.sin(a) * d * 1.3, s: 12 + R() * 14, rot: (cx ? 0.6 : -0.6) + (R() - 0.5) * 1.6, c: ["#2f6b2c", "#3d7d34", "#4f9140", "#28592a"][Math.floor(R() * 4)], ph: R() * 6.283, d: R() * 0.9 });
          }
        }
      };
      buildCanopy();
      return {
        resize() { grass.resize(); fall.resize(); buildCanopy(); },
        draw(t, dt) {
          const sx = W * 0.5, sy = -H * 0.02, big = Math.hypot(W, H);
          const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, big * 0.55);
          glow.addColorStop(0, "rgba(255,246,200,0.75)"); glow.addColorStop(0.15, "rgba(255,226,130,0.3)"); glow.addColorStop(1, "rgba(255,220,120,0)");
          ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
          ctx.save(); ctx.translate(sx, sy); ctx.rotate((still ? 0 : t) * 0.03);
          ctx.fillStyle = "rgba(255,236,170,0.07)";
          for (let i = 0; i < 14; i++) { ctx.rotate(6.283 / 14); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(big, -big * 0.03); ctx.lineTo(big, big * 0.03); ctx.fill(); }
          ctx.restore();
          ctx.fillStyle = "#fff6c4";
          fall.draw(t, dt);
          ctx.globalAlpha = 1;
          const T = still ? 99 : t;
          for (const q of canopy) {
            const g = ease(clamp((T - q.d) / 0.8, 0, 1));
            if (g > 0) leaf(q.x, q.y, q.s * g, q.rot + Math.sin(T * 1.1 + q.ph) * 0.12, q.c);
          }
          grass.draw(T);
        },
      };
    },

    autumn() {
      const ground = makeGround(narrow() ? 16 : 24);
      const COLORS = ["#d9542b", "#e7822f", "#c7392a", "#f0a73a", "#a8572a", "#f2c23d"];
      let pile = [];
      const fall = makeFall(
        () => Math.round(clamp(W / 22, 22, 70)),
        (scatter) => ({ x: R() * W, y: scatter ? R() * H : -20, s: 9 + R() * 7, vy: 30 + R() * 30, vx: -12 + R() * 8, w: 0.7 + R() * 0.8, ph: R() * 6.283, sw: 26 + R() * 20, rot: R() * 6.283, vr: -2 + R() * 4, a: 0.92, c: COLORS[Math.floor(R() * COLORS.length)], g: R() < 0.35 }),
        (p, t) => { ctx.globalAlpha = p.a; ctx.save(); ctx.translate(p.x, p.y); ctx.scale(Math.cos(t * 1.7 + p.ph) * 0.8 + (p.g ? 0.2 : 0.25), 1); (p.g ? ginkgo : leaf)(0, 0, p.s, p.rot, p.g ? "#f2c23d" : p.c); ctx.restore(); },
        ground,
        (p) => { ground.add(p.x, 2.4); pile.push({ x: p.x, y: ground.top(p.x) + 2 + R() * 4, s: p.s * 0.9, rot: R() * 6.283, c: p.g ? "#e9b733" : p.c, g: p.g }); if (pile.length > 420) pile.splice(0, pile.length - 420); },
      );
      return {
        resize() { ground.resize(); fall.resize(); pile = []; },
        draw(t, dt) {
          ctx.globalAlpha = 1;
          ground.fill("#b5703a", "rgba(80,40,10,.25)");
          for (const q of pile) (q.g ? ginkgo : leaf)(q.x, q.y, q.s, q.rot, q.c);
          fall.draw(t, dt);
          ctx.globalAlpha = 1;
        },
      };
    },
  };

  // ---------- 돌리기 ----------

  let current = "";
  let scene = null;
  let born = 0, last = 0, raf = 0;
  const frame = (now) => {
    raf = 0;
    if (!scene) return;
    const t = (now - born) / 1000;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    canvas.style.opacity = String(clamp(t / 0.6, 0, 1));
    scene.draw(t, dt);
    // 배지 자리는 늘 비워 둔다. 무엇이 내려도 배지는 또렷하게.
    const box = host.getBoundingClientRect();
    if (box.width) {
      ctx.save(); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "destination-out"; ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(box.left - 4, box.top - 4, box.width + 8, box.height + 8, (box.height + 8) / 2); else ctx.rect(box.left - 4, box.top - 4, box.width + 8, box.height + 8);
      ctx.fill(); ctx.restore();
    }
    if (!still && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const run = () => { if (!raf && scene) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", run);
  const onResize = () => { fit(); if (still) run(); };
  window.addEventListener("resize", onResize);

  function set(season) {
    if (season && !SEASONS.includes(season)) season = "";
    current = season;
    for (const s of SEASONS) buttons[s].setAttribute("aria-pressed", String(s === season));
    if (season) root.setAttribute("data-season", season); else root.removeAttribute("data-season");
    if (tintOn && season) { tint.style.background = TINT[season][0]; tint.style.opacity = String(TINT[season][1]); } else tint.style.opacity = "0";
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    ctx.clearRect(0, 0, W, H);
    scene = season ? SCENES[season]() : null;
    born = performance.now();
    if (still && scene) { born -= 99000; }
    run();
    try { if (season) localStorage.setItem(KEY, season); else localStorage.removeItem(KEY); } catch (e) { /* 그대로 */ }
    try { window.dispatchEvent(new CustomEvent("season-change", { detail: { season } })); } catch (e) { /* 그대로 */ }
  }

  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    scene = null; current = "";
    root.removeAttribute("data-season");
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", run);
    canvas.remove(); tint.remove();
    if (floating) host.remove(); else { while (shadow.firstChild) shadow.removeChild(shadow.firstChild); host.removeAttribute("data-ready"); }
    delete window.SeasonBadges;
  }

  fit();
  window.SeasonBadges = {
    __alive: true,
    floating,
    set,
    get: () => current,
    destroy,
    // 이 코드 그대로 북마클릿 주소를 만든다. 남의 페이지(구글 등)에 얹을 때 쓴다.
    bookmarklet: () => "javascript:" + encodeURIComponent("(" + seasonBadges.toString() + ")();void 0"),
  };

  // 처음 켤 계절: data-default="winter" 가 있으면 그것, 없으면 지난번 고른 것(자리에 붙은 경우만).
  let first = opt("data-default", "");
  if (!first && !floating) { try { first = localStorage.getItem(KEY) || ""; } catch (e) { first = ""; } }
  if (first) set(first);
})();
