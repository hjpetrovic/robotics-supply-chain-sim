export const C = {
  bg0:"#0a0c0f", bg1:"#111418", bg2:"#181c22", bg3:"#1f2530",
  border:"rgba(255,255,255,0.07)", borderHi:"rgba(255,255,255,0.14)",
  blue:"#4a9eff",   blueD:"rgba(74,158,255,0.12)",
  amber:"#f0a830",  amberD:"rgba(240,168,48,0.12)",
  steel:"#8899aa",  steelD:"rgba(136,153,170,0.12)",
  red:"#e05555",    redD:"rgba(224,85,85,0.12)",
  green:"#3db87a",  greenD:"rgba(61,184,122,0.12)",
  purple:"#9b7fe8",
  text:"#e8ecf0", textSub:"#8899aa", textMuted:"#4a5568", white:"#ffffff",
};

export const rCol = (r) => r>=8 ? C.red   : r>=6 ? C.amber  : C.green;
export const rBg  = (r) => r>=8 ? C.redD  : r>=6 ? C.amberD : C.greenD;
export const fmt  = (n) =>
  n>=1e6 ? (n/1e6).toFixed(1)+"M" :
  n>=1e3 ? (n/1e3).toFixed(0)+"K" :
  Math.round(n).toLocaleString();
