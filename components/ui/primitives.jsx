import { C } from "../../lib/colors.js";

// ── Card ───────────────────────────────────────────────────────────────────────
export const Card = ({children, s={}}) => (
  <div style={{
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "1.25rem 1.5rem",
    ...s,
  }}>
    {children}
  </div>
);

// ── Section label ──────────────────────────────────────────────────────────────
export const SL = ({children}) => (
  <div style={{
    fontSize: 10,
    color: "rgba(173,227,226,0.75)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontWeight: 600,
    marginBottom: 12,
    paddingLeft: 8,
    borderLeft: "2px solid rgba(173,227,226,0.35)",
  }}>
    {children}
  </div>
);

// ── Badge ──────────────────────────────────────────────────────────────────────
export const Badge = ({children, col=C.steel, bg=C.steelD}) => (
  <span style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    padding: "2px 9px",
    borderRadius: 20,
    background: bg,
    color: col,
    fontWeight: 600,
    whiteSpace: "nowrap",
    border: `1px solid ${col}33`,
    letterSpacing: "0.04em",
    lineHeight: 1.4,
  }}>
    {children}
  </span>
);

// ── Metric card ────────────────────────────────────────────────────────────────
export const Metric = ({label, value, sub, accent=C.orange}) => (
  <div style={{
    background: C.bg1,
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    padding: "1.25rem 1.5rem",
    borderTop: `2px solid ${accent}`,
    position: "relative",
    overflow: "hidden",
  }}>
    {/* subtle radial glow behind value */}
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 64,
      background: `radial-gradient(ellipse at 40% -10%, ${accent}22 0, transparent 70%)`,
      pointerEvents: "none",
    }}/>
    <div style={{
      fontSize: 10,
      color: "rgba(173,227,226,0.7)",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      fontWeight: 600,
    }}>
      {label}
    </div>
    <div style={{
      fontSize: 26,
      fontWeight: 700,
      color: accent,
      marginBottom: 4,
      letterSpacing: "-0.03em",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      lineHeight: 1,
    }}>
      {value}
    </div>
    <div style={{fontSize: 11, color: C.textSub}}>{sub}</div>
  </div>
);
