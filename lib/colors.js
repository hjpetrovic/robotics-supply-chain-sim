export const C = {
  // ── Backgrounds (EV navy) ──────────────────────────────
  bg0: "#080C22",          // page
  bg1: "#0E1330",          // card
  bg2: "#0E1330",
  bg3: "#162047",          // inner elements / chart grid

  border:   "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.12)",

  // ── EV accent palette ─────────────────────────────────
  blue:    "#7571E4",      // EV capacity purple — tabs, active, interactive
  blueD:   "rgba(117,113,228,0.14)",

  orange:  "#E8854D",      // EV chart primary — key data, hero metrics
  orangeD: "rgba(232,133,77,0.14)",

  amber:   "#F59E0B",      // costs / slider thumbs / elevated risk
  amberD:  "rgba(245,158,11,0.14)",

  teal:    "#ADE3E2",      // EV crystal teal — section accents
  tealD:   "rgba(173,227,226,0.10)",

  steel:   "#8BA4CF",      // secondary text / chart axes
  steelD:  "rgba(139,164,207,0.12)",

  red:     "#EF4444",      // critical risk / trade war
  redD:    "rgba(239,68,68,0.12)",

  green:   "#52A272",      // EV chart secondary — low risk / positive
  greenD:  "rgba(82,162,114,0.12)",

  purple:  "#9E9BF0",      // map nodes

  // ── Text ──────────────────────────────────────────────
  text:      "#CBD5E1",    // slate-300
  textSub:   "#8BA4CF",    // slate-400
  textMuted: "#4A5568",    // slate-600
  white:     "#F1F5F9",    // slate-100
};

export const rCol = (r) => r>=8 ? C.red   : r>=6 ? C.amber  : C.green;
export const rBg  = (r) => r>=8 ? C.redD  : r>=6 ? C.amberD : C.greenD;
export const fmt  = (n) =>
  n>=1e6 ? (n/1e6).toFixed(1)+"M" :
  n>=1e3 ? (n/1e3).toFixed(0)+"K" :
  Math.round(n).toLocaleString();
